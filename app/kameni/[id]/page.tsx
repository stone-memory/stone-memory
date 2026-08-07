import { notFound } from "next/navigation"
import { fetchStoneById, fetchStones } from "@/lib/data-source"
import { StoneDetailClient } from "@/components/stone-detail-client"

/**
 * Server component: resolves the stone (and the pool used for "схоже") before
 * render, so the h1, copy, specs and related links are in the initial HTML.
 *
 * Previously this route was `"use client"` and returned `null` until the
 * zustand store hydrated — Googlebot received 45KB of markup containing 42
 * characters of text and no h1.
 *
 * fetchStoneById() returns null only for a genuinely absent/hidden row; a
 * Supabase outage falls back to seed data, so an incident cannot turn the whole
 * catalogue into 404s.
 */
export default async function StoneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [stone, stones] = await Promise.all([fetchStoneById(id), fetchStones()])

  if (!stone) notFound()

  return <StoneDetailClient initialStone={stone} initialStones={stones} />
}
