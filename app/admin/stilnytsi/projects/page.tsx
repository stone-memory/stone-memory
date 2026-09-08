"use client"

import { StilnytsiCollectionPage } from "@/components/admin/stilnytsi/collection-page"
import { projectFields } from "@/lib/stilnytsi/schemas"

export default function StilnytsiProjectsPage() {
  return (
    <StilnytsiCollectionPage
      resource="stilnytsi-projects"
      idKey="slug"
      title="Стільниці · Проєкти"
      description="Проєктні пропозиції та реалізовані роботи на сайті стільниць. Порядок у списку = порядок на сайті."
      fields={projectFields}
      folder="stilnytsi-projects"
      summary={(d) => ({
        title: String(d.name ?? ""),
        subtitle: [d.type, d.location, d.material].filter(Boolean).join(" · "),
        image: typeof d.image === "string" ? d.image : undefined,
      })}
      blank={() => ({
        slug: "", name: "", type: "Стільниця", location: "", material: "", materialSlug: "",
        story: "", solution: "", image: "", gallery: [], alt: "",
      })}
    />
  )
}
