import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { InfoPage, Section, Prose, Facts, Faq, CtaBand, LinkPills } from "@/components/info-page"
import { StoneCard } from "@/components/stone-card"
import { fetchStones } from "@/lib/data-source"
import { MEMORIAL_FACETS, facetItems } from "@/lib/catalog-taxonomy"
import { productType } from "@/lib/product-copy"
import { CITIES, CONTACT, DELIVERY, LEAD_TIMES, PAYMENT, WARRANTY_YEARS, cityBySlug, type City } from "@/lib/site-facts"
import { SITE_URL, absoluteUrl } from "@/lib/site-config"
import type { StoneItem } from "@/lib/types"

export const revalidate = 60
export const dynamicParams = false

type Params = { city: string }

export function generateStaticParams(): Params[] {
  return CITIES.map((c) => ({ city: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { city: slug } = await params
  const city = cityBySlug(slug)
  if (!city) return { title: "Сторінку не знайдено", robots: { index: false, follow: false } }
  const url = absoluteUrl(`/pamyatnyky/${city.slug}`)
  const title = `Пам'ятники ${city.inCity} — від виробника, з монтажем`
  const description = `Пам'ятники з граніту ${city.inCity} від майстерні з Костополя: одинарні, подвійні, хрести, комплекси, військові. ${
    city.freeTravel ? "Замір і монтаж безкоштовно" : `Доставка ${city.distanceKm} км за пробігом`
  }, виготовлення ${LEAD_TIMES.single}, гарантія ${WARRANTY_YEARS} років.`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} — Stone Memory`, description, url, type: "website", images: ["/opengraph-image"] },
  }
}

function fmt(n: number) {
  return `${n.toLocaleString("uk-UA")}\u00A0₴`
}

function minPrice(items: StoneItem[]) {
  const p = items.map((s) => s.priceFrom).filter((x): x is number => typeof x === "number" && x > 0)
  return p.length ? Math.min(...p) : null
}

function cityFaq(city: City) {
  const travel = city.freeTravel
    ? `Виїзд на замір і монтаж ${city.inCity} безкоштовний — ${city.region} входить у нашу зону обслуговування без доплат.`
    : `Доставка ${city.inCity} рахується за пробігом: ${city.distanceKm} км від Костополя, ${DELIVERY.perKm} в один бік. Точну суму називаємо разом із ціною виробу.`
  return [
    {
      q: `Скільки коштує доставка й монтаж ${city.inCity}?`,
      a: `${travel} Сам монтаж і армований фундамент уже входять у ціну кожної моделі на сайті.`,
    },
    {
      q: `Чи треба їхати до вас у Костопіль?`,
      a: `Ні. Ескіз, ціну, пробний відбиток портрета й готовий виріб погоджуємо по фото й відео, замір робимо ми самі ${city.inCity}. Приїхати варто лише якщо хочете побачити камінь наживо — ${city.distanceKm ? `це ${city.distanceKm} км, ${city.travel}` : "цех у місті"}.`,
    },
    {
      q: `Скільки триває замовлення ${city.inCity}?`,
      a: `Одинарний пам'ятник — ${LEAD_TIMES.single} від підписання ескізу, комплекс — ${LEAD_TIMES.complex}. Монтаж ${city.inCity} — один день для одиночного, 1–3 дні для комплексу. ${LEAD_TIMES.seasonNote}`,
    },
    {
      q: "Як оплатити?",
      a: `${PAYMENT.steps.map((s) => `${s.share} — ${s.when}`).join("; ")}. ${PAYMENT.methods}`,
    },
  ]
}

