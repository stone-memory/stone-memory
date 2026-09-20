import "server-only"
import type { ComponentType } from "react"
import { setRequestLocale } from "@/lib/i18n/server"

/**
 * Обгортка сторінок під app/l/[lang]/…: виставляє мову з адреси до того, як
 * відрендеряться серверні компоненти сторінки, що беруть її через
 * getServerLocale() / getStoneT().
 */
export function withLocale<P extends { params?: Promise<Record<string, string | string[]>> }>(
  Page: ComponentType<P>,
) {
  return async function LocalizedPage(props: P & { params: Promise<{ lang: string }> }) {
    setRequestLocale((await props.params).lang)
    return <Page {...props} />
  }
}
