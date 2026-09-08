import { pageMetadata } from '@/lib/stone/seo'
import { EdgePage } from '@/components/stone/pages/material-tech'

// /vyroby/stilnytsi сам рендериться динамічним app/vyroby/[category]; тут лише глибший шлях.
export const metadata = pageMetadata('/kamin/vyroby/stilnytsi/kraya', {
  title: 'Профілі країв стільниць',
})
export default function Page() {
  return <EdgePage />
}
