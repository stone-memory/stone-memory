"use client"

import { Phone } from "lucide-react"
import { ConsultButton } from "@/components/consult-button"
import { ProfilePhone } from "@/components/profile-phone"
import { useTranslation } from "@/lib/i18n/context"
import { HUB_COPY } from "@/lib/i18n/copy/hub"

/**
 * Темна смуга «порахуємо за фото ділянки» внизу інфосторінок і хабу.
 *
 * Без пропсів бере тексти зі словника за мовою відвідувача; сторінки, що
 * передають власні рядки (українські інфосторінки), рендеряться як раніше.
 */
export function CtaBand({
  title,
  text,
  cta,
}: {
  title?: string
  text?: string
  /** Текст кнопки; стає заголовком модалки заявки. */
  cta?: string
}) {
  const { locale } = useTranslation()
  const c = HUB_COPY[locale].cta
  const heading = title ?? c.title
  return (
    <section className="mx-auto max-w-7xl px-6 pt-14 pb-20 md:pt-20 md:pb-28">
      <div className="rounded-3xl bg-foreground px-6 py-10 text-background md:px-12 md:py-14">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight-custom md:text-4xl text-balance">{heading}</h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-background/75 md:text-base">{text ?? c.text}</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <ConsultButton className="bg-background text-foreground" topic={heading}>
              {cta ?? c.button}
            </ConsultButton>
            <ProfilePhone className="inline-flex items-center gap-2 text-sm font-medium text-background/85 hover:text-background">
              <Phone className="h-4 w-4" strokeWidth={2} />
            </ProfilePhone>
          </div>
        </div>
      </div>
    </section>
  )
}
