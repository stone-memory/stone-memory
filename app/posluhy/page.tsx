import { fetchServices } from "@/lib/data-source"
import { ServicesPageClient } from "@/components/services-page-client"

export const revalidate = 60

export default async function ServicesPage() {
  const services = await fetchServices()
  return <ServicesPageClient initialServices={services} />
}
