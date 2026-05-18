import { NextResponse } from "next/server"
import { fetchNBURates } from "@/lib/fx"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const rates = await fetchNBURates()
  return NextResponse.json(rates, {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  })
}
