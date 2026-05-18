import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { guardTeamMember } from "@/lib/auth/permissions"

export const dynamic = "force-dynamic"

/**
 * Один ендпоінт що повертає всі лічильники для бейджів у sidebar.
 *
 * Стратегія:
 *   - inbox        — communications де read_at IS NULL AND direction='inbound'
 *   - chat         — chat_sessions де останнє повідомлення user-а нове за operator-ське
 *   - reminders    — reminders pending з due_at <= now (overdue/now)
 *   - orders       — orders зі status='new'
 *   - deals        — deals зі status='new'
 *
 * Кешу немає — викликається 1 раз на 30с з sidebar.
 */
export async function GET(req: Request) {
  const unauth = await guardTeamMember(req)
  if (unauth) return unauth

  const now = new Date().toISOString()

  // Виконуємо паралельно
  const [inboxR, remindersR, ordersR, dealsR, chatSessionsR, chatMessagesR] = await Promise.all([
    // 1. Unread communications
    supabaseAdmin
      .from("communications")
      .select("id", { count: "exact", head: true })
      .is("read_at", null)
      .eq("direction", "inbound"),

    // 2. Overdue/due reminders
    supabaseAdmin
      .from("reminders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .lte("due_at", now),

    // 3. New orders
    supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),

    // 4. New deals
    supabaseAdmin
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),

    // 5. Active chat sessions (за останні 24 год)
    supabaseAdmin
      .from("chat_sessions")
      .select("id, last_activity_at")
      .gte("last_activity_at", new Date(Date.now() - 24 * 3600_000).toISOString())
      .order("last_activity_at", { ascending: false })
      .limit(50),

    // 6. Останні chat_messages для тих сесій — щоб порахувати скільки чекають відповіді
    supabaseAdmin
      .from("chat_messages")
      .select("session_id, from_role, created_at")
      .gte("created_at", new Date(Date.now() - 24 * 3600_000).toISOString())
      .order("created_at", { ascending: false })
      .limit(500),
  ])

  // Обчислимо chat unread: сесії, у яких останнє повідомлення user, без відповіді operator після
  const lastByRole = new Map<string, { user?: number; operator?: number }>()
  for (const m of chatMessagesR.data || []) {
    const sid = m.session_id as string
    const role = m.from_role as "user" | "operator"
    const t = new Date(m.created_at as string).getTime()
    const cur = lastByRole.get(sid) || {}
    if (role === "user") cur.user = Math.max(cur.user || 0, t)
    else if (role === "operator") cur.operator = Math.max(cur.operator || 0, t)
    lastByRole.set(sid, cur)
  }

  let chatUnread = 0
  for (const [, times] of lastByRole) {
    if (times.user && (!times.operator || times.user > times.operator)) chatUnread++
  }

  return NextResponse.json({
    counts: {
      inbox: inboxR.count || 0,
      reminders: remindersR.count || 0,
      orders: ordersR.count || 0,
      deals: dealsR.count || 0,
      chat: chatUnread,
    },
    activeChatSessions: chatSessionsR.data?.length || 0,
    timestamp: now,
  })
}
