/**
 * Генерує SQL первинного імпорту контенту стільниць у Supabase:
 *   node scripts/cms-seed-sql.mjs > supabase/stilnytsi-cms-2-seed.sql
 *
 * Джерело — data/stone/seed/*.ts (те, що зараз показує сайт без бази). Скрипт
 * ідемпотентний: upsert по ключу, тож повторний запуск оновить записи, а
 * приховані/дописані в адмінці лишаться (hidden і position не чіпаємо).
 */
import { loadSeedContent, prepareSeed } from './cms-lib.mjs'

const load = prepareSeed()
const { collections, projects, articles, slabs, remnants, settings } = await loadSeedContent(load)

const lit = (v) => `'${String(v).replace(/'/g, "''")}'`
const json = (v) => `${lit(JSON.stringify(v))}::jsonb`

const out = []
out.push('-- Stone Memory · контент сайту стільниць — крок 2: початкові дані')
out.push(
  `-- Згенеровано ${new Date().toISOString()} із data/stone/seed. Виконати після stilnytsi-cms-1-schema.sql.`
)
out.push('begin;')

function upsertList(table, idCol, rows, idOf) {
  out.push('')
  out.push(`-- ${table}: ${rows.length}`)
  rows.forEach((row, i) => {
    out.push(
      `insert into public.${table} (${idCol}, data, position) values (${lit(idOf(row))}, ${json(row)}, ${i})` +
        ` on conflict (${idCol}) do update set data = excluded.data;`
    )
  })
}
upsertList('stilnytsi_materials', 'slug', collections, (r) => r.slug)
upsertList('stilnytsi_projects', 'slug', projects, (r) => r.slug)
upsertList('stilnytsi_articles', 'slug', articles, (r) => r.slug)
upsertList('stilnytsi_slabs', 'id', slabs, (r) => r.id)
upsertList('stilnytsi_remnants', 'id', remnants, (r) => r.id)

out.push('')
out.push(`-- stilnytsi_settings: ${Object.keys(settings).length}`)
for (const [key, data] of Object.entries(settings)) {
  out.push(
    `insert into public.stilnytsi_settings (key, data) values (${lit(key)}, ${json(data)})` +
      ` on conflict (key) do update set data = excluded.data;`
  )
}
out.push('commit;')
out.push('')
out.push("select 'materials' as t, count(*) from public.stilnytsi_materials")
out.push("union all select 'projects', count(*) from public.stilnytsi_projects")
out.push("union all select 'articles', count(*) from public.stilnytsi_articles")
out.push("union all select 'slabs', count(*) from public.stilnytsi_slabs")
out.push("union all select 'remnants', count(*) from public.stilnytsi_remnants")
out.push("union all select 'settings', count(*) from public.stilnytsi_settings;")
process.stdout.write(out.join('\n') + '\n')
