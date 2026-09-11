import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { CatalogGrid } from "@/components/catalog-grid"
import { CatalogIndex } from "@/components/catalog-index"
import { ConsultButton } from "@/components/consult-button"
import {
  MEMORIAL_FACETS,
  catalogPageCount,
  catalogPagePath,
  facetItems,
  type Facet,
} from "@/lib/catalog-taxonomy"
import { absoluteUrl } from "@/lib/site-config"
import { CITIES, LEAD_TIMES, WARRANTY_YEARS } from "@/lib/site-facts"
import type { StoneItem } from "@/lib/types"

type Props = {
  stones: StoneItem[]
  /** Немає — це кореневий каталог. */
  facet?: Facet
  page: number
}

const ROOT_INTRO =
  "Одиночні стели, подвійні пам'ятники, хрести й меморіальні комплекси з граніту, габро й лабрадориту. Кожна модель виготовляється в нашому цеху в Костополі під розмір ділянки; ціна «від» — за базову комплектацію з фундаментом і монтажем."

/**
 * Сторінка каталогу — кореневого або фасета, будь-якої сторінки пагінації.
 *
 * Одна серверна розкладка на чотири адреси (/pamyatnyky, /pamyatnyky/
 * storinka-2, /pamyatnyky/chorni, /pamyatnyky/chorni/storinka-2), щоб
 * пагінація й фасети не розійшлись у верстці. Пагінація тут — справжні
 * посилання: раніше сторінки перемикались станом React, і бот бачив лише
 * перші 30 з 122 товарів.
 */
export function CatalogPage({ stones, facet, page }: Props) {
  const monuments = stones.filter((s) => s.category === "memorial")
  const items = facet ? facetItems(stones, facet) : monuments
  const pageCount = catalogPageCount(items.length)
  const slug = facet?.slug ?? null
  const hrefFor = (n: number) => catalogPagePath(slug, n)
  const siblings = MEMORIAL_FACETS.filter((f) => f.slug !== facet?.slug)

  return (
    <>
      {/* React 19 переносить <link> у <head>: prev/next — сигнал для бота, що
          це один список, розбитий на сторінки. */}
      {page > 1 && <link rel="prev" href={absoluteUrl(hrefFor(page - 1))} />}
      {page < pageCount && <link rel="next" href={absoluteUrl(hrefFor(page + 1))} />}

      <Header />
      <main id="main-content">
        <div className="mx-auto max-w-7xl px-6 pt-6">
          <Breadcrumbs
            items={
              facet
                ? [{ name: "Каталог", href: "/memorial/pamyatnyky" }, { name: facet.h1 }]
                : [{ name: "Каталог" }]
            }
          />
        </div>

        <CatalogGrid
          initialStones={stones}
          lockedCategory="memorial"
          facetSlug={facet?.slug}
          heading={facet ? facet.h1 : "Пам'ятники з граніту від виробника"}
          intro={facet ? facet.description : ROOT_INTRO}
          initialPage={page}
          linkedPages
        />

        {/* Текст підбірки — під сіткою: людина прийшла за товарами, але сторінка
            має нести і той текст, за яким ранжується. Лише на першій сторінці,
            щоб /storinka-2 не дублювала його. */}
        {page === 1 && (
          <section className="mx-auto max-w-7xl px-6 pb-14">
            <div className="max-w-3xl space-y-4 text-base leading-relaxed text-foreground/80">
              {(facet ? facet.intro : ROOT_TEXT).split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Fact value={`${monuments.length}`} label="моделей у каталозі" />
              <Fact value={`від ${minPrice(monuments)}`} label="грн за одинарний пам'ятник" />
              <Fact value={LEAD_TIMES.single} label="виготовлення одиночного" />
              <Fact value={`${WARRANTY_YEARS} років`} label="гарантії на камінь і монтаж" />
            </div>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-6 pb-14">
          <h2 className="text-xl font-semibold tracking-tight-custom md:text-2xl">
            {facet ? "Інші підбірки" : "Підбірки пам'ятників"}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {facet && (
              <Pill href="/memorial/pamyatnyky" label="Усі пам'ятники" count={monuments.length} />
            )}
            {siblings.map((f) => {
              const count = facetItems(stones, f).length
              if (count === 0) return null
              return <Pill key={f.slug} href={`/memorial/pamyatnyky/${f.slug}`} label={f.h1} count={count} />
            })}
          </div>
        </section>

        {page === 1 && (
          <section className="mx-auto max-w-7xl px-6 pb-14">
            <h2 className="text-xl font-semibold tracking-tight-custom md:text-2xl">Доставка й монтаж</h2>
            <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
              Виїзд на замір і монтаж у Рівненській та Волинській областях безкоштовний. Інші регіони — за
              пробігом.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {CITIES.map((c) => (
                <Pill key={c.slug} href={`/pamyatnyky/${c.slug}`} label={`Пам'ятники ${c.name}`} />
              ))}
              <Pill href="/dostavka-i-oplata" label="Умови доставки й оплати" />
              <Pill href="/tsiny" label="Ціни" />
            </div>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="flex flex-col items-start gap-4 rounded-3xl bg-secondary/60 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <h2 className="text-xl font-semibold tracking-tight-custom md:text-2xl">Не знайшли свою модель?</h2>
              <p className="mt-1.5 max-w-xl text-[15px] text-muted-foreground">
                Надішліть фото ділянки або ескіз, який бачили деінде, — зробимо 3D-проєкт і порахуємо вартість у
                будь-якому з наших каменів.
              </p>
            </div>
            <ConsultButton topic="Не знайшли свою модель?">Надіслати фото або ескіз</ConsultButton>
          </div>
        </section>

        {!facet && page === 1 && <CatalogIndex stones={stones} />}
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}

const ROOT_TEXT =
  "У каталозі сім типів виробів: одинарні й подвійні пам'ятники, європейські з низькою стелою на плиті, гранітні хрести, дитячі, військові та меморіальні комплекси з облицюванням усієї ділянки. Усе виготовляється в цеху в Костополі з українського каменю: чорне габро, лабрадорит із синіми переливами, сірий покостівський, червоні лезниківський і капустинський, зелений дідковицький граніт і білий мармур.\n\nЦіна «від» у картці — за базову комплектацію того, що на фото: стела, тумба, квітник або плита, портрет і напис, фундамент і монтаж. Розмір під вашу ділянку, інший камінь або додаткові елементи рахуємо окремо — у картці кожного виробу є перелік того, що входить у вартість і від чого вона змінюється.\n\nБудь-яку модель можна виконати в іншому камені з довідника: у картці є селектор, який одразу перераховує ціну. Якщо потрібне поєднання двох кольорів або форма, якої в каталозі немає, — опишіть її, майстер зробить ескіз."

function minPrice(stones: StoneItem[]): string {
  const prices = stones.map((s) => s.priceFrom).filter((p): p is number => typeof p === "number" && p > 0)
  if (prices.length === 0) return "—"
  return Math.min(...prices).toLocaleString("uk-UA")
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-5">
      <div className="text-2xl font-semibold tracking-tight-custom tabular-nums md:text-3xl">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function Pill({ href, label, count }: { href: string; label: string; count?: number }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:border-foreground/40"
    >
      {label}
      {typeof count === "number" && <span className="ml-1.5 text-muted-foreground tabular-nums">{count}</span>}
    </Link>
  )
}
