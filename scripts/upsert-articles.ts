/**
 * Публікує статті з lib/data/articles.ts у таблицю `articles` (upsert за slug).
 *
 * Навмисно НЕ через /api/admin/seed?force=true: той маршрут разом зі статтями
 * перезаписує й таблицю stones статичним сідом з Unsplash-фото, який давно
 * розійшовся з живим каталогом.
 *
 *   npx tsx scripts/upsert-articles.ts
 */
import { articles } from "../lib/data/articles"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL і SUPABASE_SERVICE_ROLE_KEY мають бути в оточенні (source .env.local)")

async function main() {
  const rows = articles.map((a, i) => ({ slug: a.slug, data: a, position: i, hidden: false }))
  const res = await fetch(`${url}/rest/v1/articles?on_conflict=slug`, {
    method: "POST",
    headers: {
      apikey: key!,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  })
  console.log(`articles: ${rows.length} рядків, HTTP ${res.status}`, res.ok ? "" : await res.text())
}
main()
