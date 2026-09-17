export const NAV_SETTINGS_KEY = "nav_settings"
// Тег кешу fetchNavSettings (lib/data-source.ts); адмінка скидає його при
// збереженні через revalidateTag.
export const NAV_SETTINGS_TAG = "nav-settings"

export type NavSettings = {
  showProjects: boolean
}

export const DEFAULT_NAV_SETTINGS: NavSettings = {
  showProjects: false,
}
