"use client"

import { useEffect, useState } from "react"
import { X, Check, Eye, EyeOff, AlertCircle, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authedFetch } from "@/lib/authed-fetch"
import { cn } from "@/lib/utils"

/**
 * Per-channel config modal. Each channel has a different shape — we
 * declare a small schema per id and let the modal render it uniformly.
 *
 * Token fields use password-masked inputs with a show/hide toggle.
 * Saved-in-DB shows current value (masked); env-only shows "from env"
 * with a hint that DB would override. PUT replaces the entire DB
 * config for the channel; empty fields are dropped server-side.
 */

type FieldKind = "text" | "secret" | "hint"
type FieldSchema = {
  key: string
  label: string
  kind: FieldKind
  placeholder?: string
  helper?: string
}
type ChannelSchema = {
  id: string
  name: string
  fields: FieldSchema[]
  helpUrl?: string
  intro?: string
}

const SCHEMAS: Record<string, ChannelSchema> = {
  telegram: {
    id: "telegram",
    name: "Telegram",
    helpUrl: "https://core.telegram.org/bots#how-do-i-create-a-bot",
    intro:
      "Створи бота через @BotFather (/newbot). Скопіюй токен. Потім додай бота в свій адмін-чат і дізнайся chat_id (наприклад через @getmyid_bot).",
    fields: [
      { key: "bot_token", label: "Bot token", kind: "secret", placeholder: "123456789:AAH…", helper: "Видає @BotFather після /newbot" },
      { key: "admin_chat_id", label: "Admin chat ID", kind: "text", placeholder: "-1001234567890", helper: "Куди бот буде надсилати сповіщення команді" },
      { key: "webhook_secret", label: "Webhook secret", kind: "secret", placeholder: "будь-який рядок 32+ символи", helper: "Перевіряємо вхідні webhook'и" },
    ],
  },
  whatsapp: {
    id: "whatsapp",
    name: "WhatsApp",
    helpUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started",
    intro:
      "WhatsApp Business Cloud API: створи додаток у Meta Business → додай WhatsApp Product → скопіюй Permanent Access Token і Phone Number ID.",
    fields: [
      { key: "token", label: "Access token", kind: "secret", placeholder: "EAAB…" },
      { key: "phone_number_id", label: "Phone Number ID", kind: "text", placeholder: "10-15 цифр" },
      { key: "verify_token", label: "Verify token", kind: "secret", placeholder: "будь-який рядок", helper: "Те саме значення впиши у webhook налаштуваннях Meta" },
    ],
  },
  instagram: {
    id: "instagram",
    name: "Instagram",
    helpUrl: "https://developers.facebook.com/docs/messenger-platform/instagram/get-started",
    intro:
      "Підключи Instagram Business у Meta Business → дай дозволи instagram_basic + instagram_manage_messages → отримай Page Access Token.",
    fields: [
      { key: "page_access_token", label: "Page Access Token", kind: "secret", placeholder: "EAAB…" },
      { key: "page_id", label: "Page ID", kind: "text", placeholder: "ID Facebook-сторінки, до якої під'єднано IG" },
      { key: "verify_token", label: "Verify token", kind: "secret", placeholder: "будь-який рядок" },
    ],
  },
  email_inbound: {
    id: "email_inbound",
    name: "Email",
    helpUrl: "https://resend.com/docs/api-reference/api-keys/create-api-key",
    intro:
      "Через Resend (resend.com): зареєструй домен → отримай API ключ. Inbound — через webhook (Mailgun, Postmark або форвардер).",
    fields: [
      { key: "resend_api_key", label: "Resend API key", kind: "secret", placeholder: "re_…" },
      { key: "email_from", label: "From address", kind: "text", placeholder: "noreply@yourdomain.com" },
      { key: "email_from_name", label: "From name", kind: "text", placeholder: "Stone Memory" },
      { key: "email_reply_to", label: "Reply-to", kind: "text", placeholder: "support@yourdomain.com" },
      { key: "inbound_secret", label: "Inbound webhook secret", kind: "secret", placeholder: "перевіряємо вхідні листи" },
    ],
  },
  twilio_sms: {
    id: "twilio_sms",
    name: "SMS (Twilio)",
    helpUrl: "https://www.twilio.com/console",
    intro:
      "Twilio Console → Account SID + Auth Token у верхньому лівому. Купи SMS-номер у Phone Numbers → Buy a number.",
    fields: [
      { key: "account_sid", label: "Account SID", kind: "text", placeholder: "AC…" },
      { key: "auth_token", label: "Auth token", kind: "secret", placeholder: "32 hex chars" },
      { key: "from_number", label: "From number", kind: "text", placeholder: "+1XXXXXXXXXX" },
    ],
  },
}

