import { pageMetadata } from '@/lib/stone/seo'
import { TradeProgram } from '@/components/stone/pages/professional'

export const metadata = pageMetadata('/kamin/b2b/prohrama', {
  title: 'Trade-програма Stone Memory',
  image: '/detail-stone-edge.webp',
})
export default function Page() {
  return <TradeProgram />
}
