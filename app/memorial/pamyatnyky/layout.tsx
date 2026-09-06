import type { Metadata } from "next"
import { absoluteUrl } from "@/lib/site-config"

const PATH = "/memorial/pamyatnyky"

export const revalidate = 60

// NO `title` here — deliberately. Any title on this layout breaks the brand
// suffix for the segments below it:
//   • a plain string consumes the root template and stops passing it down, so
//     /hranitni and /001 rendered with no " — Stone Memory" at all;
//   • a { default, template } pair gets BOTH this template and the root one
//     applied to the page that inherits `default`, giving "… — Stone Memory
//     — Stone Memory".
// With no title on this segment, the nearest template stays the root one and
// every descendant gets exactly one brand suffix. The page and the [slug]
// route each declare their own title.
export const metadata: Metadata = {
  description:
    "Каталог пам'ятників із граніту, габро й мармуру: одиночні, подвійні, комплекси, з хрестом. Гравіювання портрета, доставка й монтаж. Гарантія 5 років.",
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    title: "Каталог пам'ятників — Stone Memory",
    description:
      "Одиночні пам'ятники, меморіальні комплекси, військові стели. Український граніт, власне виробництво в Костополі.",
    url: absoluteUrl(PATH),
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: { card: "summary_large_image", title: "Каталог пам'ятників — Stone Memory" },
}

// BreadcrumbList та ItemList навмисно НЕ тут. Цей layout обгортає і [slug],
// тому кожна картка товару отримувала другий, обрізаний BreadcrumbList
// (Головна -> Каталог, без самого товару) і чужий ItemList усього каталогу.
// Обидва блоки живуть на ./page.tsx — там, де вони описують саме ту сторінку.
export default function MonumentsCatalogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
