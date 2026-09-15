"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { X, Cookie } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import type { Locale } from "@/lib/types"

const LS_KEY = "sm-cookie-consent"

type Choice = "accepted" | "rejected" | "customized"

type ConsentState = {
  choice: Choice
  necessary: true
  analytics: boolean
  marketing: boolean
  timestamp: number
}

const copy: Record<
  Locale,
  {
    title: string
    body: string
    accept: string
    reject: string
    customize: string
    save: string
    close: string
    necessary: string
    necessaryDesc: string
    analytics: string
    analyticsDesc: string
    marketing: string
    marketingDesc: string
    privacyLink: string
  }
> = {
  uk: {
    title: "Ми використовуємо файли cookie",
    body: "Необхідні cookie обов'язкові для роботи сайту. Аналітичні та маркетингові допомагають нам покращувати сервіс — ви можете їх увімкнути чи вимкнути.",
    accept: "Прийняти всі",
    reject: "Тільки необхідні",
    customize: "Налаштувати",
    save: "Зберегти вибір",
    close: "Закрити",
    necessary: "Необхідні",
    necessaryDesc: "Забезпечують базову роботу сайту. Вимкнути неможливо.",
    analytics: "Аналітика",
    analyticsDesc: "Google Analytics — знеособлена статистика відвідувань.",
    marketing: "Маркетинг",
    marketingDesc: "Facebook Pixel, TikTok — персоналізована реклама.",
    privacyLink: "Політика конфіденційності",
  },
  pl: {
    title: "Używamy plików cookie",
    body: "Pliki niezbędne są wymagane do działania witryny. Analityczne i marketingowe pomagają nam ulepszać serwis — możesz je włączyć lub wyłączyć.",
    accept: "Akceptuj wszystkie",
    reject: "Tylko niezbędne",
    customize: "Dostosuj",
    save: "Zapisz wybór",
    close: "Zamknij",
    necessary: "Niezbędne",
    necessaryDesc: "Zapewniają podstawowe działanie witryny.",
    analytics: "Analityka",
    analyticsDesc: "Google Analytics — anonimowe statystyki.",
    marketing: "Marketing",
    marketingDesc: "Facebook Pixel, TikTok — spersonalizowane reklamy.",
    privacyLink: "Polityka prywatności",
  },
  en: {
    title: "We use cookies",
    body: "Necessary cookies are required for the site to work. Analytics and marketing cookies help us improve the service — you can enable or disable them.",
    accept: "Accept all",
    reject: "Necessary only",
    customize: "Customize",
    save: "Save choice",
    close: "Close",
    necessary: "Necessary",
    necessaryDesc: "Required for basic site functionality.",
    analytics: "Analytics",
    analyticsDesc: "Google Analytics — anonymised visit statistics.",
    marketing: "Marketing",
    marketingDesc: "Facebook Pixel, TikTok — personalised advertising.",
    privacyLink: "Privacy policy",
  },
  de: {
    title: "Wir verwenden Cookies",
    body: "Notwendige Cookies sind für den Betrieb der Website erforderlich. Analyse- und Marketing-Cookies helfen uns, den Service zu verbessern — Sie können sie aktivieren oder deaktivieren.",
    accept: "Alle akzeptieren",
    reject: "Nur notwendige",
    customize: "Anpassen",
    save: "Auswahl speichern",
    close: "Schließen",
    necessary: "Notwendig",
    necessaryDesc: "Für die Grundfunktion der Website erforderlich.",
    analytics: "Analyse",
    analyticsDesc: "Google Analytics — anonymisierte Besuchsstatistiken.",
    marketing: "Marketing",
    marketingDesc: "Facebook Pixel, TikTok — personalisierte Werbung.",
    privacyLink: "Datenschutzerklärung",
  },
  lt: {
    title: "Naudojame slapukus",
    body: "Būtini slapukai reikalingi, kad svetainė veiktų. Analitiniai ir rinkodaros slapukai padeda gerinti paslaugą — galite juos įjungti arba išjungti.",
    accept: "Priimti visus",
    reject: "Tik būtinus",
    customize: "Tinkinti",
    save: "Išsaugoti pasirinkimą",
    close: "Uždaryti",
    necessary: "Būtini",
    necessaryDesc: "Reikalingi pagrindinei svetainės veiklai.",
    analytics: "Analitika",
    analyticsDesc: "Google Analytics — anonimizuota lankytojų statistika.",
    marketing: "Rinkodara",
    marketingDesc: "Facebook Pixel, TikTok — personalizuota reklama.",
    privacyLink: "Privatumo politika",
  },
}

