import { pageMetadata } from '@/lib/stone/seo'
import { FaqHub } from '@/components/stone/pages/faq-hub'

export const metadata = pageMetadata('/kamin/faq', { title: 'FAQ про камінь і монтаж' })
export default function Page() {
  return <FaqHub />
}
