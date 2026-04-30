"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { StoneItem, Category } from "@/lib/types"

interface SelectionState {
  items: StoneItem[]
  category: Category
  isOpen: boolean
  orderSubmitted: boolean
  orderReference: string | null
}

interface SelectionActions {
  addItem: (item: StoneItem) => void
  removeItem: (id: string) => void
  clearAll: () => void
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
  setCategory: (category: Category) => void
  submitOrder: (reference: string) => void
  resetOrder: () => void
}

export const useSelectionStore = create<SelectionState & SelectionActions>()(
  persist(
    (set) => ({
      items: [],
      category: "memorial",
      isOpen: false,
      orderSubmitted: false,
      orderReference: null,

      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) {
            return state
          }
          return { items: [...state.items, item] }
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearAll: () => set({ items: [] }),

      toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),

      openSidebar: () => set({ isOpen: true }),

      closeSidebar: () => set({ isOpen: false }),

      setCategory: (category) => set({ category }),

      submitOrder: (reference) =>
        set({ orderSubmitted: true, orderReference: reference }),

      resetOrder: () =>
        set({ orderSubmitted: false, orderReference: null, items: [] }),
    }),
    {
      name: "stone-memory-selection",
      partialize: (state) => ({
        items: state.items,
        category: state.category,
      }),
    }
  )
)
