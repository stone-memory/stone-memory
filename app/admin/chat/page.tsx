"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Send, RefreshCw, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authedFetch } from "@/lib/authed-fetch"
import { getSupabase } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type Session = {
  sessionId: string
  name: string
  phone?: string
  locale: string
  lastUserAt: number
  operatorMessages: { id: string; text: string; at: number }[]
  userMessages: { id: string; text: string; at: number }[]
}

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const load = async () => {
    try {
      const r = await authedFetch("/api/chat/sessions", { cache: "no-store" })
      const d = (await r.json()) as { sessions?: Session[] }
      if (d.sessions) {
        setSessions(d.sessions)
        if (!activeId && d.sessions.length) setActiveId(d.sessions[0].sessionId)
      }
    } catch {
      /* ignore */
    }
  }

  // Initial load + safety-net poll every 60s (in case realtime reconnect missed something).
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null
    const start = () => {
      if (intervalId) return
      load()
      intervalId = setInterval(load, 60_000)
    }
    const stop = () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === "visible") start()
      else stop()
    }
    start()
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      stop()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime subscription — new chat messages and new sessions.
  useEffect(() => {
    const supabase = getSupabase()
    const channel = supabase
      .channel("admin-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload: { new: { id: number; session_id: string; from_role: string; text: string; created_at: string } }) => {
          const row = payload.new
          setSessions((prev) => {
            const idx = prev.findIndex((s) => s.sessionId === row.session_id)
            const entry = { id: String(row.id), text: row.text, at: new Date(row.created_at).getTime() }
            if (idx >= 0) {
              const s = prev[idx]
              const bucket = row.from_role === "user" ? s.userMessages : s.operatorMessages
              // Dedupe — reply() response + Realtime can race; skip if already there.
              if (bucket.some((m) => m.id === entry.id)) return prev
              const next = [...prev]
              const updated: Session = {
                ...s,
                userMessages: row.from_role === "user" ? [...s.userMessages, entry] : s.userMessages,
                operatorMessages: row.from_role === "operator" ? [...s.operatorMessages, entry] : s.operatorMessages,
                lastUserAt: row.from_role === "user" ? entry.at : s.lastUserAt,
              }
              next.splice(idx, 1)
              next.unshift(updated)
              return next
            }
            // Unknown session — trigger a full reload so we pick up the new session row too.
            load()
            return prev
          })
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_sessions" },
        () => load()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const active = useMemo(
    () => sessions.find((s) => s.sessionId === activeId) || null,
    [sessions, activeId]
  )

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [activeId, active?.operatorMessages.length])

  const reply = async () => {
    const text = draft.trim()
    if (!text || !activeId) return
    setSending(true)
    try {
      await authedFetch("/api/chat/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeId, text }),
      })
      setDraft("")
      // Realtime subscription picks up the new row and appends it to state;
      // no need to re-fetch here (would cause duplicates racing with realtime).
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Чат</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Повідомлення з сайту також приходять у Telegram. Можна відповісти звідси або з тг — дійде обидва.
          </p>
        </div>
        <Button variant="outline" onClick={load} className="rounded-xl gap-2">
          <RefreshCw size={16} />
          Оновити
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-foreground/10 bg-card p-2">
          {sessions.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Активних сесій немає
            </div>
          ) : (
            <ul className="space-y-1">
              {sessions.map((s) => (
                <li key={s.sessionId}>
                  <button
                    onClick={() => setActiveId(s.sessionId)}
                    className={cn(
                      "w-full rounded-xl px-3 py-2 text-left transition-colors",
                      activeId === s.sessionId
                        ? "bg-foreground/5"
                        : "hover:bg-foreground/5"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/5">
                        <User size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{s.name || "Гість"}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {s.locale} · {new Date(s.lastUserAt).toLocaleString("uk-UA", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="flex flex-col rounded-2xl border border-foreground/10 bg-card h-[70vh] min-h-[420px]">
          {!active ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Виберіть сесію ліворуч
            </div>
          ) : (
            <>
              <div className="border-b border-foreground/5 px-5 py-3">
                <div className="text-sm font-semibold">{active.name}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {active.phone && (
                    <a href={`tel:${active.phone.replace(/\s+/g, "")}`} className="text-accent hover:underline">
                      {active.phone}
                    </a>
                  )}
                  <span>· {active.locale}</span>
                  <span>· Session <code className="bg-foreground/5 px-1.5 py-0.5 rounded">{active.sessionId}</code></span>
                </div>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {(() => {
                  const timeline = [
                    ...active.userMessages.map((m) => ({ ...m, from: "user" as const })),
                    ...active.operatorMessages.map((m) => ({ ...m, from: "operator" as const })),
                  ].sort((a, b) => a.at - b.at)
                  if (timeline.length === 0) {
                    return (
                      <div className="text-xs text-muted-foreground text-center py-4">
                        Повідомлень поки немає.
                      </div>
                    )
                  }
                  return timeline.map((m) => (
                    <div key={m.id} className={cn("flex", m.from === "operator" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                          m.from === "operator"
                            ? "rounded-br-md bg-foreground text-background"
                            : "rounded-bl-md bg-foreground/5 text-foreground"
                        )}
                      >
                        {m.text}
                        <div className={cn("mt-1 text-[10px]", m.from === "operator" ? "text-background/60" : "text-muted-foreground")}>
                          {new Date(m.at).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  ))
                })()}
              </div>
              <div className="border-t border-foreground/5 p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    reply()
                  }}
                  className="flex items-end gap-2 rounded-2xl bg-foreground/[0.04] p-1.5 focus-within:ring-2 focus-within:ring-foreground/10"
                >
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        reply()
                      }
                    }}
                    placeholder="Відповідь клієнту…"
                    rows={1}
                    className="flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                    style={{ maxHeight: 120 }}
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-all disabled:opacity-40 active:scale-[0.95]"
                  >
                    <Send className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </form>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
