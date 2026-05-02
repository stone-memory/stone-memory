"use client"

import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { useSelectionStore } from "@/lib/store/selection"
import { useTranslation } from "@/lib/i18n/context"
import { generateOrderRef } from "@/lib/data/stones"
import { cn } from "@/lib/utils"

const LOCALE_TO_CC: Record<string, string> = {
  uk: "+380",
  pl: "+48",
  de: "+49",
  lt: "+370",
  en: "+44",
}

const PHONE_DIGITS: Record<string, number> = {
  "+380": 9,
  "+48": 9,
  "+49": 11,
  "+370": 8,
  "+44": 10,
}

function capitalizeName(value: string): string {
  return value
    .replace(/\s{2,}/g, " ")
    .split(" ")
    .map((w) => {
      if (!w) return w
      const parts = w.split("-")
      return parts
        .map((p) => (p ? p.charAt(0).toLocaleUpperCase() + p.slice(1).toLocaleLowerCase() : p))
        .join("-")
    })
    .join(" ")
}

export function SelectionForm() {
  const { items, submitOrder } = useSelectionStore()
  const { t, locale } = useTranslation()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [countryCode, setCountryCode] = useState(LOCALE_TO_CC[locale] || "+44")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const requiredDigits = PHONE_DIGITS[countryCode] ?? 9
  const isPhoneValid = phone.length === requiredDigits
  const isDisabled = !name.trim() || !isPhoneValid || items.length === 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isDisabled) return

    setIsSubmitting(true)
    const reference = generateOrderRef()

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: `${countryCode} ${phone.trim()}`,
          locale,
          source: "selection-form",
          reference,
          items: items.map((i) => ({ ...i })),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Failed to submit order")
      }
      submitOrder(reference)
    } catch (err) {
      console.error("order submit failed", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const countryCodes = [
    { code: "+48", country: "PL" },
    { code: "+49", country: "DE" },
    { code: "+370", country: "LT" },
    { code: "+380", country: "UA" },
    { code: "+44", country: "GB" },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Name Input */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(capitalizeName(e.target.value))}
        autoCapitalize="words"
        autoComplete="name"
        placeholder={t.selection.namePlaceholder}
        className={cn(
          "h-12 w-full rounded-xl bg-foreground/[0.04] px-4",
          "text-base placeholder:text-muted-foreground",
          "border-0 outline-none",
          "focus:ring-2 focus:ring-foreground/10",
          "transition-all duration-200"
        )}
      />

      {/* Phone Input with Country Code */}
      <div className="flex gap-2">
        <select
          value={countryCode}
          onChange={(e) => {
            const cc = e.target.value
            setCountryCode(cc)
            setPhone((p) => p.slice(0, PHONE_DIGITS[cc] ?? 9))
          }}
          className={cn(
            "h-12 rounded-xl bg-foreground/[0.04] px-3",
            "text-sm font-medium",
            "border-0 outline-none",
            "focus:ring-2 focus:ring-foreground/10",
            "transition-all duration-200",
            "appearance-none cursor-pointer"
          )}
        >
          {countryCodes.map((cc) => (
            <option key={cc.code} value={cc.code}>
              {cc.country} {cc.code}
            </option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "")
            setPhone(digits.slice(0, requiredDigits))
          }}
          maxLength={requiredDigits}
          placeholder={`${requiredDigits} ${t.selection.phonePlaceholder}`}
          className={cn(
            "h-12 flex-1 rounded-xl bg-foreground/[0.04] px-4",
            "text-base placeholder:text-muted-foreground tabular-nums",
            "border-0 outline-none",
            "focus:ring-2 focus:ring-foreground/10",
            "transition-all duration-200"
          )}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isDisabled || isSubmitting}
        className={cn(
          "h-14 w-full rounded-xl bg-foreground text-primary-foreground",
          "font-medium text-base",
          "transition-all duration-200",
          "hover:bg-foreground/90",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner className="h-5 w-5" />
            {t.selection.submitting}
          </span>
        ) : (
          t.selection.submit
        )}
      </button>

      {/* Privacy Notice */}
      <p className="text-center text-[11px] text-muted-foreground/80">
        {t.selection.privacy}
      </p>
    </form>
  )
}
