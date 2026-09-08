"use client"

import { StilnytsiCollectionPage } from "@/components/admin/stilnytsi/collection-page"
import { articleFields } from "@/lib/stilnytsi/schemas"

export default function StilnytsiBlogPage() {
  const today = new Date().toISOString().slice(0, 10)
  return (
    <StilnytsiCollectionPage
      resource="stilnytsi-articles"
      idKey="slug"
      title="Стільниці · Блог"
      description="Статті журналу сайту стільниць. Розділи, таблиця та FAQ рендеряться на сторінці статті; FAQ додатково йде в розмітку для Google."
      fields={articleFields}
      folder="stilnytsi-blog"
      searchKeys={["title", "h1"]}
      summary={(d) => ({
        title: String(d.title ?? ""),
        subtitle: `${d.category ?? ""} · оновлено ${d.dateModified ?? "—"}`,
        image: typeof d.image === "string" && d.image ? d.image : undefined,
      })}
      blank={() => ({
        slug: "", title: "", h1: "", description: "", dek: "", category: "Матеріали",
        readingTime: "6 хв читання", datePublished: today, dateModified: today,
        intro: "", sections: [{ heading: "", body: "" }],
        table: { headers: ["Критерій", "Варіант", "Що врахувати"], rows: [] },
        faq: [], related: ["/kalkulyator"], materials: [], categories: [],
      })}
    />
  )
}
