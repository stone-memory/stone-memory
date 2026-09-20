import { revalidatePath, revalidateTag } from "next/cache"
import { CMS_TAG } from "@/lib/stone/cms"
import { BUSINESS_PROFILE_TAG } from "@/lib/business-profile"

// Maps an admin-editable content resource to the public routes whose ISR
// cache must be purged when that content changes. Dynamic routes use the
// "page" type so every generated instance is refreshed.
const RESOURCE_PATHS: Record<string, Array<[string, "page" | "layout"]>> = {
  stones: [
    ["/", "page"],
    ["/memorial/pamyatnyky", "page"],
    ["/memorial/kameni", "page"],
    // Covers both facet and product pages — they share one dynamic segment.
    ["/memorial/pamyatnyky/[slug]", "page"],
    ["/memorial/pamyatnyky/[slug]/[page]", "page"],
    // Ціни, хаб пам'ятників, сторінки міст і «Про нас» рахують медіани й
    // кількість моделей із каталогу, тому теж залежать від товарів.
    ["/tsiny", "page"],
    ["/pamyatnyky", "page"],
    ["/pamyatnyky/[city]", "page"],
    ["/pro-nas", "page"],
    // Старі адреси товарів (308 на новий шлях) і фолбек портфоліо читають каталог.
    ["/kameni/[id]", "page"],
    ["/proekty", "page"],
  ],
  services: [["/posluhy", "page"]],
  projects: [["/proekty", "page"]],
  // Головна статей, відгуків і FAQ не читає — зайві ISR Writes прибрано;
  // натомість хаб пам'ятників показує відгуки й FAQ, тож він у списку.
  articles: [
    ["/blog", "page"],
    ["/blog/[slug]", "page"],
  ],
  reviews: [
    ["/vidhuky", "page"],
    ["/pamyatnyky", "page"],
  ],
  "faq-items": [
    ["/pytannya", "page"],
    ["/pamyatnyky", "page"],
  ],
  // «Популярне» рендериться лише на хабі пам'ятників.
  featured: [["/pamyatnyky", "page"]],
}

/** Усі ресурси з публічними сторінками — для повного скидання після сіду. */
export const PUBLIC_RESOURCES = Object.keys(RESOURCE_PATHS)

// Purge ISR cache for the public pages affected by a content change, plus the
// sitemap. Best-effort: never throws, so an admin write is never broken by a
// revalidation hiccup (e.g. running outside a request scope).
export function revalidateForResource(resource: string): void {
  if (resource.startsWith("stilnytsi-")) {
    revalidateStone()
    return
  }
  const paths = RESOURCE_PATHS[resource]
  if (!paths) return // CRM-internal resources (tasks/transactions/…) have no public page
  try {
    for (const [path, type] of paths) revalidatePath(path, type)
    revalidatePath("/sitemap.xml")
    revalidatePath("/sitemap-images.xml")
  } catch {
    // ignore — revalidation is an optimisation, not a correctness requirement
  }
}

/**
 * Контент розділу «Архітектурний камінь» читається через lib/stone/cms.ts і
 * кешується з тегом CMS_TAG. Скидаємо тег — і сторінки розділу разом із
 * мапою сайту перебудовуються з нових даних при наступному відкритті.
 */
export function revalidateStone(): void {
  try {
    // { expire: 0 }: наступний запит уже з новими даними. З профілем "max" Next 16
    // спершу віддає старий кеш і оновлює у фоні, тож адмін бачив старе після
    // збереження. Це маршрут-обробник, updateTag тут недоступний.
    revalidateTag(CMS_TAG, { expire: 0 })
    revalidatePath("/l/[lang]/arkhitekturnyi-kamin", "layout")
    // Головна показує бібліотеку колекцій (getCollections), тег для неї замало.
    revalidatePath("/", "page")
    revalidatePath("/sitemap.xml")
    revalidatePath("/sitemap-images.xml")
  } catch {
    // ignore — revalidation is an optimisation, not a correctness requirement
  }
}

/**
 * Профіль бізнесу читається в кореневому layout (футер, JSON-LD) і на
 * серверних сторінках; збереження в адмінці має оновити все одразу.
 */
export function revalidateBusinessProfile(): void {
  try {
    revalidateTag(BUSINESS_PROFILE_TAG, { expire: 0 })
    revalidatePath("/", "layout")
  } catch {
    // ignore
  }
}
