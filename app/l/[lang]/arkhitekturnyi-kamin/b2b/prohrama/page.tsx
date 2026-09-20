import { withLocale } from '@/lib/i18n/with-locale'
import { pageMetadata } from '@/lib/stone/seo'
import { TradeProgram } from '@/components/stone/pages/professional'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/b2b/prohrama', {
  title: 'Trade-програма Stone Memory',
  image: '/detail-stone-edge.webp',
})
function Page() {
  return <TradeProgram />
}
export default withLocale(Page)
