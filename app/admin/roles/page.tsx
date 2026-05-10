"use client"

import { Button } from "@/components/ui/button"
import { Check, ShieldCheck, UserCog } from "lucide-react"
import {
  useAdminRoleStore,
  ALL_PERMISSIONS,
  MANAGER_DEFAULT_PERMISSIONS,
  type PermissionKey,
} from "@/lib/store/admin-role"
import { cn } from "@/lib/utils"

const LABELS: Record<PermissionKey, string> = {
  orders: "Замовлення",
  messages: "Повідомлення",
  chat: "Живий чат",
  chatSettings: "Налаштування чату",
  finances: "Фінанси",
  products: "Продукти (камінь)",
  projects: "Портфоліо проектів",
  reviews: "Відгуки",
  featured: "Популярне",
  blog: "Блог",
  about: "Сторінка «Про нас»",
  faq: "FAQ",
  services: "Послуги",
  analytics: "Аналітика",
  tasks: "Задачі",
  business: "Профіль бізнесу",
  settings: "Налаштування сайту",
}

export default function AdminRolesPage() {
  const role = useAdminRoleStore((s) => s.role)
  const perms = useAdminRoleStore((s) => s.managerPermissions)
  const setRole = useAdminRoleStore((s) => s.setRole)
  const toggle = useAdminRoleStore((s) => s.toggleManagerPermission)
  const setPerms = useAdminRoleStore((s) => s.setManagerPermissions)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight-custom">Ролі та доступ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Адмін бачить і редагує все. Для менеджерів вмикайте лише потрібні розділи.
        </p>
      </header>

      <section className="rounded-2xl border border-foreground/10 bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Активна роль
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <RoleCard
            active={role === "admin"}
            label="Адмін"
            desc="Повний доступ до всіх розділів CRM"
            icon={ShieldCheck}
            onClick={() => setRole("admin")}
          />
          <RoleCard
            active={role === "manager"}
            label="Менеджер"
            desc="Обмежений доступ — лише до дозволених розділів"
            icon={UserCog}
            onClick={() => setRole("manager")}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-foreground/10 bg-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Дозволи менеджера
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Клікніть щоб увімкнути/вимкнути розділ. Зміни діють коли активна роль «Менеджер».
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPerms([])} className="rounded-xl text-xs">
              Очистити всі
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPerms(MANAGER_DEFAULT_PERMISSIONS)}
              className="rounded-xl text-xs"
            >
              Стандартний набір
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPerms(ALL_PERMISSIONS.filter((p) => p !== "settings"))}
              className="rounded-xl text-xs"
            >
              Усі крім Налаштувань
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {ALL_PERMISSIONS.map((p) => {
            const on = perms.includes(p)
            const locked = p === "settings"
            return (
              <button
                key={p}
                onClick={() => !locked && toggle(p)}
                disabled={locked}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                  locked
                    ? "border-foreground/5 bg-foreground/[0.02] text-muted-foreground cursor-not-allowed"
                    : on
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/15 bg-background text-foreground hover:bg-foreground/5"
                )}
              >
                <span>{LABELS[p]}</span>
                {locked ? (
                  <span className="text-[10px] uppercase tracking-wide">адмін</span>
                ) : on ? (
                  <Check size={16} />
                ) : null}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function RoleCard({
  active,
  label,
  desc,
  icon: Icon,
  onClick,
}: {
  active: boolean
  label: string
  desc: string
  icon: typeof ShieldCheck
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-4 rounded-2xl border p-5 text-left transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-foreground/10 bg-background hover:bg-foreground/5"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          active ? "bg-background/10" : "bg-foreground/5"
        )}
      >
        <Icon size={20} />
      </div>
      <div>
        <div className="font-semibold">{label}</div>
        <div className={cn("mt-1 text-xs", active ? "text-background/70" : "text-muted-foreground")}>
          {desc}
        </div>
      </div>
    </button>
  )
}
