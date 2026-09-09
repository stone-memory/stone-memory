import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { SectionHeading } from '@/components/stone/site/shell'
import { Cta, WorkSteps } from '@/components/stone/site/sections'
import { categories, materials } from '@/lib/stone/content'
import { familyHrefForMaterial } from '@/data/stone/families'
import { getProjects } from '@/lib/stone/cms'
import { pageMetadata } from '@/lib/stone/seo'

// Без власних метаданих сторінка успадковує canonical кореневого layout, тобто
// головну сайту, і Bing/Google вважають її дублем головної та не індексують.
export const metadata = pageMetadata('/arkhitekturnyi-kamin', {
  title: 'Архітектурний камінь: стільниці, підвіконня, сходи на замовлення',
  description:
    'Кам’яні стільниці, підвіконня, сходи, фасади й бруківка з граніту, мармуру та кварцу. Власне виробництво в Костополі, замір, доставка й монтаж по Україні.',
  image: '/stone-hero.webp',
})
export default async function Home() {
  const projects = await getProjects()
  return (
    <main>
      <section className="page-shell flex min-h-[58vh] flex-col items-center justify-center py-10 text-center md:min-h-[72vh] md:py-20">
        <p className="eyebrow">Камінь. У своїй найточнішій формі.</p>
        <h1 className="display mt-7 max-w-full text-balance md:!text-7xl">
          Кам’яні стільниці, підвіконня та сходи на замовлення
        </h1>
        <p className="mt-7 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground">
          Проєктуємо, ріжемо під розмір і монтуємо натуральний камінь для кухонь, ванних, сходів і
          дворів — доставка і монтаж по всій Україні.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/arkhitekturnyi-kamin/kontakty#forma"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Замовити безкоштовний замір
          </Link>
          <Link
            href="/arkhitekturnyi-kamin/kalkulyator"
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-6 py-3 text-sm font-semibold"
          >
            Порахувати вартість <ChevronRight />
          </Link>
        </div>
        <p className="mt-5 max-w-3xl text-pretty text-sm text-muted-foreground">
          Власне виробництво в Костополі • 10 українських гранітів + мармур, кварц, керамограніт •
          монтаж під ключ
        </p>
      </section>
      <section className="page-shell">
        <div className="media aspect-[16/9] md:aspect-[2/1]">
          <Image
            src="/stone-hero.webp"
            alt="Кухонний острів із природного кварциту"
            fill
            priority
            className="object-cover"
          />
        </div>
      </section>
      <section className="page-shell section-pad">
        <SectionHeading
          eyebrow="Простий вибір"
          title="Почніть із того, що створюємо."
          copy="Кожен виріб проходить один шлях: точний замір, підбір плити, виробництво й професійний монтаж."
        />
        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Link
              href={`/arkhitekturnyi-kamin/vyroby/${c.slug}`}
              key={c.slug}
              className="surface group flex min-h-48 flex-col justify-between p-6 transition-transform hover:-translate-y-1"
            >
              <span className="text-xs text-muted-foreground">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-xl font-semibold tracking-[-.035em]">{c.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{c.blurb}</p>
                <ArrowRight className="mt-5 text-accent" />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-secondary">
        <div className="page-shell section-pad">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="media aspect-[4/5]">
              <Image
                src="/stone-slabs.webp"
                alt="Сляби природного каменю у консультаційній зоні"
                fill
                className="object-cover"
              />
            </div>
            <div className="md:pl-10">
              <p className="eyebrow">Матеріали</p>
              <h2 className="title mt-5 text-balance">Рисунок, який не повторюється.</h2>
              <p className="mt-6 max-w-md leading-7 text-muted-foreground">
                Підбирайте матеріал за властивістю, тоном і характером простору.
              </p>
              <div className="mt-10 flex flex-col">
                {materials.map((m) => (
                  <Link
                    key={m.slug}
                    href={familyHrefForMaterial(m.slug)}
                    className="flex items-center justify-between border-t py-4 font-semibold"
                  >
                    <span>{m.name}</span>
                    <span className="text-sm font-normal text-muted-foreground">{m.note}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="page-shell section-pad">
        <SectionHeading eyebrow="Як ми працюємо" title="Менше невідомого. Більше точності." />
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {[
            ['01', 'Підбираємо', 'З’ясовуємо завдання, бюджет і умови експлуатації.'],
            ['02', 'Проєктуємо', 'Робимо замір, креслення та узгоджуємо кожну деталь.'],
            ['03', 'Виготовляємо', 'Обробляємо камінь і монтуємо готовий виріб.'],
          ].map((x) => (
            <div key={x[0]} className="border-t pt-6">
              <p className="text-xs font-bold text-accent">{x[0]}</p>
              <h3 className="mt-8 text-2xl font-semibold tracking-[-.04em]">{x[1]}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{x[2]}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="page-shell section-pad pt-0">
        <SectionHeading
          eyebrow="Пропозиції"
          title="Що ми можемо реалізувати для вашого простору."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {projects.slice(0, 9).map((p) => (
            <Link href={`/arkhitekturnyi-kamin/proekty/${p.slug}`} key={p.slug} className="group">
              <div className="media aspect-[4/5]">
                <Image src={p.image} alt={p.alt} fill className="object-cover" />
              </div>
              <div className="flex items-start justify-between gap-4 py-5">
                <div>
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {p.type} · {p.material}
                  </p>
                </div>
                <ArrowRight className="text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-right">
          <Link href="/arkhitekturnyi-kamin/proekty" className="text-sm text-muted-foreground hover:text-foreground">
            Усі пропозиції →
          </Link>
        </div>
      </section>
      <WorkSteps />
      <Cta />
    </main>
  )
}
