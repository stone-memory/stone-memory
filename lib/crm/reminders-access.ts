import "server-only"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCurrentCapabilities } from "@/lib/auth/permissions"

/**
 * Хто працює з задачами/нагадуваннями і що йому видно.
 *
 * Розділ «Задачі» спільний для всієї команди (замінив окремі «Особисті
 * задачі» + «Нагадування»), тому правило видимості одне для API списку,
 * лічильника в бічній панелі та дій над записом:
 *   - з правом deals.view_all видно все, за замовчуванням — свої;
 *   - без нього — лише свої (призначені мені або створені мною).
 */
export type ReminderActor = {
  userId: string
  /** team_members.id; null лише для owner-email без рядка в team_members. */
  memberId: string | null
  seesAll: boolean
}

export async function resolveReminderActor(req: Request): Promise<ReminderActor | NextResponse> {
  const res = await getCurrentCapabilities(req)
  if (res instanceof NextResponse) return res
  if (!res.user.role || !res.user.active) {
    return NextResponse.json(
      { error: "forbidden", reason: "no_active_team_membership" },
      { status: 403 }
    )
  }
  const { data: tm } = await supabaseAdmin
    .from("team_members")
    .select("id")
    .eq("user_id", res.user.user_id)
    .maybeSingle()
  return {
    userId: res.user.user_id,
    memberId: tm?.id ?? null,
    seesAll: res.capabilities.includes("deals.view_all"),
  }
}

/** PostgREST-фільтр «мої записи» для .or(). */
export function ownFilter(memberId: string): string {
  return `assigned_to.eq.${memberId},created_by.eq.${memberId}`
}

export function isOwn(
  actor: ReminderActor,
  row: { assigned_to: string | null; created_by: string | null }
): boolean {
  if (actor.seesAll) return true
  if (!actor.memberId) return false
  return row.assigned_to === actor.memberId || row.created_by === actor.memberId
}

/** Відкриті = не виконані і не скасовані; snoozed лишився від старих записів. */
export const OPEN_STATUSES = ["pending", "sent", "snoozed"] as const
