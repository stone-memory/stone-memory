"use client"

import dynamic from "next/dynamic"

/**
 * Панель підбору довантажується окремим чанком і без SSR.
 *
 * Вона закрита при завантаженні й нічого не малює, доки користувач її не
 * відкриє, але тягне Radix Sheet/ScrollArea, форму замовлення й аналітику —
 * усе це входило в перший пакет скриптів кожної публічної сторінки і на
 * мобільному змагалось за канал із LCP-зображенням. Сама реалізація — у
 * selection-sidebar-panel.tsx; місця підключення лишились як були.
 */
const SelectionSidebarPanel = dynamic(
  () => import("@/components/selection-sidebar-panel").then((m) => m.SelectionSidebar),
  { ssr: false },
)

export function SelectionSidebar() {
  return <SelectionSidebarPanel />
}
