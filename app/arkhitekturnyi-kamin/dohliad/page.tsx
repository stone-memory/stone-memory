import { pageMetadata } from '@/lib/stone/seo'
import { SupportPage } from '@/components/stone/pages/support-page'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/dohliad', { title: 'Догляд за натуральним каменем' })
export default function Page() {
  return <SupportPage slug="dohliad" />
}
