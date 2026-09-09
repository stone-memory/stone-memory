import type { Metadata } from "next"
import Link from "next/link"
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react"
import { InfoPage, Section, Steps, CtaBand } from "@/components/info-page"
import { CITIES, CONTACT, WARRANTY_YEARS } from "@/lib/site-facts"
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

const HOW_TO_VISIT = [
  {
    title: "Подзвоніть або напишіть",
    text: "Скажіть, коли зручно приїхати, — підготуємо зразки каменю, які вас цікавлять, і майстер буде на місці.",
  },
  {
    title: "Подивіться камінь наживо",
    text: "На майданчику стоять готові стели й зразки всіх родовищ: габро, лабрадорит, покостівський, лезниківський, капустинський, дідковицький, мармур.",
  },
  {
    title: "Погодьте ескіз на місці",
    text: "Якщо маєте фото ділянки й побажання — за годину вийдете з ескізом і ціною. Замір і монтаж призначимо одразу.",
  },
]

export default function ContactsPage() {
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
      telephone: "+380688080222",
      email: CONTACT.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: "провулок Білий, 20",
        addressLocality: "Костопіль",
        addressRegion: "Рівненська область",
        postalCode: "35000",
        addressCountry: "UA",
      },
      geo: { "@type": "GeoCoordinates", latitude: CONTACT.geo.lat, longitude: CONTACT.geo.lng },
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "19:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "10:00", closes: "16:00" },
      ],
      areaServed: CITIES.map((c) => ({ "@type": "City", name: c.name })),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <InfoPage
        crumbs={[{ name: "Контакти" }]}
        title="Контакти"
        lead="Цех і виставковий майданчик у Костополі. Пишіть у зручний месенджер — відповідаємо в робочий час протягом години, ескіз і ціну повертаємо того ж дня."
      >
        <Section>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-4">
              <Card icon={Phone} title="Телефон">
                <a href={CONTACT.phoneHref} className="text-xl font-semibold tracking-tight-custom hover:underline">
                  {CONTACT.phoneDisplay}
                </a>
                <p className="mt-1 text-sm text-muted-foreground">Дзвінки, SMS, Viber і Telegram — один номер.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Messenger href={CONTACT.viberHref} label="Viber" icon={MessageCircle} />
                  <Messenger href={CONTACT.telegramHref} label="Telegram" icon={Send} />
                </div>
              </Card>
              <Card icon={Mail} title="Пошта">
                <a href={`mailto:${CONTACT.email}`} className="text-lg font-medium hover:underline">
                  {CONTACT.email}
                </a>
                <p className="mt-1 text-sm text-muted-foreground">Для фото ділянки, ескізів і документів для фондів та підприємств.</p>
              </Card>
              <Card icon={MapPin} title="Адреса">
                <p className="text-lg font-medium">{CONTACT.address}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  45 км від Рівного трасою Р-05, 110 км від Луцька.{" "}
                  <a href={mapLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                    Відкрити на мапі
                  </a>
                </p>
              </Card>
              <Card icon={Clock} title="Години роботи">
                <dl className="divide-y divide-foreground/5">
                  {CONTACT.hours.map((h) => (
                    <div key={h.days} className="flex justify-between py-1.5 text-[15px]">
                      <dt className="text-muted-foreground">{h.days}</dt>
                      <dd className="font-medium tabular-nums">{h.time}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 text-sm text-muted-foreground">Монтаж на кладовищах — і в неділю, за домовленістю.</p>
              </Card>
            </div>
            <div className="overflow-hidden rounded-3xl bg-foreground/5 ring-1 ring-black/[0.06] shadow-soft">
              <iframe
                title="Stone Memory на мапі — Костопіль, провулок Білий, 20"
                src={mapSrc}
                className="h-[420px] w-full lg:h-full lg:min-h-[560px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </Section>

        <Section title="Як відбувається візит у цех" eyebrow="Приїхати">
          <Steps items={HOW_TO_VISIT} />
        </Section>

        <Section title="Куди виїжджаємо" eyebrow="Замір і монтаж">
          <p className="max-w-3xl text-base leading-relaxed text-foreground/85 md:text-[17px]">
            У Рівненській та Волинській областях замір, монтаж і гарантійний виїзд безкоштовні. В інші регіони
            України їдемо за фактичним пробігом, у Польщу, Німеччину, Литву й Чехію — з митним оформленням. На кожен
            виріб — {WARRANTY_YEARS} років гарантії незалежно від того, де він стоїть.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {CITIES.map((c) => (
              <Link
                key={c.slug}
                href={`/pamyatnyky/${c.slug}`}
                className="rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:border-foreground/40"
              >
                {c.name}
              </Link>
            ))}
            <Link href="/dostavka-i-oplata" className="rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:border-foreground/40">
              Усі умови доставки
            </Link>
          </div>
        </Section>

        <Section title="Соцмережі" eyebrow="Роботи щотижня">
          <div className="flex flex-wrap gap-3">
            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background">
              Instagram
            </a>
            <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" className="rounded-full border border-foreground/15 px-5 py-2.5 text-sm font-medium hover:bg-foreground/5">
              Facebook
            </a>
          </div>
        </Section>

        <CtaBand title="Не хочете дзвонити — залиште заявку" text="Оберіть модель у каталозі або просто опишіть, що потрібно. Передзвонимо в робочий час, без нав'язливих дзвінків потім." />
      </InfoPage>
    </>
  )
}

function Card({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-6 ring-1 ring-black/[0.06] shadow-soft">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
        {title}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function Messenger({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-foreground/5"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {label}
    </a>
  )
}
