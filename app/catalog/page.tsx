"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { CatalogGrid } from "@/components/catalog-grid"

export default function CatalogPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <CatalogGrid />
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
