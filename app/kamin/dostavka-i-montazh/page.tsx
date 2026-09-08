import { pageMetadata } from '@/lib/stone/seo'
import { SupportPage } from '@/components/stone/pages/support-page'

export const metadata = pageMetadata('/kamin/dostavka-i-montazh', { title: 'Доставка та монтаж каменю' })
export default function Page() {
  return <SupportPage slug="dostavka-i-montazh" />
}
