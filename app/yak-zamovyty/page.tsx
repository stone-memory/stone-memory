import type { Metadata } from "next"
import { HowToOrderContent } from "@/components/info/how-to-order-content"
import { FACTS } from "@/lib/i18n/copy/facts"
import { HOW_TO_ORDER_COPY } from "@/lib/i18n/copy/pages/how-to-order"
import { absoluteUrl } from "@/lib/site-config"

const PATH = "/yak-zamovyty"

export const metadata: Metadata = {
  title: "Як замовити пам'ятник — покроково, дистанційно з будь-якого міста",
  description:
    "Як замовити пам'ятник у майстерні: фото ділянки, ескіз і ціна за день, замір, 3D-проєкт, виготовлення 5–10 тижнів, монтаж. Які документи потрібні, коли краще ставити, як контролювати роботу дистанційно.",
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    title: "Як замовити пам'ятник — Stone Memory",
    description: "Шість кроків від фото ділянки до встановленого пам'ятника. Дистанційно, з погодженням по фото й відео.",
    url: absoluteUrl(PATH),
    type: "article",
    images: ["/opengraph-image"],
  },
}

/**
 * Тексти сторінки живуть у lib/i18n/copy/pages/how-to-order.ts і рендеряться
 * клієнтським HowToOrderContent за мовою відвідувача. Структуровані дані —
 * з української версії, бо сервер завжди віддає <html lang="uk">.
 */
export default function HowToOrderPage() {
  const uk = HOW_TO_ORDER_COPY.uk(FACTS.uk)
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Як замовити пам'ятник у Stone Memory",
    description: "Шість кроків від фото ділянки до встановленого пам'ятника.",
    totalTime: "P8W",
    step: uk.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text })),
  }
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: uk.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <HowToOrderContent />
    </>
  )
}
