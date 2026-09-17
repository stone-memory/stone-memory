import "server-only"
import { unstable_cache } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Article, Collection, Contacts, Project, Remnant, SettingKey, Settings, Slab } from "@/lib/stone/cms-types"
import { fetchBusinessProfile } from "@/lib/data-source"
import { hoursRows, telHref, telegramHref, viberHref } from "@/lib/business-profile"
import { versioned, versionedAll } from "@/lib/stone/asset-url"

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
// Доба: кожен запис у кеш рахується як ISR Write, і на Hobby-плані Vercel
// ліміт 200 тис. на місяць (у вересні 2026 його перевищили на 335 тис.,
// коли TTL був годиною). Правки з адмінки скидають тег одразу
// (revalidateStone), тож довгий TTL не затримує контент. Після SQL-імпорту
// прямо в базу треба зберегти будь-який запис в адмінці, щоб скинути кеш.
const TTL = 86400

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

// Адреси фото з public/ отримують ?v=<хеш вмісту> тут, на рівні даних, тож
// кожне місце рендеру (каталог, картка, галерея, головна, sitemap-images)
// бачить уже версійовану адресу. Див. lib/stone/asset-url.ts.
export const getCollections = () =>
  cached("materials", async () =>
    (
      await list<Collection>(
        "stilnytsi_materials",
        async () => (await import("@/data/stone/seed/collections")).collections
      )
    ).map((c) => ({ ...c, image: versioned(c.image), cardImage: versioned(c.cardImage) }))
  )
export const getProjects = () =>
  cached("projects", async () =>
    (
      await list<Project>("stilnytsi_projects", async () => (await import("@/data/stone/seed/projects")).projects)
    ).map((p) => ({ ...p, image: versioned(p.image), gallery: versionedAll(p.gallery ?? []) }))
  )
export const getArticles = () =>
  cached("articles", async () =>
    (
      await list<Article>("stilnytsi_articles", async () => (await import("@/data/stone/seed/articles")).articles)
    ).map((a) => ({
      ...a,
      image: a.image ? versioned(a.image) : a.image,
      detailImage: a.detailImage ? versioned(a.detailImage) : a.detailImage,
    }))
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

/**
 * Контакти розділу: телефон, пошта, адреса, графік і соцмережі беруться з
 * бізнес-профілю (одна адмінка на весь сайт); з налаштувань стільниць
 * лишаються бренд, координати цеху для мапи й посилання WhatsApp.
 */
export const getContacts = async (): Promise<Contacts> => {
  const [own, profile] = await Promise.all([getSettings().then((s) => s.contacts), fetchBusinessProfile()])
  const rows = hoursRows(profile)
  const line = (label: string, fallback: string) => {
    const r = rows.find((x) => x.days === label || x.days.startsWith(label))
    return r ? `${r.days} ${r.time}` : fallback
  }
  const weekdays = rows.find((x) => x.days.includes("–")) ?? rows[0]
  return {
    ...own,
    legalName: profile.displayName || own.legalName,
    company: profile.legalName || own.company,
    phone: { display: profile.phone, href: telHref(profile) },
    email: { display: profile.email, href: `mailto:${profile.email}` },
    address: {
      ...own.address,
      street: profile.address,
      postalCode: profile.postalCode,
      city: profile.city,
      region: profile.region,
      country: profile.country,
    },
    hours: {
      weekdays: weekdays ? `${weekdays.days} ${weekdays.time}` : own.hours.weekdays,
      saturday: line("Сб", own.hours.saturday),
      sunday: profile.hours.sun?.closed ? "Нд — вихідний" : line("Нд", own.hours.sunday),
    },
    chat: { ...own.chat, viber: viberHref(profile), telegram: telegramHref(profile) },
    social: {
      instagram: profile.instagram || own.social.instagram,
      facebook: profile.facebook || own.social.facebook,
    },
  }
}
