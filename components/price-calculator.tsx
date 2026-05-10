"use client"

import { useMemo, useState } from "react"
import { X, Calculator as CalcIcon, Phone, Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "@/lib/i18n/context"
import { useChatStore } from "@/lib/store/chat"
import type { Locale } from "@/lib/types"
import { cn } from "@/lib/utils"
import { create } from "zustand"

type ProductType =
  | "monument-single"
  | "monument-double"
  | "countertop"
  | "window-sill"
  | "stairs"
  | "fireplace"
  | "paving"

type Material = "granite" | "gabbro" | "marble" | "quartzite" | "limestone"

// Rough € per m² / linear meter / piece — for instant estimate only
const basePricePerSqm: Record<Material, number> = {
  granite: 320,
  gabbro: 380,
  marble: 420,
  quartzite: 560,
  limestone: 260,
}

const monumentBase: Record<Material, number> = {
  granite: 1800,
  gabbro: 2100,
  marble: 2600,
  quartzite: 3400,
  limestone: 1500,
}

const uiCopy: Record<Locale, {
  title: string
  subtitle: string
  open: string
  close: string
  step1: string
  step2: string
  step3: string
  result: string
  resultHint: string
  callUs: string
  requestQuote: string
  width: string
  height: string
  length: string
  depth: string
  areaLabel: string
  pieces: string
  productLabels: Record<ProductType, string>
  materialLabels: Record<Material, string>
  from: string
  priceNote: string
}> = {
  uk: {
    title: "Калькулятор вартості",
    subtitle: "Орієнтовна ціна за секунди",
    open: "Калькулятор",
    close: "Закрити",
    step1: "1. Що рахуємо",
    step2: "2. Матеріал",
    step3: "3. Розміри",
    result: "Орієнтовна вартість",
    resultHint: "Точну ціну розрахує менеджер з урахуванням складності, доставки, монтажу.",
    callUs: "Подзвонити",
    requestQuote: "Написати менеджеру",
    width: "Ширина, см",
    height: "Висота, см",
    length: "Довжина, см",
    depth: "Глибина, см",
    areaLabel: "Площа",
    pieces: "Штук",
    productLabels: {
      "monument-single": "Пам'ятник одиночний",
      "monument-double": "Пам'ятник подвійний",
      "countertop": "Стільниця",
      "window-sill": "Підвіконня",
      "stairs": "Сходи",
      "fireplace": "Камін",
      "paving": "Бруківка/плитка",
    },
    materialLabels: {
      granite: "Граніт",
      gabbro: "Габро",
      marble: "Мармур",
      quartzite: "Кварцит",
      limestone: "Вапняк",
    },
    from: "від",
    priceNote: "без доставки і монтажу",
  },
  pl: {
    title: "Kalkulator ceny",
    subtitle: "Wycena orientacyjna w sekundy",
    open: "Kalkulator",
    close: "Zamknij",
    step1: "1. Co liczymy",
    step2: "2. Materiał",
    step3: "3. Wymiary",
    result: "Cena orientacyjna",
    resultHint: "Dokładną wycenę poda menedżer z uwzględnieniem transportu i montażu.",
    callUs: "Zadzwoń",
    requestQuote: "Napisz do menedżera",
    width: "Szerokość, cm",
    height: "Wysokość, cm",
    length: "Długość, cm",
    depth: "Głębokość, cm",
    areaLabel: "Powierzchnia",
    pieces: "Sztuk",
    productLabels: {
      "monument-single": "Pomnik pojedynczy",
      "monument-double": "Pomnik podwójny",
      "countertop": "Blat",
      "window-sill": "Parapet",
      "stairs": "Schody",
      "fireplace": "Kominek",
      "paving": "Kostka/płytka",
    },
    materialLabels: {
      granite: "Granit",
      gabbro: "Gabro",
      marble: "Marmur",
      quartzite: "Kwarcyt",
      limestone: "Wapień",
    },
    from: "od",
    priceNote: "bez dostawy i montażu",
  },
  en: {
    title: "Price calculator",
    subtitle: "Instant rough estimate",
    open: "Calculator",
    close: "Close",
    step1: "1. Product",
    step2: "2. Material",
    step3: "3. Dimensions",
    result: "Rough price",
    resultHint: "A manager will give an exact quote including delivery and installation.",
    callUs: "Call",
    requestQuote: "Message a manager",
    width: "Width, cm",
    height: "Height, cm",
    length: "Length, cm",
    depth: "Depth, cm",
    areaLabel: "Area",
    pieces: "Pieces",
    productLabels: {
      "monument-single": "Monument · single",
      "monument-double": "Monument · double",
      "countertop": "Countertop",
      "window-sill": "Window sill",
      "stairs": "Staircase",
      "fireplace": "Fireplace",
      "paving": "Paving/tiles",
    },
    materialLabels: {
      granite: "Granite",
      gabbro: "Gabbro",
      marble: "Marble",
      quartzite: "Quartzite",
      limestone: "Limestone",
    },
    from: "from",
    priceNote: "before delivery and installation",
  },
  de: {
    title: "Preisrechner",
    subtitle: "Sofortige Grobschätzung",
    open: "Rechner",
    close: "Schließen",
    step1: "1. Produkt",
    step2: "2. Material",
    step3: "3. Maße",
    result: "Richtpreis",
    resultHint: "Ein Manager erstellt ein exaktes Angebot inkl. Lieferung und Montage.",
    callUs: "Anrufen",
    requestQuote: "Manager schreiben",
    width: "Breite, cm",
    height: "Höhe, cm",
    length: "Länge, cm",
    depth: "Tiefe, cm",
    areaLabel: "Fläche",
    pieces: "Stück",
    productLabels: {
      "monument-single": "Einzel-Grabmal",
      "monument-double": "Doppel-Grabmal",
      "countertop": "Arbeitsplatte",
      "window-sill": "Fensterbank",
      "stairs": "Treppe",
      "fireplace": "Kamin",
      "paving": "Pflaster/Fliesen",
    },
    materialLabels: {
      granite: "Granit",
      gabbro: "Gabbro",
      marble: "Marmor",
      quartzite: "Quarzit",
      limestone: "Kalkstein",
    },
    from: "ab",
    priceNote: "ohne Lieferung und Montage",
  },
  lt: {
    title: "Kainos skaičiuoklė",
    subtitle: "Momentinis orientacinis skaičiavimas",
    open: "Skaičiuoklė",
    close: "Uždaryti",
    step1: "1. Ką skaičiuojame",
    step2: "2. Medžiaga",
    step3: "3. Matmenys",
    result: "Orientacinė kaina",
    resultHint: "Vadybininkas pateiks tikslią kainą su pristatymu ir montavimu.",
    callUs: "Skambinti",
    requestQuote: "Rašyti vadybininkui",
    width: "Plotis, cm",
    height: "Aukštis, cm",
    length: "Ilgis, cm",
    depth: "Gylis, cm",
    areaLabel: "Plotas",
    pieces: "Vnt.",
    productLabels: {
      "monument-single": "Paminklas · viengubas",
      "monument-double": "Paminklas · dvigubas",
      "countertop": "Stalviršis",
      "window-sill": "Palangė",
      "stairs": "Laiptai",
      "fireplace": "Židinys",
      "paving": "Grindinys/plytelės",
    },
    materialLabels: {
      granite: "Granitas",
      gabbro: "Gabbras",
      marble: "Marmuras",
      quartzite: "Kvarcitas",
      limestone: "Klintis",
    },
    from: "nuo",
    priceNote: "be pristatymo ir montavimo",
  },
}

interface CalcStore {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}
export const useCalcStore = create<CalcStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}))

