import type { Metadata } from "next"
import { FaqContent, type GeneralFaq } from "@/components/info/faq-content"
import { fetchFaqItems } from "@/lib/data-source"
import { seedFaq } from "@/lib/data/seeds"
import { faqPageSchema } from "@/lib/seo/schemas/faqPage"
import { FACTS } from "@/lib/i18n/copy/facts"
import { FAQ_PAGE_COPY } from "@/lib/i18n/copy/pages/faq"
import { absoluteUrl } from "@/lib/site-config"
import type { Locale } from "@/lib/types"

const PATH = "/pytannya"
export const revalidate = 86400

export const metadata: Metadata = {
  title: "Питання й відповіді про пам'ятники",
  description:
    "Відповіді на найчастіші питання: скільки коштує пам'ятник, за скільки виготовите, який камінь обрати, як робите фундамент, чи можна замовити дистанційно, як доглядати, що з документами.",
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    title: "Питання й відповіді — Stone Memory",
    description: "Ціни, терміни, камінь, монтаж, догляд, документи — усе, що запитують перед замовленням пам'ятника.",
    url: absoluteUrl(PATH),
    type: "website",
    images: ["/opengraph-image"],
  },
}

type FaqRow = { id: string; data: unknown; order: number }
type FaqShape = { q?: Partial<Record<Locale, string>>; a?: Partial<Record<Locale, string>>; order?: number }

/**
 * Загальні питання — з бази (адмінка веде їх п'ятьма мовами) або сіду;
 * тематичні групи — у lib/i18n/copy/pages/faq.ts. Рендер за мовою —
 * клієнтський FaqContent, JSON-LD — українською.
 */
export default async function FaqPage() {
  const rows = (await fetchFaqItems()) as FaqRow[]
  const base: FaqShape[] = rows.length > 0 ? rows.map((r) => r.data as FaqShape) : seedFaq
  const general: GeneralFaq[] = base
    .filter((f) => f.q?.uk && f.a?.uk)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((f) => ({ q: f.q!, a: f.a! }))

  const uk = FAQ_PAGE_COPY.uk(FACTS.uk)
  const all = [...general.map((g) => ({ q: g.q.uk!, a: g.a.uk! })), ...uk.groups.flatMap((g) => g.items)]
  const schema = faqPageSchema(all.map((f) => ({ question: f.q, answer: f.a })), "uk")

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <FaqContent general={general} />
    </>
  )
}
