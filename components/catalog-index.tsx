import Link from "next/link"
import type { StoneItem } from "@/lib/types"

const GROUP_LABEL: Record<string, string> = {
  memorial: "Пам'ятники",
  home: "Для дому й саду",
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
  const groups = (["memorial", "home"] as const)
    .map((category) => ({
      category,
      items: stones.filter((s) => s.category === category),
    }))
    .filter((g) => g.items.length > 0)

  if (groups.length === 0) return null

  return (
    <section
      aria-labelledby="catalog-index-heading"
      className="border-t border-foreground/5 bg-secondary/30 py-14 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-6">
        <h2
          id="catalog-index-heading"
          className="text-xl font-semibold tracking-tight-custom md:text-2xl"
        >
          Усі моделі
        </h2>

        {groups.map((group) => (
          <div key={group.category} className="mt-8">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {GROUP_LABEL[group.category]}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
              {group.items.map((stone) => (
                <li key={stone.id}>
                  <Link
                    href={`/kameni/${stone.id}`}
                    className="text-sm text-muted-foreground tabular-nums transition-colors hover:text-foreground"
                  >
                    {stone.name || `№ ${stone.id}`}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