export function CookieConsent() {
  const { locale } = useTranslation()
  const L = copy[locale] || copy.uk
  const prefersReduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) {
        setOpen(true)
        return
      }
      const state = JSON.parse(raw) as ConsentState
      setAnalytics(state.analytics)
      setMarketing(state.marketing)
    } catch {
      setOpen(true)
    }
  }, [])

  const save = (choice: Choice, a: boolean, m: boolean) => {
    const state: ConsentState = {
      choice,
      necessary: true,
      analytics: a,
      marketing: m,
      timestamp: Date.now(),
    }
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state))
    } catch {}
    setOpen(false)
    // Signal to analytics components (they can subscribe to storage event or read fresh)
    window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: state }))
  }

  if (!mounted) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          // No role="dialog" here. It was paired with aria-modal="false",
          // which is a contradiction: a dialog role promises focus management
          // and a trapped, modal-like interaction this banner does not
          // implement. Lighthouse's agentic-browsing audit flags exactly that
          // ("ARIA role should be appropriate for the element"), and screen
          // readers announce a dialog that never behaves like one.
          //
          // <aside> already carries the implicit `complementary` role, which is
          // right for a persistent notice; aria-labelledby keeps it named.
          aria-labelledby="cookie-consent-title"
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 40 }}
          animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          // На телефоні банер займав 375 px із 844 — 44 % екрана: три кнопки
          // ставали одна під одною, а панель «Подзвонити / Чат» ховалась за
          // ним. Тепер дві головні кнопки в один ряд, «Налаштувати» —
          // текстовим посиланням, менші відступи й кегль: ~230 px (28 %).
          className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-2xl rounded-2xl border border-foreground/10 bg-card p-4 shadow-hover sm:inset-x-4 sm:bottom-4 sm:p-5 md:inset-x-auto md:left-4 md:right-4 md:p-6"
        >
          <div className="flex items-start gap-4">
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground/5 sm:flex">
              <Cookie size={20} strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="cookie-consent-title" className="text-[15px] font-semibold tracking-tight-custom sm:text-base">
                {L.title}
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                {L.body}{" "}
                <Link href="/konfidentsiinist" prefetch={false} className="underline-offset-2 hover:underline">
                  {L.privacyLink}
                </Link>
                .
              </p>
              {showDetails && (
                <div className="mt-3 max-h-[40dvh] space-y-2 overflow-y-auto rounded-xl bg-foreground/[0.03] p-3 sm:mt-4">
                  <Row title={L.necessary} desc={L.necessaryDesc} checked disabled />
                  <Row
                    title={L.analytics}
                    desc={L.analyticsDesc}
                    checked={analytics}
                    onChange={() => setAnalytics((v) => !v)}
                  />
                  <Row
                    title={L.marketing}
                    desc={L.marketingDesc}
                    checked={marketing}
                    onChange={() => setMarketing((v) => !v)}
                  />
                </div>
              )}

              <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:flex sm:flex-wrap sm:items-center">
                {showDetails ? (
                  <button
                    onClick={() => save("customized", analytics, marketing)}
                    className="whitespace-nowrap rounded-full bg-foreground px-3 py-2.5 text-[13px] font-medium text-background hover:-translate-y-[1px] sm:px-4 sm:py-2 sm:text-sm"
                  >
                    {L.save}
                  </button>
                ) : (
                  <button
                    onClick={() => save("accepted", true, true)}
                    className="whitespace-nowrap rounded-full bg-foreground px-3 py-2.5 text-[13px] font-medium text-background hover:-translate-y-[1px] sm:px-4 sm:py-2 sm:text-sm"
                  >
                    {L.accept}
                  </button>
                )}
                <button
                  onClick={() => save("rejected", false, false)}
                  className="whitespace-nowrap rounded-full border border-foreground/15 bg-background px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:bg-foreground/5 hover:text-foreground sm:px-4 sm:py-2 sm:text-sm"
                >
                  {L.reject}
                </button>
                {!showDetails && (
                  <button
                    onClick={() => setShowDetails(true)}
                    className="col-span-2 justify-self-start py-1 text-[13px] font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground sm:ml-1"
                  >
                    {L.customize}
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => save("rejected", false, false)}
              aria-label={L.close}
              className="-mr-2 -mt-2 hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground sm:flex"
            >
              <X size={16} strokeWidth={1.75} />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

function Row({
  title,
  desc,
  checked,
  onChange,
  disabled,
}: {
  title: string
  desc: string
  checked: boolean
  onChange?: () => void
  disabled?: boolean
}) {
  return (
    <label
      className={`flex cursor-pointer items-start justify-between gap-3 rounded-lg px-2 py-1.5 text-sm ${
        disabled ? "cursor-not-allowed opacity-70" : "hover:bg-foreground/5"
      }`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{desc}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={title}
        className="mt-1 h-4 w-4 shrink-0 accent-foreground"
      />
    </label>
  )
}

export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ConsentState
  } catch {
    return null
  }
}
