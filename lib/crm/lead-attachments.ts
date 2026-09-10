import "server-only"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { DOCUMENTS_BUCKET, ensureDocumentsBucket } from "@/lib/crm/documents-storage"

/**
 * Вкладення із заявки сайту (фото ділянки, ескіз, PDF) → CRM.
 *
 * Файли йдуть у той самий ПРИВАТНИЙ бакет, що й договори: на фото — чужі
 * могили й подвір'я, тож публічного посилання бути не може. Кожен файл
 * реєструється рядком у `documents` з kind=other і `meta.lead_attachment`,
 * прив'язаним до угоди, яку тригер створив із заявки (deals.order_id), і до
 * клієнта. В адмінці вони показуються галереєю на сторінці угоди та в
 * картці заявки (components/admin/lead-attachments.tsx).
 *
 * Помилка тут не має губити лід: викликач ловить виняток і лише логує.
 */

/** Позначка в documents.meta, за якою адмінка відрізняє вкладення від договорів. */
export const LEAD_ATTACHMENT_FLAG = "lead_attachment"

function safeName(name: string): string {
  const base = name.replace(/[^\p{L}\p{N}._-]+/gu, "_").replace(/^_+|_+$/g, "").slice(0, 80)
  return base || "file"
}

export async function storeLeadAttachments(args: {
  orderId: string
  customerName: string
  files: File[]
}): Promise<number> {
  if (!args.files.length) return 0
  await ensureDocumentsBucket()

  // Тригер copy_legacy_order_to_deal створює угоду в тій самій транзакції,
  // що й заявку, тож вона вже є. Якщо ні (міграцію не виконано) — файли все
  // одно зберігаємо, картка заявки знайде їх за meta.order_id.
  const { data: deal } = await supabaseAdmin
    .from("deals")
    .select("id, customer_id")
    .eq("order_id", args.orderId)
    .maybeSingle()

  let stored = 0
  for (const [i, file] of args.files.entries()) {
    const path = `leads/${args.orderId}/${i + 1}-${safeName(file.name)}`
    const { error: upErr } = await supabaseAdmin.storage
      .from(DOCUMENTS_BUCKET)
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type || "application/octet-stream", upsert: true })
    if (upErr) {
      console.error(`[lead] attachment upload failed (${file.name}):`, upErr.message)
      continue
    }
    const { error: docErr } = await supabaseAdmin.from("documents").insert({
      deal_id: deal?.id ?? null,
      customer_id: deal?.customer_id ?? null,
      kind: "other",
      number: null,
      title: file.name,
      storage_path: path,
      public_url: null,
      size_bytes: file.size,
      version: 1,
      meta: {
        [LEAD_ATTACHMENT_FLAG]: true,
        bucket: DOCUMENTS_BUCKET,
        mime: file.type || null,
        order_id: args.orderId,
        from: args.customerName,
      },
    })
    if (docErr) {
      console.error(`[lead] attachment register failed (${file.name}):`, docErr.message)
      continue
    }
    stored++
  }
  return stored
}
