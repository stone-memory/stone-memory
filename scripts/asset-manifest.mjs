// Версії статичних фото за вмістом → lib/stone/asset-manifest.json.
//
// Навіщо: картки й галереї каменю лежать у public/ під сталими адресами
// (/materials/<slug>.webp, /collections/<slug>-slab.webp …), а CDN і браузер
// кешують їх на 7 днів. Коли файл замінюють під тією ж адресою (так було
// 8 → 11 вересня 2026: сіра заглушка → справжні фото), відвідувачі ще тиждень
// бачать стару картинку. Тепер lib/stone/asset-url.ts додає ?v=<хеш вмісту>,
// і будь-яка заміна файлу дає нову адресу.
//
// Запускається автоматично перед `next dev` і `next build` (predev/prebuild).
import { createHash } from "node:crypto"
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { join, relative, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const DIRS = ["materials", "collections", "blog", "stone"]
const EXT = /\.(webp|jpe?g|png|avif|svg)$/i

const manifest = {}
for (const dir of DIRS) {
  const abs = join(root, "public", dir)
  let files
  try {
    files = readdirSync(abs)
  } catch {
    continue
  }
  for (const f of files.sort()) {
    const p = join(abs, f)
    if (!EXT.test(f) || !statSync(p).isFile()) continue
    manifest["/" + relative(join(root, "public"), p).split("\\").join("/")] = createHash("md5")
      .update(readFileSync(p))
      .digest("hex")
      .slice(0, 8)
  }
}

const out = join(root, "lib/stone/asset-manifest.json")
const json = JSON.stringify(manifest, null, 0)
let prev = ""
try {
  prev = readFileSync(out, "utf8")
} catch {}
if (prev !== json) {
  writeFileSync(out, json)
  console.log(`[asset-manifest] ${Object.keys(manifest).length} файлів → ${relative(root, out)}`)
}
