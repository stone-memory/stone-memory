"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSupabase } from "@/lib/supabase/client"
import { authedFetch } from "@/lib/authed-fetch"

interface AuthGateProps {
  children: React.ReactNode
}

// A valid Supabase session is necessary but NOT sufficient — the user
// must also be an ACTIVE team member with a role (server resolves the
// owner-email override → super_admin too). Without this, any
// authenticated Supabase account (deactivated teammates, accounts made
// for other reasons) would reach the admin shell with empty pages and
// 403s. We show a clean "no access" screen instead.
type Access = "checking" | "ok" | "denied"

export function AuthGate({ children }: AuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [access, setAccess] = useState<Access>("checking")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(Boolean(data.session))
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setIsAuthenticated(Boolean(session))
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  // Once authenticated, verify active team membership via /api/auth/me.
  useEffect(() => {
    if (isAuthenticated !== true) {
      setAccess("checking")
      return
    }
    let cancelled = false
    setAccess("checking")
    authedFetch("/api/auth/me", { cache: "no-store" })
      .then(async (r) => {
        if (cancelled) return
        if (!r.ok) {
          setAccess("denied")
          return
        }
        const j = (await r.json()) as { role: string | null; active: boolean }
        setAccess(j.role && j.active ? "ok" : "denied")
      })
      .catch(() => {
        if (!cancelled) setAccess("denied")
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const handleSignOut = async () => {
    await getSupabase().auth.signOut()
    setIsAuthenticated(false)
    setAccess("checking")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const supabase = getSupabase()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (error) {
      setError(error.message)
      setPassword("")
      return
    }
    setIsAuthenticated(true)
  }

  if (isAuthenticated === null) return null

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="w-full max-w-md flex flex-col items-center gap-8 px-6">
          <div className="text-center">
            <div className="text-2xl font-semibold tracking-tight mb-2">Stone Memory</div>
            <h1 className="text-4xl font-semibold tracking-tight">Доступ до адмінки</h1>
          </div>
          <form onSubmit={handleSubmit} className="w-full space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base rounded-2xl"
              autoComplete="email"
              autoFocus
              required
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 text-base rounded-2xl"
              autoComplete="current-password"
              required
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-2xl text-base"
            >
              {submitting ? "Вхід…" : "Увійти"}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  if (access === "checking") return null

  if (access === "denied") {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="w-full max-w-md flex flex-col items-center gap-6 px-6 text-center">
          <div>
            <div className="text-2xl font-semibold tracking-tight mb-2">Stone Memory</div>
            <h1 className="text-3xl font-semibold tracking-tight">Немає доступу</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Цей акаунт не є активним членом команди. Зверніться до головного
            адміністратора, щоб вам надали доступ, або увійдіть під іншим акаунтом.
          </p>
          <Button onClick={handleSignOut} variant="outline" className="rounded-2xl">
            Вийти
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function SignOutButton() {
  const handle = async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
  }
  return (
    <button
      type="button"
      onClick={handle}
      className="text-xs text-muted-foreground hover:text-foreground"
    >
      Вийти
    </button>
  )
}
