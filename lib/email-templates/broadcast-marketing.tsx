import { Button, Hr, Img, Section, Text } from "@react-email/components"
import { BaseLayout } from "./base-layout"
import { h1, paragraph, muted, button, listItem } from "./styles"

type HighlightItem = {
  imageUrl?: string
  title: string
  description?: string
  priceFrom?: number
}

type Props = {
  preview: string
  headline: string
  intro: string
  highlights?: HighlightItem[]
  ctaLabel: string
  ctaUrl: string
  outro?: string
  siteUrl: string
  unsubscribeToken?: string | null
}

// Reusable marketing template: headline + intro + optional list of 3-6 items
// (image + title + price) + CTA. Covers "нові надходження", "акція" and
// "сезонний гайд" use cases — admin just fills the fields.
export function BroadcastMarketing({
  preview,
  headline,
  intro,
  highlights = [],
  ctaLabel,
  ctaUrl,
  outro,
  siteUrl,
  unsubscribeToken,
}: Props) {
  return (
    <BaseLayout preview={preview} siteUrl={siteUrl} unsubscribeToken={unsubscribeToken}>
      <Text style={h1}>{headline}</Text>
      <Text style={paragraph}>{intro}</Text>

      {highlights.length > 0 && (
        <Section style={{ margin: "20px 0" }}>
          {highlights.map((h, i) => (
            <Section
              key={i}
              style={{
                marginBottom: "16px",
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "12px",
              }}
            >
              {h.imageUrl && (
                <Img
                  src={h.imageUrl}
                  alt={h.title}
                  width="560"
                  style={{
                    width: "100%",
                    maxWidth: "560px",
                    height: "auto",
                    borderRadius: "8px",
                    display: "block",
                    marginBottom: "10px",
                  }}
                />
              )}
              <Text style={{ ...listItem, fontWeight: 600, fontSize: "16px", margin: "0 0 4px" }}>
                {h.title}
              </Text>
              {typeof h.priceFrom === "number" && (
                <Text style={{ ...muted, margin: "0 0 6px" }}>від €{h.priceFrom}</Text>
              )}
              {h.description && <Text style={{ ...paragraph, margin: 0 }}>{h.description}</Text>}
            </Section>
          ))}
        </Section>
      )}

      <Button href={ctaUrl} style={button}>
        {ctaLabel}
      </Button>

      {outro && (
        <>
          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />
          <Text style={{ ...muted, whiteSpace: "pre-line" }}>{outro}</Text>
        </>
      )}
    </BaseLayout>
  )
}
