import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { stoneCode, stoneDisplayName, stonePath } from "@/lib/catalog-taxonomy"
import { defaultStone } from "@/lib/stone-guide"
import type { StoneItem } from "@/lib/types"

/**
 * Назва без каменю: «Одинарний пам'ятник — капустинський граніт, проста форма»
 * стає «Одинарний пам'ятник, проста форма».
 *
 * Камінь у цьому розділі стоїть заголовком групи, тож повторювати його в
 * кожному з 122 рядків немає сенсу — саме через це індекс роздувся на пів
 * екрана. Назви старих позицій («Ангел Скорботи») каменю не містять і
 * проходять крізь цю функцію без змін.
 */
function shortName(name: string): string {
  const dash = name.indexOf(" — ")
  if (dash === -1) return name
  const head = name.slice(0, dash)
  const tail = name.slice(dash + 3)
  const comma = tail.indexOf(",")
  const withoutStone = comma === -1 ? head : `${head},${tail.slice(comma + 1)}`
  // Розділ називається «Усі моделі» й складається з самих пам'ятників, тому
  // саме слово в кожному рядку зайве: «Одинарний пам'ятник, проста форма» →
  // «Одинарний, проста форма». «Хрест гранітний» цього слова не містить і
  // лишається як є.
  //
  // Без `\b`: у JS ця межа рахується за ASCII-класом \w, куди кирилиця не
  // входить, тому після «пам'ятник» вона не спрацьовує взагалі.
  return withoutStone.replace(/ ?пам'ятник/i, "")
}

/**
 * Plain server-rendered index of every catalogue item.
 *
 * The grid above renders nine cards and grows on scroll, which is right for
 * humans but left all 60 product pages with zero inbound internal links — they
 * were reachable only from sitemap.xml, i.e. orphans as far as PageRank flow
 * and crawl priority are concerned.
 *
 * This is a real, visible index (not a hidden link farm): text links only, so
 * it costs no images and no JavaScript, and it gives every product a permanent
 * path from the catalogue.
 */
export function CatalogIndex({ stones }: { stones: StoneItem[] }) {
  // Тільки пам'ятники: лінійка «дім» ще не має маршруту, і її позиції не
  // повинні звідси лінкуватись — це єдине місце, що дає товару шлях для
  // обходу пошуковиком.
  const monuments = stones.filter((s) => s.category === "memorial")

  // Групуємо за каменем, а не одним списком: 122 повні назви займали пів
  // екрана, бо кожна повторювала породу. Тепер камінь названо один раз
  // заголовком, а рядок несе тільки те, чим позиція від сусідів різниться.
  const byStone = new Map<string, StoneItem[]>()
  for (const s of monuments) {
    const key = defaultStone(s).name
    const list = byStone.get(key)
    list ? list.push(s) : byStone.set(key, [s])
  }

  const groups = [...byStone.entries()]
    .map(([label, items]) => ({ label, items }))
    .sort((a, b) => b.items.length - a.items.length)

  if (groups.length === 0) return null

  return (
    <section
      aria-labelledby="catalog-index-heading"
      className="border-t border-foreground/5 bg-secondary/30 py-14 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Згорнуто за замовчуванням: розгорнутий список зі 122 позицій займав
            три з половиною екрани на телефоні під кожною сторінкою каталогу.
            <details> лишає всі посилання в розмітці — вони й далі дають кожному
            товару шлях для обходу, — але не змушує гортати їх повз. */}
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-xl font-semibold tracking-tight-custom md:text-2xl">
            <h2 id="catalog-index-heading" className="inline">
              Усі моделі
            </h2>
            <span className="text-sm font-normal tabular-nums text-muted-foreground">
              {monuments.length}
            </span>
            <ChevronDown
              className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180"
              strokeWidth={2}
            />
          </summary>

          {groups.map((group) => (
            <div key={group.label} className="mt-7">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {group.label}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                {group.items.map((stone) => (
                  <li key={stone.id}>
                    <Link
                      href={stonePath(stone)}
                      className="text-[13px] text-muted-foreground tabular-nums transition-colors hover:text-foreground"
                    >
                      {shortName(stoneDisplayName(stone) ?? `№ ${stoneCode(stone)}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </details>
      </div>
    </section>
  )
}
