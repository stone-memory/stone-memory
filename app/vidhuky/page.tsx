import { fetchReviews } from "@/lib/data-source"
import type { Review } from "@/lib/store/reviews"
import { ReviewsPageClient } from "@/components/reviews-page-client"

export const revalidate = 60

export default async function ReviewsPage() {
  const rows = await fetchReviews("all")
  // fetchReviews returns storage rows; the payload under `data` is the Review
  // the UI renders, mirroring what the client store does after hydration.
  const reviews = rows
    .map((r) => r.data as Review)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))

  return <ReviewsPageClient initialReviews={reviews} />
}
