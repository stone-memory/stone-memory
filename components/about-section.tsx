"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Clock, Award, Shield, Users, Truck } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { useAbout } from "@/lib/store/about"

const PHONE_DISPLAY = "+380 (67) 808 02 22"
const EMAIL = "sttonememory@gmail.com"

const contactLabels = {
  uk: { heading: "Контакти", address: "Адреса", phone: "Телефон", email: "Email", hours: "Графік", hoursValue: "Пн–Пт 9:00–19:00 · Сб 10:00–16:00" },
  pl: { heading: "Kontakt", address: "Adres", phone: "Telefon", email: "Email", hours: "Godziny", hoursValue: "Pn–Pt 9:00–19:00 · Sb 10:00–16:00" },
  en: { heading: "Contact", address: "Address", phone: "Phone", email: "Email", hours: "Hours", hoursValue: "Mon–Fri 9:00–19:00 · Sat 10:00–16:00" },
  de: { heading: "Kontakt", address: "Adresse", phone: "Telefon", email: "E-Mail", hours: "Öffnungszeiten", hoursValue: "Mo–Fr 9:00–19:00 · Sa 10:00–16:00" },
  lt: { heading: "Kontaktai", address: "Adresas", phone: "Telefonas", email: "El. paštas", hours: "Darbo laikas", hoursValue: "Pr–Pn 9:00–19:00 · Š 10:00–16:00" },
} as const

const badgeIconMap = {
  award: Award,
  shield: Shield,
  users: Users,
  truck: Truck,
} as const

export function AboutSection() {
  const { locale, t } = useTranslation()
  const content = useAbout(locale)
  const C = contactLabels[locale]
  const addressValue = t.footer.addressValue

  return (
    <section id="about" className="pt-8 pb-16 md:pt-10 md:pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 md:mb-10">
          <h2 className="text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
            {content.heading}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.3fr_1fr] md:gap-10 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            {content.photo && (
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-foreground/5 ring-1 ring-black/[0.04] shadow-soft">
                <Image
                  src={content.photo}
                  alt={content.photoAlt || content.heading}
                  fill
                  sizes="(max-width: 768px) 100vw, 58vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground md:text-lg">
              {content.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="self-start rounded-2xl bg-card p-6 ring-1 ring-black/[0.06] shadow-soft md:sticky md:top-20"
          >
            <h3 className="text-xl font-semibold tracking-tight-custom">
              {C.heading}
            </h3>

            <dl className="mt-5 space-y-4">
              <ContactRow icon={MapPin} term={C.address} desc={addressValue} />
              <ContactRow
                icon={Phone}
                term={C.phone}
                desc={PHONE_DISPLAY}
                href={`tel:${PHONE_DISPLAY.replace(/\s+/g, "")}`}
              />
              <ContactRow
                icon={Mail}
                term={C.email}
                desc={EMAIL}
                href={`mailto:${EMAIL}`}
              />
              <ContactRow icon={Clock} term={C.hours} desc={C.hoursValue} />
            </dl>
          </motion.div>
        </div>

        {content.badges.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-12 md:grid-cols-4">
            {content.badges.map((b, i) => {
              const Icon = badgeIconMap[b.icon] || Award
              return (
                <motion.div
                  key={`${b.label}-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.25, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex items-center gap-3 rounded-full bg-foreground/[0.04] px-5 py-3 text-sm font-medium text-foreground"
                >
                  <Icon className="h-4 w-4 text-foreground/70" strokeWidth={1.75} />
                  {b.label}
                </motion.div>
              )
            })}
          </div>
        )}

        <div className="mt-12 overflow-hidden rounded-2xl ring-1 ring-black/[0.06] shadow-soft md:mt-16">
          <div className="relative aspect-[16/9] w-full md:aspect-[21/9]">
            <iframe
              title="Stone Memory — Костопіль, Рівненська область"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=26.3400%2C50.8600%2C26.4200%2C50.9000&layer=mapnik&marker=50.8800%2C26.3800`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
              style={{ filter: "grayscale(1) contrast(1.05)" }}
              allowFullScreen
            />
            {/* Covers OpenStreetMap attribution footer (which is localized by browser) with our own Ukrainian version */}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-background/90 px-3 py-1.5 text-[10px] text-muted-foreground backdrop-blur">
              <span>Костопіль, Рівненська область, Україна</span>
              <a
                href="https://www.openstreetmap.org/?mlat=50.8800&mlon=26.3800#map=13/50.8800/26.3800"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                © OpenStreetMap
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactRow({
  icon: Icon,
  term,
  desc,
  href,
}: {
  icon: typeof MapPin
  term: string
  desc: string
  href?: string
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.05]">
        <Icon className="h-4 w-4 text-foreground/75" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <dt className="text-sm font-medium text-foreground">{term}</dt>
        {href ? (
          <a
            href={href}
            className="mt-1 block break-words text-[15px] text-accent transition-colors hover:brightness-110"
          >
            {desc}
          </a>
        ) : (
          <dd className="mt-1 text-[15px] text-muted-foreground">{desc}</dd>
        )}
      </div>
    </div>
  )
}
