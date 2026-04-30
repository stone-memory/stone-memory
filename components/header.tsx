"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useSelectionStore } from "@/lib/store/selection"
import { useTranslation } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import type { Locale } from "@/lib/types"

interface HeaderProps {
  className?: string
}

const aboutLabels: Record<Locale, string> = {
  uk: "Про нас",
  pl: "O nas",
  en: "About",
  de: "Über uns",
  lt: "Apie mus",
}

export function Header({ className }: HeaderProps) {
  const { items, openSidebar } = useSelectionStore()
  const { t, locale } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const itemCount = items.length

  const projectsLabels: Record<Locale, string> = {
    uk: "Наші роботи",
    pl: "Projekty",
    en: "Projects",
    de: "Projekte",
    lt: "Darbai",
  }

  const navItems = [
    { href: "/catalog", label: t.nav.catalog },
    { href: "/services", label: t.nav.services },
    { href: "/projects", label: projectsLabels[locale] },
    { href: "/about", label: aboutLabels[locale] },
    { href: "/blog", label: t.nav.blog },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-14 w-full",
        "border-b border-foreground/5",
        "bg-card/55 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-card/45",
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground"
          aria-label="Stone Memory — home"
        >
          <Image
            src="/logo-mark.png"
            alt=""
            width={28}
            height={28}
            priority
            className="h-7 w-7 select-none"
          />
          <span className="text-[17px] font-semibold tracking-tight-custom">
            Stone Memory
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className="rounded-full px-3 py-1.5 text-[13px] font-medium text-foreground/75 transition-colors hover:text-foreground hover:bg-foreground/5"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={openSidebar}
            className="relative h-10 w-10 text-foreground/80 hover:text-foreground hover:bg-foreground/5"
            aria-label={t.nav.selection}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-medium text-accent-foreground"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden h-10 w-10 text-foreground/80 hover:bg-foreground/5"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-foreground/5 bg-card/90 backdrop-blur-2xl px-6 py-3"
          >
            <nav className="flex flex-col">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-base font-medium text-foreground/85 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-3 pt-3 border-t border-foreground/5">
                <LanguageSwitcher />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
