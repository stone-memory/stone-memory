/**
 * Імпорт нової партії пам'ятників (коди 123–206) у каталог.
 *
 * Читає scripts/memorial-import.json (дані товарів, зібрані з
 * scripts/render-prompts.csv), бере готові JPEG з теки, переданої першим
 * аргументом, заливає їх у Supabase Storage за тим самим шляхом, що й адмінка
 * (stone-images/stones/<id>-<випадкове>.jpg), і створює рядки в таблиці stones.
 * Повторний запуск безпечний: рядок з таким id перезаписується (upsert).
 *
 *   set -a; . ./.env.local; set +a
 *   npx tsx scripts/import-memorial.ts /шлях/до/jpg
 */
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "stone-images"
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL і SUPABASE_SERVICE_ROLE_KEY мають бути в оточенні")
const dir = process.argv[2]
if (!dir) throw new Error("Вкажіть теку з JPEG: npx tsx scripts/import-memorial.ts /шлях/до/jpg")

type Item = { file: string; data: Record<string, unknown> & { id: string; code: string } }
const items: Item[] = JSON.parse(readFileSync("scripts/memorial-import.json", "utf8"))
const available = new Set(readdirSync(dir))
const H = { apikey: key, Authorization: `Bearer ${key}` }

async function upload(item: Item): Promise<string> {
  // Детерміноване ім'я: повторний запуск перезаписує файл, а не плодить копії.
  const objectPath = `stones/${item.data.id.toLowerCase()}-${item.data.code}.jpg`
  const body = readFileSync(join(dir, item.file))
  const res = await fetch(`${url}/storage/v1/object/${bucket}/${objectPath}`, {
    method: "POST",
    headers: { ...H, "Content-Type": "image/jpeg", "x-upsert": "true" },
    body,
  })
  if (!res.ok) throw new Error(`upload ${item.file}: ${res.status} ${await res.text()}`)
  return `${url}/storage/v1/object/public/${bucket}/${objectPath}`
}

async function main() {
  const rows: { id: string; data: unknown; hidden: boolean; position: number }[] = []
  // position у таблиці NOT NULL; нові позиції йдуть після наявних 122.
  let position = 1000
  for (const item of items) {
    if (!available.has(item.file)) { console.warn(`пропуск ${item.data.code}: немає ${item.file}`); continue }
    const imagePath = await upload(item)
    rows.push({ id: item.data.id, data: { ...item.data, imagePath }, hidden: false, position: position++ })
    process.stdout.write(`${item.data.code} `)
  }
  console.log(`\nзавантажено ${rows.length} фото, пишу рядки…`)
  const res = await fetch(`${url}/rest/v1/stones?on_conflict=id`, {
    method: "POST",
    headers: { ...H, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  })
  console.log(`stones: ${rows.length} рядків, HTTP ${res.status}`, res.ok ? "" : await res.text())
}
main()
