import type { Metadata } from "next"
import { fetchServices } from "@/lib/data-source"
import { SITE_URL, absoluteUrl } from "@/lib/site-config"

export const revalidate = 60

const PATH = "/posluhy"

export const metadata: Metadata = {
  title: "Послуги — дизайн, виробництво, монтаж і догляд",
  description:
    // Trimmed to ~155 chars: the previous 266-character version was cut off
    // mid-sentence in the SERP, so the last third was never seen.
    "Повний цикл: дизайн і 3D-візуалізація, гравіювання портретів, виробництво у власному цеху в Костополі, доставка, монтаж, реставрація. Гарантія 5 років.",
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    title: "Stone Memory — Послуги",
    description:
      "Від ескізу до монтажу: дизайн, гравіювання, виробництво, доставка, догляд. Український камінь, гарантія 5 років.",
    url: absoluteUrl(PATH),
    type: "website",
    images: ["/opengraph-image"],
  },
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How long does it take from order to installation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Typical lead time is 6–10 weeks: 1 week for 3D design and approval, 4–6 weeks of production, and 1–2 weeks for delivery and installation. Signature pieces with sculpture can run 3–5 months.",
      },
    },
    {
      "@type": "Question",
      name: "Do you deliver across Ukraine?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We deliver and install across Ukraine from our workshop in Kostopil, Rivne Oblast. Every shipment is crated in wood and 100% insured.",
      },
    },
    {
      "@type": "Question",
      name: "What warranty do you provide?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We provide a 5-year legal warranty on everything — foundation, installation and the stone itself. Material passports and origin certificates are included with every order.",
      },
    },
    {
      "@type": "Question",
      name: "Can you restore an existing monument?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We do cleaning, re-polishing, engraving restoration and element replacement. We give an honest assessment first — sometimes restoration costs more than replacement.",
      },
    },
    {
      "@type": "Question",
      name: "Do you work from a photo for engraving?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We can restore portraits even from small photographs using AI-assisted retouch followed by hand refinement. Our engravers work in both hand and laser techniques.",
      },
    },
    {
      "@type": "Question",
      name: "What stone types do you offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ukrainian granites — Holovyne gabbro, Leznykivskyi red, Pokostivskyi grey, Holovynskyi labradorite, Zhezhelivskyi, Omelianivskyi, Tokivskyi; Ukrainian marbles — Pryluzkyi, Slovianskyi; Carpathian travertine; Rivne basalt; Podillia limestone. Imported: Italian marble (Carrara, Calacatta), Indian and Chinese granite, Brazilian quartzite, onyx.",
      },
    },
  ],
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const services = await fetchServices()

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Services", item: absoluteUrl(PATH) },
    ],
  }

  // One Service schema per offering — helps Google surface each as a distinct
  // service in search (knowledge panel, "services offered" chip).
  const serviceSchemas = services.map((s) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: s.title.en || s.title.uk,
    name: s.title.en || s.title.uk,
    description: s.shortDesc.en || s.shortDesc.uk,
    provider: { "@type": "Organization", name: "Stone Memory", url: SITE_URL },
    areaServed: [
      { "@type": "Country", name: "Ukraine" },
      { "@type": "AdministrativeArea", name: "European Union" },
    ],
    url: `${absoluteUrl(PATH)}#${s.slug}`,
  }))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {serviceSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {children}
    </>
  )
}
