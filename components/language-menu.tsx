"use client"

import { Check } from "lucide-react"
import type { ReactNode } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/context"
import { localeNames, type Locale } from "@/lib/i18n/dictionaries"

const LOCALES: Locale[] = ["uk", "pl", "en", "de", "lt"]

/**
 * Саме меню мов на Radix DropdownMenu.
 *
 * Живе окремо від кнопки-перемикача (language-switcher.tsx), бо Radix
 * DropdownMenu разом із popper, focus-scope, remove-scroll тощо важить
 * ~40 КБ gzip — і все це входило в перший пакет скриптів кожної сторінки
 * заради меню, яке більшість відвідувачів ніколи не відкриває. Тепер чанк
 * довантажується при наведенні/фокусі/дотику до кнопки.
 */
export function LanguageMenu({
  triggerClassName,
  children,
  defaultOpen,
}: {
  triggerClassName?: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const { locale, setLocale } = useTranslation()

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={triggerClassName}>
          {children}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {LOCALES.map((l) => (
          <DropdownMenuItem key={l} onClick={() => setLocale(l)} className="gap-3 cursor-pointer">
            <span className="text-base leading-none">{localeNames[l].flag}</span>
            <span className="flex-1">{localeNames[l].name}</span>
            {locale === l && <Check className="h-4 w-4 text-foreground" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
