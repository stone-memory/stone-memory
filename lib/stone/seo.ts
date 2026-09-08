import type { Metadata } from 'next'

/**
 * Єдина форма метаданих сторінки. Раніше це жило в generateMetadata
 * catch-all роуту й дублювало диспетчер власним ланцюжком умов; тепер кожен
 * роут викликає pageMetadata зі своїм шляхом і заголовком, а форма (обрізання
 * title до 60, description до 155, canonical, OG, Twitter) одна на всіх.
 */
export function pageMetadata(
  path: string,
  {
    title,
    description,
    image = '/stone-hero.webp',
  }: { title: string; description?: string; image?: string }
): Metadata {
  const desc = (
    description || `${title}. Вибір матеріалу, технічні деталі та прорахунок Stone Memory.`
  ).slice(0, 155)
  return {
    title: title.slice(0, 60),
    description: desc,
    alternates: { canonical: path },
    openGraph: { title, description: desc, type: 'website', images: [{ url: image, alt: title }] },
    twitter: { card: 'summary_large_image', title, description: desc, images: [image] },
  }
}
