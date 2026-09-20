import { withLocale } from '@/lib/i18n/with-locale'
import { pageMetadata } from '@/lib/stone/seo'
import { FaqHub } from '@/components/stone/pages/faq-hub'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/faq', { title: 'FAQ про камінь і монтаж' })
function Page() {
  return <FaqHub />
}
export default withLocale(Page)
