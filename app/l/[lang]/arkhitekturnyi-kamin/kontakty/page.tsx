import { withLocale } from '@/lib/i18n/with-locale'
import { pageMetadata } from '@/lib/stone/seo'
import { ContactPage } from '@/components/stone/pages/contact-page'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/kontakty', { title: 'Контакти' })
function Page() {
  return <ContactPage />
}
export default withLocale(Page)
