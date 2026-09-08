"use client"

import { useState } from "react"
import { StilnytsiCollectionPage } from "@/components/admin/stilnytsi/collection-page"
import { remnantFields, slabFields } from "@/lib/stilnytsi/schemas"
import { cn } from "@/lib/utils"

export default function StilnytsiSlabsPage() {
  const [tab, setTab] = useState<"slabs" | "remnants">("slabs")
  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-full bg-foreground/5 p-1 w-fit">
        {(
          [
            ["slabs", "Сляби"],
            ["remnants", "Залишки"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              tab === key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "slabs" ? (
        <StilnytsiCollectionPage
          key="slabs"
          resource="stilnytsi-slabs"
          idKey="id"
          title="Стільниці · Сляби в наявності"
          description="Реальний склад цілих плит для сторінки /b2b/slyaby. Сховайте позицію, коли сляб продано; видаляйте лише помилкові записи."
          fields={slabFields}
          folder="stilnytsi-slabs"
          searchKeys={["collection", "lot"]}
          summary={(d) => ({
            title: `${d.collection ?? ""} · ${d.status ?? ""}`,
            subtitle: `${Array.isArray(d.dimensions) ? d.dimensions.join("×") + " см" : ""} · ${d.thickness ?? ""} мм · ${d.finish ?? ""} · ${d.price ?? 0} грн`,
            image: typeof d.image === "string" ? d.image : undefined,
          })}
          blank={() => ({
            id: "", collection: "", collectionSlug: "", material: "granit", tone: "",
            dimensions: [300, 150], thickness: 20, finish: "Полірований", lot: "", origin: "Україна",
            status: "В наявності", quantity: 1, price: 0,
            availability: "Доступний до резерву",
            uniqueness: "Фактична плита має унікальний рисунок, тон і мінеральні включення.",
            image: "", alt: "",
          })}
        />
      ) : (
        <StilnytsiCollectionPage
          key="remnants"
          resource="stilnytsi-remnants"
          idKey="id"
          title="Стільниці · Залишки слябів"
          description="Фрагменти після розкрою для сторінки /zalyshky-slabiv: підвіконня, столики, полиці."
          fields={remnantFields}
          folder="stilnytsi-remnants"
          summary={(d) => ({
            title: String(d.name ?? ""),
            subtitle: [d.size, d.thickness, d.finish, d.price, d.status].filter(Boolean).join(" · "),
            image: typeof d.image === "string" ? d.image : undefined,
          })}
          blank={() => ({ id: "", name: "", size: "", thickness: "20 мм", finish: "Полірований", price: "", status: "Доступний", image: "" })}
        />
      )}
    </div>
  )
}
