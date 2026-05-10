"use client"

import { useEffect, useState } from "react"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type Role = "admin" | "manager"

export type PermissionKey =
  | "orders"
  | "messages"
  | "chat"
  | "chatSettings"
  | "finances"
  | "products"
  | "projects"
  | "reviews"
  | "featured"
  | "blog"
  | "about"
  | "faq"
  | "services"
  | "analytics"
  | "tasks"
  | "business"
  | "settings"

export const ALL_PERMISSIONS: PermissionKey[] = [
  "orders",
  "messages",
  "chat",
  "chatSettings",
  "finances",
  "products",
  "projects",
  "reviews",
  "featured",
  "blog",
  "about",
  "faq",
  "services",
  "analytics",
  "tasks",
  "business",
  "settings",
]

export const MANAGER_DEFAULT_PERMISSIONS: PermissionKey[] = [
  "orders",
  "messages",
  "chat",
  "products",
  "projects",
  "reviews",
  "tasks",
]

interface AdminRoleState {
  role: Role
  managerPermissions: PermissionKey[]
  hasHydrated: boolean
  setRole: (r: Role) => void
  toggleManagerPermission: (k: PermissionKey) => void
  setManagerPermissions: (ks: PermissionKey[]) => void
  setHasHydrated: (v: boolean) => void
}

export const useAdminRoleStore = create<AdminRoleState>()(
  persist(
    (set) => ({
      role: "admin",
      managerPermissions: MANAGER_DEFAULT_PERMISSIONS,
      hasHydrated: false,
      setRole: (r) => set({ role: r }),
      toggleManagerPermission: (k) =>
        set((s) => ({
          managerPermissions: s.managerPermissions.includes(k)
            ? s.managerPermissions.filter((x) => x !== k)
            : [...s.managerPermissions, k],
        })),
      setManagerPermissions: (ks) => set({ managerPermissions: ks }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "sm-admin-role",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ role: s.role, managerPermissions: s.managerPermissions }),
      onRehydrateStorage: () => (s) => s?.setHasHydrated(true),
    }
  )
)

export function useCanAccess(permission: PermissionKey): boolean {
  const role = useAdminRoleStore((s) => s.role)
  const perms = useAdminRoleStore((s) => s.managerPermissions)
  const hasHydrated = useAdminRoleStore((s) => s.hasHydrated)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || !hasHydrated) return true
  if (role === "admin") return true
  return perms.includes(permission)
}
