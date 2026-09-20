import { withLocale } from '@/lib/i18n/with-locale'
import { pageMetadata } from '@/lib/stone/seo'
import { SITE_URL } from '@/lib/site-config'
import { getLocalizedArticles } from '@/lib/stone/i18n-content'
import { BlogHub } from '@/components/stone/blog/blog-hub'
import { JsonLd, PageHero } from '@/components/stone/pages/primitives'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/blog', { title: 'Журнал Stone Memory' })
async function Page() {
  const articles = await getLocalizedArticles()
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
export default withLocale(Page)
