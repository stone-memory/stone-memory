import { Cta } from '@/components/stone/site/sections'
import { PageHero } from '@/components/stone/pages/primitives'

/** Інформаційна сторінка без власної логіки: заголовок, абзац, заклик. */
export function SimplePage({ title, copy }: { title: string; copy: string }) {
  return (
    <>
      <PageHero eyebrow="Stone Memory" title={title} copy={copy} />
      <Cta />
    </>
  )
}
