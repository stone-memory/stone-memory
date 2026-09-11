"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import * as Dialog from "@radix-ui/react-dialog"
import { Check, Paperclip, X } from "lucide-react"
import { useConsultStore } from "@/lib/store/consult"
import { shrinkImage } from "@/lib/image-shrink"
import { readAttribution } from "@/lib/attribution"
import { trackEvent } from "@/components/analytics-pixels"
import { CONTACT } from "@/lib/site-facts"
import { cn } from "@/lib/utils"

/**
 * Модалка заявки з вкладеннями.
 *
 * Відкривається з ConsultButton на інформаційних сторінках, у каталозі та на
 * головній. Збирає ім'я, телефон, зручний канал зв'язку, повідомлення і до
 * п'яти файлів (фото ділянки, ескіз, PDF). Фото стискаються в браузері
 * (lib/image-shrink.ts), бо тіло запиту до /api/lead обмежене ~4,5 МБ.
 *
 * Заявка йде в /api/lead: CRM + Telegram + лист на пошту майстерні з
 * вкладеннями. Канал зв'язку потрапляє в текст заявки.
 */

export const CONTACT_CHANNELS = [
  { id: "phone", label: "Дзвінок" },
  { id: "viber", label: "Viber" },
  { id: "telegram", label: "Telegram" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" },
] as const

export type ContactChannel = (typeof CONTACT_CHANNELS)[number]["id"]

export const MAX_FILES = 5
export const MAX_TOTAL_MB = 4
const MAX_TOTAL_BYTES = MAX_TOTAL_MB * 1024 * 1024
const ACCEPT = "image/*,.pdf,application/pdf"

const field =
  "h-12 w-full rounded-xl bg-foreground/[0.04] px-4 text-base placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-foreground/10 transition-all"

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} МБ` : `${Math.max(1, Math.round(bytes / 1024))} КБ`
}

export function ConsultModal() {
  const { isOpen, title, topic, close } = useConsultStore()
  const [status, setStatus] = useState<"idle" | "pending" | "sent" | "error">("idle")
  const [feedback, setFeedback] = useState("")
  const [channel, setChannel] = useState<ContactChannel>("phone")
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState("")
  const [shrinking, setShrinking] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  // Кожне відкриття — чиста форма, крім випадку, коли її щойно надіслали:
  // тоді при повторному відкритті показуємо ту саму подяку.
  useEffect(() => {
    if (!isOpen) return
    if (status === "sent") return
    setStatus("idle")
    setFeedback("")
    setFileError("")
  }, [isOpen, status])

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0)

  async function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    setFileError("")
    setShrinking(true)
    try {
      const incoming = Array.from(list)
      const room = MAX_FILES - files.length
      if (incoming.length > room) {
        setFileError(`Можна прикріпити до ${MAX_FILES} файлів.`)
      }
      const accepted: File[] = []
      for (const raw of incoming.slice(0, Math.max(0, room))) {
        const isPdf = raw.type === "application/pdf" || /\.pdf$/i.test(raw.name)
        if (!raw.type.startsWith("image/") && !isPdf) {
          setFileError("Підійдуть фото або PDF.")
          continue
        }
        const file = isPdf ? raw : await shrinkImage(raw)
        if (file.size > MAX_TOTAL_BYTES) {
          setFileError(`«${raw.name}» завеликий: разом файли мають бути до ${MAX_TOTAL_MB} МБ.`)
          continue
        }
        accepted.push(file)
      }
      setFiles((prev) => {
        const next = [...prev, ...accepted]
        let sum = next.reduce((s, f) => s + f.size, 0)
        while (sum > MAX_TOTAL_BYTES && next.length > 0) {
          const dropped = next.pop()!
          sum -= dropped.size
          setFileError(`Разом файли мають бути до ${MAX_TOTAL_MB} МБ — «${dropped.name}» не додано.`)
        }
        return next
      })
    } finally {
      setShrinking(false)
      if (fileInput.current) fileInput.current.value = ""
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setFileError("")
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === "pending" || shrinking) return
    setStatus("pending")
    setFeedback("")

    const body = new FormData(event.currentTarget)
    body.delete("file")
    for (const f of files) body.append("file", f, f.name)
    body.set("source", "consult")
    body.set("contact_channel", channel)
    if (topic) body.set("topic", topic)
    try {
      const attribution = readAttribution()
      if (attribution) body.set("attribution", JSON.stringify(attribution))
    } catch {
      /* аналітика не має блокувати заявку */
    }

    const response = await fetch("/api/lead", { method: "POST", body }).catch(() => null)
    const result = response ? await response.json().catch(() => ({})) : {}
    if (response?.ok) {
      setStatus("sent")
      setFeedback(
        channel === "email"
          ? "Дякуємо. Відповімо на пошту протягом робочого дня."
          : "Дякуємо. Ми отримали запит і зв'яжемося з вами в робочий час."
      )
      setFiles([])
      trackEvent("generate_lead", { form: "consult", topic: topic || "", channel, files: files.length })
    } else {
      setStatus("error")
      setFeedback(result.error || "Не вдалося надіслати запит. Зателефонуйте нам або спробуйте ще раз.")
    }
  }

  function handleOpenChange(open: boolean) {
    if (open) return
    close()
    // Після успішної відправки наступне відкриття — знову чиста форма.
    if (status === "sent") setTimeout(() => setStatus("idle"), 300)
  }

  const emailRequired = channel === "email"

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className={cn(
            "fixed z-50 flex flex-col bg-background shadow-2xl outline-none",
            "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-3xl",
            "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(560px,calc(100vw-2rem))] sm:max-h-[90dvh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b px-6 pt-6 pb-4">
            <div>
              <Dialog.Title className="text-2xl font-semibold tracking-tight-custom">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                Фото ділянки чи ескіз можна прикріпити одразу.
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              aria-label="Закрити"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="overflow-y-auto px-6 py-5">
            {status === "sent" ? (
              <div className="flex flex-col items-center py-10 text-center" aria-live="polite">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background">
                  <Check className="h-6 w-6" strokeWidth={2.5} />
                </span>
                <h3 className="mt-5 text-xl font-semibold">Запит надіслано</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">{feedback}</p>
                <a href={CONTACT.phoneHref} className="mt-6 text-sm font-medium underline underline-offset-4">
                  Або подзвоніть: {CONTACT.phoneDisplay}
                </a>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <label className="sr-only">
                  Не заповнюйте це поле
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="text-muted-foreground">Ім'я</span>
                    <input name="name" required minLength={2} maxLength={80} autoComplete="name" className={field} placeholder="Як до вас звертатись" />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="text-muted-foreground">Телефон</span>
                    <input
                      name="phone"
                      required
                      minLength={5}
                      maxLength={30}
                      inputMode="tel"
                      autoComplete="tel"
                      className={field}
                      placeholder="+380"
                    />
                  </label>
                </div>

                <fieldset>
                  <legend className="mb-2 text-sm text-muted-foreground">Як зручно зв'язатись</legend>
                  <div className="flex flex-wrap gap-2">
                    {CONTACT_CHANNELS.map((c) => (
                      <label
                        key={c.id}
                        className={cn(
                          "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                          channel === c.id
                            ? "border-foreground bg-foreground text-background"
                            : "border-foreground/15 hover:bg-foreground/5"
                        )}
                      >
                        <input
                          type="radio"
                          name="contact_channel_ui"
                          value={c.id}
                          checked={channel === c.id}
                          onChange={() => setChannel(c.id)}
                          className="sr-only"
                        />
                        {c.label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-muted-foreground">Email{emailRequired ? "" : " (необов'язково)"}</span>
                  <input
                    name="email"
                    type="email"
                    required={emailRequired}
                    maxLength={120}
                    autoComplete="email"
                    className={field}
                    placeholder="name@example.com"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-muted-foreground">Повідомлення</span>
                  <textarea
                    name="message"
                    maxLength={1200}
                    rows={4}
                    className="min-h-28 w-full rounded-xl bg-foreground/[0.04] p-4 text-base placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-foreground/10"
                    placeholder="Що потрібно: модель, камінь, місто, побажання"
                  />
                </label>

                <div>
                  <input
                    ref={fileInput}
                    id="consult-files"
                    type="file"
                    name="file"
                    accept={ACCEPT}
                    multiple
                    className="sr-only"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                  <label
                    htmlFor="consult-files"
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-foreground/20 px-4 py-3 text-sm transition-colors hover:bg-foreground/[0.03]",
                      files.length >= MAX_FILES && "pointer-events-none opacity-50"
                    )}
                  >
                    <Paperclip className="h-4 w-4 shrink-0" strokeWidth={2} />
                    <span>
                      {shrinking
                        ? "Готуємо фото…"
                        : files.length
                          ? `Додати ще (${files.length} з ${MAX_FILES})`
                          : "Прикріпити фото ділянки, ескіз або PDF"}
                    </span>
                  </label>
                  {files.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {files.map((f, i) => (
                        <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 rounded-lg bg-foreground/[0.04] px-3 py-2 text-sm">
                          <span className="truncate">{f.name}</span>
                          <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
                            {formatSize(f.size)}
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-foreground/10 hover:text-foreground"
                              aria-label={`Прибрати ${f.name}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {fileError || `До ${MAX_FILES} файлів, разом до ${MAX_TOTAL_MB} МБ. Фото зменшуємо автоматично${totalBytes ? ` · зараз ${formatSize(totalBytes)}` : ""}.`}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={status === "pending" || shrinking}
                  className="h-12 w-full rounded-full bg-foreground text-sm font-medium text-background transition-transform hover:-translate-y-[1px] active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {status === "pending" ? "Надсилаємо…" : "Надіслати"}
                </button>

                <p aria-live="polite" className="text-sm text-destructive empty:hidden">
                  {status === "error" ? feedback : ""}
                </p>

                <p className="text-xs leading-5 text-muted-foreground">
                  Натискаючи «Надіслати», ви погоджуєтесь з{" "}
                  <Link href="/konfidentsiinist" className="underline underline-offset-2">
                    політикою конфіденційності
                  </Link>
                  . Дані не передаємо третім особам.
                </p>
              </form>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
