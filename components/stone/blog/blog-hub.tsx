'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Article } from '@/lib/stone/cms-types'

const categories = ['Усі', 'Матеріали', 'Догляд', 'Проєктування', 'Ціни'] as const
export function BlogHub({ articles }: { articles: Article[] }) {
  const [active, setActive] = useState<(typeof categories)[number]>('Усі')
  const visible =
    active === 'Усі' ? articles : articles.filter((article) => article.category === active)
  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-3" aria-label="Фільтр статей">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            aria-pressed={active === category}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${active === category ? 'bg-primary text-primary-foreground' : ''}`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((article) => (
          <article
            key={article.slug}
            className="flex min-h-64 flex-col justify-between rounded-xl bg-card p-6"
          >
            <p className="eyebrow text-accent">{article.category}</p>
            <div>
              <h2 className="text-2xl font-semibold">
                <Link href={`/kamin/blog/${article.slug}`}>{article.title}</Link>
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{article.dek}</p>
              <p className="mt-5 text-xs text-muted-foreground">
                {article.readingTime} · Оновлено {article.dateModified}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
