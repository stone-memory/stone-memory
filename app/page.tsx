import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { HomeDirections } from "@/components/home-directions"
import { HomeStoneLibrary } from "@/components/home-stone-library"
import { HomeAbout } from "@/components/home-about"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { fetchStones } from "@/lib/data-source"
import { getCollections } from "@/lib/stone/cms"

export const revalidate = 60

/**
 * Головна — про майстерню й камінь, а не про товар.
 *
 * Дві двері (пам'ятники / архітектурний камінь), спільна бібліотека каменю,
 * хто ми і як працюємо. Усе, що стосується лише пам'ятників — підбірки з
 * цінами, процес, міста, відгуки, FAQ — переїхало в хаб /pamyatnyky; розділ
 * архітектурного каменю має свій хаб /arkhitekturnyi-kamin.
 */
export default async function Home() {
  const [stones, collections] = await Promise.all([fetchStones(), getCollections()])

  return (
    <>
      <Header />
      <main id="main-content" className="relative">
        <Hero />
        <HomeDirections stones={stones} />
        <HomeStoneLibrary collections={collections} />
        <HomeAbout />
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
