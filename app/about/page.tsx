"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { AboutSection } from "@/components/about-section"

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <AboutSection />
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
