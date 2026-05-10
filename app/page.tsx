"use client"

import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CategoriesSection } from "@/components/categories-section"
import { FeaturedStones } from "@/components/featured-stones"
import { ReviewsSection } from "@/components/reviews-section"
import { FaqSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { FaqJsonLd } from "@/components/jsonld-faq"

export default function Home() {
  return (
    <>
      <Header />
      <FaqJsonLd />
      <main id="main-content" className="relative">
        <Hero />
        <CategoriesSection />
        <FeaturedStones />
        <ReviewsSection />
        <FaqSection />
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
