"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowRight } from "lucide-react"

type Item = {
  id: string
  label: string
  hint?: string
  href: string
  group: string
}

/**
 * Static nav + dynamic admin index. Searches labels + hints.
 * Trigger with ⌘K / Ctrl+K. Arrow keys + Enter to navigate.
 */
const NAV_ITEMS: Item[] = [
  { id: "n-orders", label: "Замовлення", href: "/admin", group: "Навігація" },
  { id: "n-messages", label: "Повідомлення", href: "/admin/messages", group: "Навігація" },
  { id: "n-chat", label: "Живий чат", href: "/admin/chat", group: "Навігація" },
  { id: "n-chat-s", label: "Налаштування чату", href: "/admin/chat-settings", group: "Навігація" },
  { id: "n-fin", label: "Фінанси", href: "/admin/finances", group: "Навігація" },
  { id: "n-prod", label: "Продукти (камінь)", href: "/admin/stones", group: "Навігація" },
  { id: "n-svc", label: "Послуги", href: "/admin/services", group: "Навігація" },
  { id: "n-prj", label: "Проекти", href: "/admin/projects", group: "Навігація" },
  { id: "n-rev", label: "Відгуки", href: "/admin/reviews", group: "Навігація" },
  { id: "n-pop", label: "Популярне", href: "/admin/featured", group: "Навігація" },
  { id: "n-blog", label: "Блог", href: "/admin/blog", group: "Навігація" },
  { id: "n-faq", label: "FAQ", href: "/admin/faq", group: "Навігація" },
  { id: "n-about", label: "Сторінка «Про нас»", href: "/admin/about", group: "Навігація" },
  { id: "n-cli", label: "Клієнти", href: "/admin/clients", group: "Навігація" },
  { id: "n-an", label: "Аналітика", href: "/admin/analytics", group: "Навігація" },
  { id: "n-tasks", label: "Задачі", href: "/admin/tasks", group: "Навігація" },
  { id: "n-biz", label: "Профіль бізнесу", href: "/admin/business", group: "Навігація" },
  { id: "n-backup", label: "Резервні копії", href: "/admin/backup", group: "Навігація" },
  { id: "n-audit", label: "Аудит", href: "/admin/audit", group: "Навігація" },
  { id: "n-roles", label: "Ролі та доступ", href: "/admin/roles", group: "Навігація" },
  { id: "n-set", label: "Налаштування сайту", href: "/admin/settings", group: "Навігація" },

  { id: "a-newfaq", label: "Нове питання FAQ", hint: "додати питання", href: "/admin/faq", group: "Дії" },
  { id: "a-newsvc", label: "Нова послуга", hint: "створити картку послуги", href: "/admin/services", group: "Дії" },
  { id: "a-newprj", label: "Новий проект", hint: "додати в портфоліо", href: "/admin/projects", group: "Дії" },
  { id: "a-newrev", label: "Додати відгук вручну", href: "/admin/reviews", group: "Дії" },
  { id: "a-newtask", label: "Нова задача", href: "/admin/tasks", group: "Дії" },
  { id: "a-backup", label: "Експортувати резервну копію", href: "/admin/backup", group: "Дії" },
]

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [highlight, setHighlight] = useState(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault()
        setOpen((v) => !v)
        return
      }
      if (!open) return
      if (e.key === "Escape") setOpen(false)
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setHighlight((h) => Math.min(h + 1, filtered.length - 1))
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setHighlight((h) => Math.max(h - 1, 0))
      }
      if (e.key === "Enter") {
        e.preventDefault()
        const item = filtered[highlight]
        if (item) pick(item)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, highlight])

  const filtered = useMemo(() => {
    if (!q.trim()) return NAV_ITEMS
    const s = q.toLowerCase()
    return NAV_ITEMS.filter((i) => i.label.toLowerCase().includes(s) || (i.hint || "").toLowerCase().includes(s))
  }, [q])

  useEffect(() => setHighlight(0), [q])

  const pick = (item: Item) => {
    setOpen(false)
    setQ("")
    router.push(item.href)
  }

  if (!open) return null

  const grouped = filtered.reduce<Record<string, Item[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Командна панель"
      className="fixed inset-0 z-[120] flex items-start justify-center bg-black/40 p-4 pt-[10vh]"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl border border-foreground/10 bg-card shadow-hover"
      >
        <div className="flex items-center gap-3 border-b border-foreground/5 px-5 py-4">
          <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Пошук розділів, дій… (⌘K)"
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded-md bg-foreground/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">ESC</kbd>
        </div>

        <div className="max-h-[60vh] overflow-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Нічого не знайдено</div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group} className="mb-2">
                <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {group}
                </div>
                {items.map((item) => {
                  const gIdx = filtered.indexOf(item)
                  const active = gIdx === highlight
                  return (
                    <button
                      key={item.id}
                      onMouseEnter={() => setHighlight(gIdx)}
                      onClick={() => pick(item)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                        active ? "bg-foreground text-background" : "hover:bg-foreground/5"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.hint && (
                          <span className={active ? "text-background/60 text-xs" : "text-muted-foreground text-xs"}>
                            — {item.hint}
                          </span>
                        )}
                      </span>
                      <ArrowRight size={14} className={active ? "" : "text-muted-foreground"} />
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-foreground/5 px-4 py-2.5 text-xs text-muted-foreground">
          <span>
            <kbd className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>{" "}
            навігація ·{" "}
            <kbd className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-[10px]">↵</kbd> вибір
          </span>
          <span>{filtered.length} результатів</span>
        </div>
      </div>
    </div>
  )
}
