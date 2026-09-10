"use client"

import { create } from "zustand"

/**
 * Модалка «Отримати розрахунок / Написати майстру».
 *
 * Окремо від кошика (lib/store/selection.ts): кошик потребує вибраних моделей,
 * а ця форма — навпаки, для тих, хто моделі не має, зате має фото ділянки,
 * ескіз або питання. `topic` — з якого блоку відкрили, щоб менеджер бачив
 * контекст («Не знайшли свою модель?», «Лишилось питання?» тощо).
 */
interface ConsultState {
  isOpen: boolean
  title: string
  topic: string | null
}

interface ConsultActions {
  open: (opts?: { title?: string; topic?: string | null }) => void
  close: () => void
}

export const DEFAULT_CONSULT_TITLE = "Отримати розрахунок"

export const useConsultStore = create<ConsultState & ConsultActions>()((set) => ({
  isOpen: false,
  title: DEFAULT_CONSULT_TITLE,
  topic: null,
  open: (opts) =>
    set({
      isOpen: true,
      title: opts?.title?.trim() || DEFAULT_CONSULT_TITLE,
      topic: opts?.topic?.trim() || null,
    }),
  close: () => set({ isOpen: false }),
}))
