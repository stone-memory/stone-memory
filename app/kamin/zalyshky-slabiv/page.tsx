import { pageMetadata } from '@/lib/stone/seo'
import { RemnantsPage } from '@/components/stone/pages/material-tech'

export const metadata = pageMetadata('/kamin/zalyshky-slabiv', { title: 'Залишки кам’яних слябів' })
export default function Page() {
  return <RemnantsPage />
}
