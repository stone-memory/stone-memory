import { withLocale } from '@/lib/i18n/with-locale'
import { pageMetadata } from '@/lib/stone/seo'
import { RemnantsPage } from '@/components/stone/pages/material-tech'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/zalyshky-slabiv', { title: 'Залишки кам’яних слябів' })
function Page() {
  return <RemnantsPage />
}
export default withLocale(Page)
