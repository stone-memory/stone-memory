/**
 * Фото контенту стільниць зберігаються або як абсолютні URL (Supabase Storage,
 * завантажені через адмінку), або як шляхи виду /materials/x.webp, що лежать у
 * репозиторії сайту стільниць. Другі адмінка може показати лише через адресу
 * того сайту: NEXT_PUBLIC_STILNYTSI_SITE_URL (до підключення піддомену —
 * Vercel-аліас проєкту).
 */
const SITE = (process.env.NEXT_PUBLIC_STILNYTSI_SITE_URL || "https://stonememory-stilnytsi.vercel.app").replace(/\/+$/, "")

export function stilnytsiImageUrl(value: string | undefined | null): string {
  if (!value) return ""
  if (/^https?:\/\//.test(value)) return value
  if (value.startsWith("/")) return SITE + value
  return ""
}
