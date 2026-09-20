import { withLocale } from '@/lib/i18n/with-locale'
import { pageMetadata } from '@/lib/stone/seo'
import { EdgePage } from '@/components/stone/pages/material-tech'

// /vyroby/stilnytsi сам рендериться динамічним app/vyroby/[category]; тут лише глибший шлях.
export const metadata = pageMetadata('/arkhitekturnyi-kamin/vyroby/stilnytsi/kraya', {
  title: 'Профілі країв стільниць',
})
function Page() {
  return <EdgePage />
}
export default withLocale(Page)
