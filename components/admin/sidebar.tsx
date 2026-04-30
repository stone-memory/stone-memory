"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Inbox, LineChart, LogOut, Star, Package, MessageCircle, Info, BookOpen, Sparkles, Inbox as InboxIcon, Wallet, MessageSquare, Briefcase, HelpCircle, Wrench, ShieldCheck, CheckSquare, Building2, Send, Menu, X, UserCircle } from "lucide-react"
import { useAdminRoleStore, type PermissionKey } from "@/lib/store/admin-role"
import { useOpenTasksCount } from "@/lib/store/tasks"
import { cn } from "@/lib/utils"

type NavItem = { href: string; icon: typeof Inbox; label: string; perm: PermissionKey }

const navItems: NavItem[] = [
  { href: "/admin", icon: Inbox, label: "Orders", perm: "orders" },
  { href: "/admin/messages", icon: InboxIcon, label: "Messages", perm: "messages" },
  { href: "/admin/broadcast", icon: Send, label: "Broadcast", perm: "messages" },
  { href: "/admin/chat", icon: MessageCircle, label: "Live chat", perm: "chat" },
  { href: "/admin/chat-settings", icon: Sparkles, label: "Chat settings", perm: "chatSettings" },
  { href: "/admin/finances", icon: Wallet, label: "Finances", perm: "finances" },
  { href: "/admin/stones", icon: Package, label: "Products", perm: "products" },
  { href: "/admin/services", icon: Wrench, label: "Services", perm: "services" },
  { href: "/admin/projects", icon: Briefcase, label: "Projects", perm: "projects" },
  { href: "/admin/reviews", icon: MessageSquare, label: "Reviews", perm: "reviews" },
  { href: "/admin/featured", icon: Star, label: "Popular", perm: "featured" },
  { href: "/admin/blog", icon: BookOpen, label: "Blog", perm: "blog" },
  { href: "/admin/faq", icon: HelpCircle, label: "FAQ", perm: "faq" },
  { href: "/admin/about", icon: Info, label: "About page", perm: "about" },
  { href: "/admin/tasks", icon: CheckSquare, label: "Tasks", perm: "tasks" },
  { href: "/admin/analytics", icon: LineChart, label: "Analytics", perm: "analytics" },
  { href: "/admin/business", icon: Building2, label: "Business profile", perm: "business" },
  { href: "/admin/roles", icon: ShieldCheck, label: "Roles & access", perm: "settings" },
  { href: "/admin/account", icon: UserCircle, label: "Account", perm: "settings" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const role = useAdminRoleStore((s) => s.role)
  const managerPerms = useAdminRoleStore((s) => s.managerPermissions)
  const hasHydrated = useAdminRoleStore((s) => s.hasHydrated)
  const openTasks = useOpenTasksCount()

  const visible = navItems.filter((item) => {
    if (!hasHydrated) return true
    if (role === "admin") return true
    if (item.perm === "settings") return false
    return managerPerms.includes(item.perm)
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
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between bg-white border-b border-black/5 px-4 h-14">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 -ml-2 rounded-lg hover:bg-black/5"
        >
          <Menu size={20} />
        </button>
        <div className="text-sm font-medium">Stone Memory · Admin</div>
        <div className="w-9" />
      </header>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 w-64 h-screen bg-white border-r border-black/5 flex flex-col transition-transform duration-200",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
      {/* Top section */}
      <div className="p-6 border-b border-black/5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="text-sm font-medium">Stone Memory</div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="lg:hidden p-1 rounded-lg hover:bg-black/5"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="inline-block text-xs uppercase tracking-widest bg-black/5 px-2 py-0.5 rounded text-muted-foreground">
            Admin
          </div>
          <kbd className="rounded-md bg-black/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground" title="Відкрити пошук">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {visible.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-black/5 text-foreground"
                    : "text-muted-foreground hover:bg-black/[0.03] hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.perm === "tasks" && openTasks > 0 && (
                  <span className="rounded-full bg-foreground px-1.5 text-[10px] font-semibold text-background tabular-nums">
                    {openTasks}
                  </span>
                )}
              </button>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-6 border-t border-black/5 space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-xs font-semibold">
            SM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate capitalize">{role}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {role === "admin" ? "Повний доступ" : `${managerPerms.length} дозволів`}
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
          <span>Sign out</span>
        </Button>
      </div>
    </aside>
    </>
  )
}
