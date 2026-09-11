import "server-only"
import { unstable_cache } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Article, Collection, Project, Remnant, SettingKey, Settings, Slab } from "@/lib/stone/cms-types"

/**
 * Контент розділу «Архітектурний камінь» (/arkhitekturnyi-kamin) з таблиць stilnytsi_*.
 *
 * Читаємо тим самим шляхом, що й решта контенту сайту (lib/data-source.ts):
 * supabaseAdmin на сервері, приховані записи відсіюємо тут. Кожен запит
 * кешується з тегом CMS_TAG, і адмінка після збереження скидає його через
 * revalidateForResource() — сторінки оновлюються за секунду без окремих
 * ключів і без HTTP-виклику.
 *
 * Якщо база недоступна, віддаємо початковий набір із data/stone/seed — той
 * самий, що заливався в неї SQL-міграцією. Сторінка тоді покаже старий, але
 * коректний контент замість помилки.
 */
export const CMS_TAG = "stilnytsi"
// 5 хвилин, а не година: правки, зроблені прямо в базі (SQL-імпорт), не
// скидають тег, і різні інстанси сервера показували різний набір колекцій.
const TTL = 300

type Row<T> = { data: T; hidden: boolean }

async function list<T>(table: string, seed: () => Promise<T[]>): Promise<T[]> {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select("data, hidden")
    .order("position", { ascending: true })
  if (error || !data) {
    console.error(`[stone/cms] ${table}:`, error?.message ?? "no data")
    return seed()
  }
  return (data as Row<T>[]).filter((r) => !r.hidden).map((r) => r.data)
}

const cached = <T>(key: string, fn: () => Promise<T>) =>
  unstable_cache(fn, [`stone-${key}`], { tags: [CMS_TAG], revalidate: TTL })()

export const getCollections = () =>
  cached("materials", () =>
    list<Collection>("stilnytsi_materials", async () => (await import("@/data/stone/seed/collections")).collections)
  )
export const getProjects = () =>
  cached("projects", () =>
    list<Project>("stilnytsi_projects", async () => (await import("@/data/stone/seed/projects")).projects)
  )
export const getArticles = () =>
  cached("articles", () =>
    list<Article>("stilnytsi_articles", async () => (await import("@/data/stone/seed/articles")).articles)
  )
export const getSlabs = () =>
  cached("slabs", () => list<Slab>("stilnytsi_slabs", async () => (await import("@/data/stone/seed/slabs")).slabs))
export const getRemnants = () =>
  cached("remnants", () =>
    list<Remnant>("stilnytsi_remnants", async () => (await import("@/data/stone/seed/remnants")).remnants)
  )

export async function getCollection(slug: string) {
  return (await getCollections()).find((x) => x.slug === slug) ?? null
}
export async function getProject(slug: string) {
  return (await getProjects()).find((x) => x.slug === slug) ?? null
}
export async function getArticle(slug: string) {
  return (await getArticles()).find((x) => x.slug === slug) ?? null
}

const seedSettings = async (): Promise<Settings> => (await import("@/data/stone/seed/settings")).settings

/** Усі налаштування розділу одним запитом (контакти, калькулятор, FAQ, тексти). */
export const getSettings = () =>
  cached("settings", async (): Promise<Settings> => {
    const { data, error } = await supabaseAdmin.from("stilnytsi_settings").select("key, data")
    if (error || !data) {
      console.error("[stone/cms] settings:", error?.message ?? "no data")
      return seedSettings()
    }
    const fromDb = Object.fromEntries(data.map((r) => [r.key as SettingKey, r.data])) as Partial<Settings>
    // Ключ, якого ще нема в базі, беремо з початкового набору: розділ має
    // працювати і під час поетапного наповнення.
    return { ...(await seedSettings()), ...fromDb }
  })

export async function getSetting<K extends SettingKey>(k: K): Promise<Settings[K]> {
  return (await getSettings())[k]
}

export const getContacts = async () => (await getSettings()).contacts
