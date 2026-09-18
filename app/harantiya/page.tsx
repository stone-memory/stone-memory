import type { Metadata } from "next"
import { WarrantyContent } from "@/components/info/warranty-content"
import { WARRANTY_YEARS } from "@/lib/site-facts"
import { absoluteUrl } from "@/lib/site-config"

const PATH = "/harantiya"

export const metadata: Metadata = {
  title: `Гарантія ${WARRANTY_YEARS} років на пам'ятник, фундамент і монтаж`,
  description:
    "Що покриває гарантія на пам'ятник: камінь, гравіювання, фундамент, монтаж. Що робимо безкоштовно, що за прайсом, як звернутись. Чому 5 чесних років кращі за 30 паперових.",
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    title: `Гарантія ${WARRANTY_YEARS} років — Stone Memory`,
    description: "На камінь, гравіювання, фундамент і монтаж. Приїжджаємо й виправляємо безкоштовно.",
    url: absoluteUrl(PATH),
    type: "article",
    images: ["/opengraph-image"],
  },
}

/** Тексти — у lib/i18n/copy/pages/warranty.ts, рендер за мовою — WarrantyContent. */
export default function WarrantyPage() {
  return <WarrantyContent />
}
