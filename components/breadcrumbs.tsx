"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import type { Locale } from "@/lib/types"

// Dedicated label map: this is the homepage crumb, and the i18n dictionary
// has no generic "home" string.
const HOME_LABEL: Record<Locale, string> = {
  uk: "Головна",
  en: "Home",
  pl: "Strona główna",
  de: "Startseite",
  lt: "Pagrindinis",
}

export type Crumb = {
  name: string
  /** Omit on the final crumb — the current page is not a link. */
  href?: string
}

/**
 * Visible breadcrumb trail.
 *
 * The BreadcrumbList JSON-LD already shipped in the route layouts, but Google
 * treats structured data as a description of what is on the page — without a
 * visible trail the markup describes navigation that does not exist, and the
 * breadcrumb rich result can be dropped. This renders the same path the schema
 * claims. The leading "Головна" crumb is added automatically.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const { locale } = useTranslation()
  const trail: Crumb[] = [{ name: HOME_LABEL[locale], href: "/" }, ...items]

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1
          return (
            <li key={`${crumb.name}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" strokeWidth={2} aria-hidden="true" />
              )}
              {isLast || !crumb.href ? (
                <span aria-current="page" className="font-medium text-foreground line-clamp-1">
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.href} className="transition-colors hover:text-foreground">
                  {crumb.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
