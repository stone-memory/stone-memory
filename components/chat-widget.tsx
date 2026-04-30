"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircle, X, Send, CheckCheck, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useChatStore } from "@/lib/store/chat"
import { useChatSettings, tryMatchFaq } from "@/lib/store/chat-settings"
import { useTranslation } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import {
  botCopy,
  capitalizeName,
  extractPhone,
  formatPhone,
  looksLikeName,
} from "@/lib/chat-bot"

// Visitor-side is anonymous (no Supabase auth), so Realtime subscriptions
// are blocked by RLS. We fall back to polling. 10s is a reasonable trade-off
// between perceived latency and server load.
const POLL_INTERVAL_MS = 10000

const uiLabels = {
  uk: { title: "Stone Memory", subtitle: "Онлайн — менеджер зараз поруч", placeholder: "Напишіть повідомлення…", sendLabel: "Надіслати", retry: "Надіслати ще раз", quick: "Часті питання" },
  pl: { title: "Stone Memory", subtitle: "Online — menedżer jest w pobliżu", placeholder: "Napisz wiadomość…", sendLabel: "Wyślij", retry: "Wyślij ponownie", quick: "Częste pytania" },
  en: { title: "Stone Memory", subtitle: "Online — a manager is available", placeholder: "Type a message…", sendLabel: "Send", retry: "Send again", quick: "Quick questions" },
  de: { title: "Stone Memory", subtitle: "Online — Manager verfügbar", placeholder: "Nachricht schreiben…", sendLabel: "Senden", retry: "Erneut senden", quick: "Häufige Fragen" },
  lt: { title: "Stone Memory", subtitle: "Prisijungę — vadybininkas pasiekiamas", placeholder: "Rašykite žinutę…", sendLabel: "Siųsti", retry: "Siųsti dar kartą", quick: "Dažni klausimai" },
} as const

