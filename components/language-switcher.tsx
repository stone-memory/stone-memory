"use client"

import { Check, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/context"
import { localeNames, type Locale } from "@/lib/i18n/dictionaries"
import { cn } from "@/lib/utils"

interface LanguageSwitcherProps {
  className?: string
}

const LOCALES: Locale[] = ["uk", "pl", "en", "de", "lt"]

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-2 h-9 px-3 rounded-full text-sm font-medium text-foreground/80 hover:bg-black/5",
            className
          )}
        >
          <span className="text-base leading-none">{localeNames[locale].flag}</span>
          <span className="uppercase">{locale}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => setLocale(l)}
            className="gap-3 cursor-pointer"
          >
            <span className="text-base leading-none">{localeNames[l].flag}</span>
            <span className="flex-1">{localeNames[l].name}</span>
            {locale === l && <Check className="h-4 w-4 text-foreground" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
