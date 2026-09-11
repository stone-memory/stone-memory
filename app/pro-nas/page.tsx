import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { AboutSection } from "@/components/about-section"
import { AboutDetails } from "@/components/about-details"
import { fetchSingleton, fetchStones } from "@/lib/data-source"
import type { AboutOverrides } from "@/lib/store/about"

export const revalidate = 60

export default async function AboutPage() {
  const [stones, aboutOverrides] = await Promise.all([
    fetchStones(),
    fetchSingleton<AboutOverrides>("about_overrides"),
  ])
  const modelCount = stones.filter((s) => s.category === "memorial").length
  return (
    <>
      <Header />
      <main id="main-content">
        <AboutSection initialOverrides={aboutOverrides} />
        <AboutDetails modelCount={modelCount} />
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
