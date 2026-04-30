import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { stones } from "@/lib/data/stones"
import { services } from "@/lib/data/services"
import { projects } from "@/lib/data/projects"
import { articles } from "@/lib/data/articles"
import {
  seedReviews,
  seedFaq,
  seedBusinessProfile,
  seedAbout,
  seedBlogConfig,
} from "@/lib/data/seeds"
import { requireAdmin } from "@/lib/api-auth"

export const dynamic = "force-dynamic"

// POST /api/admin/seed?force=true  — re-run even if tables are already populated.
// Without force, only inserts rows that don't already exist (upsert ignore duplicates).
export async function POST(req: Request) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized

  const url = new URL(req.url)
  const force = url.searchParams.get("force") === "true"

  const report: Record<string, number> = {}

  // ---- stones ----
  {
    const rows = stones.map((s, i) => ({ id: s.id, data: s, position: i, hidden: false }))
    const { error } = await supabaseAdmin
      .from("stones")
      .upsert(rows, { onConflict: "id", ignoreDuplicates: !force })
    if (error) return NextResponse.json({ error: `stones: ${error.message}` }, { status: 500 })
    report.stones = rows.length
  }

  // ---- services ----
  {
    const rows = services.map((s, i) => ({ slug: s.slug, data: s, position: i, hidden: false }))
    const { error } = await supabaseAdmin
      .from("services")
      .upsert(rows, { onConflict: "slug", ignoreDuplicates: !force })
    if (error) return NextResponse.json({ error: `services: ${error.message}` }, { status: 500 })
    report.services = rows.length
  }

  // ---- projects ----
  {
    const rows = projects.map((p, i) => ({ slug: p.slug, data: p, position: i, hidden: false }))
    const { error } = await supabaseAdmin
      .from("projects")
      .upsert(rows, { onConflict: "slug", ignoreDuplicates: !force })
    if (error) return NextResponse.json({ error: `projects: ${error.message}` }, { status: 500 })
    report.projects = rows.length
  }

  // ---- articles ----
  {
    const rows = articles.map((a, i) => ({ slug: a.slug, data: a, position: i, hidden: false }))
    const { error } = await supabaseAdmin
      .from("articles")
      .upsert(rows, { onConflict: "slug", ignoreDuplicates: !force })
    if (error) return NextResponse.json({ error: `articles: ${error.message}` }, { status: 500 })
    report.articles = rows.length
  }

  // ---- reviews ----
  {
    const rows = seedReviews.map((r) => ({
      id: r.id,
      data: r,
      placement: r.placement,
      order: r.order ?? 99,
    }))
    const { error } = await supabaseAdmin
      .from("reviews")
      .upsert(rows, { onConflict: "id", ignoreDuplicates: !force })
    if (error) return NextResponse.json({ error: `reviews: ${error.message}` }, { status: 500 })
    report.reviews = rows.length
  }

  // ---- faq_items ----
  {
    const rows = seedFaq.map((f) => ({
      id: f.id,
      data: f,
      order: f.order,
      hidden: Boolean(f.hidden),
    }))
    const { error } = await supabaseAdmin
      .from("faq_items")
      .upsert(rows, { onConflict: "id", ignoreDuplicates: !force })
    if (error) return NextResponse.json({ error: `faq_items: ${error.message}` }, { status: 500 })
    report.faq_items = rows.length
  }

  // ---- featured_stones: pick items flagged isFeatured, capped to 6 ----
  {
    const featuredIds = stones.filter((s) => s.isFeatured).map((s) => s.id).slice(0, 6)
    if (force) {
      // replace the full list
      await supabaseAdmin.from("featured_stones").delete().neq("stone_id", "___none___")
    }
    const rows = featuredIds.map((id, i) => ({ stone_id: id, position: i }))
    if (rows.length > 0) {
      const { error } = await supabaseAdmin
        .from("featured_stones")
        .upsert(rows, { onConflict: "stone_id", ignoreDuplicates: !force })
      if (error) return NextResponse.json({ error: `featured_stones: ${error.message}` }, { status: 500 })
    }
    report.featured_stones = rows.length
  }

  // ---- site_content: about_overrides, business_profile, blog_config ----
  {
    const now = new Date().toISOString()
    const rows = [
      { key: "about_overrides", data: seedAbout, updated_at: now },
      { key: "business_profile", data: seedBusinessProfile, updated_at: now },
      { key: "blog_config", data: seedBlogConfig, updated_at: now },
    ]
    const { error } = await supabaseAdmin
      .from("site_content")
      .upsert(rows, { onConflict: "key", ignoreDuplicates: !force })
    if (error) return NextResponse.json({ error: `site_content: ${error.message}` }, { status: 500 })
    report.site_content = rows.length
  }

  return NextResponse.json({ ok: true, seeded: report, force })
}
