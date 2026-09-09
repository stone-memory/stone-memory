"use client"

import { ChevronDown } from "lucide-react"
import { useState, type ComponentType } from "react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/context"
import { localeNames } from "@/lib/i18n/dictionaries"
import { cn } from "@/lib/utils"

interface LanguageSwitcherProps {
  className?: string
}

type MenuComponent = ComponentType<{
  triggerClassName?: string
  children: React.ReactNode
  defaultOpen?: boolean
}>

let menuPromise: Promise<MenuComponent> | null = null
function loadMenu(): Promise<MenuComponent> {
  menuPromise ??= import("@/components/language-menu").then((m) => m.LanguageMenu)
  return menuPromise
}

/**
 * Кнопка перемикання мови. У SSR і до першої взаємодії — звичайна кнопка з
 * тим самим виглядом, що й тригер меню; Radix-меню (див. language-menu.tsx)
 * довантажується при наведенні, фокусі чи дотику, а після кліку відкривається
 * одразу, щойно чанк приїде. Так ~40 КБ gzip зникають із першого пакета
 * скриптів, а кнопка не «стрибає» — вона є в HTML із самого початку.
 */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale } = useTranslation()
  const [Menu, setMenu] = useState<MenuComponent | null>(null)
  const [openOnReady, setOpenOnReady] = useState(false)

  const triggerClassName = cn(
    "gap-2 h-9 px-3 rounded-full text-sm font-medium text-foreground/80 hover:bg-black/5",
    className
  )
  const label = (
    <>
      <span className="text-base leading-none">{localeNames[locale].flag}</span>
      <span className="uppercase">{locale}</span>
      <ChevronDown className="h-3.5 w-3.5 opacity-50" />
    </>
  )

  if (Menu) {
    return (
      <Menu triggerClassName={triggerClassName} defaultOpen={openOnReady}>
        {label}
      </Menu>
    )
  }

  const warm = () => {
    void loadMenu()
  }
  const open = () => {
    setOpenOnReady(true)
    void loadMenu().then((m) => setMenu(() => m))
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={triggerClassName}
      aria-haspopup="menu"
      aria-expanded={false}
      onPointerEnter={warm}
      onFocus={warm}
      onTouchStart={warm}
      onClick={open}
    >
      {label}
    </Button>
  )
}
