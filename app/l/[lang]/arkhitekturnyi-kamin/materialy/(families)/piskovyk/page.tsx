import { withLocale } from '@/lib/i18n/with-locale'
import { pageMetadata } from '@/lib/stone/seo'
import { families } from '@/data/stone/families'
import { FamilyHub } from '@/components/stone/pages/family-hub'

// Статичний сегмент навмисно: він має пріоритет над app/materialy/[collection].
export const metadata = pageMetadata('/arkhitekturnyi-kamin/materialy/piskovyk', { title: families.piskovyk })
function Page() {
  return <FamilyHub family="piskovyk" />
}
export default withLocale(Page)
