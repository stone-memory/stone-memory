/**
 * Дописує технічні характеристики (data.specs) у stilnytsi_materials за
 * довідником data/stone/seed/specs.ts. Не чіпає записи, де адмін уже
 * заповнив specs, і не переписує решту полів.
 *
 *   npx tsx --env-file=.env.local scripts/apply-collection-specs.ts
 *   npx tsx --env-file=.env.local scripts/apply-collection-specs.ts --force   # перезаписати й наявні
 */
import { specs } from "../data/stone/seed/specs"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL і SUPABASE_SERVICE_ROLE_KEY мають бути в оточенні")
const force = process.argv.includes("--force")
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }

async function main() {
  const res = await fetch(`${url}/rest/v1/stilnytsi_materials?select=slug,data`, { headers })
  if (!res.ok) throw new Error(`read ${res.status}: ${await res.text()}`)
  const rows = (await res.json()) as { slug: string; data: Record<string, unknown> }[]
  let updated = 0, skipped = 0, missing = 0
  for (const row of rows) {
    const sp = specs[row.slug]
    if (!sp) { missing++; console.log("  немає довідкових даних:", row.slug); continue }
    if (row.data.specs && !force) { skipped++; continue }
    const r = await fetch(`${url}/rest/v1/stilnytsi_materials?slug=eq.${encodeURIComponent(row.slug)}`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({ data: { ...row.data, specs: sp } }),
    })
    if (!r.ok) throw new Error(`patch ${row.slug} ${r.status}: ${await r.text()}`)
    updated++
  }
  console.log(`рядків у базі: ${rows.length}, оновлено: ${updated}, пропущено (specs уже є): ${skipped}, без довідника: ${missing}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
