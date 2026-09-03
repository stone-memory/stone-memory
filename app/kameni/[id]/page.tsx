import { notFound, permanentRedirect } from "next/navigation"
import { fetchStoneById } from "@/lib/data-source"
import { stonePath } from "@/lib/catalog-taxonomy"

export const revalidate = 60

/**
 * Legacy product URL — kept permanently as a redirect.
 *
 * These 60 URLs are the ones currently indexed and ranking, so they 308 to
 * the new keyword-bearing path rather than 404ing. The mapping cannot live in
 * next.config.mjs because it is data-dependent: the row id and the public code
 * have drifted apart in production (row id 3 carries code "002"), so the
 * destination has to be resolved from the record.
 */
export default async function LegacyStonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const stone = await fetchStoneById(id)
  if (!stone) notFound()
  permanentRedirect(stonePath(stone))
}
