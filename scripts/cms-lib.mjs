/**
 * Спільне для scripts/audit.mjs і scripts/cms-seed-sql.mjs: транспіляція
 * TS-даних без tsx/ts-node та читання контенту або з бази (як сайт), або з
 * data/seed (як перший імпорт).
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

export const root = process.cwd()
const outDir = path.join(root, '.next', 'audit')

/** Підвантажує .env.local (без сторонніх пакетів), не перекриваючи вже задані змінні. */
export function loadEnv() {
  const file = path.join(root, '.env.local')
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (!m || process.env[m[1]] !== undefined) continue
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

function transpile(relFile) {
  const src = fs.readFileSync(path.join(root, relFile), 'utf8')
  const rewritten = src.replace(/from '@\/(data|lib)\/([a-z0-9/-]+)'/g, (_, dir, name) => {
    const target = path.posix.relative(path.posix.dirname(relFile), `${dir}/${name}.js`)
    return `from '${target.startsWith('.') ? target : './' + target}'`
  })
  const { outputText } = ts.transpileModule(rewritten, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  })
  const dest = path.join(outDir, relFile.replace(/\.ts$/, '.js'))
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, outputText)
}

/** Транспілює data/, data/seed/, lib/cms-types, lib/paths у .next/audit і повертає loader. */
export function prepareSeed() {
  fs.rmSync(outDir, { recursive: true, force: true })
    const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
      if (e.isDirectory()) walk(`${rel}/${e.name}`)
      else if (e.name.endsWith('.ts')) transpile(`${rel}/${e.name}`)
    }
  }
  walk('data/stone')
  transpile('lib/stone/cms-types.ts')
  transpile('lib/stone/paths.ts')
  transpile('lib/stone/prices.ts')
  transpile('lib/stone/config.ts')
  fs.writeFileSync(path.join(outDir, 'package.json'), '{"type":"module"}')
  return (rel) => import(pathToFileURL(path.join(outDir, rel)).href)
}

/** Увесь контент із data/seed у тому вигляді, в якому він іде в базу. */
export async function loadSeedContent(load) {
  const [{ collections }, { projects }, { articles }, { slabs }, { remnants }, { settings }] =
    await Promise.all([
      load('data/stone/seed/collections.js'),
      load('data/stone/seed/projects.js'),
      load('data/stone/seed/articles.js'),
      load('data/stone/seed/slabs.js'),
      load('data/stone/seed/remnants.js'),
      load('data/stone/seed/settings.js'),
    ])
  return { collections, projects, articles, slabs, remnants, settings }
}

/** Той самий контент, але з бази — так, як його бачить сайт. */
export async function loadDbContent() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '')
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const rest = async (p) => {
    const r = await fetch(`${url}/rest/v1/${p}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    if (!r.ok) throw new Error(`${p} → HTTP ${r.status}`)
    return r.json()
  }
  const list = async (t) => (await rest(`${t}?select=data&order=position.asc`)).map((r) => r.data)
  const [collections, projects, articles, slabs, remnants, settingsRows] = await Promise.all([
    list('stilnytsi_materials'),
    list('stilnytsi_projects'),
    list('stilnytsi_articles'),
    list('stilnytsi_slabs'),
    list('stilnytsi_remnants'),
    rest('stilnytsi_settings?select=key,data'),
  ])
  const settings = Object.fromEntries(settingsRows.map((r) => [r.key, r.data]))
  return { collections, projects, articles, slabs, remnants, settings }
}
