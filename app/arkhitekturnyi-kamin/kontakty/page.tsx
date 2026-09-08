import { pageMetadata } from '@/lib/stone/seo'
import { ContactPage } from '@/components/stone/pages/contact-page'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/kontakty', { title: 'Контакти' })
export default function Page() {
  return <ContactPage />
}
