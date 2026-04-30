import "server-only"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { StoneItem } from "@/lib/types"
import { stones as baseStones } from "@/lib/data/stones"
import { services as baseServices, type Service } from "@/lib/data/services"
import { projects as baseProjects, type Project } from "@/lib/data/projects"
import { articles as baseArticles, type Article } from "@/lib/data/articles"

// ---------- Stones ----------

export async function fetchStones(opts?: { includeHidden?: boolean }): Promise<StoneItem[]> {
  const { data, error } = await supabaseAdmin
    .from("stones")
    .select("data, hidden, position")
    .order("position", { ascending: true })

  if (error || !data) return baseStones
  const rows = opts?.includeHidden ? data : data.filter((r) => !r.hidden)
  return rows.map((r) => r.data as StoneItem)
}

export async function fetchStoneById(id: string): Promise<StoneItem | null> {
  const { data, error } = await supabaseAdmin.from("stones").select("data, hidden").eq("id", id).maybeSingle()
  if (error || !data) return null
  if (data.hidden) return null
  return data.data as StoneItem
}

// ---------- Services ----------

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabaseAdmin
    .from("services")
    .select("data, hidden, position")
    .order("position", { ascending: true })
  if (error || !data) return baseServices
  return data.filter((r) => !r.hidden).map((r) => r.data as Service)
}

// ---------- Projects ----------

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("data, hidden, position")
    .order("position", { ascending: true })
  if (error || !data) return baseProjects
  return data.filter((r) => !r.hidden).map((r) => r.data as Project)
}

export async function fetchHiddenProjectCategories(): Promise<string[]> {
  const { data, error } = await supabaseAdmin.from("project_hidden_categories").select("category")
  if (error || !data) return []
  return data.map((r) => r.category as string)
}

// ---------- Articles ----------

export async function fetchArticles(): Promise<Article[]> {
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("data, hidden, position")
    .order("position", { ascending: true })
  if (error || !data) return baseArticles
  return data.filter((r) => !r.hidden).map((r) => r.data as Article)
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("data, hidden")
    .eq("slug", slug)
    .maybeSingle()
  if (error || !data) return null
  if (data.hidden) return null
  return data.data as Article
}

// ---------- Reviews ----------

export type ReviewRow = {
  id: string
  data: Record<string, unknown>
  placement: "home" | "all" | "hidden"
  order: number
}

export async function fetchReviews(placement: "home" | "all"): Promise<ReviewRow[]> {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select('id, data, placement, "order"')
    .order("order", { ascending: true })
  if (error || !data) return []
  let list = data as ReviewRow[]
  list =
    placement === "home"
      ? list.filter((r) => r.placement === "home")
      : list.filter((r) => r.placement !== "hidden")
  if (placement === "home") list = list.slice(0, 6)
  return list
}

// ---------- FAQ ----------

export async function fetchFaqItems(): Promise<Array<{ id: string; data: unknown; order: number }>> {
  const { data, error } = await supabaseAdmin
    .from("faq_items")
    .select('id, data, "order", hidden')
    .order("order", { ascending: true })
  if (error || !data) return []
  return data.filter((r) => !r.hidden).map((r) => ({ id: r.id, data: r.data, order: r.order }))
}

// ---------- Featured stones ----------

export async function fetchFeaturedIds(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("featured_stones")
    .select("stone_id, position")
    .order("position", { ascending: true })
  if (error || !data) return []
  return data.map((r) => r.stone_id as string)
}

// ---------- Singletons (about per locale, business profile, blog config) ----------

export async function fetchSingleton<T = unknown>(key: string): Promise<T | null> {
  const { data, error } = await supabaseAdmin
    .from("site_content")
    .select("data")
    .eq("key", key)
    .maybeSingle()
  if (error || !data) return null
  return (data.data as T) ?? null
}
