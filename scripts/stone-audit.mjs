/**
 * Аудит цілісності сайту. Запускати ПІСЛЯ `next build`: `npm run audit`.
 *
 * Перевіряє два шари:
 *   1. Дані (data/*.ts): перехресні звʼязки між колекціями, проєктами,
 *      статтями, категоріями; існування зображень у public/; ціни.
 *   2. Збірка (.next/server/app/**\/*.html): кожне внутрішнє посилання веде
 *      на існуючу сторінку, кожне зображення існує в public/.
 *
 * Саме так знайшлись 4 битих посилання і 85 проблем даних, які роками
 * могли жити непоміченими: старі слаги категорій, неіснуючі статті у
 * звʼязках, дубль сторінки матеріалу. Завершується кодом 1, якщо є проблеми.
 *
 * Дані беруться з бази (SUPABASE_URL у .env.local), інакше з data/seed;
 * TS транспілюється у .next/audit (scripts/cms-lib.mjs).
 */
import fs from 'node:fs'
import path from 'node:path'
import { loadDbContent, loadEnv, loadSeedContent, prepareSeed } from './cms-lib.mjs'

const root = process.cwd()
const pub = path.join(root, 'public')
const problems = []
const flag = (msg) => problems.push(msg)

// ---------- 1. Дані: з бази (як сайт) або з data/seed ----------
loadEnv()
const load = prepareSeed()
const fromDb = await loadDbContent()
const content = fromDb ?? (await loadSeedContent(load))
console.log(
  fromDb ? 'Джерело даних: Supabase (stilnytsi_*)' : 'Джерело даних: data/seed (без SUPABASE_URL)'
)
const { collections, projects, articles, slabs, remnants, settings } = content
const { categories, materials } = await load('data/stone/materials.js')
const { families } = await load('data/stone/families.js')
const { buildPaths } = await load('lib/stone/paths.js')
const { stoneHref } = await load('lib/stone/config.js')
const { formatPrice } = await load('lib/stone/prices.js')
const allPaths = buildPaths({ collections, projects, articles, settings })

// ---------- 2. Перехресні звʼязки ----------
const known = new Set(['/', ...allPaths])
const collectionSlugs = new Set(collections.map((c) => c.slug))
const categorySlugs = new Set(categories.map((c) => c.slug))
const articleSlugs = new Set(articles.map((a) => a.slug))
const familyNames = new Set(Object.values(families))
const materialKeys = new Set(materials.map((m) => m.slug))
const image = (p, ctx) => {
  if (p && !fs.existsSync(path.join(pub, p))) flag(`[зображення] ${ctx}: нема файлу ${p}`)
}
const uniqueSlugs = (list, label) => {
  const seen = new Set()
  for (const x of list) {
    if (seen.has(x.slug)) flag(`[дубль] ${label} «${x.slug}» повторюється`)
    seen.add(x.slug)
  }
}
uniqueSlugs(collections, 'колекція')
uniqueSlugs(projects, 'проєкт')
uniqueSlugs(articles, 'стаття')

for (const c of collections) {
  if (!familyNames.has(c.family)) flag(`[колекція ${c.slug}] родина «${c.family}» невідома`)
  if (!materialKeys.has(c.material)) flag(`[колекція ${c.slug}] матеріал «${c.material}» невідомий`)
  image(c.image, `колекція ${c.slug}.image`)
  image(c.cardImage, `колекція ${c.slug}.cardImage`)
  for (const s of ['macro', 'slab', 'application'])
    image(`/collections/${c.slug}-${s}.webp`, `колекція ${c.slug} галерея`)
  for (const a of c.relatedArticles ?? [])
    if (!articleSlugs.has(a)) flag(`[колекція ${c.slug}] relatedArticles → нема статті «${a}»`)
  for (const k of c.relatedCategories ?? [])
    if (!categorySlugs.has(k))
      flag(`[колекція ${c.slug}] relatedCategories → нема категорії «${k}»`)
  const price = formatPrice(c.price)
  if (!price || /undefined|NaN/.test(price)) flag(`[ціна ${c.slug}] formatPrice → «${price}»`)
}
for (const p of projects) {
  if (!collectionSlugs.has(p.materialSlug))
    flag(`[проєкт ${p.slug}] materialSlug «${p.materialSlug}» → нема такої колекції`)
  image(p.image, `проєкт ${p.slug}.image`)
  for (const g of p.gallery ?? []) image(g, `проєкт ${p.slug}.gallery`)
}
for (const a of articles) {
  image(`/blog/${a.slug}.webp`, `стаття ${a.slug}`)
  image(`/blog/${a.slug}-detail.webp`, `стаття ${a.slug} (деталь)`)
  for (const r of a.related ?? [])
    if (!known.has(stoneHref(r))) flag(`[стаття ${a.slug}] related → нема сторінки «${r}»`)
  for (const m of a.materials ?? [])
    if (!collectionSlugs.has(m)) flag(`[стаття ${a.slug}] materials → нема колекції «${m}»`)
  for (const k of a.categories ?? [])
    if (!categorySlugs.has(k)) flag(`[стаття ${a.slug}] categories → нема категорії «${k}»`)
}
for (const s of slabs) image(s.image, `сляб ${s.id}`)
for (const r of remnants) image(r.image, `залишок ${r.id}`)

