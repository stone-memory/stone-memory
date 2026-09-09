import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { guardTeamMember } from "@/lib/auth/permissions"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "stone-images"
const MAX_SIZE = 8 * 1024 * 1024 // 8 MB — images only, not HD video
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
])

function extFromMime(type: string): string {
  switch (type) {
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "image/avif":
      return "avif"
    case "image/gif":
      return "gif"
    case "image/svg+xml":
      return "svg"
    default:
      return "bin"
  }
}

const COMPRESS_OVER = 600 * 1024
const MAX_PX = 2000

async function compressIfLarge(
  input: Buffer,
  mime: string
): Promise<{ body: Buffer; contentType: string; ext: string }> {
  const passthrough = { body: input, contentType: mime, ext: extFromMime(mime) }
  if (input.length <= COMPRESS_OVER) return passthrough
  if (mime !== "image/jpeg" && mime !== "image/png") return passthrough
  try {
    const sharp = (await import("sharp")).default
    const out = await sharp(input)
      .rotate()
      .resize({ width: MAX_PX, height: MAX_PX, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toBuffer()
    // Стиснення не допомогло (уже щільний JPEG) — лишаємо оригінал.
    if (out.length >= input.length) return passthrough
    return { body: out, contentType: "image/jpeg", ext: "jpg" }
  } catch {
    // sharp недоступний у цьому середовищі — краще важке фото, ніж зламане завантаження.
    return passthrough
  }
}

// Sanitizes an optional folder hint to a safe segment (letters/digits/dashes).
function sanitizeFolder(input: string | null): string {
  if (!input) return "misc"
  const cleaned = input.toLowerCase().replace(/[^a-z0-9\-_]/g, "-").replace(/-+/g, "-").slice(0, 40)
  return cleaned || "misc"
}

export async function POST(req: Request) {
  const unauthorized = await guardTeamMember(req)
  if (unauthorized) return unauthorized

  const url = new URL(req.url)
  const folder = sanitizeFolder(url.searchParams.get("folder"))

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: "expected multipart form data" }, { status: 400 })
  }

  const file = form.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 })
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "empty file" }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: `file too large (max ${MAX_SIZE / 1024 / 1024} MB)` }, { status: 413 })
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: `unsupported type: ${file.type}` }, { status: 415 })
  }

  // Фото товарів приходили з камери як є: 60 із 122 важили 2–4,5 МБ. На
  // сторінці їх оптимізує next/image, але оригінальна адреса йде в JSON-LD,
  // image-sitemap і og:image, звідки її тягнуть без стиснення. Тому JPEG і
  // PNG понад COMPRESS_OVER стискаємо ще на вході: до MAX_PX по довгій
  // стороні, JPEG q82. SVG, GIF, AVIF і WebP не чіпаємо.
  const original = Buffer.from(await file.arrayBuffer())
  const { body, contentType, ext } = await compressIfLarge(original, file.type)

  const randomName = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const objectPath = `${folder}/${randomName}`

  const { error: upErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(objectPath, body, {
      contentType,
      upsert: false,
      cacheControl: "31536000",
    })

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 })
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(objectPath)
  return NextResponse.json({ ok: true, url: data.publicUrl, path: objectPath }, { status: 201 })
}
