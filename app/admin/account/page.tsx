"use client"

import { useEffect, useState } from "react"
import { Lock, Check, AlertCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSupabase } from "@/lib/supabase/client"

export default function AdminAccountPage() {
  const [email, setEmail] = useState<string>("")

  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = getSupabase()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email)
    })
  }, [])

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (newPassword.length < 8) {
      setError("Пароль має бути щонайменше 8 символів")
      return
    }
    if (newPassword !== confirm) {
      setError("Паролі не збігаються")
      return
    }

    setSubmitting(true)
    try {
      const supabase = getSupabase()
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword })
      if (updateErr) {
        setError(updateErr.message)
        return
      }
      setSuccess(true)
      setNewPassword("")
      setConfirm("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не вдалось змінити пароль")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight-custom">Акаунт</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Дані для входу в CRM.
        </p>
      </header>

      {/* Email (read-only) */}
      <section className="rounded-2xl border border-foreground/10 bg-card p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          <Mail size={14} /> Email
        </div>
        <div className="font-mono text-sm text-foreground break-all">{email || "—"}</div>
        <p className="mt-2 text-xs text-muted-foreground">
          Щоб змінити email — потрібно оновити його в Supabase (Auth → Users) і перелогінитись.
        </p>
      </section>

      {/* Change password */}
      <section className="rounded-2xl border border-foreground/10 bg-card p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          <Lock size={14} /> Пароль
        </div>

        <form onSubmit={changePassword} className="space-y-3">
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

            {success && (
              <span className="inline-flex items-center gap-1.5 text-sm text-success">
                <Check size={16} />
                Пароль оновлено
              </span>
            )}
            {error && (
              <span className="inline-flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle size={16} />
                {error}
              </span>
            )}
          </div>
        </form>

        <p className="mt-4 text-xs text-muted-foreground">
          Після зміни пароля ваші активні сесії лишаються живими. Якщо забули пароль — використайте пароль-reset через email у формі входу (кнопка "Forgot password" у Supabase hosted UI), або оновіть його через Supabase Dashboard.
        </p>
      </section>
    </div>
  )
}
