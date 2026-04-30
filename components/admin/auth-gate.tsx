"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSupabase } from "@/lib/supabase/client"

interface AuthGateProps {
  children: React.ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
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
            <h1 className="text-4xl font-semibold tracking-tight">Admin Access</h1>
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
              placeholder="Password"
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
              {submitting ? "Signing in…" : "Sign In"}
            </Button>
          </form>
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
      Sign out
    </button>
  )
}
