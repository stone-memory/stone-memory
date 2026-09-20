import { withLocale } from '@/lib/i18n/with-locale'
import { pageMetadata } from '@/lib/stone/seo'
import { ThicknessPage } from '@/components/stone/pages/material-tech'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/materialy/tovshchyny', { title: 'Товщини кам’яних плит' })
function Page() {
  return <ThicknessPage />
}
export default withLocale(Page)
