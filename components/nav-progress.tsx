"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

type State = "idle" | "loading" | "done"

// Thin top progress bar shown during client-side navigation. Matches the
// nprogress pattern: grows to ~80% while fetching, snaps to 100% on arrival,
// then fades out. Intercepts same-origin anchor clicks globally so it works
// for every <Link> without per-link wiring.
export function NavProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [state, setState] = useState<State>("idle")

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Respect modified clicks so they open new tabs / context menus etc.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as HTMLElement | null)?.closest("a")
      if (!anchor) return
      if (anchor.target === "_blank") return
      const href = anchor.getAttribute("href")
      if (!href) return
      if (href.startsWith("#")) return
      if (/^(mailto:|tel:|javascript:|https?:\/\/)/i.test(href)) {
        // external absolute URLs (outside the app) — skip, since the page unloads anyway
        try {
          const u = new URL(href, window.location.origin)
          if (u.origin !== window.location.origin) return
        } catch {
          return
        }
      }
      // Same-origin navigation — ignore when target is current URL.
      const current = window.location.pathname + window.location.search
      try {
        const target = new URL(anchor.href, window.location.origin)
        const next = target.pathname + target.search
        if (next === current) return
      } catch {
        return
      }
      setState("loading")
    }
    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [])

  // When the URL resolves to a new pathname/search, navigation finished.
  useEffect(() => {
    setState((prev) => (prev === "loading" ? "done" : prev))
  }, [pathname, searchParams])

  useEffect(() => {
    if (state !== "done") return
    const t = setTimeout(() => setState("idle"), 350)
    return () => clearTimeout(t)
  }, [state])

  return (
    <div
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-[200] h-0.5 pointer-events-none"
    >
      <div
        className={cn(
          "h-full bg-foreground will-change-[width,opacity]",
          state === "idle" && "w-0 opacity-0 transition-[width,opacity] duration-300",
          state === "loading" && "w-[80%] opacity-100 transition-[width] duration-700 ease-out",
          state === "done" && "w-full opacity-100 transition-[width] duration-200",
        )}
      />
    </div>
  )
}
