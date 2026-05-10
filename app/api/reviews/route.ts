import { NextResponse } from "next/server"

export const revalidate = 3600

type ReviewItem = {
  name: string
  date: string
  rating: number
  text: string
  source?: "google" | "local"
  photo?: string | null
}

type GooglePlacesReview = {
  rating?: number
  text?: { text?: string }
  originalText?: { text?: string }
  authorAttribution?: {
    displayName?: string
    photoUri?: string
  }
  publishTime?: string
}

function formatDate(iso: string): string {
  if (!iso) return ""
  try {
    const d = new Date(iso)
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const yyyy = d.getFullYear()
    return `${dd}.${mm}.${yyyy}`
  } catch {
    return iso
  }
}

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID

  if (!apiKey || !placeId) {
    return NextResponse.json({ reviews: [], source: "none" }, { status: 200 })
  }

  try {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=uk`
    const res = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "reviews,rating,userRatingCount",
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { reviews: [], source: "google-error", status: res.status },
        { status: 200 }
      )
    }

    const data = (await res.json()) as {
      reviews?: GooglePlacesReview[]
      rating?: number
      userRatingCount?: number
    }

    const reviews: ReviewItem[] = (data.reviews || [])
      .filter((r) => (r.text?.text || r.originalText?.text))
      .map((r) => ({
        name: r.authorAttribution?.displayName || "Google user",
        rating: Math.max(1, Math.min(5, Math.round(r.rating || 5))),
        text: (r.text?.text || r.originalText?.text || "").trim(),
        date: formatDate(r.publishTime || ""),
        source: "google",
        photo: r.authorAttribution?.photoUri || null,
      }))

    return NextResponse.json(
      {
        reviews,
        rating: data.rating,
        totalCount: data.userRatingCount,
        source: "google",
      },
      { status: 200 }
    )
  } catch {
    return NextResponse.json({ reviews: [], source: "google-error" }, { status: 200 })
  }
}
