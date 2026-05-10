"use client"

import { useEffect, useState } from "react"
import {
  Check,
  X,
  ArrowDown,
  ArrowUp,
  Copy,
  ExternalLink,
  MessageCircle,
  Send,
  Mail,
  Phone,
  AlertCircle,
  Lock,
  Crown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { authedFetch } from "@/lib/authed-fetch"
import { useCurrentRole, isSuperAdmin } from "@/lib/auth/use-current-role"

type Integration = {
  id: string
  name: string
  configured: boolean
  webhookUrl: string | null
  envVars: { key: string; set: boolean }[]
  canSend: boolean
  canReceive: boolean
}

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  site_chat: MessageCircle,
  telegram: Send,
  whatsapp: MessageCircle,
  instagram: MessageCircle,
  email: Mail,
  sms: Phone,
}

const COLORS: Record<string, string> = {
  site_chat: "bg-foreground/10 text-foreground",
  telegram: "bg-[#229ED9]/10 text-[#229ED9]",
  whatsapp: "bg-[#25D366]/10 text-[#25D366]",
  instagram: "bg-gradient-to-br from-[#E1306C]/20 to-[#F77737]/20 text-[#E1306C]",
  email: "bg-amber-500/10 text-amber-700",
  sms: "bg-purple-500/10 text-purple-700",
}

const SETUP_GUIDES: Record<string, { steps: string[]; docsUrl: string }> = {
  telegram: {
    docsUrl: "https://core.telegram.org/bots/api",
    steps: [
      "Створи бота через @BotFather: команда /newbot, отримаєш TELEGRAM_BOT_TOKEN.",
      "Створи групу для менеджерів, додай туди бота, напиши будь-що — отримаєш TELEGRAM_ADMIN_CHAT_ID через https://api.telegram.org/bot<TOKEN>/getUpdates (chat.id, від'ємне число для груп).",
      "Згенеруй секрет: openssl rand -hex 32 → TELEGRAM_WEBHOOK_SECRET.",
      "Зареєструй webhook: curl 'https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://stonememory.com.ua/api/telegram&secret_token=<WEBHOOK_SECRET>'",
      "Додай 3 ENV у Vercel і redeploy.",
    ],
  },
  whatsapp: {
    docsUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started",
    steps: [
      "Створи Meta App: https://developers.facebook.com/apps → Business → Create.",
      "Додай продукт WhatsApp → Set up.",
      "У Configuration отримай Phone number ID + System User Permanent Access Token.",
      "Налаштуй Webhook: URL = https://stonememory.com.ua/api/whatsapp/webhook, Verify token = твій WHATSAPP_VERIFY_TOKEN.",
      "Subscribe to fields: messages, message_status.",
      "Додай у Vercel ENV: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN.",
      "Тестове повідомлення приходить — Meta дозволяє чат на 24 год після першого вхідного від клієнта (24h messaging window). Для outbound потрібні template messages.",
    ],
  },
  instagram: {
    docsUrl: "https://developers.facebook.com/docs/messenger-platform/instagram/",
    steps: [
      "Той же Meta App що і для WhatsApp (або новий).",
      "Інстаграм має бути Business Account і підключений до Facebook Page.",
      "У Meta App додай продукти: Webhooks, Instagram Graph API.",
      "Subscribe сторінку до webhook: URL = https://stonememory.com.ua/api/instagram/webhook, Verify token = INSTAGRAM_VERIFY_TOKEN.",
      "Subscribe to fields: messages, messaging_postbacks.",
      "Отримай Long-lived Page Access Token (через Graph API Explorer).",
      "Додай у Vercel ENV: INSTAGRAM_PAGE_ACCESS_TOKEN, INSTAGRAM_PAGE_ID, INSTAGRAM_VERIFY_TOKEN.",
    ],
  },
  email: {
    docsUrl: "https://resend.com/docs/dashboard/webhooks/introduction",
    steps: [
      "Outbound вже працює — RESEND_API_KEY встановлений (info@stonememory.com.ua).",
      "Для inbound (вхідні листи) — найпростіший шлях через Cloudflare Email Routing:",
      "1. У Cloudflare DNS → Email Routing → налаштувати MX records.",
      "2. Створити Worker що POST'ить email на /api/email/inbound у форматі JSON.",
      "Альтернатива: Resend Receiving (preview), Mailgun routes, Postmark inbound, SendGrid Inbound Parse.",
      "Згенерувати INBOUND_EMAIL_SECRET (openssl rand -hex 32) — webhook провайдер слатиме з цим у заголовку x-webhook-secret.",
    ],
  },
  sms: {
    docsUrl: "https://www.twilio.com/docs/sms",
    steps: [
      "Зареєструватись у Twilio Console: https://console.twilio.com",
      "Купити номер (Phone Numbers → Buy a number) — від $1/міс для US, $10+ для UA.",
      "У налаштуваннях номера: Messaging Configuration → 'A message comes in' → POST → https://stonememory.com.ua/api/sms/inbound.",
      "Account SID + Auth Token знайдеш на Console Dashboard.",
      "Додай ENV: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER (формат +380...).",
    ],
  },
  site_chat: {
    docsUrl: "",
    steps: ["Завжди увімкнено — стандартний віджет на сайті."],
  },
}

