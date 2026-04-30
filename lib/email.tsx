import "server-only"
import * as React from "react"
import { Resend } from "resend"
import { render } from "@react-email/render"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { BaseLayout } from "@/lib/email-templates/base-layout"

const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  console.warn("[email] RESEND_API_KEY is not set; emails will fail at runtime")
}

export const resend = apiKey ? new Resend(apiKey) : null

export const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev"
export const FROM_NAME = process.env.EMAIL_FROM_NAME || "Stone Memory"
export const REPLY_TO = process.env.EMAIL_REPLY_TO || "sttonememory@gmail.com"
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"

type CommonArgs = {
  to: string
  subject: string
  scope?: "broadcast" | "individual" | "transactional"
  unsubscribeToken?: string | null
}

type SendArgs = CommonArgs & (
  | { react: React.ReactElement; html?: never }      // send a pre-built React Email element as-is
  | { html: string; react?: never }                  // legacy: wrap raw HTML in BaseLayout
)

function buildUnsubscribe(token: string | null | undefined): { url: string; mailto: string } {
  const mailto = `mailto:${REPLY_TO}?subject=unsubscribe`
  const url = token ? `${SITE_URL}/unsubscribe?token=${encodeURIComponent(token)}` : mailto
  return { url, mailto }
}

// Render raw HTML input (from old /admin/broadcast textarea) inside the base
// layout so it gets the branded wrapper + unsubscribe footer.
function wrapRawHtml(innerHtml: string, unsubscribeToken: string | null | undefined, subject: string) {
  return (
    <BaseLayout preview={subject} siteUrl={SITE_URL} unsubscribeToken={unsubscribeToken}>
      <div dangerouslySetInnerHTML={{ __html: innerHtml }} />
    </BaseLayout>
  )
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(?:p|div|h[1-6]|li|br|tr|table)[^>]*>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export async function sendOne(args: SendArgs): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!resend) return { ok: false, error: "RESEND_API_KEY not set" }

  const reactEl = args.react
    ? args.react
    : wrapRawHtml(args.html!, args.unsubscribeToken, args.subject)

  const wrappedHtml = await render(reactEl)
  const plainText = await render(reactEl, { plainText: true })
  const { url: unsubscribeUrl, mailto: unsubscribeMailto } = buildUnsubscribe(args.unsubscribeToken)
  const bodyForLog = args.html ?? "[react-template]"

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: args.to,
      replyTo: REPLY_TO,
      subject: args.subject,
      html: wrappedHtml,
      text: plainText || htmlToText(wrappedHtml),
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>, <${unsubscribeMailto}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    })
    if (error) throw new Error(error.message)
    await supabaseAdmin.from("email_log").insert({
      recipient: args.to,
      subject: args.subject,
      body: bodyForLog,
      scope: args.scope || "individual",
      resend_id: data?.id || null,
    })
    return { ok: true, id: data?.id }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "send failed"
    await supabaseAdmin.from("email_log").insert({
      recipient: args.to,
      subject: args.subject,
      body: bodyForLog,
      scope: args.scope || "individual",
      error: msg,
    })
    return { ok: false, error: msg }
  }
}
