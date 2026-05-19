"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Inbox, LineChart, LogOut, Star, Package, MessageCircle, Info, BookOpen, Sparkles, Inbox as InboxIcon, Wallet, MessageSquare, Briefcase, HelpCircle, Wrench, CheckSquare, Building2, Send, Menu, X, UserCircle, Users, Bell, Handshake, Plug, LayoutGrid, Lock } from "lucide-react"
import { useOpenTasksCount } from "@/lib/store/tasks"
import { useNotificationCounts } from "@/lib/crm/notifications-store"
import { useCurrentRole, isSuperAdmin } from "@/lib/auth/use-current-role"
import type { TeamRole } from "@/lib/crm/types"
import type { Capability } from "@/lib/permissions/capabilities"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  icon: typeof Inbox
  label: string
  /** Capability required to SEE this link. Mirrors the server-side gate
   *  on the corresponding API route, so the menu never offers something
   *  the backend would reject. Omit + alwaysShow for member-universal
   *  pages (own tasks, own account). */
  cap?: Capability
  /** Visible to every active team member regardless of capabilities. */
  alwaysShow?: boolean
  section?: string
  /** When true, only super_admin sees the link as a real link. Other
   *  roles see it disabled with a Lock icon and a "owner-only" tooltip. */
  superAdminOnly?: boolean
}

const navItems: NavItem[] = [
  // === CRM-розділи ===
  { href: "/admin", icon: Inbox, label: "Дашборд (заявки)", cap: "deals.view_all", section: "CRM" },
  { href: "/admin/customers", icon: Users, label: "Клієнти", cap: "customers.view_all", section: "CRM" },
  { href: "/admin/deals", icon: Handshake, label: "Угоди", cap: "deals.view_all", section: "CRM" },
  { href: "/admin/reminders", icon: Bell, label: "Нагадування", cap: "deals.edit", section: "CRM" },
  { href: "/admin/inbox", icon: InboxIcon, label: "Inbox (всі канали)", cap: "customers.message", section: "CRM" },
  { href: "/admin/chat", icon: MessageCircle, label: "Лайв-чат сайту", cap: "customers.message", section: "CRM" },
  { href: "/admin/messages", icon: MessageSquare, label: "Повідомлення (legacy)", cap: "customers.message", section: "CRM" },
  { href: "/admin/broadcast", icon: Send, label: "Розсилка", cap: "content.editorial", section: "CRM" },
  { href: "/admin/tasks", icon: CheckSquare, label: "Особисті задачі", alwaysShow: true, section: "CRM" },
  { href: "/admin/finances", icon: Wallet, label: "Фінанси", cap: "finances.view_company", section: "CRM" },
  { href: "/admin/analytics", icon: LineChart, label: "Аналітика", cap: "finances.view_company", section: "CRM" },

  // === Контент сайту ===
  { href: "/admin/homepage", icon: LayoutGrid, label: "Головна сторінка", cap: "content.editorial", section: "Контент" },
  { href: "/admin/stones", icon: Package, label: "Товари (камінь)", cap: "content.catalog", section: "Контент" },
  { href: "/admin/services", icon: Wrench, label: "Послуги", cap: "content.catalog", section: "Контент" },
  { href: "/admin/projects", icon: Briefcase, label: "Проєкти", cap: "content.editorial", section: "Контент" },
  { href: "/admin/reviews", icon: MessageSquare, label: "Відгуки", cap: "content.editorial", section: "Контент" },
  { href: "/admin/featured", icon: Star, label: "Популярні", cap: "content.catalog", section: "Контент" },
  { href: "/admin/blog", icon: BookOpen, label: "Блог", cap: "content.editorial", section: "Контент" },
  { href: "/admin/faq", icon: HelpCircle, label: "FAQ", cap: "content.editorial", section: "Контент" },
  { href: "/admin/about", icon: Info, label: "Про нас", cap: "content.editorial", section: "Контент" },
  { href: "/admin/chat-settings", icon: Sparkles, label: "Налаштування чату", cap: "content.editorial", section: "Контент" },

  // === Налаштування ===
  { href: "/admin/integrations", icon: Plug, label: "Інтеграції каналів", cap: "integrations.manage", section: "Налаштування", superAdminOnly: true },
  { href: "/admin/team", icon: Users, label: "Команда і ролі", cap: "team.manage", section: "Налаштування" },
  { href: "/admin/business", icon: Building2, label: "Бізнес-профіль", cap: "team.manage", section: "Налаштування" },
  // /admin/roles — legacy local-only permission toggle, replaced by /admin/team.
  // Page still exists for backward compat but hidden from sidebar.
  { href: "/admin/account", icon: UserCircle, label: "Акаунт", alwaysShow: true, section: "Налаштування" },
]

