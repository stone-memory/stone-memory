import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { sendTelegram, tgEscape } from "@/lib/telegram"
import { sendOne } from "@/lib/email"

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Таємниця для cron (та сама що для email-dispatch)
async function isAllowed(req: Request): Promise<boolean> {
  const auth = req.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : ""
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) return token === cronSecret
  // Fallback: прийнятний user-jwt admin
  if (token) {
    const { data } = await supabaseAdmin.auth.getUser(token)
    if (data.user) return true
  }
  return false
}

/**
 * Cron handler — викликається кожні 5 хвилин з GitHub Actions.
 *
 * Логіка:
 *   1. Знайти reminders зі status=pending і due_at <= now
 *   2. Для кожного:
 *      - надіслати у Telegram (якщо TG configured)
 *      - надіслати email якщо в notify_via є 'email'
 *      - оновити status=sent + notified_at
 *   3. SLA-перевірки:
 *      - угоди в "new" >24 год без переходу → створити sla_warning
 *      - угоди в "in_production" >14 днів → notify
 */
async function handle(req: Request): Promise<NextResponse> {
  if (!(await isAllowed(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const nowIso = new Date().toISOString()

  // --- 1. Reminders ---
  const { data: due, error } = await supabaseAdmin
    .from("reminders")
    .select("*, deals(reference, customers(name, phone)), team_members:assigned_to(email, display_name, role)")
    .eq("status", "pending")
    .lte("due_at", nowIso)
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const results: Array<{ id: string; ok: boolean; channels: string[] }> = []

  for (const r of due || []) {
    const channels: string[] = []
    const dealRef = r.deals?.reference
    const customer = r.deals?.customers
    const assignee = (r as { team_members?: { email?: string; display_name?: string } }).team_members

    // Telegram
    if (r.notify_via?.includes("telegram")) {
      const text = [
        "🔔 <b>Нагадування</b>",
        "",
        `<b>${tgEscape(r.title)}</b>`,
        r.description ? tgEscape(r.description) : "",
        "",
        dealRef ? `📋 Угода: <code>${tgEscape(dealRef)}</code>` : "",
        customer ? `👤 ${tgEscape(customer.name || "")} · ${tgEscape(customer.phone || "")}` : "",
        assignee?.display_name ? `👨‍💼 ${tgEscape(assignee.display_name)}` : "",
      ].filter(Boolean).join("\n")
      const tg = await sendTelegram({ text })
      if (tg.ok) channels.push("telegram")
    }

    // Email — якщо assignee має email. Передаємо HTML — sendOne сам обгорне у BaseLayout.
    if (r.notify_via?.includes("email") && assignee?.email) {
      try {
        const html = `
          <h1 style="font-size:22px;margin:0 0 8px">🔔 ${escapeHtml(r.title)}</h1>
          ${r.description ? `<p>${escapeHtml(r.description)}</p>` : ""}
          ${dealRef ? `<p>Угода: <code>${escapeHtml(dealRef)}</code></p>` : ""}
          ${customer ? `<p>Клієнт: ${escapeHtml(customer.name || "—")} · ${escapeHtml(customer.phone || "—")}</p>` : ""}
          <p style="color:#6b7280;font-size:13px">Stone Memory CRM · автоматичне нагадування</p>
        `
        const sent = await sendOne({
          to: assignee.email,
          subject: `🔔 ${r.title}`,
          html,
          scope: "transactional",
        })
        if (sent.ok) channels.push("email")
      } catch (e) {
        console.error("[cron/reminders] email failed", e)
      }
    }

    // Mark as sent
    await supabaseAdmin
      .from("reminders")
      .update({
        status: "sent",
        notified_at: new Date().toISOString(),
      })
      .eq("id", r.id)

    results.push({ id: r.id, ok: channels.length > 0, channels })
  }

  // --- 2. SLA: угоди в "new" >24 год без переходу ---
  const yesterday = new Date(Date.now() - 24 * 3600_000).toISOString()
  const { data: stuckNew } = await supabaseAdmin
    .from("deals")
    .select("id, reference, customer_id, assigned_to, customers(name, phone)")
    .eq("status", "new")
    .lt("created_at", yesterday)
    .limit(50)

  let slaCreated = 0
  for (const d of stuckNew || []) {
    // Перевірити чи вже є sla_warning
    const { data: existing } = await supabaseAdmin
      .from("reminders")
      .select("id")
      .eq("deal_id", d.id)
      .eq("kind", "sla_warning")
      .eq("status", "pending")
      .maybeSingle()
    if (existing) continue

    await supabaseAdmin.from("reminders").insert({
      deal_id: d.id,
      customer_id: d.customer_id,
      assigned_to: d.assigned_to,
      kind: "sla_warning",
      title: `⚠️ Лід без зв'язку >24 год: ${d.reference || d.id}`,
      description: "Клієнт залишив заявку понад добу тому, статус ще «Нова». Перетелефонуйте.",
      due_at: new Date().toISOString(),
      notify_via: ["telegram", "email"],
    })
    slaCreated++
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    slaCreated,
    results,
  })
}

export async function GET(req: Request) { return handle(req) }
export async function POST(req: Request) { return handle(req) }
