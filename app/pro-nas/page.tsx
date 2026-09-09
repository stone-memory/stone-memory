import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { AboutSection } from "@/components/about-section"
import { AboutDetails } from "@/components/about-details"
import { fetchStones } from "@/lib/data-source"

export const revalidate = 60

export default async function AboutPage() {
  const stones = await fetchStones()
  const modelCount = stones.filter((s) => s.category === "memorial").length
  return (
    <>
      <Header />
      <main id="main-content">
        <AboutSection />
        <AboutDetails modelCount={modelCount} />
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
