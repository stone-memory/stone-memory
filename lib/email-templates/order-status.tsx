import { Button, Text } from "@react-email/components"
import { BaseLayout } from "./base-layout"
import { h1, paragraph, muted, button, referenceChip, type Locale } from "./styles"

export type OrderStatus = "in_progress" | "completed"

type Props = {
  customerName: string
  reference?: string | null
  status: OrderStatus
  locale: Locale
  siteUrl: string
  unsubscribeToken?: string | null
}

type L = {
  preview: string
  heading: string
  intro: (name: string) => string
  reference: string
  body: string
  cta: string
  signature: string
}

const COPY: Record<Locale, Record<OrderStatus, L>> = {
  uk: {
    in_progress: {
      preview: "Ваше замовлення в роботі — Stone Memory",
      heading: "Ми взяли ваше замовлення в роботу",
      intro: (n) => `${n}, дякуємо за довіру! Ми розпочали роботу над вашим проєктом.`,
      reference: "Номер замовлення",
      body: "Наш менеджер зв'яжеться з вами найближчими днями з оновленнями щодо ескізу та термінів. Якщо маєте питання — просто відповідайте на цей лист.",
      cta: "Переглянути каталог",
      signature: "З повагою,\nкоманда Stone Memory",
    },
    completed: {
      preview: "Ваше замовлення готове — Stone Memory",
      heading: "Ваше замовлення готове",
      intro: (n) => `${n}, роботу над вашим замовленням завершено. Дякуємо, що обрали нас!`,
      reference: "Номер замовлення",
      body: "Будемо вдячні за ваш відгук. Якщо ви задоволені роботою — поділіться, будь ласка, враженнями: це допомагає іншим клієнтам робити вибір.",
      cta: "Залишити відгук",
      signature: "З повагою,\nкоманда Stone Memory",
    },
  },
  en: {
    in_progress: {
      preview: "Your order is in progress — Stone Memory",
      heading: "We've started working on your order",
      intro: (n) => `${n}, thank you for your trust! We have begun work on your project.`,
      reference: "Reference",
      body: "Our manager will be in touch in the coming days with design and timeline updates. Reply to this email anytime with questions.",
      cta: "Browse catalog",
      signature: "Best regards,\nStone Memory team",
    },
    completed: {
      preview: "Your order is complete — Stone Memory",
      heading: "Your order is complete",
      intro: (n) => `${n}, work on your order is finished. Thank you for choosing us!`,
      reference: "Reference",
      body: "We would be grateful for your feedback. If you're happy with the result, please share your experience — it helps other clients.",
      cta: "Leave a review",
      signature: "Best regards,\nStone Memory team",
    },
  },
  pl: {
    in_progress: {
      preview: "Twoje zamówienie w realizacji",
      heading: "Rozpoczęliśmy pracę nad zamówieniem",
      intro: (n) => `${n}, dziękujemy za zaufanie! Zaczęliśmy pracę nad Twoim projektem.`,
      reference: "Numer",
      body: "Nasz menedżer odezwie się wkrótce z aktualizacjami. Odpowiadaj śmiało na ten e-mail.",
      cta: "Katalog",
      signature: "Z poważaniem,\nzespół Stone Memory",
    },
    completed: {
      preview: "Zamówienie gotowe",
      heading: "Twoje zamówienie jest gotowe",
      intro: (n) => `${n}, praca nad zamówieniem została zakończona. Dziękujemy!`,
      reference: "Numer",
      body: "Będziemy wdzięczni za opinię — pomaga to innym klientom.",
      cta: "Zostaw opinię",
      signature: "Z poważaniem,\nzespół Stone Memory",
    },
  },
  de: {
    in_progress: {
      preview: "Ihre Bestellung in Bearbeitung",
      heading: "Wir haben mit Ihrer Bestellung begonnen",
      intro: (n) => `${n}, vielen Dank für Ihr Vertrauen! Wir haben mit der Arbeit begonnen.`,
      reference: "Referenz",
      body: "Unser Manager meldet sich in den kommenden Tagen mit Updates. Antworten Sie einfach auf diese E-Mail bei Fragen.",
      cta: "Katalog",
      signature: "Mit freundlichen Grüßen,\nStone Memory Team",
    },
    completed: {
      preview: "Bestellung abgeschlossen",
      heading: "Ihre Bestellung ist fertig",
      intro: (n) => `${n}, die Arbeit an Ihrer Bestellung ist abgeschlossen. Vielen Dank!`,
      reference: "Referenz",
      body: "Wir würden uns über Ihre Bewertung freuen — das hilft anderen Kunden.",
      cta: "Bewertung schreiben",
      signature: "Mit freundlichen Grüßen,\nStone Memory Team",
    },
  },
  lt: {
    in_progress: {
      preview: "Jūsų užsakymas vykdomas",
      heading: "Pradėjome Jūsų užsakymo darbus",
      intro: (n) => `${n}, ačiū už pasitikėjimą! Pradėjome darbą.`,
      reference: "Numeris",
      body: "Mūsų vadybininkas netrukus susisieks su naujienomis. Turite klausimų — tiesiog atsakykite į šį laišką.",
      cta: "Katalogas",
      signature: "Pagarbiai,\nStone Memory komanda",
    },
    completed: {
      preview: "Užsakymas baigtas",
      heading: "Jūsų užsakymas baigtas",
      intro: (n) => `${n}, darbas baigtas. Ačiū, kad pasirinkote mus!`,
      reference: "Numeris",
      body: "Būsime dėkingi už atsiliepimą — tai padeda kitiems klientams.",
      cta: "Palikti atsiliepimą",
      signature: "Pagarbiai,\nStone Memory komanda",
    },
  },
}

export function OrderStatusUpdate({
  customerName,
  reference,
  status,
  locale,
  siteUrl,
  unsubscribeToken,
}: Props) {
  const L = COPY[locale]?.[status] || COPY.uk[status]
  const ctaHref = status === "completed" ? `${siteUrl}/reviews` : `${siteUrl}/catalog`

  return (
    <BaseLayout preview={L.preview} siteUrl={siteUrl} unsubscribeToken={unsubscribeToken}>
      <Text style={h1}>{L.heading}</Text>
      <Text style={paragraph}>{L.intro(customerName)}</Text>
      {reference && (
        <Text style={paragraph}>
          <strong>{L.reference}:</strong>{" "}
          <span style={referenceChip}>{reference}</span>
        </Text>
      )}
      <Text style={paragraph}>{L.body}</Text>
      <Button href={ctaHref} style={button}>
        {L.cta}
      </Button>
      <Text style={{ ...muted, marginTop: 24, whiteSpace: "pre-line" }}>{L.signature}</Text>
    </BaseLayout>
  )
}
