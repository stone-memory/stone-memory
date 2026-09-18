import type { Metadata } from "next"
import { DeliveryContent } from "@/components/info/delivery-content"
import { FACTS } from "@/lib/i18n/copy/facts"
import { DELIVERY_COPY } from "@/lib/i18n/copy/pages/delivery"
import { absoluteUrl } from "@/lib/site-config"

const PATH = "/dostavka-i-oplata"

export const metadata: Metadata = {
  title: "Доставка, монтаж і оплата пам'ятників",
  description:
    "Доставка й монтаж пам'ятників по Україні та в ЄС: безкоштовний виїзд у Рівненській і Волинській областях, 3–5 ₴/км в інші регіони. Оплата трьома частинами 30/50/20. Фундамент і гарантія 5 років у ціні.",
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    title: "Доставка, монтаж і оплата — Stone Memory",
    description: "Куди й за скільки доставляємо, як монтуємо, як платити. Без прихованих доплат.",
    url: absoluteUrl(PATH),
    type: "article",
    images: ["/opengraph-image"],
  },
}

/** Тексти — у lib/i18n/copy/pages/delivery.ts; JSON-LD з української версії. */
export default function DeliveryPage() {
  const uk = DELIVERY_COPY.uk(FACTS.uk)
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: uk.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <DeliveryContent />
    </>
  )
}
