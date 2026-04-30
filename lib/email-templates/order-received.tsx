import { Button, Section, Text } from "@react-email/components"
import { BaseLayout } from "./base-layout"
import { h1, paragraph, muted, button, listItem, referenceChip, type Locale } from "./styles"

type OrderItem = { id: string; priceFrom?: number; material?: string }

type Props = {
  customerName: string
  reference?: string | null
  items?: OrderItem[]
  locale: Locale
  siteUrl: string
  unsubscribeToken?: string | null
}

const COPY: Record<Locale, {
  preview: string
  heading: string
  intro: (name: string) => string
  reference: string
  selection: string
  next: string
  cta: string
  signature: string
}> = {
  uk: {
    preview: "Ваш запит отримано — Stone Memory",
    heading: "Дякуємо за ваш запит!",
    intro: (n) => `${n}, ми отримали ваше повідомлення і передзвонимо протягом 24 робочих годин.`,
    reference: "Номер запиту",
    selection: "Ви обрали:",
    next: "Наш менеджер зв'яжеться з вами, щоб уточнити деталі, запропонувати варіанти і розрахувати попередню вартість.",
    cta: "Переглянути каталог",
    signature: "З повагою,\nкоманда Stone Memory",
  },
  en: {
    preview: "We received your enquiry — Stone Memory",
    heading: "Thank you for your enquiry!",
    intro: (n) => `${n}, we have received your message and will get back within 24 business hours.`,
    reference: "Reference",
    selection: "Your selection:",
    next: "Our manager will contact you to clarify details, suggest options, and prepare a preliminary quote.",
    cta: "Browse catalog",
    signature: "Best regards,\nStone Memory team",
  },
  pl: {
    preview: "Otrzymaliśmy Twoje zapytanie — Stone Memory",
    heading: "Dziękujemy za zapytanie!",
    intro: (n) => `${n}, otrzymaliśmy Twoją wiadomość i oddzwonimy w ciągu 24 godzin w dni robocze.`,
    reference: "Numer zapytania",
    selection: "Wybrane pozycje:",
    next: "Nasz menedżer skontaktuje się, aby omówić szczegóły i przygotować wstępną wycenę.",
    cta: "Katalog",
    signature: "Z poważaniem,\nzespół Stone Memory",
  },
  de: {
    preview: "Anfrage erhalten — Stone Memory",
    heading: "Danke für Ihre Anfrage!",
    intro: (n) => `${n}, wir haben Ihre Nachricht erhalten und melden uns innerhalb von 24 Werktagen.`,
    reference: "Referenz",
    selection: "Ihre Auswahl:",
    next: "Unser Manager wird sich bei Ihnen melden, um Details zu klären und ein Angebot vorzubereiten.",
    cta: "Katalog ansehen",
    signature: "Mit freundlichen Grüßen,\nStone Memory Team",
  },
  lt: {
    preview: "Gavome Jūsų užklausą — Stone Memory",
    heading: "Ačiū už užklausą!",
    intro: (n) => `${n}, gavome Jūsų žinutę ir susisieksime per 24 darbo valandas.`,
    reference: "Užklausos numeris",
    selection: "Jūsų pasirinkimas:",
    next: "Mūsų vadybininkas susisieks, kad aptartų detales ir parengtų pirminį pasiūlymą.",
    cta: "Peržiūrėti katalogą",
    signature: "Pagarbiai,\nStone Memory komanda",
  },
}

export function OrderReceived({
  customerName,
  reference,
  items = [],
  locale,
  siteUrl,
  unsubscribeToken,
}: Props) {
  const L = COPY[locale] || COPY.uk
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
      {items.length > 0 && (
        <>
          <Text style={paragraph}>
            <strong>{L.selection}</strong>
          </Text>
          <Section style={{ marginBottom: "16px" }}>
            {items.map((it) => (
              <Text key={it.id} style={listItem}>
                • № {it.id}
                {typeof it.priceFrom === "number" ? ` — від €${it.priceFrom}` : ""}
              </Text>
            ))}
          </Section>
        </>
      )}
      <Text style={paragraph}>{L.next}</Text>
      <Button href={`${siteUrl}/catalog`} style={button}>
        {L.cta}
      </Button>
      <Text style={{ ...muted, marginTop: 24, whiteSpace: "pre-line" }}>{L.signature}</Text>
    </BaseLayout>
  )
}
