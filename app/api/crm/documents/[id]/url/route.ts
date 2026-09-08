import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { guardTeamMember } from "@/lib/auth/permissions"
import { DOCUMENTS_BUCKET, LEGACY_PUBLIC_BUCKET } from "@/lib/crm/documents-storage"

export const dynamic = "force-dynamic"

/** Скільки живе тимчасове посилання на документ (секунди). */
const SIGNED_URL_TTL = 5 * 60

/**
 * GET /api/crm/documents/[id]/url — тимчасове підписане посилання на документ.
 *
 * Документи (договори, КП, рахунки) містять імʼя, телефон і суми клієнта.
 * Раніше вони лежали в публічному бакеті зображень і відкривались будь-кому
 * з посиланням. Тепер файл у приватному бакеті, а посилання видається лише
 * активному члену команди і діє 5 хвилин.
 *
 * Старі документи (згенеровані до переходу) досі в публічному бакеті —
 * для них теж віддаємо підписане посилання, шлях у storage той самий.
 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const unauthorized = await guardTeamMember(req)
  if (unauthorized) return unauthorized

  const { id } = await ctx.params
  const { data: doc, error } = await supabaseAdmin
    .from("documents")
    .select("id, storage_path, public_url, meta")
    .eq("id", id)
    .single()
  if (error || !doc) return NextResponse.json({ error: "document not found" }, { status: 404 })

  const meta = (doc.meta ?? {}) as { bucket?: string }
  const bucket =
    meta.bucket ||
    (doc.public_url && doc.public_url.includes(`/${LEGACY_PUBLIC_BUCKET}/`)
      ? LEGACY_PUBLIC_BUCKET
      : DOCUMENTS_BUCKET)

  const { data, error: signErr } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(doc.storage_path, SIGNED_URL_TTL)
  if (signErr || !data?.signedUrl) {
    return NextResponse.json({ error: signErr?.message || "cannot sign url" }, { status: 500 })
  }
  return NextResponse.json({ url: data.signedUrl, expires_in: SIGNED_URL_TTL })
}
