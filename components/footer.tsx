"use client"

import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Youtube, ArrowRight } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { useBusinessProfile } from "@/lib/store/business-profile"
import { useState } from "react"

export function Footer() {
  const { t, locale } = useTranslation()
  const profile = useBusinessProfile()
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error === "invalid email" ? "Невірний email" : "Не вдалось підписатися")
        return
      }
      setSubscribed(true)
      setEmail("")
      setTimeout(() => setSubscribed(false), 3000)
    } catch {
      setError("Помилка мережі")
    } finally {
      setSubmitting(false)
    }
  }

  const phone = profile.phone
  const EMAIL = profile.email
  const addressLine = [profile.address, profile.city].filter(Boolean).join(", ")
  // Build hours string grouping consecutive days with identical times: "Пн–Пт 9:00–19:00 · Сб 10:00–16:00"
  const dayLabels: Record<string, string> = locale === "uk"
    ? { mon: "Пн", tue: "Вт", wed: "Ср", thu: "Чт", fri: "Пт", sat: "Сб", sun: "Нд" }
    : { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" }
  const fmt = (t: string) => t.replace(/^0/, "")
  const hoursLine = (() => {
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const
    const groups: { first: string; last: string; open: string; close: string }[] = []
    for (const day of days) {
      const h = profile.hours[day]
      if (!h || h.closed) continue
      const prev = groups[groups.length - 1]
      if (prev && prev.open === h.open && prev.close === h.close) {
        prev.last = day
      } else {
        groups.push({ first: day, last: day, open: h.open, close: h.close })
      }
    }
    return groups
      .map((g) => {
        const dayPart = g.first === g.last ? dayLabels[g.first] : `${dayLabels[g.first]}–${dayLabels[g.last]}`
        return `${dayPart} ${fmt(g.open)}–${fmt(g.close)}`
      })
      .join(" · ")
  })()

  return (
    <footer id="contact" className="border-t border-foreground/5 bg-card pt-20 pb-10 md:pt-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div className="max-w-md">
            <Link href="/" className="flex items-center gap-2 text-foreground" aria-label="Stone Memory">
              <Image src="/logo-mark.png" alt="" width={36} height={36} className="h-9 w-9 select-none" />
              <span className="text-xl font-semibold tracking-tight-custom">Stone Memory</span>
            </Link>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              {t.footer.tagline}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a href="https://www.instagram.com/sttonememory" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5 text-foreground/70 transition-colors hover:bg-foreground hover:text-background">
                <Instagram className="h-4 w-4" strokeWidth={1.75} />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61588950935616" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5 text-foreground/70 transition-colors hover:bg-foreground hover:text-background">
                <Facebook className="h-4 w-4" strokeWidth={1.75} />
              </a>
              {/* <a href="https://youtube.com/@stonememory" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5 text-foreground/70 transition-colors hover:bg-foreground hover:text-background">
                <Youtube className="h-4 w-4" strokeWidth={1.75} />
              </a> */}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {t.footer.subscribe}
            </div>
            <p className="mt-3 text-[15px] text-muted-foreground">
              {t.footer.subscribeDesc}
            </p>
            <form
              onSubmit={onSubscribe}
              className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:rounded-full sm:border sm:border-foreground/10 sm:bg-background sm:p-1.5 sm:shadow-soft sm:focus-within:ring-2 sm:focus-within:ring-foreground/10"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.footer.subscribePlaceholder}
                className="min-w-0 flex-1 rounded-full border border-foreground/10 bg-background px-4 py-2.5 text-[15px] outline-none placeholder:text-muted-foreground focus:border-foreground/30 sm:border-0 sm:bg-transparent sm:px-3 sm:py-1.5 sm:focus:border-transparent"
              />
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-[1px] disabled:opacity-60 sm:py-1.5"
              >
                {submitting ? "…" : subscribed ? "✓" : t.footer.subscribeCta}
                {!subscribed && !submitting && <ArrowRight className="h-4 w-4" strokeWidth={2} />}
              </button>
            </form>
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
            {subscribed && <p className="mt-2 text-xs text-success">Дякуємо — ви підписані!</p>}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-8">
          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t.footer.explore}
            </h3>
            <ul className="space-y-2.5 text-[15px]">
              <li><Link href="/catalog" prefetch className="text-foreground/85 hover:text-foreground">{t.nav.catalog}</Link></li>
              <li><Link href="/services" prefetch className="text-foreground/85 hover:text-foreground">{t.nav.services}</Link></li>
              <li><Link href="/about" prefetch className="text-foreground/85 hover:text-foreground">{t.footer.about}</Link></li>
              <li><Link href="/blog" prefetch className="text-foreground/85 hover:text-foreground">{t.nav.blog}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t.footer.support}
            </h3>
            <ul className="space-y-2.5 text-[15px]">
              <li><Link href="/services#warranty" prefetch className="text-foreground/85 hover:text-foreground">{t.footer.warranty}</Link></li>
              <li><Link href="/services#delivery" prefetch className="text-foreground/85 hover:text-foreground">{t.footer.delivery}</Link></li>
              <li><Link href="/#faq" className="text-foreground/85 hover:text-foreground">{t.footer.faq}</Link></li>
            </ul>
          </div>

          <div className="col-span-2">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t.footer.contact}
            </h3>
            <ul className="space-y-3 text-[15px]">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="font-medium text-foreground hover:text-accent">{phone}</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <a href={`mailto:${EMAIL}`} className="text-foreground/85 hover:text-foreground">{EMAIL}</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.footer.address}</div>
                  <div className="mt-0.5 text-foreground/85">{addressLine || t.footer.addressValue}</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.footer.hours}</div>
                  <div className="mt-0.5 text-foreground/85">{hoursLine || t.footer.hoursValue}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-foreground/5 pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>{t.footer.copyright}</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/about" prefetch className="transition-colors hover:text-foreground">{t.footer.about}</Link>
            <Link href="/privacy" prefetch className="transition-colors hover:text-foreground">
              {locale === "uk" ? "Конфіденційність" : locale === "pl" ? "Prywatność" : locale === "de" ? "Datenschutz" : locale === "lt" ? "Privatumas" : "Privacy"}
            </Link>
            <Link href="/terms" prefetch className="transition-colors hover:text-foreground">
              {locale === "uk" ? "Умови" : locale === "pl" ? "Warunki" : locale === "de" ? "AGB" : locale === "lt" ? "Sąlygos" : "Terms"}
            </Link>
            <a href={`mailto:${EMAIL}`} className="transition-colors hover:text-foreground">{t.footer.contact}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
