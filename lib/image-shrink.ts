/**
 * Стискання фото в браузері перед відправкою.
 *
 * Vercel обмежує тіло запиту до route handler ~4,5 МБ, а фото з телефона —
 * 3–6 МБ кожне. Зменшуємо до 1600 px по довшій стороні і пакуємо в JPEG:
 * цього досить, щоб роздивитись ділянку чи ескіз, а важить у 10 разів менше.
 * Усе, що не картинка (PDF) або не піддалось декодуванню (HEIC у Firefox),
 * повертаємо як є — далі його перевірить ліміт розміру.
 */
export const SHRINK_MAX_PX = 1600
export const SHRINK_QUALITY = 0.82
/** Менші за це не чіпаємо: перекодування нічого не виграє. */
const SKIP_BELOW_BYTES = 600 * 1024

export async function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file
  if (file.size < SKIP_BELOW_BYTES) return file
  if (typeof createImageBitmap !== "function") return file

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
    const scale = Math.min(1, SHRINK_MAX_PX / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", SHRINK_QUALITY))
    if (!blob || blob.size >= file.size) return file

    const name = file.name.replace(/\.[a-z0-9]+$/i, "") + ".jpg"
    return new File([blob], name, { type: "image/jpeg", lastModified: file.lastModified })
  } catch {
    return file
  }
}
