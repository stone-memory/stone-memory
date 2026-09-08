import { supabaseAdmin } from "@/lib/supabase/admin"

/**
 * Сховище документів угод (договори, КП, рахунки).
 *
 * Окремий ПРИВАТНИЙ бакет: файли містять персональні дані клієнта, тож
 * віддаються лише через тимчасові підписані посилання
 * (app/api/crm/documents/[id]/url). Бакет створюється автоматично при
 * першій генерації, ручних кроків у Supabase не потрібно.
 */
export const DOCUMENTS_BUCKET = process.env.SUPABASE_DOCUMENTS_BUCKET || "documents"

/** Публічний бакет зображень, де документи лежали до переходу. */
export const LEGACY_PUBLIC_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "stone-images"

let ensured = false

export async function ensureDocumentsBucket(): Promise<void> {
  if (ensured) return
  const { data } = await supabaseAdmin.storage.getBucket(DOCUMENTS_BUCKET)
  if (!data) {
    const { error } = await supabaseAdmin.storage.createBucket(DOCUMENTS_BUCKET, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
    })
    // Гонка двох одночасних генерацій: бакет уже створено — не помилка.
    if (error && !/already exists|duplicate/i.test(error.message)) throw error
  } else if (data.public) {
    // Хтось зробив бакет публічним руками — повертаємо приватність, інакше
    // сенс переходу зникає.
    await supabaseAdmin.storage.updateBucket(DOCUMENTS_BUCKET, { public: false })
  }
  ensured = true
}
