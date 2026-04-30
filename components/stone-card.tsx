"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSelectionStore } from "@/lib/store/selection"
import { usePopularityStore } from "@/lib/store/popularity"
import { useTranslation } from "@/lib/i18n/context"
import { shapeLabels, finishLabels } from "@/lib/i18n/filters"
import type { StoneItem, Locale } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StoneCardProps {
  item: StoneItem
  showBestseller?: boolean
}

const categoryLabels: Record<"memorial" | "home", Record<Locale, string>> = {
  memorial: { uk: "ПАМ'ЯТНИКИ", pl: "POMNIKI", en: "MONUMENTS", de: "GRABMALE", lt: "PAMINKLAI" },
  home: { uk: "ДЛЯ ДОМУ", pl: "DO DOMU", en: "HOME", de: "HAUS", lt: "NAMAMS" },
}

const bestsellerLabels: Record<Locale, string> = {
  uk: "ХІТ",
  pl: "HIT",
  en: "BESTSELLER",
  de: "BESTSELLER",
  lt: "HITAS",
}

const addToCartLabels: Record<Locale, string> = {
  uk: "В кошик",
  pl: "Do koszyka",
  en: "Add to cart",
  de: "In den Warenkorb",
  lt: "Į krepšelį",
}

const inCartLabels: Record<Locale, string> = {
  uk: "У кошику",
  pl: "W koszyku",
  en: "In cart",
  de: "Im Warenkorb",
  lt: "Krepšelyje",
}

function buildDescription(item: StoneItem, locale: Locale): string {
  const finish = item.finish ? finishLabels[item.finish][locale].toLowerCase() : ""
  const categoryWord: Record<Locale, string> = {
    uk: item.category === "memorial" ? "пам'ятник" : "виріб з каменю",
    pl: item.category === "memorial" ? "pomnik" : "wyrób kamienny",
    en: item.category === "memorial" ? "monument" : "stone piece",
    de: item.category === "memorial" ? "Grabmal" : "Steinwerk",
    lt: item.category === "memorial" ? "paminklas" : "akmens gaminys",
  }
  const templates: Record<Locale, string> = {
    uk: `Натуральний камінь, ${categoryWord.uk}${finish ? `, ${finish} обробка` : ""}.`,
    pl: `Naturalny kamień, ${categoryWord.pl}${finish ? `, wykończenie ${finish}` : ""}.`,
    en: `Natural stone ${categoryWord.en}${finish ? `, ${finish} finish` : ""}.`,
    de: `Naturstein, ${categoryWord.de}${finish ? `, ${finish} Oberfläche` : ""}.`,
    lt: `Natūralus akmuo, ${categoryWord.lt}${finish ? `, ${finish} apdaila` : ""}.`,
  }
  return templates[locale]
}

const specLabels: Record<Locale, { size: string; weight: string; finish: string }> = {
  uk: { size: "Розмір", weight: "Маса", finish: "Поверхня" },
  pl: { size: "Rozmiar", weight: "Waga", finish: "Wykończenie" },
  en: { size: "Size", weight: "Weight", finish: "Finish" },
  de: { size: "Größe", weight: "Gewicht", finish: "Oberfläche" },
  lt: { size: "Dydis", weight: "Svoris", finish: "Apdaila" },
}

export function StoneCard({ item, showBestseller }: StoneCardProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [imageSrc, setImageSrc] = useState(item.imagePath)
  const { addItem, items } = useSelectionStore()
  const incrementPopularity = usePopularityStore((s) => s.increment)
  const { t, locale, formatPrice } = useTranslation()
  const isSelected = items.some((i) => i.id === item.id)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSelected) return
    addItem(item)
    incrementPopularity(item.id)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 600)
  }

  const categoryLabel = categoryLabels[item.category][locale]
  const subLabel = item.shape
    ? shapeLabels[item.shape][locale].toUpperCase()
    : item.finish
    ? finishLabels[item.finish][locale].toUpperCase()
    : ""
  const description = buildDescription(item, locale)
  const L = specLabels[locale]

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.01 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <Link
        href={`/stones/${item.id}`}
        prefetch
        className="block h-full overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-black/[0.04] transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-hover hover:-translate-y-0.5"
        aria-label={`№ ${item.id}`}
      >
        <div className="relative aspect-[16/11] overflow-hidden bg-foreground/5">
          <Image
            src={imageSrc}
            alt={`${item.category === "memorial" ? "Пам'ятник" : "Виріб з каменю"} № ${item.id}${item.material ? `, ${item.material}` : ""}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageSrc("/stones/memorial-01.svg")}
            className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
          />
          {(showBestseller || item.isFeatured) && (
            <div className="absolute left-4 top-4 rounded-full bg-foreground px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-background">
              {bestsellerLabels[locale]}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span>{categoryLabel}</span>
            {subLabel && (
              <>
                <span className="opacity-50">•</span>
                <span>{subLabel}</span>
              </>
            )}
          </div>

          <h3 className="mt-3 text-xl font-semibold tracking-tight-custom tabular-nums">
            № {item.id}
          </h3>

          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground line-clamp-2">
            {description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {item.sizeCm && (
              <span className="inline-flex items-center rounded-full bg-foreground/[0.04] px-3 py-1.5 text-[12px] text-foreground/75">
                {L.size}: {item.sizeCm}
              </span>
            )}
            {item.weightKg && (
              <span className="inline-flex items-center rounded-full bg-foreground/[0.04] px-3 py-1.5 text-[12px] text-foreground/75">
                {L.weight}: {item.weightKg} kg
              </span>
            )}
            {item.finish && (
              <span className="inline-flex items-center rounded-full bg-foreground/[0.04] px-3 py-1.5 text-[12px] text-foreground/75">
                {finishLabels[item.finish][locale]}
              </span>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {t.catalog.fromPrice}
              </span>
              <span className="text-xl font-semibold tabular-nums">
                {formatPrice(item.priceFrom)}
              </span>
            </div>
            <motion.button
              type="button"
              onClick={handleAdd}
              disabled={isSelected}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isSelected
                  ? "bg-success/10 text-success"
                  : "bg-accent text-accent-foreground hover:-translate-y-[1px] hover:brightness-110"
              )}
              aria-label={isSelected ? inCartLabels[locale] : addToCartLabels[locale]}
            >
              <AnimatePresence mode="wait" initial={false}>
                {showSuccess || isSelected ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="inline-flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" strokeWidth={2.25} />
                    {inCartLabels[locale]}
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {addToCartLabels[locale]}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