export default async function CityPage({ params }: { params: Promise<Params> }) {
  const { city: slug } = await params
  const city = cityBySlug(slug)
  if (!city) notFound()

  const stones = await fetchStones()
  const monuments = stones.filter((s) => s.category === "memorial")
  const single = monuments.filter((s) => productType(s) === "single")
  const complex = monuments.filter((s) => productType(s) === "complex")
  const military = monuments.filter((s) => productType(s) === "military")

  // Шість робіт різних типів: людина має побачити діапазон, а не шість схожих.
  const byType = new Map<string, StoneItem[]>()
  for (const s of monuments) {
    const t = productType(s)
    byType.set(t, [...(byType.get(t) ?? []), s])
  }
  const picks: StoneItem[] = []
  for (const t of ["single", "complex", "military", "double", "cross", "european", "child"]) {
    const list = byType.get(t) ?? []
    const featured = list.find((s) => s.isFeatured) ?? list[0]
    if (featured) picks.push(featured)
    if (picks.length === 6) break
  }

  const faq = cityFaq(city)
  const others = CITIES.filter((c) => c.slug !== city.slug)

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `Виготовлення та встановлення пам'ятників ${city.inCity}`,
      serviceType: "Пам'ятники з граніту",
      provider: { "@type": "LocalBusiness", "@id": `${SITE_URL}/#localbusiness`, name: "Stone Memory", telephone: "+380688080222" },
      areaServed: { "@type": "City", name: city.name },
      url: absoluteUrl(`/pamyatnyky/${city.slug}`),
      ...(minPrice(single)
        ? { offers: { "@type": "Offer", priceCurrency: "UAH", price: minPrice(single), description: "Одинарний пам'ятник із монтажем" } }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Головна", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: `Пам'ятники ${city.inCity}`, item: absoluteUrl(`/pamyatnyky/${city.slug}`) },
      ],
    },
  ]

  return (
    <>
      {schema.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <InfoPage
        crumbs={[{ name: `Пам'ятники ${city.inCity}` }]}
        title={`Пам'ятники ${city.inCity}`}
        lead={`Виготовляємо в Костополі, встановлюємо ${city.inCity}. ${
          city.freeTravel ? "Замір, доставка й монтаж — безкоштовно." : `Доставка ${city.distanceKm} км, ${city.travel}.`
        } Ціна від виробника, без салонної націнки.`}
      >
        <Section>
          <Facts
            items={[
              { value: minPrice(single) ? `від ${fmt(minPrice(single)!)}` : "—", label: "одинарний пам'ятник з монтажем" },
              { value: minPrice(complex) ? `від ${fmt(minPrice(complex)!)}` : "—", label: "меморіальний комплекс" },
              { value: city.distanceKm ? `${city.distanceKm} км` : "цех тут", label: city.distanceKm ? `від цеху, ${city.travel}` : city.name },
              { value: city.freeTravel ? "0 ₴" : DELIVERY.perKm, label: city.freeTravel ? "виїзд і монтаж" : "доставка, за пробігом" },
            ]}
          />
        </Section>

        <Section eyebrow={city.region} title={`Як ми працюємо ${city.inCity}`}>
          <Prose
            text={`${city.note}\n\nПроцес той самий, що й для клієнтів у Костополі: ви надсилаєте фото ділянки, ми за день повертаємо ескіз і ціну, виїжджаємо на замір ${city.inCity}, робимо шурф під фундамент і погоджуємо все з адміністрацією кладовища. Виготовлення — ${LEAD_TIMES.single} для одинарного і ${LEAD_TIMES.complex} для комплексу, монтаж бригадою за 1–3 дні. Гарантія ${WARRANTY_YEARS} років на камінь, фундамент і монтаж діє ${city.inCity} так само, як і біля цеху: приїжджаємо й виправляємо безкоштовно.`}
          />
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link href="/yak-zamovyty" className="rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:border-foreground/40">Як замовити</Link>
            <Link href="/dostavka-i-oplata" className="rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:border-foreground/40">Доставка й оплата</Link>
            <Link href="/tsiny" className="rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:border-foreground/40">Ціни</Link>
          </div>
        </Section>

        {picks.length > 0 && (
          <Section eyebrow="З каталогу" title={`Що замовляють ${city.inCity} найчастіше`}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {picks.map((s, i) => (
                <StoneCard key={s.id} item={s} priority={i < 3} />
              ))}
            </div>
            <div className="mt-6">
              <LinkPills
                items={MEMORIAL_FACETS.map((f) => ({
                  href: `/memorial/pamyatnyky/${f.slug}`,
                  label: f.h1,
                  count: facetItems(stones, f).length,
                })).filter((f) => f.count > 0)}
              />
            </div>
          </Section>
        )}

        {military.length > 0 && (
          <Section eyebrow="Захисникам" title={`Військові пам'ятники ${city.inCity}`}>
            <Prose
              text={`Для родин загиблих військових ми готуємо повний пакет документів для компенсації від держави та фондів: договір, рахунок, акт, фотофіксацію. Портрет у формі, шеврон підрозділу, герб і нагороди гравіюємо за наданими зображеннями. У каталозі ${military.length} ${military.length < 5 ? "моделі" : "моделей"}${
                minPrice(military) ? `, від ${fmt(minPrice(military)!)}` : ""
              }; будь-яку доопрацьовуємо під конкретну людину.`}
            />
            <div className="mt-4">
              <Link href="/memorial/pamyatnyky/viyskovi" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background">
                Військові пам'ятники
              </Link>
            </div>
          </Section>
        )}

        <Section eyebrow="Питання" title={`Про замовлення ${city.inCity} запитують`}>
          <Faq items={faq} />
        </Section>

        <Section eyebrow="Інші міста" title="Куди ще виїжджаємо">
          <LinkPills items={others.map((c) => ({ href: `/pamyatnyky/${c.slug}`, label: c.name }))} />
          <p className="mt-4 text-sm text-muted-foreground">
            Немає вашого міста? Працюємо по всій Україні — подзвоніть{" "}
            <a href={CONTACT.phoneHref} className="underline underline-offset-4 hover:text-foreground">{CONTACT.phoneDisplay}</a>, скажемо вартість доставки за хвилину.
          </p>
        </Section>

        <CtaBand title={`Порахуємо пам'ятник ${city.inCity} за фото ділянки`} />
      </InfoPage>
    </>
  )
}
