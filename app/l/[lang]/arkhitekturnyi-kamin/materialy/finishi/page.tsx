import { withLocale } from '@/lib/i18n/with-locale'
import { pageMetadata } from '@/lib/stone/seo'
import { FinishPage } from '@/components/stone/pages/material-tech'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/materialy/finishi', { title: 'Фініші натурального каменю' })
function Page() {
  return <FinishPage />
}
export default withLocale(Page)
