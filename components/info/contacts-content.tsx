"use client"

import Link from "next/link"
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react"
import { InfoPage, Section, Steps, CtaBand } from "@/components/info-page"
import { CITIES } from "@/lib/site-facts"
import { fullAddress, hoursRows, telHref, telegramHref, viberHref, type BusinessProfile } from "@/lib/business-profile"
import { useTranslation } from "@/lib/i18n/context"
import { FACTS } from "@/lib/i18n/copy/facts"
import { CONTACTS_COPY } from "@/lib/i18n/copy/pages/contacts"

type Props = {
  /** Профіль з бази — єдине джерело контактів; сервер читає, клієнт лише показує. */
  profile: BusinessProfile
  mapSrc: string
  mapLink: string
  instagram: string
  facebook: string
}

const pill = "rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:border-foreground/40"

export function ContactsContent({ profile, mapSrc, mapLink, instagram, facebook }: Props) {
  const { locale } = useTranslation()
  const f = FACTS[locale]
  const c = CONTACTS_COPY[locale](f)

  return (
    <InfoPage crumbs={[{ name: c.crumb }]} title={c.title} lead={c.lead}>
      <Section>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <Card icon={Phone} title={c.phone}>
              <a href={telHref(profile)} className="text-xl font-semibold tracking-tight-custom hover:underline">
                {profile.phone}
              </a>
              <p className="mt-1 text-sm text-muted-foreground">{c.phoneNote}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Messenger href={viberHref(profile)} label="Viber" icon={MessageCircle} />
                <Messenger href={telegramHref(profile)} label="Telegram" icon={Send} />
              </div>
            </Card>
            <Card icon={Mail} title={c.mail}>
              <a href={`mailto:${profile.email}`} className="text-lg font-medium hover:underline">
                {profile.email}
              </a>
              <p className="mt-1 text-sm text-muted-foreground">{c.mailNote}</p>
            </Card>
            <Card icon={MapPin} title={c.address}>
              <p className="text-lg font-medium">{fullAddress(profile)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {c.addressNote}{" "}
                <a href={mapLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                  {c.openMap}
                </a>
              </p>
            </Card>
            <Card icon={Clock} title={c.hours}>
              <dl className="divide-y divide-foreground/5">
                {hoursRows(profile, locale, c.closedLabel).map((h) => (
                  <div key={h.days} className="flex justify-between py-1.5 text-[15px]">
                    <dt className="text-muted-foreground">{h.days}</dt>
                    <dd className="font-medium tabular-nums">{h.time}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-2 text-sm text-muted-foreground">{c.hoursNote}</p>
            </Card>
          </div>
          <div className="overflow-hidden rounded-3xl bg-foreground/5 ring-1 ring-black/[0.06] shadow-soft">
            <iframe
              title={c.mapTitle}
              src={mapSrc}
              className="h-[420px] w-full lg:h-full lg:min-h-[560px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Section>

      <Section title={c.visitTitle} eyebrow={c.visitEyebrow}>
        <Steps items={c.visit} />
      </Section>

      <Section title={c.areaTitle} eyebrow={c.areaEyebrow}>
        <p className="max-w-3xl text-base leading-relaxed text-foreground/85 md:text-[17px]">{c.areaText}</p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {CITIES.map((city) => (
            <Link key={city.slug} href={`/pamyatnyky/${city.slug}`} className={pill}>
              {f.cities[city.slug]?.name ?? city.name}
            </Link>
          ))}
          <Link href="/dostavka-i-oplata" className={pill}>{c.allTerms}</Link>
        </div>
      </Section>

      <Section title={c.socialTitle} eyebrow={c.socialEyebrow}>
        <div className="flex flex-wrap gap-3">
          <a href={instagram} target="_blank" rel="noopener noreferrer" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background">
            Instagram
          </a>
          <a href={facebook} target="_blank" rel="noopener noreferrer" className="rounded-full border border-foreground/15 px-5 py-2.5 text-sm font-medium hover:bg-foreground/5">
            Facebook
          </a>
        </div>
      </Section>

      <CtaBand title={c.cta.title} text={c.cta.text} cta={c.cta.button} />
    </InfoPage>
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
    <a href={href} className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-foreground/5">
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {label}
    </a>
  )
}
