/**
 * Імпорт нової партії пам'ятників (коди 123–206) у каталог.
 *
 * Читає scripts/memorial-import.json (дані товарів, зібрані з
 * scripts/render-prompts.csv), бере рендери з теки, переданої першим
 * аргументом (PNG або JPEG, файл упізнається за кодом у перших трьох символах
 * імені: 123-single-gabbro.png), стискає в JPEG 1024 px q84, заливає у Supabase
 * Storage під детермінованим ім'ям (stone-images/stones/n063-123.jpg) і
 * upsert-ить рядки в таблиці stones. Повторний запуск безпечний: фото й рядок
 * перезаписуються, тож перегенеровані рендери достатньо покласти в ту саму
 * теку й запустити ще раз.
 *
 *   set -a; . ./.env.local; set +a
 *   npx tsx scripts/import-memorial.ts public/memorial
 */
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import sharp from "sharp"
import { createHash } from "node:crypto"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "stone-images"
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL і SUPABASE_SERVICE_ROLE_KEY мають бути в оточенні")
const dir = process.argv[2]
if (!dir) throw new Error("Вкажіть теку з JPEG: npx tsx scripts/import-memorial.ts /шлях/до/jpg")

type Item = { file: string; data: Record<string, unknown> & { id: string; code: string } }
const items: Item[] = JSON.parse(readFileSync("scripts/memorial-import.json", "utf8"))
// код → файл у теці (перші три символи імені)
const byCode = new Map<string, string>()
for (const f of readdirSync(dir)) if (/^\d{3}.*\.(png|jpe?g)$/i.test(f)) byCode.set(f.slice(0, 3), f)
const H = { apikey: key, Authorization: `Bearer ${key}` }

async function upload(item: Item): Promise<string> {
  // Детерміноване ім'я: повторний запуск перезаписує файл, а не плодить копії.
  const objectPath = `stones/${item.data.id.toLowerCase()}-${item.data.code}.jpg`
  const src = readFileSync(join(dir, byCode.get(item.data.code)!))
  const body = await sharp(src).resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 84, progressive: true, mozjpeg: true }).toBuffer()
  const res = await fetch(`${url}/storage/v1/object/${bucket}/${objectPath}`, {
    method: "POST",
    headers: { ...H, "Content-Type": "image/jpeg", "x-upsert": "true" },
    body,
  })
  if (!res.ok) throw new Error(`upload ${item.file}: ${res.status} ${await res.text()}`)
  // Ім'я файлу стале, тому версія за вмістом іде в query: інакше оптимізатор
  // картинок Vercel (minimumCacheTTL 30 днів) показував би старий рендер.
  const v = createHash("sha1").update(body).digest("hex").slice(0, 8)
  return `${url}/storage/v1/object/public/${bucket}/${objectPath}?v=${v}`
}

async function main() {
  const rows: { id: string; data: unknown; hidden: boolean; position: number }[] = []
  // position у таблиці NOT NULL; нові позиції йдуть після наявних 122.
  let position = 1000
  for (const item of items) {
    if (!byCode.has(item.data.code)) { console.warn(`пропуск ${item.data.code}: немає файлу з таким кодом`); continue }
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
