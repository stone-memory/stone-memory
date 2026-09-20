import { withLocale } from '@/lib/i18n/with-locale'
import { pageMetadata } from '@/lib/stone/seo'
import { SupportPage } from '@/components/stone/pages/support-page'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/dostavka-i-montazh', { title: 'Доставка та монтаж каменю' })
function Page() {
  return <SupportPage slug="dostavka-i-montazh" />
}
export default withLocale(Page)
