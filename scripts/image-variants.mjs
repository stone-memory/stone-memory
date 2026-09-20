// Зменшені копії фото з public/ → public/_img/w<ширина>/<шлях>.webp.
//
// Навіщо: до 20.09.2026 усі <Image> ходили через оптимізатор Vercel
// (/_next/image). На Hobby це 5 тис. трансформацій на місяць; понад 700 фото ×
// кілька ширин вичерпали ліміт, і Vercel почав відповідати 402
// OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED — частина фото на сайті просто не
// вантажилась. Тепер копії ріжуться один раз під час збірки й віддаються з CDN
// як звичайна статика: без лімітів, без функцій, без холодного старту.
// Адресу копії будує lib/image-loader.ts.
//
// Готові копії кешуються за хешем вмісту в .next/cache (Vercel зберігає цю теку
// між збірками), тож повторна збірка ріже лише нові й замінені фото.
//
// Запускається перед `next build` (prebuild). У dev не потрібен: там loader
// віддає оригінал.
import { createHash } from "node:crypto"
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs"
import { cpus } from "node:os"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const publicDir = join(root, "public")
const outDir = join(publicDir, "_img")
const cacheDir = join(root, ".next", "cache", "img-variants")
const WIDTHS = JSON.parse(readFileSync(join(root, "lib/image-widths.json"), "utf8"))
const EXT = /\.(webp|jpe?g|png)$/i
// _img — власний вивід; test-fav — чернетки поза git.
const SKIP_DIRS = new Set(["_img", "test-fav"])
const QUALITY = 72

function walk(dir, acc = []) {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      if (dir === publicDir && SKIP_DIRS.has(name)) continue
      walk(p, acc)
    } else if (EXT.test(name)) {
      acc.push(p)
    }
  }
  return acc
}

const started = Date.now()
const files = walk(publicDir)
rmSync(outDir, { recursive: true, force: true })
mkdirSync(cacheDir, { recursive: true })

const used = new Set()
let rendered = 0

async function processFile(file) {
  const rel = relative(publicDir, file).split("\\").join("/")
  const buf = readFileSync(file)
  const hash = createHash("md5").update(buf).digest("hex").slice(0, 12)
  const { width: srcWidth = 0 } = await sharp(buf).metadata()
  for (const w of WIDTHS) {
    // Ширше за оригінал не розтягуємо: усі такі ширини ділять одну копію.
    const effective = srcWidth ? Math.min(w, srcWidth) : w
    const cached = join(cacheDir, `${hash}-w${effective}-q${QUALITY}.webp`)
    used.add(cached)
    if (!existsSync(cached)) {
      await sharp(buf)
        .rotate()
        .resize({ width: effective, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(cached)
      rendered++
    }
    const out = join(outDir, `w${w}`, `${rel}.webp`)
    mkdirSync(dirname(out), { recursive: true })
    copyFileSync(cached, out)
  }
}

const queue = [...files]
const failed = []
await Promise.all(
  Array.from({ length: Math.max(2, cpus().length) }, async () => {
    for (let f = queue.pop(); f; f = queue.pop()) {
      try {
        await processFile(f)
      } catch (e) {
        failed.push(`${relative(root, f)}: ${e.message}`)
      }
    }
  }),
)

// Копії фото, яких у public/ вже немає.
for (const name of readdirSync(cacheDir)) {
  const p = join(cacheDir, name)
  if (!used.has(p)) rmSync(p, { force: true })
}

console.log(
  `[image-variants] ${files.length} фото × ${WIDTHS.length} ширин, нових копій: ${rendered}, ${((Date.now() - started) / 1000).toFixed(1)} с`,
)
if (failed.length) {
  console.error(`[image-variants] не вдалось обробити:\n  ${failed.join("\n  ")}`)
  process.exit(1)
}
