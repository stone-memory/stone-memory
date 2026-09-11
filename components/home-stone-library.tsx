import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { STONE_GUIDE } from "@/lib/stone-guide"
import type { Collection } from "@/lib/stone/cms-types"

/**
 * Спільна бібліотека каменю на головній.
 *
 * Дані — колекції розділу «Архітектурний камінь» (stilnytsi_materials): це
 * єдине місце, де кожен камінь має фото, походження й тон. Натуральні породи
 * показуємо картками з двома виходами — «для пам'ятників» (довідник або
 * фасет каталогу) і «для дому» (сторінка колекції). Інженерний камінь (кварц,
 * керамограніт) на пам'ятники не йде, тому він окремим рядком лише з
 * посиланням у розділ.
 */

const NATURAL = ["Граніт", "Лабрадорит", "Мармур", "Кварцит", "Онікс", "Травертин", "Вапняк"]

const FAMILY_ORDER = ["Граніт", "Лабрадорит", "Мармур", "Кварцит", "Онікс", "Травертин", "Вапняк"]

const FAMILY_NOTE: Record<string, string> = {
  Граніт: "Український, з кар'єрів Житомирщини, Рівненщини, Кіровоградщини й Дніпропетровщини. Найміцніший і найдовговічніший камінь у нас — і на стелу, і на стільницю.",
  Лабрадорит: "Темний камінь із синіми переливами. На пам'ятниках — контраст під гравіювання, у домі — акцентна поверхня, що змінюється зі світлом.",
  Мармур: "Італійський та іспанський. На пам'ятники — для скульптури, дитячих і світлих рішень; у домі — ванни, каміни, підвіконня.",
  Кварцит: "Твердість граніту, рисунок мармуру. Для дому — стільниці й острови.",
  Онікс: "Напівпрозорий шаруватий камінь. Барні стійки, панно й стіни з підсвіткою.",
  Травертин: "Пористий теплий камінь Середземномор'я. Фасади, підлоги, каміни.",
  Вапняк: "Матовий м'який камінь для фасадів, підлог і терас; не для кухні.",
}

const FAMILY_HREF: Record<string, string> = {
  Граніт: "/arkhitekturnyi-kamin/materialy/granit",
  Лабрадорит: "/arkhitekturnyi-kamin/materialy/labradoryt",
  Мармур: "/arkhitekturnyi-kamin/materialy/marmur",
  Кварцит: "/arkhitekturnyi-kamin/materialy/kvarcyt",
  Онікс: "/arkhitekturnyi-kamin/materialy/oniks",
  Травертин: "/arkhitekturnyi-kamin/materialy/travertyn",
  Вапняк: "/arkhitekturnyi-kamin/materialy/vapnyak",
}

function memorialHref(slug: string): string | null {
  const entry = STONE_GUIDE.find((e) => e.interiorSlug === slug)
  if (!entry) return null
  return entry.facet ? `/memorial/pamyatnyky/${entry.facet}` : "/memorial/kameni"
}

export function HomeStoneLibrary({ collections }: { collections: Collection[] }) {
  const natural = collections.filter((c) => NATURAL.includes(c.family))
  const engineered = collections.filter((c) => !NATURAL.includes(c.family))
  const families = FAMILY_ORDER.filter((f) => natural.some((c) => c.family === f))
  const brands = Array.from(new Set(engineered.map((c) => c.brand).filter(Boolean))) as string[]
  const ukrainian = natural.filter((c) => /Украї/.test(c.origin)).length
  const forMemorial = natural.filter((c) => memorialHref(c.slug)).length

  if (natural.length === 0) return null

  return (
    <section id="stone" className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
      <div className="mb-8 grid gap-6 md:mb-12 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Бібліотека каменю</span>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
            Камінь, з яким ми працюємо
          </h2>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Одна бібліотека на два напрями. Кожен натуральний камінь тут можна замовити і як стелу на пам'ятник, і
            як стільницю чи сходи — з того самого блоку, з того самого цеху.
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-3">
          <Stat value={`${natural.length}`} label="натуральних порід" />
          <Stat value={`${ukrainian}`} label="українських родовищ" />
          <Stat value={`${forMemorial}`} label="годяться на пам'ятники" />
        </dl>
      </div>

      <div className="space-y-12">
        {families.map((family) => {
          const items = natural.filter((c) => c.family === family)
          return (
            <div key={family}>
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
                <h3 className="text-2xl font-semibold tracking-tight-custom md:text-3xl">{family}</h3>
                <p className="max-w-2xl text-[15px] text-muted-foreground">{FAMILY_NOTE[family]}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {items.map((c) => {
                  const memorial = memorialHref(c.slug)
                  return (
                    <article
                      key={c.slug}
                      className="group overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.05] shadow-soft transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-hover"
                    >
                      <Link href={`/arkhitekturnyi-kamin/materialy/${c.slug}`} className="relative block aspect-square overflow-hidden bg-foreground/5">
                        <Image
                          src={c.cardImage || c.image}
                          alt={`${c.name} — ${c.tone}`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.05]"
                        />
                      </Link>
                      <div className="p-4">
                        <h4 className="text-[15px] font-semibold leading-snug tracking-tight-custom">{c.name.replace(/^(Граніт|Мармур|Лабрадорит|Кварцит)\s+/, "")}</h4>
                        <p className="mt-1 text-xs text-muted-foreground">{c.origin.split(",")[0]} · {c.tone}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {memorial && (
                            <Link
                              href={memorial}
                              className="rounded-full bg-foreground px-2.5 py-1 text-[11px] font-medium text-background transition-transform hover:-translate-y-[1px]"
                            >
                              Пам'ятники
                            </Link>
                          )}
                          <Link
                            href={`/arkhitekturnyi-kamin/materialy/${c.slug}`}
                            className="rounded-full border border-foreground/15 px-2.5 py-1 text-[11px] font-medium transition-colors hover:border-foreground/40"
                          >
                            Для дому
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
              <div className="mt-4">
                <Link
                  href={FAMILY_HREF[family] ?? "/arkhitekturnyi-kamin/materialy"}
                  className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground"
                >
                  Усе про {family.toLowerCase()}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {engineered.length > 0 && (
        <div className="mt-12 flex flex-col gap-4 rounded-3xl bg-secondary/60 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h3 className="text-xl font-semibold tracking-tight-custom md:text-2xl">Інженерний камінь — лише для дому</h3>
            <p className="mt-1.5 max-w-2xl text-[15px] text-muted-foreground">
              {engineered.length} колекцій кварцу й керамограніту{brands.length ? ` — ${brands.join(", ")}` : ""}: рівний
              колір, непориста поверхня, будь-який формат.
            </p>
          </div>
          <Link
            href="/arkhitekturnyi-kamin/materialy"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-[1px]"
          >
            Уся бібліотека матеріалів
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      )}
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-4">
      <dd className="text-2xl font-semibold tracking-tight-custom tabular-nums md:text-3xl">{value}</dd>
      <dt className="mt-1 text-xs text-muted-foreground md:text-sm">{label}</dt>
    </div>
  )
}
