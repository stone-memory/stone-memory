import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { fetchStones } from "@/lib/data-source"
import { absoluteUrl } from "@/lib/site-config"
import { MEMORIAL_FACETS, facetItems, verticalLabel } from "@/lib/catalog-taxonomy"

export const revalidate = 60

const PATH = "/memorial"

export const metadata: Metadata = {
  title: "Пам'ятники з граніту — виготовлення від виробника",
  description:
    "Пам'ятники, меморіальні комплекси, надгробки з граніту й мармуру. Власний цех у Костополі: проєкт, гравіювання, доставка й монтаж. Гарантія 5 років.",
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    title: "Меморіальний напрямок — Stone Memory",
    description:
      "Пам'ятники, меморіальні комплекси, благоустрій місця поховання. Виробництво повного циклу в Костополі.",
    url: absoluteUrl(PATH),
    type: "website",
    images: ["/opengraph-image"],
  },
}

/** Sections of the memorial vertical that are not catalogue facets. */
const SERVICES = [
  {
    href: "/posluhy#engraving",
    title: "Портрети та гравіювання",
    text: "Ручне й лазерне гравіювання портрета, епітафії, символіки підрозділу та нагород.",
  },
  {
    href: "/posluhy#delivery",
    title: "Доставка та монтаж",
    text: "Фундамент, встановлення й узгодження з адміністрацією кладовища по всій Україні.",
  },
  {
    href: "/posluhy#design",
    title: "Благоустрій місця поховання",
    text: "Квітники, огорожі, столи й лавки, облицювання ділянки з того самого каменю.",
  },
  {
    href: "/proekty",
    title: "Каталог готових робіт",
    text: "Виконані пам'ятники й комплекси з фотографіями з місця встановлення.",
  },
]

export default async function MemorialHubPage() {
  const stones = await fetchStones()
  const total = stones.filter((s) => s.category === "memorial").length

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: verticalLabel("memorial"), item: absoluteUrl(PATH) },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Header />
      <main id="main-content">
        <div className="mx-auto max-w-7xl px-6 pt-6">
          <Breadcrumbs items={[{ name: verticalLabel("memorial") }]} />
        </div>

        <section className="mx-auto max-w-7xl px-6 pt-6 pb-16 md:pt-8 md:pb-20">
          <h1 className="text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
            Пам'ятники з натурального каменю
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground text-balance md:text-lg">
            Виробництво повного циклу в Костополі — від ескізу до встановлення на місці. Граніт,
            габро й мармур українських родовищ, гарантія 5 років на камінь, фундамент і монтаж.
          </p>

          <div className="mt-10">
            <h2 className="text-2xl font-semibold tracking-tight-custom md:text-3xl">Каталог</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/memorial/pamyatnyky"
                className="rounded-2xl border border-foreground/10 p-6 transition-colors hover:border-foreground/30"
              >
                <span className="text-lg font-medium">Усі пам'ятники</span>
                <span className="mt-1 block text-sm text-muted-foreground tabular-nums">
                  {total} моделей у каталозі
                </span>
              </Link>

              {MEMORIAL_FACETS.map((facet) => {
                const count = facetItems(stones, facet).length
                if (count === 0) return null
                return (
                  <Link
                    key={facet.slug}
                    href={`/memorial/pamyatnyky/${facet.slug}`}
                    className="rounded-2xl border border-foreground/10 p-6 transition-colors hover:border-foreground/30"
                  >
                    <span className="text-lg font-medium">{facet.h1}</span>
                    <span className="mt-1 block text-sm text-muted-foreground tabular-nums">
                      {count} моделей
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="mt-14">
            <h2 className="text-2xl font-semibold tracking-tight-custom md:text-3xl">Послуги</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="rounded-2xl border border-foreground/10 p-6 transition-colors hover:border-foreground/30"
                >
                  <span className="text-lg font-medium">{s.title}</span>
                  <span className="mt-2 block text-sm text-muted-foreground">{s.text}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
