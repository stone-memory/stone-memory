#!/usr/bin/env node
/**
 * Перестискає важкі фото товарів у Supabase Storage.
 *
 * Аудит (SITE_AUDIT.md §3.6): 60 із 122 фото важать 2–4,5 МБ, разом 220 МБ.
 * next/image віддає на сторінці оптимізовані копії, але в JSON-LD, image-sitemap
 * і og:image стоять оригінальні адреси — їх тягнуть Google Images, Facebook,
 * Telegram і Viber без стиснення.
 *
 * Скрипт бере кожен товар з таблиці `stones`, завантажує оригінал, і якщо він
 * більший за --max-bytes (типово 600 КБ) — зменшує до --max-px по довгій
 * стороні (типово 2000), перекодовує в JPEG q82 з прогресивним завантаженням
 * і перезаписує ТОЙ САМИЙ об'єкт у бакеті. Адреса не змінюється, тому база,
 * sitemap і кеш браузерів лишаються узгодженими; CDN Supabase віддасть нову
 * версію після закінчення cache-control (до години).
 *
 * Запуск (потрібен ключ service role — той самий, що в .env.local):
 *
 *   node scripts/compress-stone-images.mjs --dry-run     # лише показати, що зробить
 *   node scripts/compress-stone-images.mjs               # виконати
 *   node scripts/compress-stone-images.mjs --max-bytes 400000 --max-px 1800
 *
 * Перед перезаписом оригінал зберігається в ./backup-stone-images/<шлях>.
 */
import { createClient } from "@supabase/supabase-js"
import { createHash } from "node:crypto"
import sharp from "sharp"
import { mkdir, writeFile, readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"

const args = process.argv.slice(2)
const flag = (name, def) => {
  const i = args.indexOf(name)
  return i === -1 ? def : args[i + 1]
}
const DRY = args.includes("--dry-run")
const MAX_BYTES = Number(flag("--max-bytes", 600_000))
const MAX_PX = Number(flag("--max-px", 2400))
const QUALITY = Number(flag("--quality", 90))

async function loadEnv() {
  if (existsSync(".env.local")) {
    const text = await readFile(".env.local", "utf8")
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
    }
  }
}

/** Мережа до CDN Supabase інколи обриває з'єднання; одна невдача не має валити весь прогін. */
async function fetchRetry(url, init, attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fetch(url, init)
    } catch (e) {
      if (i === attempts) { console.warn(`  ! ${url.split("/").pop()}: ${e.cause?.code ?? e.message}`); return null }
      await new Promise((r) => setTimeout(r, 2000 * i))
    }
  }
  return null
}

async function main() {
  await loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "stone-images"
  if (!url || !key) {
    console.error("Потрібні NEXT_PUBLIC_SUPABASE_URL і SUPABASE_SERVICE_ROLE_KEY (у .env.local або середовищі).")
    process.exit(1)
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const { data: rows, error } = await supabase.from("stones").select("id, data")
  if (error) throw error

  const prefix = `${url.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/`
  const targets = []
  for (const row of rows) {
    const urls = [row.data?.imagePath, ...(row.data?.gallery ?? [])].filter(Boolean)
    for (const u of urls) {
      if (typeof u === "string" && u.startsWith(prefix)) targets.push({ id: row.id, data: row.data, objectPath: decodeURIComponent(u.slice(prefix.length).split("?")[0]), url: u.split("?")[0] })
    }
  }
  const unique = [...new Map(targets.map((t) => [t.objectPath, t])).values()]
  console.log(`Фото у бакеті ${bucket}: ${unique.length}. Поріг: ${(MAX_BYTES / 1e6).toFixed(1)} МБ, максимум ${MAX_PX}px.`)

  let saved = 0
  let touched = 0
  for (const t of unique) {
    // Спершу лише заголовки: 206 фото по 2–4 МБ качати заради розміру довго.
    const head = await fetchRetry(t.url, { method: "HEAD" })
    const len = Number(head?.headers.get("content-length") ?? 0)
    if (head?.ok && len && len <= MAX_BYTES) continue
    const res = await fetchRetry(t.url)
    if (!res?.ok) {
      console.warn(`  ! ${t.objectPath}: ${res ? `HTTP ${res.status}` : "не вдалося завантажити"}`)
      continue
    }
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length <= MAX_BYTES) continue

    const meta = await sharp(buf).metadata()
    const out = await sharp(buf)
      .rotate()
      .resize({ width: MAX_PX, height: MAX_PX, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
      .toBuffer()

    console.log(
      `  ${t.objectPath}: ${meta.width}×${meta.height} ${(buf.length / 1e6).toFixed(2)} МБ → ${(out.length / 1e6).toFixed(2)} МБ`
    )
    touched++
    saved += buf.length - out.length
    if (DRY) continue

    const backup = path.join("backup-stone-images", t.objectPath)
    await mkdir(path.dirname(backup), { recursive: true })
    await writeFile(backup, buf)

    // Той самий шлях і той самий Content-Type, що очікує адреса (.jpg). Якщо
    // оригінал був PNG за адресою .png — лишаємо PNG-розширення, але вміст
    // JPEG браузери читають за сигнатурою, а не за розширенням.
    const { error: upErr } = await supabase.storage.from(bucket).upload(t.objectPath, out, {
      upsert: true,
      contentType: "image/jpeg",
      cacheControl: "31536000",
    })
    if (upErr) { console.warn(`  ! ${t.objectPath}: ${upErr.message}`); continue }

    // Адреса та сама, тому версію за вмістом додаємо в query: інакше оптимізатор
    // картинок Vercel (minimumCacheTTL 30 днів) і браузери показували б старий файл.
    const v = createHash("sha1").update(out).digest("hex").slice(0, 8)
    const fresh = `${t.url}?v=${v}`
    const data = { ...t.data }
    if (typeof data.imagePath === "string" && data.imagePath.split("?")[0] === t.url) data.imagePath = fresh
    if (Array.isArray(data.gallery)) data.gallery = data.gallery.map((g) => (typeof g === "string" && g.split("?")[0] === t.url ? fresh : g))
    const { error: rowErr } = await supabase.from("stones").update({ data }).eq("id", t.id)
    if (rowErr) console.warn(`  ! рядок ${t.id}: ${rowErr.message}`)
  }

  console.log(`\n${DRY ? "Було б перестиснуто" : "Перестиснуто"}: ${touched} фото, економія ${(saved / 1e6).toFixed(1)} МБ.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
