"use client"

import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { CatalogGrid } from "@/components/catalog-grid"

export default function CatalogPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Suspense fallback={null}>
          <CatalogGrid />
        </Suspense>
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
