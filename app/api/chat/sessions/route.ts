import { NextResponse } from "next/server"
import { listSessions } from "@/lib/chat-store"
import { requireAdmin } from "@/lib/api-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized
  const sessions = await listSessions()
  return NextResponse.json({ sessions })
}
