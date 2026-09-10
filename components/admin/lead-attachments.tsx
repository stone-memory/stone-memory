"use client"

import { useEffect, useState } from "react"
import { FileText, Paperclip } from "lucide-react"
import { authedFetch } from "@/lib/authed-fetch"
import { openDocument } from "@/lib/crm/documents-client"
import type { Document } from "@/lib/crm/types"

/**
 * Галерея вкладень із заявки сайту (фото ділянки, ескізи, PDF).
 *
 * Файли лежать у приватному бакеті, тому кожна мініатюра тягне тимчасове
 * підписане посилання через /api/crm/documents/[id]/url (діє 5 хвилин —
 * досить, щоб роздивитись; клік відкриває файл у новій вкладці новим
 * посиланням). PDF показуємо іконкою.
 */

export function isLeadAttachment(d: Pick<Document, "meta">): boolean {
  return Boolean((d.meta as { lead_attachment?: boolean } | null)?.lead_attachment)
}

function mimeOf(d: Pick<Document, "meta">): string {
  return String((d.meta as { mime?: string } | null)?.mime ?? "")
}

function formatSize(bytes: number | null): string {
  if (!bytes) return ""
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} МБ` : `${Math.max(1, Math.round(bytes / 1024))} КБ`
}

function Thumb({ doc }: { doc: Document }) {
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const isImage = mimeOf(doc).startsWith("image/")

  useEffect(() => {
    if (!isImage) return
    let alive = true
    authedFetch(`/api/crm/documents/${doc.id}/url`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { url?: string }) => {
        if (alive && j.url) setUrl(j.url)
        else if (alive) setFailed(true)
      })
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [doc.id, isImage])

  return (
    <button
      type="button"
      onClick={() => openDocument(doc.id)}
      title={doc.title ?? doc.storage_path}
      className="group relative aspect-square overflow-hidden rounded-xl border border-foreground/10 bg-foreground/[0.03] text-left transition-colors hover:border-foreground/30"
    >
      {isImage && url && !failed ? (
        // Тимчасове підписане посилання на приватний бакет — next/image тут
        // ні до чого: домен змінний, а кешувати підписані адреси не можна.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={doc.title ?? "Вкладення"} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-2 text-center text-muted-foreground">
          <FileText size={20} />
          <span className="line-clamp-2 text-[11px] leading-tight">{doc.title ?? "Файл"}</span>
        </span>
      )}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
        {doc.title} {formatSize(doc.size_bytes)}
      </span>
    </button>
  )
}

export function LeadAttachments({ documents, title = "Фото від клієнта" }: { documents: Document[]; title?: string }) {
  if (documents.length === 0) return null
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <Paperclip size={12} /> {title} · {documents.length}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {documents.map((d) => (
          <Thumb key={d.id} doc={d} />
        ))}
      </div>
    </div>
  )
}

/** Для картки заявки в /admin: документи шукаються за id рядка в orders. */
export function OrderAttachments({ orderId }: { orderId: string }) {
  const [docs, setDocs] = useState<Document[]>([])
  useEffect(() => {
    let alive = true
    authedFetch(`/api/crm/documents?order_id=${encodeURIComponent(orderId)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { documents: [] }))
      .then((j: { documents?: Document[] }) => alive && setDocs((j.documents ?? []).filter(isLeadAttachment)))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [orderId])
  if (docs.length === 0) return null
  return (
    <section>
      <LeadAttachments documents={docs} />
    </section>
  )
}
