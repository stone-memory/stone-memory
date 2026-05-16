import { revalidatePath } from "next/cache"

// Maps an admin-editable content resource to the public routes whose ISR
// cache must be purged when that content changes. Dynamic routes use the
// "page" type so every generated instance is refreshed.
const RESOURCE_PATHS: Record<string, Array<[string, "page" | "layout"]>> = {
  stones: [
    ["/", "page"],
    ["/catalog", "page"],
    ["/stones/[id]", "page"],
  ],
  services: [["/services", "page"]],
  projects: [["/projects", "page"]],
  articles: [
    ["/blog", "page"],
    ["/blog/[slug]", "page"],
  ],
  reviews: [
    ["/", "page"],
    ["/reviews", "page"],
  ],
  "faq-items": [["/", "page"]],
  // featured stones aren't a generic resource — handled via the literal key below
  featured: [
    ["/", "page"],
    ["/catalog", "page"],
  ],
}

// Purge ISR cache for the public pages affected by a content change, plus the
// sitemap. Best-effort: never throws, so an admin write is never broken by a
// revalidation hiccup (e.g. running outside a request scope).
export function revalidateForResource(resource: string): void {
  const paths = RESOURCE_PATHS[resource]
  if (!paths) return // CRM-internal resources (tasks/transactions/…) have no public page
  try {
    for (const [path, type] of paths) revalidatePath(path, type)
    revalidatePath("/sitemap.xml")
  } catch {
    // ignore — revalidation is an optimisation, not a correctness requirement
  }
}
