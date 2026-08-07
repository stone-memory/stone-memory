import type { Metadata } from "next"
import { AdminShell } from "@/components/admin/admin-shell"

/**
 * Server component purely so this route group can declare metadata — the
 * interactive shell lives in <AdminShell/>.
 *
 * robots.txt already disallows /admin, but that only asks crawlers not to
 * fetch; a URL discovered elsewhere (a shared link, a referrer) can still be
 * indexed URL-only. `noindex` is the directive that actually keeps the CRM out
 * of the index, and `nofollow` stops link equity leaking into it.
 */
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