// ---------- 3. Збірка: посилання та ресурси ----------
const appDir = path.join(root, '.next', 'server', 'app')
if (!fs.existsSync(appDir)) {
  console.error('Немає .next/server/app — спершу `npm run build`.')
  process.exit(2)
}
const htmlFiles = []
;(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.name.endsWith('.html')) htmlFiles.push(p)
  }
})(appDir)
const routeOf = (f) => {
  const p = f.slice(appDir.length).replace(/\.html$/, '')
  return p === '/index' ? '/' : p
}
const pages = new Set(htmlFiles.map(routeOf))
pages.delete('/_not-found')
// Перевіряємо лише розділ «Архітектурний камінь»: решта сайту має власні
// конвенції зображень (Supabase Storage) і власні перевірки.
const SECTION = '/arkhitekturnyi-kamin'
const inSection = (route) => route === SECTION || route.startsWith(SECTION + '/')
// Файли, які Next віддає з app/, а не з public/ (іконка з app/icon.png).
const appServed = new Set(['/icon.png', '/favicon.ico'])
const badLinks = new Map()
const badAssets = new Map()
const note = (map, key, from) => (map.get(key) ?? map.set(key, new Set()).get(key)).add(from)

for (const f of htmlFiles) {
  const page = routeOf(f)
  if (page === '/_not-found' || !inSection(page)) continue
  const html = fs.readFileSync(f, 'utf8')
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const h = m[1].replace(/&amp;/g, '&')
    if (!h.startsWith('/') || h.startsWith('/_next') || h.startsWith('//')) continue
    const clean = h.split('?')[0].split('#')[0]
    if (clean === '' || pages.has(clean) || appServed.has(clean)) continue
    if (/\.(webp|svg|png|jpe?g|avif|txt|xml|ico|webmanifest)$/.test(clean)) {
      if (!fs.existsSync(path.join(pub, clean))) note(badAssets, clean, page)
      continue
    }
    note(badLinks, clean, page)
  }
  for (const m of html.matchAll(/(?:src|srcSet|srcset)="([^"]+)"/g)) {
    for (const part of m[1].split(',')) {
      const u = part.trim().split(' ')[0]
      let asset = null
      if (u.startsWith('/_next/image?url=')) asset = decodeURIComponent(u.slice(17).split('&')[0])
      else if (u.startsWith('/') && !u.startsWith('/_next')) asset = u
      // Абсолютні URL (Supabase Storage) не перевіряємо — вони не в public/.
      if (asset && !/^https?:/.test(asset) && !appServed.has(asset) && !fs.existsSync(path.join(pub, asset)))
        note(badAssets, asset, page)
    }
  }
}
for (const [l, from] of badLinks)
  flag(`[посилання] ${l} ← ${[...from].slice(0, 3).join(', ')}${from.size > 3 ? '…' : ''}`)
for (const [a, from] of badAssets)
  flag(`[ресурс] ${a} ← ${[...from].slice(0, 3).join(', ')}${from.size > 3 ? '…' : ''}`)

// ---------- Підсумок ----------
console.log(
  `Сторінок розділу: ${[...pages].filter(inSection).length} · колекцій ${collections.length} · проєктів ${projects.length} · статей ${articles.length}`
)
if (problems.length) {
  console.log(`\nПРОБЛЕМ: ${problems.length}`)
  for (const p of problems) console.log(' - ' + p)
  process.exit(1)
}
console.log('Проблем не знайдено.')
