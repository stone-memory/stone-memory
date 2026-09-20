import { withLocale } from '@/lib/i18n/with-locale'
import { pageMetadata } from '@/lib/stone/seo'
import { SupportPage } from '@/components/stone/pages/support-page'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/harantiya', { title: 'Гарантія на вироби з каменю' })
function Page() {
  return <SupportPage slug="harantiya" />
}
export default withLocale(Page)
