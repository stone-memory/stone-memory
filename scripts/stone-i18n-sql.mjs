// Збирає SQL-міграцію з перекладами статей і проєктів (data/stone/i18n/*.json)
// у поле data.i18n таблиць stilnytsi_articles / stilnytsi_projects.
// Запуск: node scripts/stone-i18n-sql.mjs > supabase/stilnytsi-cms-8-i18n-2026-09.sql
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dir = join(process.cwd(), 'data/stone/i18n')
const read = (f) => JSON.parse(readFileSync(join(dir, f), 'utf8'))
const lit = (v) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`

const articles = {}
for (const f of readdirSync(dir).filter((x) => /^articles\.(\w+)\.part\d\.json$/.test(x))) {
  const locale = f.split('.')[1]
  for (const [slug, tr] of Object.entries(read(f))) {
    ;(articles[slug] ??= {})[locale] = tr
  }
}
const projects = read('projects.json')

const out = [
  '-- Переклади статей журналу та story/solution проєктних пропозицій (pl/en/de/lt).',
  '-- Згенеровано scripts/stone-i18n-sql.mjs з data/stone/i18n/*.json. Ідемпотентно: i18n перезаписується цілком.',
  'begin;',
]
for (const [slug, i18n] of Object.entries(articles)) {
  out.push(`update stilnytsi_articles set data = data || jsonb_build_object('i18n', ${lit(i18n)}) where slug = '${slug}';`)
}
for (const [slug, i18n] of Object.entries(projects)) {
  out.push(`update stilnytsi_projects set data = data || jsonb_build_object('i18n', ${lit(i18n)}) where slug = '${slug}';`)
}
out.push('commit;')
process.stdout.write(out.join('\n') + '\n')
console.error(`articles: ${Object.keys(articles).length}, projects: ${Object.keys(projects).length}`)
