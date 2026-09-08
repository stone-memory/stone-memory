import { pageMetadata } from '@/lib/stone/seo'
import { SITE_URL } from '@/lib/site-config'
import { getArticles } from '@/lib/stone/cms'
import { BlogHub } from '@/components/stone/blog/blog-hub'
import { JsonLd, PageHero } from '@/components/stone/pages/primitives'

export const metadata = pageMetadata('/kamin/blog', { title: 'Журнал Stone Memory' })
export default async function Page() {
  const articles = await getArticles()
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': ['Blog', 'CollectionPage'],
          name: 'Журнал Stone Memory',
          url: `${SITE_URL}/blog`,
          inLanguage: 'uk-UA',
          blogPost: articles.map((a) => ({
            '@type': 'BlogPosting',
            headline: a.title,
            url: `${SITE_URL}/blog/${a.slug}`,
            dateModified: a.dateModified,
          })),
        }}
      />
      <PageHero
        eyebrow="Журнал"
        title="Коротко про складний вибір."
        copy="Практичні відповіді про матеріали, догляд, проєктування та формування вартості."
      >
        <BlogHub articles={articles} />
      </PageHero>
    </>
  )
}
