import "server-only"
import { getServerLocale } from "@/lib/i18n/server"
import { stoneT, type StoneT } from "@/lib/i18n/stone"
import type { Locale } from "@/lib/types"

/** Мова з cookie + перекладач для серверних компонентів розділу. */
export async function getStoneT(): Promise<{ locale: Locale; t: StoneT }> {
  const locale = await getServerLocale()
  return { locale, t: stoneT(locale) }
}
