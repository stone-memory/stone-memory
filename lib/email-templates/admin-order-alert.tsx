import { Button, Section, Text } from "@react-email/components"
import { BaseLayout } from "./base-layout"
import { h1, paragraph, button, listItem, referenceChip } from "./styles"

type OrderItem = { id: string; priceFrom?: number; material?: string }

type Props = {
  customerName: string
  phone: string
  email?: string | null
  reference?: string | null
  items?: OrderItem[]
  message?: string | null
  siteUrl: string
}

export function AdminOrderAlert({
  customerName,
  phone,
  email,
  reference,
  items = [],
  message,
  siteUrl,
}: Props) {
  return (
    <BaseLayout preview={`Нове замовлення — ${customerName}`} siteUrl={siteUrl}>
      <Text style={h1}>🆕 Нове замовлення</Text>
      <Text style={paragraph}>
        <strong>Ім'я:</strong> {customerName}
        <br />
        <strong>Телефон:</strong> <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a>
        {email && (
          <>
            <br />
            <strong>Email:</strong> <a href={`mailto:${email}`}>{email}</a>
          </>
        )}
        {reference && (
          <>
            <br />
            <strong>Референс:</strong> <span style={referenceChip}>{reference}</span>
          </>
        )}
      </Text>

      {items.length > 0 && (
        <>
          <Text style={paragraph}>
            <strong>Позиції:</strong>
          </Text>
          <Section style={{ marginBottom: "16px" }}>
            {items.map((it) => (
              <Text key={it.id} style={listItem}>
                • № {it.id}
                {typeof it.priceFrom === "number" ? ` — від €${it.priceFrom}` : ""}
                {it.material ? ` · ${it.material}` : ""}
              </Text>
            ))}
          </Section>
        </>
      )}

      {message && (
        <>
          <Text style={paragraph}>
            <strong>Повідомлення клієнта:</strong>
          </Text>
          <Text style={{ ...paragraph, whiteSpace: "pre-line", fontStyle: "italic" }}>{message}</Text>
        </>
      )}

      <Button href={`${siteUrl}/admin`} style={button}>
        Відкрити CRM
      </Button>
    </BaseLayout>
  )
}
