import { fetchServices } from "@/lib/data-source"
import { ServicesPageClient } from "@/components/services-page-client"
import { ServicesDetails } from "@/components/services-details"

export const revalidate = 60

export default async function ServicesPage() {
  const services = await fetchServices()
  return <ServicesPageClient initialServices={services} details={<ServicesDetails />} />
}