const ROLE_LABEL_UK: Record<TeamRole, string> = {
  super_admin: "Головний адмін",
  admin: "Адмін",
  manager: "Менеджер",
  master: "Майстер",
  sales: "Продажі",
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { role: realRole, capabilities, loading: roleLoading } = useCurrentRole()
  const currentlySuperAdmin = isSuperAdmin(realRole)
  const roleLabel = realRole ? ROLE_LABEL_UK[realRole] : "—"
  const openTasks = useOpenTasksCount()
  // Real-time лічильники сповіщень для бейджів. Хук сам поллить /api/crm/notifications/counts
  // кожні 30 с і авто-зануляє лічильник коли admin відвідав відповідний розділ.
  const counts = useNotificationCounts(pathname || undefined)
  const totalUnread = counts.inbox + counts.reminders + counts.orders + counts.deals + counts.chat

  // Capability-driven visibility — mirrors the server-side API gates so
  // the menu never offers a section the backend would 403. super_admin
  // resolves to the full capability set, so it sees everything.
  const visible = roleLoading
    ? []
    : navItems.filter((item) => {
        if (item.alwaysShow) return true
        if (!item.cap) return false
        return capabilities.includes(item.cap)
      })

  const handleSignOut = async () => {
    const { getSupabase } = await import("@/lib/supabase/client")
    await getSupabase().auth.signOut()
    window.location.href = "/admin"
  }

  const [mobileOpen, setMobileOpen] = useState(false)

  // Close drawer when route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Lock scroll while drawer is open on mobile
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  return (
    <>
      {/* Mobile-only top bar with burger */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between bg-white border-b border-black/5 px-4 h-14">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Відкрити меню"
          className="relative p-2 -ml-2 rounded-lg hover:bg-black/5"
        >
          <Menu size={20} />
          {totalUnread > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </button>
        <div className="text-sm font-medium">Stone Memory · Адмін</div>
        <div className="w-9" />
      </header>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 w-64 h-screen bg-white border-r border-black/5 flex flex-col transition-transform duration-200",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
      {/* Top section */}
      <div className="p-6 border-b border-black/5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="text-sm font-medium">Stone Memory</div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Закрити меню"
            className="md:hidden p-1 rounded-lg hover:bg-black/5"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest bg-black/5 px-2 py-0.5 rounded text-muted-foreground">
            {roleLoading ? "…" : roleLabel}
            {totalUnread > 0 && (
              <span
                className="rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-foreground"
                title={`${totalUnread} непрочитаних`}
              >
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </div>
          <kbd className="rounded-md bg-black/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground" title="Відкрити пошук">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Navigation — згруповано по секціях */}
      <nav className="flex-1 px-3 py-6 space-y-4 overflow-y-auto">
        {(() => {
          const sections: { name: string; items: NavItem[] }[] = []
          for (const item of visible) {
            const sec = item.section || "CRM"
            const last = sections[sections.length - 1]
            if (last && last.name === sec) last.items.push(item)
            else sections.push({ name: sec, items: [item] })
          }
          return sections.map((sec) => (
            <div key={sec.name} className="space-y-1">
              <div className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                {sec.name}
              </div>
              {sec.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))
                const Icon = item.icon

                // Бейдж: визначаємо лічильник за href.
                let badge = 0
                let badgeColor = "bg-foreground text-background"
                if (item.href === "/admin/tasks") badge = openTasks
                else if (item.href === "/admin/inbox") { badge = counts.inbox; badgeColor = "bg-accent text-accent-foreground" }
                else if (item.href === "/admin/reminders") { badge = counts.reminders; badgeColor = "bg-red-500 text-white" }
                else if (item.href === "/admin") { badge = counts.orders; badgeColor = "bg-accent text-accent-foreground" }
                else if (item.href === "/admin/deals") { badge = counts.deals; badgeColor = "bg-accent text-accent-foreground" }
                else if (item.href === "/admin/chat") { badge = counts.chat; badgeColor = "bg-accent text-accent-foreground" }

                // super_admin-only items render as a disabled row with a
                // Lock icon for non-super-admins. Tooltip explains why.
                // The page itself ALSO guards (defense in depth) — hiding
                // the link is just a UX cue.
                const lockedForUser = item.superAdminOnly === true && !currentlySuperAdmin
                if (lockedForUser) {
                  return (
                    <button
                      key={item.href}
                      type="button"
                      disabled
                      title="Доступ лише для головного адміністратора"
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-muted-foreground/60 cursor-not-allowed"
                    >
                      <Icon size={16} />
                      <span className="flex-1 text-left">{item.label}</span>
                      <Lock size={12} className="opacity-70" />
                    </button>
                  )
                }
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                        isActive
                          ? "bg-black/5 text-foreground"
                          : "text-muted-foreground hover:bg-black/[0.03] hover:text-foreground"
                      }`}
                    >
                      <Icon size={16} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {badge > 0 && !isActive && (
                        <span className={`rounded-full px-1.5 text-[10px] font-semibold tabular-nums min-w-[18px] text-center ${badgeColor}`}>
                          {badge > 99 ? "99+" : badge}
                        </span>
                      )}
                    </button>
                  </Link>
                )
              })}
            </div>
          ))
        })()}
      </nav>

      {/* Bottom section */}
      <div className="p-6 border-t border-black/5 space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-xs font-semibold">
            SM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{roleLoading ? "Завантаження…" : roleLabel}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {currentlySuperAdmin ? "Повний доступ" : `${capabilities.length} дозволів`}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
        >
          <LogOut size={16} />
          <span>Вийти</span>
        </Button>
      </div>
    </aside>
    </>
  )
}
