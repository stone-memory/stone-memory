import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

export const COMPANY = {
  name: "Stone Memory",
  address: "вул. Гранітна 12, Костопіль, Рівненська обл., Україна",
  email: "sttonememory@gmail.com",
}

export function BaseLayout({
  preview,
  children,
  unsubscribeToken,
  siteUrl,
}: {
  preview: string
  children: React.ReactNode
  unsubscribeToken?: string | null
  siteUrl: string
}) {
  const unsubscribeUrl = unsubscribeToken
    ? `${siteUrl}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
    : `mailto:${COMPANY.email}?subject=unsubscribe`
  const unsubscribeLabel = unsubscribeToken
    ? "Відписатися від розсилки"
    : "Повідомити що отримали лист помилково"

  return (
    <Html lang="uk">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={{ padding: "28px 28px 8px" }}>
            <Text style={brandStyle}>{COMPANY.name}</Text>
          </Section>

          <Section style={{ padding: "16px 28px 32px" }}>{children}</Section>

          <Hr style={{ borderColor: "#e5e7eb", margin: 0 }} />

          <Section style={footerStyle}>
            <Text style={footerLineBold}>{COMPANY.name}</Text>
            <Text style={footerLine}>{COMPANY.address}</Text>
            <Text style={footerLine}>
              <Link href={`mailto:${COMPANY.email}`} style={footerLinkMuted}>
                {COMPANY.email}
              </Link>
            </Text>
            <Text style={{ ...footerLine, marginTop: 12 }}>
              <Link href={unsubscribeUrl} style={footerLinkMuted}>
                {unsubscribeLabel}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const bodyStyle = {
  margin: 0,
  padding: 0,
  background: "#f5f5f5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
} as const

const containerStyle = {
  maxWidth: "600px",
  width: "100%",
  background: "#ffffff",
  borderRadius: "16px",
  overflow: "hidden",
  margin: "24px auto",
} as const

const brandStyle = {
  fontSize: "14px",
  fontWeight: 600,
  letterSpacing: "2px",
  color: "#6b7280",
  textTransform: "uppercase" as const,
  margin: 0,
}

const footerStyle = {
  padding: "20px 28px",
  textAlign: "center" as const,
}

const footerLine = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: 0,
}

const footerLineBold = {
  ...footerLine,
  color: "#6b7280",
  fontWeight: 600,
}

const footerLinkMuted = {
  color: "#6b7280",
  textDecoration: "underline",
}
