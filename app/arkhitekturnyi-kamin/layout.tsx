import type { Metadata } from "next"
import { getContacts } from "@/lib/stone/cms"
import { Footer, Header } from "@/components/stone/site/shell"
import { LanguageProvider } from "@/lib/i18n/context"
import { getServerLocale } from "@/lib/i18n/server"

/**
 * Оболонка розділу «Архітектурний камінь» (/arkhitekturnyi-kamin): власні шапка й підвал з
 * навігацією по виробах, матеріалах і B2B. Плаваючі кнопки дзвінка та чату
 * малює загальний PublicChrome із кореневого layout — другий комплект тут не
 * потрібен.
 */
export const metadata: Metadata = {
  title: { default: "Архітектурний камінь", template: "%s | Stone Memory" },
}

export default async function StoneLayout({ children }: { children: React.ReactNode }) {
  // Мова з cookie робить розділ динамічним (SSR на запит), зате весь контент
  // із бази віддається одразу мовою відвідувача. Вкладений LanguageProvider
  // дає клієнтським компонентам ту саму мову вже під час гідратації.
  const locale = await getServerLocale()
  const contacts = await getContacts(locale)
  return (
    <LanguageProvider initialLocale={locale}>
      <Header contacts={contacts} />
      {children}
      <Footer contacts={contacts} />
    </LanguageProvider>
  )
}
