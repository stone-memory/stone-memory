import type { Metadata } from "next"
import Link from "next/link"
import { InfoPage, Section, Prose, Table, Faq, CtaBand, LinkPills } from "@/components/info-page"
import { fetchStones } from "@/lib/data-source"
import { MEMORIAL_FACETS, facetItems, catalogPagePath } from "@/lib/catalog-taxonomy"
import { productType, type ProductType } from "@/lib/product-copy"
import { STONE_GUIDE } from "@/lib/stone-guide"
import { LEAD_TIMES, PAYMENT, SERVICE_PRICES, WARRANTY_YEARS } from "@/lib/site-facts"
import { absoluteUrl } from "@/lib/site-config"
import type { StoneItem } from "@/lib/types"

const PATH = "/tsiny"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Ціни на пам'ятники — від виробника, з монтажем",
  description:
    "Скільки коштує пам'ятник з граніту: одинарний, подвійний, хрест, дитячий, комплекс, військовий. Ціни від виробника з фундаментом і монтажем. Гравіювання, фотокераміка, огорожа — прайс.",
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    title: "Ціни на пам'ятники — Stone Memory",
    description: "Ціни на всі типи пам'ятників і послуги: гравіювання, фотокераміка, огорожа, облицювання. Від виробника з Костополя.",
    url: absoluteUrl(PATH),
    type: "website",
    images: ["/opengraph-image"],
  },
}

const TYPE_ORDER: { type: ProductType; label: string; facet: string; lead: string; includes: string }[] = [
  { type: "single", label: "Одинарний пам'ятник", facet: "odynochni", lead: LEAD_TIMES.single, includes: "стела, тумба, квітник, портрет і напис, фундамент, монтаж" },
  { type: "double", label: "Подвійний пам'ятник", facet: "podviyni", lead: LEAD_TIMES.double, includes: "широка стела або дві, тумба, квітник на дві могили, два портрети" },
  { type: "european", label: "Європейський пам'ятник", facet: "yevropeiski", lead: LEAD_TIMES.single, includes: "низька стела, надгробна плита, тумба, портрет і напис" },
  { type: "cross", label: "Хрест гранітний", facet: "khresty", lead: LEAD_TIMES.cross, includes: "хрест із суцільної плити, тумба, напис, квітник" },
  { type: "child", label: "Дитячий пам'ятник", facet: "dytyachi", lead: LEAD_TIMES.child, includes: "стела зменшеного розміру, тумба, квітник, портрет" },
  { type: "complex", label: "Меморіальний комплекс", facet: "kompleksy", lead: LEAD_TIMES.complex, includes: "стела, тумба, плита з квітником, облицювання ділянки, фундамент" },
  { type: "military", label: "Військовий пам'ятник", facet: "viyskovi", lead: LEAD_TIMES.military, includes: "стела, портрет у формі, символіка, плита, облицювання, документи" },
]

const fmt = (n: number) => `${n.toLocaleString("uk-UA")} ₴`

function stats(items: StoneItem[]) {
  const prices = items.map((s) => s.priceFrom).filter((p): p is number => typeof p === "number" && p > 0).sort((a, b) => a - b)
  if (prices.length === 0) return null
  return { min: prices[0], median: prices[Math.floor(prices.length / 2)], max: prices[prices.length - 1], n: prices.length }
}

const FAQ = [
  {
    q: "Чому ціна вказана «від»?",
    a: "Ціна «від» — це базова комплектація моделі в мінімальному стандартному розмірі, з фундаментом і монтажем. Остаточна вартість залежить від розміру ділянки, висоти й товщини стели, кількості гравіювань і додаткових елементів. Після фото ділянки називаємо точну цифру, і вона не змінюється під час роботи.",
  },
  {
    q: "Чи входить монтаж і фундамент у ціну?",
    a: "Так. У кожній ціні на сайті вже є армований бетонний фундамент, доставка й монтаж бригадою в межах Рівненської та Волинської областей. В інші регіони доставка рахується за пробігом, і ми називаємо її одразу разом із ціною виробу.",
  },
  {
    q: "Чому у вас дешевше, ніж у Києві чи Львові, при тому самому камені?",
    a: "Ми виробник: власний цех у Костополі за 100 км від кар'єрів Житомирщини, без орендованих салонів у великих містах і без посередників. Камінь той самий, що продають у столиці, різниця в ціні — це оренда й націнка салону, яких у нас немає.",
  },
  {
    q: "Як оплачувати?",
    a: `${PAYMENT.steps.map((s) => `${s.share} — ${s.when}`).join("; ")}. ${PAYMENT.methods}`,
  },
  {
    q: "Скільки коштує лише гравіювання портрета на вже встановленому пам'ятнику?",
    a: "Портрет на готовому камені — від 2 000 ₴ разом із ретушшю фото, виконуємо на кладовищі або в цеху, якщо стелу можна зняти. Термін — 7–10 днів. Виїзд по Рівненщині й Волині безкоштовний.",
  },
]