/** Map UI integration card id (from /api/crm/integrations/status) → config schema id. */
const ID_MAP: Record<string, string> = {
  telegram: "telegram",
  whatsapp: "whatsapp",
  instagram: "instagram",
  email: "email_inbound",
  sms: "twilio_sms",
}

export function IntegrationConfigModal({
  cardId,
  onClose,
  onSaved,
}: {
  cardId: string
  onClose: () => void
  onSaved: () => void
}) {
  const schemaId = ID_MAP[cardId] || cardId
  const schema = SCHEMAS[schemaId]
  const [values, setValues] = useState<Record<string, string>>({})
  const [envSet, setEnvSet] = useState<Record<string, boolean>>({})
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [enabled, setEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!schema) {
      setLoading(false)
      return
    }
    authedFetch(`/api/crm/integrations/${schemaId}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) {
          setError("Не вдалось завантажити налаштування")
          return
        }
        const j = (await r.json()) as {
          enabled: boolean
          config: Record<string, string>
          envSet: Record<string, boolean>
        }
        setValues(j.config || {})
        setEnvSet(j.envSet || {})
        setEnabled(j.enabled !== false)
      })
      .finally(() => setLoading(false))
  }, [schemaId, schema])

  if (!schema) {
    return (
      <Modal onClose={onClose}>
        <div className="p-6">
          <p className="text-sm text-destructive">Невідомий канал: {cardId}</p>
        </div>
      </Modal>
    )
  }

  const handleSave = async () => {
    setError(null)
    setSaving(true)
    setSaved(false)
    try {
      const r = await authedFetch(`/api/crm/integrations/${schemaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, config: values }),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        setError(j.error || "Не вдалось зберегти")
        return
      }
      setSaved(true)
      onSaved()
      // Close after a beat so the user sees the confirmation tick
      setTimeout(onClose, 800)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-foreground/5 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight-custom">{schema.name}</h2>
            {schema.intro && (
              <p className="mt-0.5 text-xs text-muted-foreground max-w-md">{schema.intro}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground shrink-0"
          >
            <X size={16} />
          </button>
        </header>

        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            <Loader2 size={20} className="mx-auto mb-2 animate-spin" />
            Завантаження…
          </div>
        ) : (
          <>
            <div className="space-y-3 overflow-auto px-5 py-4">
              {schema.fields.map((f) => {
                const dbValue = values[f.key] || ""
                const dbSet = dbValue.length > 0
                const envOnly = !dbSet && envSet[f.key]
                const showThis = showSecret[f.key]
                return (
                  <div key={f.key}>
                    <label className="mb-1 flex items-center justify-between gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <span>{f.label}</span>
                      {envOnly && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-1.5 py-0.5 text-[10px] normal-case text-muted-foreground">
                          з env
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Input
                        type={f.kind === "secret" && !showThis ? "password" : "text"}
                        value={dbValue}
                        onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                        placeholder={envOnly ? "(використовується значення з env — перепиши тут щоб замінити)" : f.placeholder}
                        autoComplete="off"
                        className={cn("pr-10", f.kind === "secret" && "font-mono")}
                      />
                      {f.kind === "secret" && (
                        <button
                          type="button"
                          onClick={() => setShowSecret((p) => ({ ...p, [f.key]: !p[f.key] }))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-foreground/5"
                          aria-label={showThis ? "Сховати" : "Показати"}
                          tabIndex={-1}
                        >
                          {showThis ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                    {f.helper && (
                      <p className="mt-1 text-[11px] text-muted-foreground">{f.helper}</p>
                    )}
                  </div>
                )
              })}

              <label className="mt-2 inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="h-4 w-4 accent-foreground"
                />
                Активувати канал
              </label>
              <p className="text-[11px] text-muted-foreground">
                Якщо вимкнено — DB-конфіг ігнорується, runtime читатиме env (як було раніше).
              </p>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-foreground/5 bg-foreground/[0.02] px-5 py-3">
              <div className="flex items-center gap-2 text-xs">
                {schema.helpUrl && (
                  <a
                    href={schema.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink size={11} /> Документація
                  </a>
                )}
                {error && (
                  <span className="inline-flex items-center gap-1 text-destructive">
                    <AlertCircle size={11} /> {error}
                  </span>
                )}
                {saved && (
                  <span className="inline-flex items-center gap-1 text-success">
                    <Check size={11} /> Збережено
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="rounded-xl">
                  Закрити
                </Button>
                <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {saving ? "Зберігаю…" : "Зберегти"}
                </Button>
              </div>
            </footer>
          </>
        )}
      </div>
    </Modal>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-foreground/10 bg-card shadow-hover"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
