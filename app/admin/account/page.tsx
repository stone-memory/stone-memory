"use client"

import { useEffect, useState } from "react"
import { Lock, Check, AlertCircle, Mail, Crown, ShieldOff, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authedFetch } from "@/lib/authed-fetch"
import { useCurrentRole, isSuperAdmin } from "@/lib/auth/use-current-role"

/**
 * Account page. Splits into two flows based on role:
 *
 * - super_admin → full UI: change own password & email through our
 *   server endpoints (which use admin SDK). Defense in depth: a Postgres
 *   trigger blocks any non-super-admin from updating auth.users
 *   credentials directly even if they bypass this UI.
 *
 * - everyone else → read-only email + display-name editor + a clear
 *   "ask the owner" panel with mailto. We deliberately don't render
 *   the password form for them; the password endpoint also returns
 *   403 to anything that bypasses the UI.
 */
export default function AdminAccountPage() {
  const { role, email, loading } = useCurrentRole()
  const superAdmin = isSuperAdmin(role)

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight-custom">Акаунт</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Дані для входу в CRM та персональний профіль.
        </p>
        {!loading && (
          <RoleBanner role={role} />
        )}
      </header>

      {loading ? (
        <div className="rounded-2xl border border-foreground/10 bg-card p-6 text-sm text-muted-foreground">
          Завантаження…
        </div>
      ) : superAdmin ? (
        <>
          <SuperAdminEmailSection currentEmail={email || ""} />
          <SuperAdminPasswordSection />
        </>
      ) : (
        <>
          <ReadOnlyEmailSection email={email || ""} />
          <ContactOwnerSection />
          <ProfileBasicsSection />
        </>
      )}
    </div>
  )
}

// ----------------------------------------------------------------
// Banner that shows what the current user is and what they can do.
// ----------------------------------------------------------------
function RoleBanner({ role }: { role: ReturnType<typeof useCurrentRole>["role"] }) {
  if (!role) {
    return (
      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-foreground/5 px-3 py-1 text-xs text-muted-foreground">
        <ShieldOff size={12} /> Без ролі в команді
      </div>
    )
  }
  if (role === "super_admin") {
    return (
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
        <Crown size={12} /> Головний адмін
      </div>
    )
  }
  const label =
    role === "admin"
      ? "Адмін"
      : role === "manager"
        ? "Менеджер"
        : role === "master"
          ? "Майстер"
          : "Продажі"
  return (
    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-foreground/5 px-3 py-1 text-xs text-muted-foreground">
      Роль: <span className="font-medium text-foreground">{label}</span>
    </div>
  )
}

// ================================================================
// SUPER_ADMIN flows
// ================================================================
function SuperAdminEmailSection({ currentEmail }: { currentEmail: string }) {
  const [newEmail, setNewEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setStatus("idle")
    setErrorMsg(null)
    try {
      const r = await authedFetch("/api/auth/update-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      })
      const j = await r.json()
      if (!r.ok) {
        setStatus("error")
        setErrorMsg(j.error || "Помилка")
        return
      }
      setStatus("ok")
      setNewEmail("")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-foreground/10 bg-card p-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        <Mail size={14} /> Email
      </div>
      <div className="font-mono text-sm break-all">{currentEmail || "—"}</div>

      <form onSubmit={submit} className="mt-4 space-y-2">
        <label className="block text-xs font-medium text-muted-foreground">
          Новий email
        </label>
        <div className="flex gap-2">
          <Input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="new@example.com"
            className="h-10 rounded-xl"
          />
          <Button
            type="submit"
            disabled={submitting || !newEmail.trim()}
            className="rounded-xl gap-2"
          >
            {submitting ? "Зберігаю…" : "Змінити"}
          </Button>
        </div>
        {status === "ok" && (
          <p className="inline-flex items-center gap-1.5 text-sm text-success">
            <Check size={14} /> Запит відправлено. Перевірте новий email — там лист підтвердження.
          </p>
        )}
        {status === "error" && (
          <p className="inline-flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle size={14} /> {errorMsg}
          </p>
        )}
      </form>
      <p className="mt-3 text-xs text-muted-foreground">
        Після зміни email Supabase надішле на нову адресу лист підтвердження. Поточна сесія залишається активною.
      </p>
    </section>
  )
}

function SuperAdminPasswordSection() {
  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("idle")
    setErrorMsg(null)

    if (newPassword.length < 8) {
      setStatus("error")
      setErrorMsg("Пароль має бути щонайменше 8 символів")
      return
    }
    if (newPassword !== confirm) {
      setStatus("error")
      setErrorMsg("Паролі не збігаються")
      return
    }

    setSubmitting(true)
    try {
      const r = await authedFetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })
      const j = await r.json()
      if (!r.ok) {
        setStatus("error")
        setErrorMsg(j.error || "Помилка")
        return
      }
      setStatus("ok")
      setNewPassword("")
      setConfirm("")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-foreground/10 bg-card p-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        <Lock size={14} /> Пароль
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Новий пароль</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Мінімум 8 символів"
            autoComplete="new-password"
            className="h-11 rounded-xl"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Підтвердіть новий пароль</label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            className="h-11 rounded-xl"
            required
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={submitting} className="rounded-xl gap-2">
            <Lock size={16} />
            {submitting ? "Зберігаю…" : "Змінити пароль"}
          </Button>
          {status === "ok" && (
            <span className="inline-flex items-center gap-1.5 text-sm text-success">
              <Check size={16} /> Пароль оновлено
            </span>
          )}
          {status === "error" && (
            <span className="inline-flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle size={16} /> {errorMsg}
            </span>
          )}
        </div>
      </form>
      <p className="mt-4 text-xs text-muted-foreground">
        Після зміни пароля активні сесії лишаються живими. Якщо забули — використайте пароль-reset через email у формі входу.
      </p>
    </section>
  )
}