export default function IntegrationsPage() {
  const { role, loading: roleLoading } = useCurrentRole()
  const allowed = isSuperAdmin(role)

  const [items, setItems] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
    if (!allowed) {
      setLoading(false)
      return
    }
    authedFetch("/api/crm/integrations/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        setItems(j.integrations || [])
        setLoading(false)
      })
  }, [allowed])

  // Defense in depth: even if a non-super-admin somehow lands here
  // (direct URL, sidebar bypass), the API guard returns 403 and we
  // render an explicit access-denied panel rather than a blank page.
  if (roleLoading) {
    return (
      <div className="rounded-2xl border border-foreground/10 bg-card p-6 text-sm text-muted-foreground">
        Завантаження…
      </div>
    )
  }
  if (!allowed) {
    return (
      <div className="space-y-6 max-w-2xl">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Інтеграції каналів</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Підключення Telegram, WhatsApp, Instagram, Email, SMS до CRM.
          </p>
        </header>
        <div className="rounded-2xl border border-amber-300/40 bg-amber-50/60 p-6 dark:bg-amber-900/10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">
            <Lock size={14} /> Доступ обмежено
          </div>
          <h2 className="text-lg font-semibold tracking-tight-custom">
            Цей розділ — лише для головного адміна
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Канальні інтеграції — критична частина воронки. Якщо хтось випадково відключить
            канал, всі клієнти перестануть писати. Тому налаштовує тільки власник.
            Ви, як <span className="font-medium text-foreground">{role || "учасник"}</span>,
            бачите вхідні повідомлення з усіх каналів у unified inbox автоматично — нічого
            налаштовувати не потрібно.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-xl gap-2">
              <a href="/admin/inbox">
                <Crown size={14} /> Перейти у Inbox
              </a>
            </Button>
            <Button asChild className="rounded-xl gap-2">
              <a href="mailto:sttonememory@gmail.com?subject=%5BCRM%5D%20Запит%20на%20налаштування%20інтеграції">
                Зв'язатись з адміном
              </a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight-custom">Інтеграції каналів</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Підключи канали комунікації — всі повідомлення зберуться в /admin/inbox.
        </p>
      </header>

      {loading && (
        <div className="rounded-xl border border-foreground/10 bg-card p-6 text-center text-sm text-muted-foreground">
          Завантаження…
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map((it) => {
          const Icon = ICONS[it.id] || MessageCircle
          const guide = SETUP_GUIDES[it.id]
          const isExpanded = expanded === it.id
          return (
            <div
              key={it.id}
              className={`rounded-2xl border bg-card overflow-hidden ${
                it.configured ? "border-success/30" : "border-foreground/10"
              }`}
            >
              <header className="p-5 flex items-start gap-4">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${COLORS[it.id]}`}>
                  <Icon size={20} />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{it.name}</h2>
                    {it.configured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
                        <Check size={11} /> Налаштовано
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700">
                        <AlertCircle size={11} /> Не налаштовано
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className={it.canReceive ? "text-success" : "text-muted-foreground/60"}>
                      <ArrowDown size={11} className="inline" /> {it.canReceive ? "приймає" : "не приймає"}
                    </span>
                    <span className={it.canSend ? "text-success" : "text-muted-foreground/60"}>
                      <ArrowUp size={11} className="inline" /> {it.canSend ? "надсилає" : "не надсилає"}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExpanded(isExpanded ? null : it.id)}
                  className="rounded-full text-xs"
                >
                  {isExpanded ? "Приховати" : "Налаштувати"}
                </Button>
              </header>

              {isExpanded && guide && (
                <div className="border-t border-foreground/5 p-5 space-y-4 bg-foreground/[0.02]">
                  {it.webhookUrl && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Webhook URL
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-card border border-foreground/10 p-2 font-mono text-xs">
                        <code className="flex-1 break-all">{origin}{it.webhookUrl}</code>
                        <button
                          onClick={() => copy(`${origin}${it.webhookUrl}`, `url-${it.id}`)}
                          className="rounded-md p-1 hover:bg-foreground/5"
                          title="Копіювати"
                        >
                          {copied === `url-${it.id}` ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {it.envVars.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        ENV-змінні
                      </div>
                      <div className="space-y-1">
                        {it.envVars.map((v) => (
                          <div key={v.key} className="flex items-center gap-2 text-xs">
                            <span className={v.set ? "text-success" : "text-amber-600"}>
                              {v.set ? <Check size={12} /> : <X size={12} />}
                            </span>
                            <code className={`font-mono ${v.set ? "text-foreground" : "text-muted-foreground"}`}>{v.key}</code>
                            {v.set && <span className="text-success text-[10px]">встановлено</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Як налаштувати
                    </div>
                    <ol className="space-y-1.5 text-xs text-foreground/85 list-decimal list-inside">
                      {guide.steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                    {guide.docsUrl && (
                      <a
                        href={guide.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                      >
                        Офіційна документація <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <BackfillChatBlock />

      <div className="rounded-2xl border border-foreground/10 bg-card p-5 text-sm text-muted-foreground">
        <h3 className="font-semibold text-foreground mb-2">Як це працює</h3>
        <ol className="space-y-1.5 list-decimal list-inside">
          <li>Клієнт пише у будь-який канал (Telegram, WhatsApp, Instagram, email, SMS, чат сайту).</li>
          <li>Webhook приймає повідомлення → знаходить або створює клієнта по телефону/каналу → пише у <code className="text-foreground">communications</code>.</li>
          <li>У <a href="/admin/inbox" className="text-accent hover:underline">/admin/inbox</a> усе зливається в одну стрічку.</li>
          <li>Менеджер відповідає звідти — система маршрутизує реплай на правильний канал.</li>
          <li>Якщо у клієнта вже є відкрита угода — повідомлення auto-link до неї.</li>
        </ol>
      </div>
    </div>
  )
}

/**
 * Бекфілл існуючих chat_messages → communications.
 * Запускається одноразово (повторні виклики безпечні — skip-ить дублі).
 */
function BackfillChatBlock() {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<{
    processed: number
    skipped: number
    customersCreated: number
    errorCount: number
    errors: string[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showErrors, setShowErrors] = useState(false)

  const run = async () => {
    setRunning(true)
    setError(null)
    setResult(null)
    setShowErrors(false)
    try {
      const r = await authedFetch("/api/crm/admin/backfill-chat", { method: "POST" })
      const j = await r.json()
      if (!r.ok) {
        setError(j.error || "Помилка")
        return
      }
      setResult({
        processed: j.processed,
        skipped: j.skipped,
        customersCreated: j.customersCreated,
        errorCount: j.errorCount || 0,
        errors: Array.isArray(j.errors) ? j.errors : [],
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка мережі")
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="rounded-2xl border border-foreground/10 bg-card p-5">
      <h3 className="font-semibold mb-2">Перенести існуючі чат-сесії в Inbox</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Старі розмови з лайв-чату сайту (до моменту як я додав unified inbox) живуть лише в таблиці chat_messages.
        Натисни щоб скопіювати їх у communications — після цього вони зʼявляться у /admin/inbox.
        Безпечно повторювати — пропускає вже скопійовані.
      </p>
      <Button onClick={run} disabled={running} className="rounded-xl gap-2">
        {running ? "Переношу…" : "Перенести в Inbox"}
      </Button>
      {result && (
        <div className="mt-3 rounded-xl bg-success/10 px-4 py-3 text-sm">
          ✓ <strong>{result.processed}</strong> повідомлень перенесено,{" "}
          <strong>{result.skipped}</strong> пропущено (вже були),{" "}
          <strong>{result.customersCreated}</strong> нових клієнтів створено.
          {result.errorCount > 0 && (
            <div className="mt-2 text-amber-700">
              <button
                onClick={() => setShowErrors((v) => !v)}
                className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-amber-900"
              >
                ⚠ {result.errorCount} помилок — {showErrors ? "сховати" : "показати"}
              </button>
              {showErrors && result.errors.length > 0 && (
                <ul className="mt-2 max-h-64 overflow-auto rounded-lg bg-amber-50/60 p-3 font-mono text-xs leading-relaxed text-amber-900">
                  {result.errors.map((msg, i) => (
                    <li key={i} className="border-b border-amber-200/60 py-1 last:border-b-0">
                      {msg}
                    </li>
                  ))}
                  {result.errorCount > result.errors.length && (
                    <li className="pt-2 text-amber-800/70">
                      …та ще {result.errorCount - result.errors.length} (показано перші {result.errors.length})
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
      {error && (
        <div className="mt-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}
