"use client"

import { useTranslation } from "@/lib/i18n/context"
import type { Locale } from "@/lib/types"

/**
 * Текст, що залежить від мови, усередині серверного компонента.
 *
 * Мова живе лише на клієнті (LanguageProvider читає localStorage), тому
 * серверна розкладка не може обрати рядок сама. Цей вузол гідратується
 * окремо й підміняє український текст після вибору мови — так само, як
 * решта клієнтських компонентів.
 */
export function Localized({ text }: { text: Partial<Record<Locale, string>> & { uk: string } }) {
  const { locale } = useTranslation()
  return <>{text[locale] ?? text.uk}</>
}
