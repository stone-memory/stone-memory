/**
 * «Українське наперед» (вересень 2026), крок у базу stilnytsi_materials:
 *   1. origin «Іран»/«Мексика» → «Імпорт» для 6 колекцій (травертину Gold —
 *      ще й опис без «іранський»); решту полів, зокрема правки адміна, не чіпає;
 *   2. family «Габро»/«Базальт» для 7 колекцій, які були всередині «Граніт»;
 *   3. 14 нових українських колекцій із сіду (ukrainianPending) — вставка з
 *      hidden = true; наявні слаги не перезаписуються.
 * Те саме як SQL — supabase/stilnytsi-cms-6-ukrainian-first-2026-09.sql.
 *
 *   npx tsx --env-file=.env.local scripts/apply-ukrainian-first.ts
 *
 * --unhide: знімає hidden із колекцій, які в сіді вже перенесені з
 * ukrainianPending в ukrainian (тобто мають фото в public/). Запускати ПІСЛЯ
 * деплою з цими фото, інакше на живому сайті будуть биті картинки. Після
 * запуску зберегти будь-який запис в адмінці, щоб скинути кеш сторінок.
 *
 *   npx tsx --env-file=.env.local scripts/apply-ukrainian-first.ts --unhide
 */
import { existsSync } from "node:fs"
import { collections, pendingCollections } from "../data/stone/seed/collections"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL і SUPABASE_SERVICE_ROLE_KEY мають бути в оточенні")
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }
const table = `${url}/rest/v1/stilnytsi_materials`

const ORIGIN = ["onice-bianco", "onice-miele", "onice-verde", "onice-nuvolato", "rainbow-onyx", "travertino-gold"]
const FAMILY = ["kometa-black", "holovynske", "bukynske", "antik-nero", "berestovetskyi", "kostopilskyi", "khustovskyi"]

async function patch(slug: string, fields: Record<string, unknown>) {
  const res = await fetch(`${table}?slug=eq.${encodeURIComponent(slug)}&select=slug,data`, { headers })
  if (!res.ok) throw new Error(`read ${slug} ${res.status}: ${await res.text()}`)
  const [row] = (await res.json()) as { slug: string; data: Record<string, unknown> }[]
  if (!row) { console.log("  нема в базі:", slug); return false }
  const same = Object.entries(fields).every(([k, v]) => row.data[k] === v)
  if (same) return false
  const r = await fetch(`${table}?slug=eq.${encodeURIComponent(slug)}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ data: { ...row.data, ...fields } }),
  })
  if (!r.ok) throw new Error(`patch ${slug} ${r.status}: ${await r.text()}`)
  return true
}

async function unhide() {
  const res = await fetch(`${table}?select=slug,hidden&hidden=eq.true`, { headers })
  if (!res.ok) throw new Error(`list ${res.status}: ${await res.text()}`)
  const hidden = ((await res.json()) as { slug: string }[]).map((r) => r.slug)
  const ready = hidden.filter((slug) => collections.some((c) => c.slug === slug))
  let n = 0
  for (const slug of ready) {
    const files = [`materials/${slug}.webp`, ...["macro", "slab"].map((t) => `collections/${slug}-${t}.webp`)]
    const missing = files.filter((f) => !existsSync(`public/${f}`))
    if (missing.length) { console.log(`  ${slug}: нема ${missing.join(", ")}, лишаю прихованим`); continue }
    const r = await fetch(`${table}?slug=eq.${encodeURIComponent(slug)}`, {
      method: "PATCH", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify({ hidden: false }),
    })
    if (!r.ok) throw new Error(`unhide ${slug} ${r.status}: ${await r.text()}`)
    console.log(`  відкрито: ${slug}`); n++
  }
  console.log(`відкрито ${n}, лишається прихованих: ${hidden.length - n}. Далі: зберегти будь-який запис в адмінці, щоб скинути кеш.`)
}

async function main() {
  if (process.argv.includes("--unhide")) return unhide()
  const seed = (slug: string) => {
    const c = collections.find((x) => x.slug === slug)
    if (!c) throw new Error(`у сіді нема ${slug}`)
    return c
  }
  let origin = 0, family = 0
  for (const slug of ORIGIN) {
    const c = seed(slug)
    const fields = slug === "travertino-gold" ? { origin: c.origin, description: c.description } : { origin: c.origin }
    if (await patch(slug, fields)) origin++
  }
  for (const slug of FAMILY) if (await patch(slug, { family: seed(slug).family })) family++

  const existing = await fetch(`${table}?select=slug`, { headers })
  if (!existing.ok) throw new Error(`list ${existing.status}: ${await existing.text()}`)
  const have = new Set(((await existing.json()) as { slug: string }[]).map((r) => r.slug))
  const rows = pendingCollections
    .filter((c) => !have.has(c.slug))
    .map((c, i) => ({ slug: c.slug, data: c, hidden: true, position: 1000 + i }))
  if (rows.length) {
    const r = await fetch(table, { method: "POST", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify(rows) })
    if (!r.ok) throw new Error(`insert ${r.status}: ${await r.text()}`)
  }
  console.log(`походження оновлено: ${origin}, родина оновлена: ${family}, приховано додано: ${rows.length}, уже були: ${pendingCollections.length - rows.length}`)
  console.log("Далі: зберегти будь-який запис в адмінці, щоб скинути кеш сторінок.")
}
main().catch((e) => { console.error(e); process.exit(1) })
