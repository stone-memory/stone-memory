/**
 * Звірка з ринком слябів (вересень 2026, docs/stone-market-check-2026-09.md),
 * крок у базу stilnytsi_materials:
 *   1. 28 колекцій, яких немає в жодного українського продавця слябів
 *      (seed unavailableCollections) → hidden = true; дані рядка не чіпає;
 *   2. 24 заміни з наявністю на ринку (seed pendingCollections) → вставка з
 *      hidden = true; наявні слаги не перезаписуються.
 * Те саме як SQL — supabase/stilnytsi-cms-7-market-check-2026-09.sql.
 *
 *   npx tsx --env-file=.env.local scripts/apply-market-check.ts
 *
 * --unhide: знімає hidden із колекцій, які в сіді вже перенесені з pending у
 * основні списки (тобто мають фото в public/). Запускати ПІСЛЯ деплою з цими
 * фото. unavailableCollections сюди не потрапляють ніколи.
 *
 *   npx tsx --env-file=.env.local scripts/apply-market-check.ts --unhide
 */
import { existsSync } from "node:fs"
import { collections, pendingCollections, unavailableCollections } from "../data/stone/seed/collections"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL і SUPABASE_SERVICE_ROLE_KEY мають бути в оточенні")
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }
const table = `${url}/rest/v1/stilnytsi_materials`

async function setHidden(slug: string, hidden: boolean) {
  const r = await fetch(`${table}?slug=eq.${encodeURIComponent(slug)}`, {
    method: "PATCH", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify({ hidden }),
  })
  if (!r.ok) throw new Error(`hidden=${hidden} ${slug} ${r.status}: ${await r.text()}`)
}

async function listRows() {
  const res = await fetch(`${table}?select=slug,hidden`, { headers })
  if (!res.ok) throw new Error(`list ${res.status}: ${await res.text()}`)
  return (await res.json()) as { slug: string; hidden: boolean }[]
}

async function unhide() {
  const hidden = (await listRows()).filter((r) => r.hidden).map((r) => r.slug)
  const ready = hidden.filter((slug) => collections.some((c) => c.slug === slug))
  let n = 0
  for (const slug of ready) {
    const files = [`materials/${slug}.webp`, ...["macro", "slab"].map((t) => `collections/${slug}-${t}.webp`)]
    const missing = files.filter((f) => !existsSync(`public/${f}`))
    if (missing.length) { console.log(`  ${slug}: нема ${missing.join(", ")}, лишаю прихованим`); continue }
    await setHidden(slug, false)
    console.log(`  відкрито: ${slug}`); n++
  }
  console.log(`відкрито ${n}, лишається прихованих: ${hidden.length - n}. Далі: зберегти будь-який запис в адмінці, щоб скинути кеш.`)
}

async function main() {
  if (process.argv.includes("--unhide")) return unhide()
  const rows = await listRows()
  const bySlug = new Map(rows.map((r) => [r.slug, r]))
  let hid = 0
  for (const c of unavailableCollections) {
    const row = bySlug.get(c.slug)
    if (!row) { console.log("  нема в базі:", c.slug); continue }
    if (row.hidden) continue
    await setHidden(c.slug, true); hid++
  }
  const inserts = pendingCollections
    .filter((c) => !bySlug.has(c.slug))
    .map((c, i) => ({ slug: c.slug, data: c, hidden: true, position: 1100 + i }))
  if (inserts.length) {
    const r = await fetch(table, { method: "POST", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify(inserts) })
    if (!r.ok) throw new Error(`insert ${r.status}: ${await r.text()}`)
  }
  console.log(`приховано: ${hid} з ${unavailableCollections.length}, додано прихованими: ${inserts.length}, уже були: ${pendingCollections.length - inserts.length}`)
  console.log("Далі: деплой (скидає кеш) або зберегти будь-який запис в адмінці.")
}
main().catch((e) => { console.error(e); process.exit(1) })
