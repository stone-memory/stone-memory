import type { Metadata } from "next"
import { getContacts } from "@/lib/stone/cms"
import { Footer, Header } from "@/components/stone/site/shell"

/**
 * Оболонка розділу «Архітектурний камінь» (/kamin): власні шапка й підвал з
 * навігацією по виробах, матеріалах і B2B. Плаваючі кнопки дзвінка та чату
 * малює загальний PublicChrome із кореневого layout — другий комплект тут не
 * потрібен.
 */
export const metadata: Metadata = {
  title: { default: "Архітектурний камінь", template: "%s | Stone Memory" },
}

export default async function StoneLayout({ children }: { children: React.ReactNode }) {
  const contacts = await getContacts()
  return (
    <>
      <Header contacts={contacts} />
      {children}
      <Footer contacts={contacts} />
    </>
  )
}
