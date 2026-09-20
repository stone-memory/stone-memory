import { withLocale } from '@/lib/i18n/with-locale'
import { pageMetadata } from '@/lib/stone/seo'
import { SupportPage } from '@/components/stone/pages/support-page'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/dohliad', { title: 'Догляд за натуральним каменем' })
function Page() {
  return <SupportPage slug="dohliad" />
}
export default withLocale(Page)
