import { pageMetadata } from '@/lib/stone/seo'
import { SupportPage } from '@/components/stone/pages/support-page'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/harantiya', { title: 'Гарантія на вироби з каменю' })
export default function Page() {
  return <SupportPage slug="harantiya" />
}
