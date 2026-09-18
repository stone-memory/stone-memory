#!/usr/bin/env node
/**
 * Переносить згенеровані фото каменю з теки генератора в public/ сайту:
 * обрізає до 3:2, зменшує чи збільшує до 1200×800, кодує у WebP.
 *
 *   node scripts/import-stone-photos.mjs <тека з public/materials і public/collections> [slug ...]
 *
 * Без слагів бере всі файли теки. Особливі кадрування (краї плитки, відблиски)
 * задані в CROPS: частки, які відрізаються зліва, зверху, справа, знизу.
 * DERIVED робить файл із іншого джерела, коли генератор його не дав.
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const [src, ...only] = process.argv.slice(2)
if (!src) throw new Error('вкажи теку з public/materials і public/collections')
const W = 1200, H = 800

/** Відрізати частки [left, top, right, bottom] перед кадруванням 3:2. */
const CROPS = {
  'materials/zhadani': [0.05, 0.05, 0.05, 0.05],
  'materials/rakhni-polivsky': [0.25, 0, 0, 0],
  'materials/fantasy-azure': [0.08, 0.12, 0.08, 0.12],
  'collections/lukovetskyi-macro': [0, 0.08, 0.08, 0],
}
/** Ціль ← джерело + кадрування: коли генератор не дав файл, робимо його з картки. */
const DERIVED = {
  'collections/rakhni-polivsky-macro': ['materials/rakhni-polivsky', [0.4, 0.25, 0.1, 0.42]],
  // Партія «заміни» 09.2026: картка Vratza R1 прийшла заглушкою, макро рівне — беремо його цілком
  'materials/vratza-r1': ['collections/vratza-r1-macro', [0, 0, 0, 0]],
}

async function convert(from, to, inset = [0, 0, 0, 0]) {
  const meta = await sharp(from).metadata()
  const [l, t, r, b] = inset
  let left = Math.round(meta.width * l), top = Math.round(meta.height * t)
  let width = Math.round(meta.width * (1 - l - r)), height = Math.round(meta.height * (1 - t - b))
  // 3:2 по центру того, що лишилося
  if (width / height > 1.5) { const w = Math.round(height * 1.5); left += Math.round((width - w) / 2); width = w }
  else { const h = Math.round(width / 1.5); top += Math.round((height - h) / 2); height = h }
  fs.mkdirSync(path.dirname(to), { recursive: true })
  await sharp(from).extract({ left, top, width, height }).resize(W, H, { kernel: 'lanczos3' }).webp({ quality: 86 }).toFile(to)
  return `${width}×${height}`
}

const isPlaceholder = (file) => !fs.existsSync(file) || fs.statSync(file).size < 50_000
let done = 0
for (const dir of ['materials', 'collections']) {
  const from = path.join(src, 'public', dir)
  if (!fs.existsSync(from)) continue
  for (const name of fs.readdirSync(from).sort()) {
    if (!/\.(png|webp|jpe?g)$/i.test(name)) continue
    const base = name.replace(/\.[^.]+$/, '')
    const slug = dir === 'materials' ? base : base.replace(/-(macro|slab|application)$/, '')
    if (only.length && !only.includes(slug)) continue
    const file = path.join(from, name)
    if (isPlaceholder(file)) { console.log(`  пропуск (заглушка ${Math.round(fs.statSync(file).size / 1024)} КБ): ${dir}/${name}`); continue }
    const key = `${dir}/${base}`
    const size = await convert(file, path.join('public', dir, `${base}.webp`), CROPS[key])
    console.log(`  ${key}.webp ← ${size}`)
    done++
  }
}
for (const [target, [source, inset]] of Object.entries(DERIVED)) {
  const slug = path.basename(source)
  if (only.length && !only.includes(slug)) continue
  const from = path.join(src, 'public', `${source}.png`)
  if (!fs.existsSync(from)) continue // джерела в цій теці нема: похідний з іншої партії
  if (fs.existsSync(path.join('public', `${target}.webp`)) && !isPlaceholder(path.join(src, 'public', `${target}.png`))) continue
  const size = await convert(from, path.join('public', `${target}.webp`), inset)
  console.log(`  ${target}.webp ← ${source} ${size} (похідний)`)
  done++
}
console.log(`готово: ${done} файлів`)
