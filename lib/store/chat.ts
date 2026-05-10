"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type ChatMessage = {
  id: string
  role: "user" | "operator"
  text: string
  at: number
  pending?: boolean
  failed?: boolean
}

export type ChatStage = "need-name" | "need-phone" | "ready"

interface ChatState {
  isOpen: boolean
  sessionId: string | null
  userName: string
  userPhone: string
  stage: ChatStage
  messages: ChatMessage[]
  fallbackSent: boolean
  hasHydrated: boolean
  open: () => void
  close: () => void
  toggle: () => void
  setUserName: (v: string) => void
  setUserPhone: (v: string) => void
  setStage: (s: ChatStage) => void
  addMessage: (m: Omit<ChatMessage, "id" | "at"> & { id?: string; at?: number }) => ChatMessage
  markSent: (id: string) => void
  markFailed: (id: string) => void
  markFallbackSent: () => void
  clear: () => void
  setHasHydrated: (v: boolean) => void
}

function makeId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function makeSessionId() {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// Persisted to sessionStorage: state survives page reloads within the same
// tab, but is cleared when the tab is closed. Matches the "each new visit
// starts a fresh conversation" requirement while preserving context on
// accidental F5 mid-chat.
export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isOpen: false,
      sessionId: null,
      userName: "",
      userPhone: "",
      stage: "need-name",
      messages: [],
      fallbackSent: false,
      hasHydrated: false,
      open: () =>
        set((state) => ({
          isOpen: true,
          sessionId: state.sessionId || makeSessionId(),
        })),
      close: () => set({ isOpen: false }),
      toggle: () =>
        set((state) => ({
          isOpen: !state.isOpen,
          sessionId: state.sessionId || (!state.isOpen ? makeSessionId() : null),
        })),
      setUserName: (v) => set({ userName: v }),
      setUserPhone: (v) => set({ userPhone: v }),
      setStage: (s) => set({ stage: s }),
      addMessage: (m) => {
        const msg: ChatMessage = {
          id: m.id || makeId(),
          at: m.at || Date.now(),
          role: m.role,
          text: m.text,
          pending: m.pending,
          failed: m.failed,
        }
        set((state) => ({ messages: [...state.messages, msg] }))
        return msg
      },
      markSent: (id) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, pending: false, failed: false } : m
          ),
        })),
      markFailed: (id) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, pending: false, failed: true } : m
          ),
        })),
      markFallbackSent: () => set({ fallbackSent: true }),
      clear: () =>
        set({
          messages: [],
          sessionId: null,
          stage: "need-name",
          userName: "",
          userPhone: "",
          fallbackSent: false,
        }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "sm-chat",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.sessionStorage : (undefined as unknown as Storage)
      ),
      partialize: (state) => ({
        sessionId: state.sessionId,
        userName: state.userName,
        userPhone: state.userPhone,
        stage: state.stage,
        messages: state.messages,
        fallbackSent: state.fallbackSent,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
