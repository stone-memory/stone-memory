import { NextResponse } from "next/server"
import { listSessions } from "@/lib/chat-store"
import { guardCapability } from "@/lib/auth/permissions"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const unauthorized = await guardCapability(req, "customers.message")
  if (unauthorized) return unauthorized
  const sessions = await listSessions()
  return NextResponse.json({ sessions })
}
