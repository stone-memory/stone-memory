import "server-only"
import * as React from "react"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { sendOne, SITE_URL } from "@/lib/email"
import { BroadcastMarketing } from "@/lib/email-templates/broadcast-marketing"

export type BroadcastTarget =
  | { kind: "subscribers" }
  | { kind: "clients" }
  | { kind: "specific"; emails: string[] }

export type Recipient = { email: string; token: string | null }

// Structured marketing template fields the admin fills in.
export type MarketingTemplateFields = {
  preview?: string
  headline: string
  intro: string
  highlights?: Array<{ imageUrl?: string; title: string; description?: string; priceFrom?: number }>
  ctaLabel: string
  ctaUrl: string
  outro?: string
}

// The data the admin submits — either raw HTML or a named template + fields.
export type SendRequest =
  | { kind: "html"; subject: string; html: string }
  | { kind: "template"; template: "marketing"; subject: string; fields: MarketingTemplateFields }

function unique(list: string[]): string[] {
  return Array.from(new Set(list.filter(Boolean).map((e) => e.toLowerCase())))
}

export async function resolveRecipients(target: BroadcastTarget): Promise<Recipient[]> {
  if (target.kind === "subscribers") {
    const { data, error } = await supabaseAdmin
      .from("subscribers")
      .select("email, unsubscribe_token")
      .eq("status", "active")
    if (error) throw new Error(error.message)
    return (data || []).map((r) => ({ email: r.email as string, token: r.unsubscribe_token as string }))
  }
  if (target.kind === "clients") {
    const { data, error } = await supabaseAdmin.from("orders").select("email").not("email", "is", null)
    if (error) throw new Error(error.message)
    const emails = unique((data || []).map((r) => (r.email as string) || ""))
    return emails.map((email) => ({ email, token: null }))
  }
  if (target.kind === "specific") {
    const emails = unique(target.emails || [])
    const { data } = await supabaseAdmin
      .from("subscribers")
      .select("email, unsubscribe_token")
      .in("email", emails)
    const tokenMap = new Map<string, string>()
    for (const r of data || []) tokenMap.set((r.email as string).toLowerCase(), r.unsubscribe_token as string)
    return emails.map((email) => ({ email, token: tokenMap.get(email) ?? null }))
  }
  throw new Error("invalid target")
}

export async function dispatchBroadcast(args: {
  request: SendRequest
  recipients: Recipient[]
  scope?: "broadcast" | "individual"
}): Promise<{ sent: number; failed: number; total: number }> {
  const scope = args.scope ?? (args.recipients.length > 1 ? "broadcast" : "individual")
  let sent = 0
  let failed = 0

  for (const r of args.recipients) {
    let res
    if (args.request.kind === "html") {
      res = await sendOne({
        to: r.email,
        subject: args.request.subject,
        html: args.request.html,
        scope,
        unsubscribeToken: r.token,
      })
    } else {
      // template path — build a fresh React element per recipient so the
      // unsubscribe footer embeds the correct token.
      const react = (
        <BroadcastMarketing
          preview={args.request.fields.preview || args.request.subject}
          headline={args.request.fields.headline}
          intro={args.request.fields.intro}
          highlights={args.request.fields.highlights}
          ctaLabel={args.request.fields.ctaLabel}
          ctaUrl={args.request.fields.ctaUrl}
          outro={args.request.fields.outro}
          siteUrl={SITE_URL}
          unsubscribeToken={r.token}
        />
      )
      res = await sendOne({
        to: r.email,
        subject: args.request.subject,
        react,
        scope,
        unsubscribeToken: r.token,
      })
    }
    if (res.ok) sent++
    else failed++
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  return { sent, failed, total: args.recipients.length }
}
