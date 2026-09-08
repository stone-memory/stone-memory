"use client"

import { toast } from "sonner"
import { authedFetch } from "@/lib/authed-fetch"

/**
 * Відкрити документ угоди в новій вкладці через тимчасове підписане посилання.
 *
 * Вікно відкривається СИНХРОННО в обробнику кліку (інакше блокувальник
 * спливних вікон зʼїсть його після await), а адреса підставляється, коли
 * сервер відповість.
 */
export async function openDocument(documentId: string): Promise<void> {
  // Без "noopener" у window.open: з ним Chrome повертає null, і адреса
  // підставлялась у поточну вкладку адмінки. Розриваємо звʼязок вручну.
  const win = window.open("", "_blank")
  if (win) win.opener = null
  try {
    const r = await authedFetch(`/api/crm/documents/${documentId}/url`, { cache: "no-store" })
    const j = (await r.json().catch(() => ({}))) as { url?: string; error?: string }
    if (!r.ok || !j.url) {
      win?.close()
      toast.error("Не вдалося відкрити документ", { description: j.error })
      return
    }
    if (win) win.location.href = j.url
    else window.location.href = j.url
  } catch {
    win?.close()
    toast.error("Не вдалося відкрити документ")
  }
}
