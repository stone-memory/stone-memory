import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { fetchStones } from "@/lib/data-source"
import { absoluteUrl } from "@/lib/site-config"
import { stoneCode, stonePath } from "@/lib/catalog-taxonomy"
import { STONE_GUIDE, ROCK_TYPES } from "@/lib/stone-guide"

export const revalidate = 60

const PATH = "/memorial/kameni"

export const metadata: Metadata = {
  title: "Камінь для пам'ятника — граніт, габро, лабрадорит, мармур",
  description:
    "Який камінь обрати для пам'ятника: габро, лабрадорит, покостівський, лезниківський і капустинський граніт, мармур. Вигляд, контраст під гравіювання, ціновий рівень.",
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    title: "Камінь для пам'ятника — як обрати",
    description:
      "Породи й родовища українського каменю: чим відрізняються на вигляд, який краще тримає гравіювання, скільки коштує.",
    url: absoluteUrl(PATH),
    type: "article",
    images: ["/opengraph-image"],
  },
}

export default async function StoneGuidePage() {
  const stones = await fetchStones()
  // Приклади беремо з живого каталогу за `code`, а не хардкодимо URL картинок:
  // товар можуть перефотографувати або перейменувати, і сторінка не має відʼїхати.
  const byCode = new Map(stones.map((s) => [stoneCode(s), s]))

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Камінь для пам'ятника", item: absoluteUrl(PATH) },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Header />
      <main id="main-content">
        <div className="mx-auto max-w-7xl px-6 pt-6">
          <Breadcrumbs items={[{ name: "Камінь для пам'ятника" }]} />
        </div>

        <section className="mx-auto max-w-7xl px-6 pt-6 pb-16 md:pt-8 md:pb-20">
          <h1 className="text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
            Камінь для пам'ятника
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground text-balance md:text-lg">
            Найчастіше питання перед замовленням — «а який камінь брати». Розбираємо
            за дві хвилини: спершу породи, далі чому в граніту колір залежить від
            кар'єру, і врешті — між чим ви насправді обираєте.
          </p>

          {/* ── 1. Породи ─────────────────────────────────────────────── */}
          <div className="mt-14">
            <h2 className="text-2xl font-semibold tracking-tight-custom md:text-3xl">
              Крок 1. Порода — що це за камінь
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              Порода визначає, наскільки камінь щільний, як тримає полірування й
              наскільки контрастним вийде гравіювання. Для пам'ятників в Україні
              використовують чотири.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ROCK_TYPES.map((r) => (
                <div key={r.rock} className="rounded-2xl border border-foreground/10 p-6">
                  <span className="text-lg font-medium">{r.rock}</span>
                  <span className="mt-2 block text-sm text-foreground/80">{r.colorRule}</span>
                  <span className="mt-2 block text-sm text-muted-foreground">{r.note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── 2. Чому родовище ──────────────────────────────────────── */}
          <div className="mt-14 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6 md:p-8">
            <h2 className="text-2xl font-semibold tracking-tight-custom md:text-3xl">
              Крок 2. У граніту колір задає родовище
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Габро чорне звідки завгодно, мармур білий звідки завгодно. А от «червоний
              граніт» без назви кар'єру не описує нічого: лезниківський —
              цегляно-червоний із великим зерном, капустинський — світліший і рожевуватий.
              Це різні камені, хоч обидва червоні.
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Тому назва родовища в картці товару — це не додатковий параметр поверх
              кольору. <strong className="font-medium text-foreground">Це і є точна назва кольору.</strong>
            </p>
          </div>

          {/* ── 3. Між чим обирати ────────────────────────────────────── */}
          <div className="mt-14">
            <h2 className="text-2xl font-semibold tracking-tight-custom md:text-3xl">
              Крок 3. Між чим ви обираєте
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              Сім варіантів. Будь-яку модель із каталогу можна виконати в кожному з них —
              форма й камінь не пов'язані.
            </p>

            <div className="mt-6 space-y-4">
              {STONE_GUIDE.map((s) => {
                const example = byCode.get(s.exampleCode)
                return (
                  <div
                    key={s.key}
                    className="grid grid-cols-1 gap-5 rounded-2xl border border-foreground/10 p-5 sm:grid-cols-[9rem_1fr] md:p-6"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-foreground/5 ring-1 ring-foreground/10">
                      <Image
                        src={s.swatch}
                        alt={`Поверхня каменю: ${s.name}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 144px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-lg font-medium md:text-xl">{s.name}</h3>
                        <span className="rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs text-muted-foreground">
                          {s.rock}
                        </span>
                        <span className="text-xs text-muted-foreground">{s.priceLevel}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/80">{s.look}</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.why}</p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {s.facet ? (
                          <Link
                            href={`/memorial/pamyatnyky/${s.facet}`}
                            className="underline-offset-2 hover:underline"
                          >
                            Дивитися в каталозі
                          </Link>
                        ) : null}
                        {example ? (
                          <Link href={stonePath(example)} className="text-muted-foreground underline-offset-2 hover:underline">
                            Приклад: {example.name || `№ ${s.exampleCode}`}
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-14 flex flex-wrap gap-3">
            <Link
              href="/memorial/pamyatnyky"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-[1px]"
            >
              Перейти до каталогу
            </Link>
            <Link
              href="/posluhy"
              className="rounded-full border border-foreground/15 px-6 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
            >
              Послуги та гравіювання
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
