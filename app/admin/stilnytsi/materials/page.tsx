"use client"

import { StilnytsiCollectionPage } from "@/components/admin/stilnytsi/collection-page"
import { materialFields } from "@/lib/stilnytsi/schemas"

export default function StilnytsiMaterialsPage() {
  return (
    <StilnytsiCollectionPage
      resource="stilnytsi-materials"
      idKey="slug"
      title="Стільниці · Матеріали й ціни"
      description="Колекції каменю на сайті стільниць: опис, фото, застосування та ціна «від». Ціна 0 показується як «ціна за запитом». Зміни на сайті — за секунду після збереження."
      fields={materialFields}
      folder="stilnytsi-materials"
      summary={(d) => {
        const p = (d.price as { value?: number; unit?: string; currency?: string } | undefined) ?? {}
        return {
          title: String(d.name ?? ""),
          subtitle: `${d.family ?? ""}${p.value ? ` · від ${p.value} ${p.currency}/${p.unit}` : " · ціна за запитом"}`,
          image: typeof d.cardImage === "string" ? d.cardImage : undefined,
        }
      }}
      blank={() => ({
        slug: "", name: "", family: "Граніт", material: "granit", origin: "", tone: "",
        finishes: ["полірований"], thicknesses: [20, 30], applications: ["стільниці"],
        description: "", care: "", image: "", cardImage: "",
        relatedArticles: [], relatedCategories: ["stilnytsi"],
        price: { value: 0, unit: "м²", currency: "грн" },
      })}
    />
  )
}