export default async function PricesPage() {
  const stones = await fetchStones()
  const monuments = stones.filter((s) => s.category === "memorial")

  const rows = TYPE_ORDER.map((t) => {
    const items = monuments.filter((s) => productType(s) === t.type)
    return { ...t, items, st: stats(items) }
  }).filter((r) => r.st)

  const overall = stats(monuments)
  const facetLinks = MEMORIAL_FACETS.map((f) => ({
    href: catalogPagePath(f.slug, 1),
    label: f.h1,
    count: facetItems(stones, f).length,
  })).filter((f) => f.count > 0)

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  }
  const offers = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Ціни на пам'ятники Stone Memory",
    url: absoluteUrl(PATH),
    itemListElement: rows.map((r) => ({
      "@type": "Offer",
      name: r.label,
      priceCurrency: "UAH",
      price: r.st!.min,
      priceSpecification: { "@type": "PriceSpecification", minPrice: r.st!.min, maxPrice: r.st!.max, priceCurrency: "UAH" },
      url: absoluteUrl(catalogPagePath(r.facet, 1)),
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offers) }} />
      <InfoPage
        crumbs={[{ name: "Ціни" }]}
        title="Ціни на пам'ятники"
        lead={`Від виробника, з фундаментом і монтажем. ${overall ? `Каталог починається з ${fmt(overall.min)} за одинарний пам'ятник` : "Каталог оновлюється"} — і кожна цифра нижче взята з живих карток, а не з рекламного «від».`}
      >
        <Section eyebrow="За типом виробу" title="Скільки коштує пам'ятник">
          <Table
            head={["Тип", "Від", "Типово", "До", "Термін", "У базовій ціні"]}
            rows={rows.map((r) => [
              <Link key={r.type} href={catalogPagePath(r.facet, 1)} className="underline decoration-foreground/20 underline-offset-4 hover:decoration-foreground">
                {r.label} <span className="text-muted-foreground">({r.st!.n})</span>
              </Link>,
              fmt(r.st!.min),
              fmt(r.st!.median),
              fmt(r.st!.max),
              r.lead,
              <span key={`${r.type}-inc`} className="text-sm text-muted-foreground">{r.includes}</span>,
            ])}
            caption="«Типово» — медіана цін моделей цього типу в каталозі. Усі ціни в гривнях, на дату перегляду сторінки."
          />
          <div className="mt-6">
            <LinkPills items={facetLinks} />
          </div>
        </Section>

        <Section eyebrow="Від чого залежить" title="Що входить у ціну і що її змінює">
          <div className="grid gap-6 lg:grid-cols-2">
            <Prose text={`У кожній ціні на сайті — сам виріб у полірованому камені, портрет і напис, армований бетонний фундамент, доставка й монтаж бригадою в Рівненській та Волинській областях. Це та комплектація, яку ви бачите на фото, у мінімальному стандартному розмірі.\n\nЦіна росте від чотирьох речей: розмір (висота і товщина стели, площа облицювання), складність оздоблення (різьблення, фігурна форма, позолота), додаткові елементи (огорожа, лава, ваза, ліхтарі) і камінь. Останній впливає найменше: камінь — це 15–35 % вартості виробу, тому перехід із покостівського граніту на лабрадорит змінює ціну комплексу лише на кілька відсотків.`} />
            <div>
              <h3 className="text-lg font-semibold tracking-tight-custom">Камінь: різниця у вартості</h3>
              <Table
                head={["Камінь", "Рівень ціни", "Множник на камінь"]}
                rows={STONE_GUIDE.map((s) => [s.name, s.priceLevel, `×${s.coef.toFixed(2)}`])}
              />
              <p className="mt-3 text-sm text-muted-foreground">
                Множник діє лише на кам'яну частку ціни. У картці кожної моделі є селектор каменю, який одразу
                показує вартість у будь-якому з цих варіантів.
              </p>
            </div>
          </div>
        </Section>

        <Section eyebrow="Послуги" title="Гравіювання, доповнення, благоустрій">
          <Table
            head={["Робота", "Ціна", "Примітка"]}
            rows={SERVICE_PRICES.map((s) => [s.name, s.price, <span key={s.name} className="text-sm text-muted-foreground">{s.note}</span>])}
            caption="Орієнтовні ціни на роботи окремо від пам'ятника. Точну вартість називаємо після фото."
          />
        </Section>

        <Section eyebrow="Оплата" title="Три платежі, жодного авансу за повітря">
          <ol className="grid gap-4 md:grid-cols-3">
            {PAYMENT.steps.map((s) => (
              <li key={s.share} className="rounded-2xl bg-card p-6 ring-1 ring-black/[0.06] shadow-soft">
                <div className="text-3xl font-semibold tracking-tight-custom tabular-nums">{s.share}</div>
                <div className="mt-2 font-medium">{s.when}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.what}</div>
              </li>
            ))}
          </ol>
          <p className="mt-4 max-w-3xl text-[15px] text-muted-foreground">
            {PAYMENT.methods} Гарантія {WARRANTY_YEARS} років на камінь, фундамент і монтаж входить у ціну.{" "}
            <Link href="/dostavka-i-oplata" className="underline underline-offset-4 hover:text-foreground">Докладніше про доставку й оплату</Link>.
          </p>
        </Section>

        <Section eyebrow="Питання" title="Про ціни запитують найчастіше">
          <Faq items={FAQ} />
        </Section>

        <CtaBand title="Точна ціна — за фото ділянки" text="Надішліть фото місця і модель, яка сподобалась, — протягом робочого дня повернемось із ескізом у вашому камені й остаточною цифрою, яка не зміниться під час роботи." />
      </InfoPage>
    </>
  )
}