const PHONE = "+380678080222"
const PHONE_DISPLAY = "+380 (67) 808 02 22"

export function PriceCalculator() {
  const { locale, formatPrice } = useTranslation()
  const U = uiCopy[locale]
  const isOpen = useCalcStore((s) => s.isOpen)
  const close = useCalcStore((s) => s.close)
  const openChat = useChatStore((s) => s.open)

  const [product, setProduct] = useState<ProductType>("monument-single")
  const [material, setMaterial] = useState<Material>("granite")
  // dims in cm
  const [w, setW] = useState(80)
  const [h, setH] = useState(50)
  const [l, setL] = useState(200) // length for countertop/stairs
  const [d, setD] = useState(60) // depth / width
  const [pieces, setPieces] = useState(1)

  const areaM2 = useMemo(() => {
    const cm2 = l * d
    return Math.max(0.01, cm2 / 10000)
  }, [l, d])

  const price = useMemo(() => {
    switch (product) {
      case "monument-single": {
        const scale = (w * h) / (80 * 50)
        return Math.round(monumentBase[material] * Math.max(0.6, scale))
      }
      case "monument-double": {
        const scale = (w * h) / (80 * 50)
        return Math.round(monumentBase[material] * 1.65 * Math.max(0.8, scale))
      }
      case "countertop":
      case "window-sill":
      case "stairs":
      case "fireplace":
      case "paving": {
        const multiplier =
          product === "stairs" ? 1.6 :
          product === "fireplace" ? 2.1 :
          product === "window-sill" ? 1.15 :
          product === "paving" ? 0.75 :
          1.0 // countertop baseline
        return Math.round(basePricePerSqm[material] * areaM2 * multiplier * pieces)
      }
    }
  }, [product, material, w, h, l, d, areaM2, pieces])

  const needsTwoDim = product === "monument-single" || product === "monument-double"

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[90] inset-x-3 bottom-3 top-3 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-xl md:max-h-[90vh] overflow-auto rounded-3xl border border-foreground/10 bg-card p-6 shadow-hover md:p-8"
            role="dialog"
            aria-labelledby="calc-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-foreground/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <CalcIcon className="h-3.5 w-3.5" strokeWidth={2} />
                  {U.subtitle}
                </div>
                <h2 id="calc-title" className="mt-2 text-2xl font-semibold tracking-tight-custom md:text-3xl">
                  {U.title}
                </h2>
              </div>
              <button
                onClick={close}
                aria-label={U.close}
                className="rounded-full p-2 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <Section title={U.step1}>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(U.productLabels) as ProductType[]).map((p) => (
                    <Pill key={p} active={product === p} onClick={() => setProduct(p)}>
                      {U.productLabels[p]}
                    </Pill>
                  ))}
                </div>
              </Section>

              <Section title={U.step2}>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(U.materialLabels) as Material[]).map((m) => (
                    <Pill key={m} active={material === m} onClick={() => setMaterial(m)}>
                      {U.materialLabels[m]}
                    </Pill>
                  ))}
                </div>
              </Section>

              <Section title={U.step3}>
                <div className="grid grid-cols-2 gap-3">
                  {needsTwoDim ? (
                    <>
                      <NumberField label={U.width} value={w} onChange={setW} min={20} max={250} />
                      <NumberField label={U.height} value={h} onChange={setH} min={30} max={250} />
                    </>
                  ) : (
                    <>
                      <NumberField label={U.length} value={l} onChange={setL} min={10} max={1000} />
                      <NumberField label={U.depth} value={d} onChange={setD} min={10} max={400} />
                      <NumberField label={U.pieces} value={pieces} onChange={setPieces} min={1} max={999} />
                    </>
                  )}
                </div>
                {!needsTwoDim && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {U.areaLabel}: <span className="font-medium text-foreground tabular-nums">{areaM2.toFixed(2)} м²</span>
                  </p>
                )}
              </Section>
            </div>

            <div className="mt-7 rounded-2xl bg-foreground text-background p-5 md:p-6">
              <div className="text-[11px] font-medium uppercase tracking-[0.2em] opacity-70">
                {U.result}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-sm opacity-80">{U.from}</span>
                <span className="text-4xl font-semibold tracking-tight-custom tabular-nums md:text-5xl">
                  {formatPrice(price)}
                </span>
              </div>
              <div className="mt-1 text-xs opacity-70">{U.priceNote}. {U.resultHint}</div>
              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={`tel:${PHONE}`}
                  className="inline-flex items-center gap-2 rounded-full bg-background/10 px-4 py-2 text-sm font-medium text-background ring-1 ring-background/20 transition-colors hover:bg-background/20"
                >
                  <Phone className="h-3.5 w-3.5" strokeWidth={2} />
                  {U.callUs} · {PHONE_DISPLAY}
                </a>
                <button
                  onClick={() => {
                    close()
                    openChat()
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-medium text-foreground hover:brightness-110"
                >
                  <Send className="h-3.5 w-3.5" strokeWidth={2} />
                  {U.requestQuote}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  )
}

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-foreground/15 bg-card text-foreground hover:bg-foreground/5"
      )}
    >
      {children}
    </button>
  )
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = Number(e.target.value)
          if (Number.isFinite(v)) onChange(Math.max(min, Math.min(max, v)))
        }}
        className="h-11 w-full rounded-xl border border-foreground/10 bg-background px-3 text-base tabular-nums outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10"
      />
    </label>
  )
}
