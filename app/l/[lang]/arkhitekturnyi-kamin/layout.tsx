import type { Metadata } from "next"
import { getContacts } from "@/lib/stone/cms"
import { Footer, Header } from "@/components/stone/site/shell"
import { LanguageProvider } from "@/lib/i18n/context"
import { notFound } from "next/navigation"
import { isLocale } from "@/lib/i18n/config"
import { setRequestLocale } from "@/lib/i18n/server"

/**
 * Оболонка розділу «Архітектурний камінь» (/arkhitekturnyi-kamin): власні шапка й підвал з
 * навігацією по виробах, матеріалах і B2B. Плаваючі кнопки дзвінка та чату
 * малює загальний PublicChrome із кореневого layout — другий комплект тут не
 * потрібен.
 */
export const metadata: Metadata = {
  title: { default: "Архітектурний камінь", template: "%s | Stone Memory" },
}

// Українську збираємо наперед, решту мов — за першим запитом; далі вони так
// само лежать у кеші як статика.
export function generateStaticParams() {
  return [{ lang: "uk" }]
}

export default async function StoneLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  // [lang] підставляє rewrite з cookie `sm-locale` (next.config.mjs), тож
  // контент із бази віддається одразу мовою відвідувача, а сторінки лишаються
  // статичними. Вкладений LanguageProvider дає клієнтським компонентам ту саму
  // мову вже під час гідратації.
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = setRequestLocale(lang)
  const contacts = await getContacts(locale)
  return (
    <LanguageProvider initialLocale={locale}>
      <Header contacts={contacts} />
      {children}
      <Footer contacts={contacts} />
    </LanguageProvider>
  )
}
