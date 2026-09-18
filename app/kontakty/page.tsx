import type { Metadata } from "next"
import { ContactsContent } from "@/components/info/contacts-content"
import { CITIES, CONTACT } from "@/lib/site-facts"
import { fetchBusinessProfile } from "@/lib/data-source"
import { openingHoursSpecification, phoneE164, postalAddress } from "@/lib/business-profile"
import { SITE_URL, absoluteUrl } from "@/lib/site-config"

const PATH = "/kontakty"

export const metadata: Metadata = {
  title: "Контакти — майстерня пам'ятників у Костополі",
  description:
    "Stone Memory: цех і виставковий майданчик у Костополі, Рівненська область. Телефон, Viber, Telegram, години роботи, як доїхати. Виїзд на замір по Рівненщині та Волині безкоштовний.",
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    title: "Контакти — Stone Memory",
    description: "Костопіль, провулок Білий, 20. Пн–Пт 9:00–19:00, Сб 10:00–16:00. Телефон, Viber, Telegram.",
    url: absoluteUrl(PATH),
    type: "website",
    images: ["/opengraph-image"],
  },
}

/**
 * Профіль бізнесу читається на сервері (єдине джерело контактів — база) і
 * передається клієнтському ContactsContent, який обирає мову текстів.
 */
export default async function ContactsPage() {
  const profile = await fetchBusinessProfile()
  const mapBbox = `${CONTACT.geo.lng - 0.012}%2C${CONTACT.geo.lat - 0.006}%2C${CONTACT.geo.lng + 0.012}%2C${CONTACT.geo.lat + 0.006}`
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${mapBbox}&layer=mapnik&marker=${CONTACT.geo.lat}%2C${CONTACT.geo.lng}`
  const mapLink = `https://www.openstreetmap.org/?mlat=${CONTACT.geo.lat}&mlon=${CONTACT.geo.lng}#map=16/${CONTACT.geo.lat}/${CONTACT.geo.lng}`

  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Контакти Stone Memory",
    url: absoluteUrl(PATH),
    mainEntity: {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#localbusiness`,
      name: "Stone Memory",
      telephone: phoneE164(profile),
      email: profile.email,
      address: postalAddress(profile),
      geo: { "@type": "GeoCoordinates", latitude: CONTACT.geo.lat, longitude: CONTACT.geo.lng },
      openingHoursSpecification: openingHoursSpecification(profile),
      areaServed: CITIES.map((c) => ({ "@type": "City", name: c.name })),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ContactsContent
        profile={profile}
        mapSrc={mapSrc}
        mapLink={mapLink}
        instagram={profile.instagram || CONTACT.instagram}
        facebook={profile.facebook || CONTACT.facebook}
      />
    </>
  )
}