// ================================================================
// NON-SUPER_ADMIN flows
// ================================================================
function ReadOnlyEmailSection({ email }: { email: string }) {
  return (
    <section className="rounded-2xl border border-foreground/10 bg-card p-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        <Mail size={14} /> Email
      </div>
      <div className="font-mono text-sm break-all">{email || "—"}</div>
      <p className="mt-3 text-xs text-muted-foreground">
        Email і пароль може змінити лише головний адміністратор. Зверніться нижче ↓
      </p>
    </section>
  )
}

function ContactOwnerSection() {
  const ownerEmail = "sttonememory@gmail.com"
  const subject = encodeURIComponent("[CRM] Запит на зміну даних акаунта")
  return (
    <section className="rounded-2xl border border-amber-300/40 bg-amber-50/60 p-6 dark:bg-amber-900/10">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">
        <Crown size={14} /> Зміна email або пароля
      </div>
      <h2 className="text-lg font-semibold tracking-tight-custom">
        Дані акаунта змінює лише головний адмін
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Це запобіжник: щоб ніхто не зміг випадково чи навмисно перехопити доступ. Якщо потрібно змінити email або пароль — напишіть власнику.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild className="rounded-xl gap-2">
          <a href={`mailto:${ownerEmail}?subject=${subject}`}>
            <Send size={14} /> Зв'язатись з адміном
          </a>
        </Button>
        <span className="inline-flex items-center text-xs text-muted-foreground">
          або напишіть на <code className="ml-1 font-mono">{ownerEmail}</code>
        </span>
      </div>
    </section>
  )
}

/**
 * Profile basics every team member CAN edit on their own — display
 * name today, more later (avatar, locale, notification prefs). Updates
 * go to team_members via /api/crm/team/me which we already have a
 * pattern for via /api/crm/team/[id] PATCH.
 */
function ProfileBasicsSection() {
  const [displayName, setDisplayName] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")

  useEffect(() => {
    authedFetch("/api/auth/me", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) {
          setLoaded(true)
          return
        }
        // /api/auth/me only returns role/email; pull display_name from
        // team_members via a sibling fetch.
        const me = await r.json()
        const tm = await authedFetch(`/api/crm/team/me`, { cache: "no-store" })
        if (tm.ok) {
          const j = await tm.json()
          setDisplayName(j.display_name || "")
          setPhone(j.phone || "")
        } else {
          // Fallback: split email user part
          if (me.email) setDisplayName(me.email.split("@")[0])
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  const save = async () => {
    setSaving(true)
    setStatus("idle")
    try {
      const r = await authedFetch(`/api/crm/team/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName, phone }),
      })
      setStatus(r.ok ? "ok" : "error")
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) return null

  return (
    <section className="rounded-2xl border border-foreground/10 bg-card p-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        <User size={14} /> Особистий профіль
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Це можна змінювати самостійно — впливає лише на те, як ваше ім'я і телефон показуються колегам.
      </p>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Ім'я для відображення
          </label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Як вас бачать колеги"
            className="h-11 rounded-xl"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Телефон
          </label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+380…"
            className="h-11 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={save} disabled={saving} className="rounded-xl gap-2">
            {saving ? "Зберігаю…" : "Зберегти"}
          </Button>
          {status === "ok" && (
            <span className="inline-flex items-center gap-1.5 text-sm text-success">
              <Check size={14} /> Збережено
            </span>
          )}
          {status === "error" && (
            <span className="inline-flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle size={14} /> Не вдалось зберегти
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