export function ChatWidget() {
  const { locale } = useTranslation()
  const U = uiLabels[locale]
  const B = botCopy[locale]
  const { quickReplies, fallback } = useChatSettings(locale)
  const isOpen = useChatStore((s) => s.isOpen)
  const hasHydrated = useChatStore((s) => s.hasHydrated)
  const sessionId = useChatStore((s) => s.sessionId)
  const userName = useChatStore((s) => s.userName)
  const userPhone = useChatStore((s) => s.userPhone)
  const stage = useChatStore((s) => s.stage)
  const setUserName = useChatStore((s) => s.setUserName)
  const setUserPhone = useChatStore((s) => s.setUserPhone)
  const setStage = useChatStore((s) => s.setStage)
  const messages = useChatStore((s) => s.messages)
  const fallbackSent = useChatStore((s) => s.fallbackSent)
  const addMessage = useChatStore((s) => s.addMessage)
  const markSent = useChatStore((s) => s.markSent)
  const markFailed = useChatStore((s) => s.markFailed)
  const markFallbackSent = useChatStore((s) => s.markFallbackSent)
  const openChat = useChatStore((s) => s.open)
  const closeChat = useChatStore((s) => s.close)
  const [draft, setDraft] = useState("")
  const [mounted, setMounted] = useState(false)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const greetedRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Greet once per session — wait for hydrate so we don't re-greet after reload.
  useEffect(() => {
    if (!isOpen || !hasHydrated) return
    if (messages.length === 0 && !greetedRef.current) {
      greetedRef.current = true
      addMessage({ role: "operator", text: B.askName })
    }
  }, [isOpen, hasHydrated, messages.length, addMessage, B.askName])

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [isOpen, messages.length])

  // Poll operator replies only in "ready" stage. Pauses automatically when
  // the tab is hidden (Page Visibility API) so we don't spam the server.
  useEffect(() => {
    if (!isOpen || !hasHydrated || !sessionId || stage !== "ready") return
    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | null = null
    const seen = new Set(messages.filter((m) => m.role === "operator").map((m) => m.id))

    async function poll() {
      if (document.visibilityState !== "visible") return
      try {
        const r = await fetch(`/api/chat?session=${encodeURIComponent(sessionId!)}`, { cache: "no-store" })
        if (!r.ok) return
        const data = (await r.json()) as { messages?: { id: string; text: string; at: number }[] }
        if (cancelled || !data.messages) return
        for (const m of data.messages) {
          if (seen.has(m.id)) continue
          seen.add(m.id)
          addMessage({ id: m.id, at: m.at, role: "operator", text: m.text })
        }
      } catch {
        /* ignore */
      }
    }
    const start = () => {
      if (intervalId) return
      poll()
      intervalId = setInterval(poll, POLL_INTERVAL_MS)
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
      cancelled = true
      stop()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [isOpen, hasHydrated, sessionId, messages, addMessage, stage])

  const relayToManager = async (text: string, extra?: { name?: string; phone?: string }) => {
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          name: extra?.name || userName || "Гість",
          phone: extra?.phone || userPhone || "",
          text,
          locale,
        }),
      })
      return true
    } catch {
      return false
    }
  }

  const handleSend = async (textOverride?: string) => {
    if (sending) return
    const text = (textOverride ?? draft).trim()
    if (!text) return
    setDraft("")
    setSending(true)
    try {
      // Stage 1: capture name
      if (stage === "need-name") {
        addMessage({ role: "user", text })
        if (looksLikeName(text)) {
          const name = capitalizeName(text)
          setUserName(name)
          setStage("need-phone")
          await new Promise((r) => setTimeout(r, 300))
          addMessage({ role: "operator", text: B.welcomeName(name) })
          await new Promise((r) => setTimeout(r, 250))
          addMessage({ role: "operator", text: B.askPhone })
        } else {
          await new Promise((r) => setTimeout(r, 250))
          addMessage({ role: "operator", text: B.askName })
        }
        return
      }

      // Stage 2: capture phone
      if (stage === "need-phone") {
        addMessage({ role: "user", text })
        const digits = extractPhone(text)
        if (!digits) {
          await new Promise((r) => setTimeout(r, 250))
          addMessage({ role: "operator", text: B.phoneInvalid })
          return
        }
        const formatted = formatPhone(digits)
        setUserPhone(formatted)
        setStage("ready")
        const msg = addMessage({ role: "user", text: `📞 ${formatted}`, pending: true })
        const ok = await relayToManager(`📞 ${formatted}\n👤 ${userName}`, { name: userName, phone: formatted })
        if (ok) markSent(msg.id); else markFailed(msg.id)
        await new Promise((r) => setTimeout(r, 250))
        addMessage({ role: "operator", text: B.phoneSaved })
        return
      }

      // Stage 3: normal chat — try FAQ; show manager-notified fallback once per session.
      const userMsg = addMessage({ role: "user", text, pending: true })
      const faq = tryMatchFaq(locale, text)
      const ok = await relayToManager(text)
      if (ok) markSent(userMsg.id); else markFailed(userMsg.id)
      await new Promise((r) => setTimeout(r, 350))
      if (faq) {
        addMessage({ role: "operator", text: faq })
      } else if (!fallbackSent) {
        addMessage({ role: "operator", text: fallback })
        markFallbackSent()
      }
      // If no FAQ match and fallback was already sent — stay silent; real manager
      // will reply via CRM or Telegram.
    } finally {
      setSending(false)
    }
  }

  const handleQuickReply = async (qr: { label: string; answer: string }) => {
    if (sending) return
    setSending(true)
    try {
      addMessage({ role: "user", text: qr.label })
      await relayToManager(qr.label)
      await new Promise((r) => setTimeout(r, 300))
      addMessage({ role: "operator", text: qr.answer })
    } finally {
      setSending(false)
    }
  }

  const retry = async (id: string, text: string) => {
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, name: userName, phone: userPhone, text, locale }),
      })
      if (!r.ok) throw new Error("failed")
      markSent(id)
    } catch {
      markFailed(id)
    }
  }

  const showQuickReplies = stage === "ready" && !sending

  return (
    <>
      <button
        type="button"
        onClick={openChat}
        aria-label={U.title}
        className={cn(
          "fixed bottom-5 right-5 z-40 hidden md:inline-flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-hover transition-transform hover:-translate-y-0.5 active:scale-[0.97]",
          isOpen && "opacity-0 pointer-events-none"
        )}
      >
        <MessageCircle className="h-6 w-6" strokeWidth={1.75} />
      </button>

      <AnimatePresence>
        {mounted && isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeChat}
              className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm md:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-[70] flex flex-col overflow-hidden border border-foreground/10 bg-card shadow-hover inset-x-3 bottom-[88px] top-16 rounded-2xl md:inset-auto md:bottom-5 md:right-5 md:top-auto md:h-[580px] md:w-[400px] md:rounded-3xl"
            >
              <div className="flex items-center justify-between border-b border-foreground/5 bg-card px-5 py-4">
                <div>
                  <div className="text-[15px] font-semibold">{U.title}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
                    {U.subtitle}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeChat}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {messages.map((m) => (
                  <Bubble
                    key={m.id}
                    role={m.role}
                    pending={m.pending}
                    failed={m.failed}
                    onRetry={() => retry(m.id, m.text)}
                    retryLabel={U.retry}
                  >
                    {m.text}
                  </Bubble>
                ))}
              </div>

              {showQuickReplies && quickReplies.length > 0 && (
                <div className="border-t border-foreground/5 bg-foreground/[0.02] px-3 py-2">
                  <div className="flex flex-wrap gap-1.5">
                    {quickReplies.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleQuickReply(q)}
                        className="rounded-full border border-foreground/15 bg-card px-3 py-1.5 text-[12px] font-medium text-foreground/85 hover:border-foreground/30 hover:text-foreground transition-colors"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-foreground/5 bg-card px-3 pb-3 pt-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex items-end gap-2 rounded-2xl bg-foreground/[0.04] p-1.5 focus-within:ring-2 focus-within:ring-foreground/10"
                >
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder={U.placeholder}
                    rows={1}
                    className="flex-1 resize-none bg-transparent px-3 py-2 text-[14px] outline-none placeholder:text-muted-foreground"
                    style={{ maxHeight: 100 }}
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    aria-label={U.sendLabel}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-all disabled:opacity-40 active:scale-[0.95]"
                  >
                    <Send className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function Bubble({
  role,
  children,
  pending,
  failed,
  onRetry,
  retryLabel,
}: {
  role: "user" | "operator"
  children: React.ReactNode
  pending?: boolean
  failed?: boolean
  onRetry?: () => void
  retryLabel?: string
}) {
  const isUser = role === "user"
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className="max-w-[82%] space-y-1">
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed whitespace-pre-wrap",
            isUser
              ? "rounded-br-md bg-foreground text-background"
              : "rounded-bl-md bg-foreground/5 text-foreground"
          )}
        >
          {children}
        </div>
        {isUser && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            {pending ? (
              <span className="text-muted-foreground/80">…</span>
            ) : failed ? (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1 text-destructive hover:underline"
              >
                <AlertCircle className="h-3 w-3" strokeWidth={2} />
                {retryLabel}
              </button>
            ) : (
              <CheckCheck className="h-3 w-3 text-success" strokeWidth={2.25} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
