"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import type { Locale } from "@/lib/types"

const u = (id: string) => `https://images.unsplash.com/${id}?w=1600&h=1200&fit=crop&q=80&auto=format`

type Copy = {
  heading: string
  memorialTitle: string
  memorialDesc: string
  memorialCta: string
  memorialItems: string[]
  homeTitle: string
  homeDesc: string
  homeCta: string
  homeItems: string[]
}

const copy: Record<Locale, Copy> = {
  uk: {
    heading: "Що саме ми робимо",
    memorialTitle: "Пам'ятники",
    memorialDesc: "Меморіальні комплекси з граніту і мармуру — український і імпортний камінь. Ескіз, виготовлення, гравіювання, монтаж.",
    memorialCta: "Переглянути пам'ятники",
    memorialItems: ["Одиночні та парні", "Сімейні комплекси", "Хрести та обеліски", "Реставрація", "Гравіювання портретів", "Огорожі й благоустрій"],
    homeTitle: "Дім і сад",
    homeDesc: "Стільниці, підвіконня, каміни, сходи та бруківка. Преміальні вироби з природного каменю для ваших інтер'єрів і ландшафту.",
    homeCta: "Дім і сад",
    homeItems: ["Стільниці на кухню", "Підвіконня", "Сходи й балясини", "Каміни й портали", "Підлога й слаб", "Бруківка й доріжки"],
  },
  pl: {
    heading: "Co dokładnie robimy",
    memorialTitle: "Pomniki",
    memorialDesc: "Kompleksy memorialne z granitu i marmuru — ukraiński oraz importowany kamień. Szkic, produkcja, grawerowanie, montaż.",
    memorialCta: "Zobacz pomniki",
    memorialItems: ["Pojedyncze i podwójne", "Kompleksy rodzinne", "Krzyże i obeliski", "Renowacja", "Grawerowanie portretów", "Ogrodzenia i zagospodarowanie"],
    homeTitle: "Dom i ogród",
    homeDesc: "Blaty, parapety, kominki, schody i kostka brukowa. Premium wyroby z kamienia naturalnego do wnętrz i krajobrazu.",
    homeCta: "Dom i ogród",
    homeItems: ["Blaty kuchenne", "Parapety", "Schody i balustrady", "Kominki i portale", "Podłogi i slaby", "Kostka i ścieżki"],
  },
  en: {
    heading: "What we actually make",
    memorialTitle: "Monuments",
    memorialDesc: "Memorial complexes in granite and marble — Ukrainian and imported stone. Design, production, engraving, installation.",
    memorialCta: "Browse monuments",
    memorialItems: ["Single & double", "Family complexes", "Crosses & obelisks", "Restoration", "Portrait engraving", "Borders & landscaping"],
    homeTitle: "Home & Garden",
    homeDesc: "Countertops, window sills, fireplaces, stairs and paving. Premium natural-stone pieces for interiors and landscape.",
    homeCta: "Home & Garden",
    homeItems: ["Kitchen countertops", "Window sills", "Staircases", "Fireplaces & portals", "Slabs & flooring", "Paving & pathways"],
  },
  de: {
    heading: "Was wir wirklich fertigen",
    memorialTitle: "Grabmale",
    memorialDesc: "Grabmal-Komplexe aus Granit und Marmor — ukrainischer und importierter Stein. Entwurf, Fertigung, Gravur, Montage.",
    memorialCta: "Grabmale ansehen",
    memorialItems: ["Einzel & Doppel", "Familien-Komplexe", "Kreuze & Obelisken", "Restaurierung", "Porträt-Gravur", "Einfassungen & Landschaft"],
    homeTitle: "Haus & Garten",
    homeDesc: "Arbeitsplatten, Fensterbänke, Kamine, Treppen und Pflaster. Premium-Natursteinelemente für Interieur und Landschaft.",
    homeCta: "Haus & Garten",
    homeItems: ["Küchenarbeitsplatten", "Fensterbänke", "Treppen & Geländer", "Kamine & Portale", "Böden & Platten", "Pflaster & Wege"],
  },
  lt: {
    heading: "Ką mes iš tikrųjų gaminame",
    memorialTitle: "Paminklai",
    memorialDesc: "Memorialiniai kompleksai iš granito ir marmuro — ukrainietiškas ir importuotas akmuo. Eskizas, gamyba, graviravimas, montavimas.",
    memorialCta: "Peržiūrėti paminklus",
    memorialItems: ["Pavieniai ir poriniai", "Šeimos kompleksai", "Kryžiai ir obeliskai", "Restauravimas", "Portretų graviravimas", "Aptvarai ir sutvarkymas"],
    homeTitle: "Namams ir sodui",
    homeDesc: "Stalviršiai, palangės, židiniai, laiptai ir grindinio akmenys. Aukščiausios klasės natūralaus akmens gaminiai interjerui ir kraštovaizdžiui.",
    homeCta: "Namams ir sodui",
    homeItems: ["Virtuvės stalviršiai", "Palangės", "Laiptai ir turėklai", "Židiniai ir portalai", "Grindys ir plokštės", "Grindinys ir takai"],
  },
}

const HERO_MEMORIAL = "/stones/memorial-01.svg"
const HERO_HOME = u("photo-1556909211-36987daf7b4d")

export function CategoriesSection() {
  const { locale } = useTranslation()
  const L = copy[locale]

  return (
    <section id="categories" className="mx-auto max-w-7xl px-6 pt-14 pb-2 md:pt-20">
      <div className="mb-8 md:mb-10">
        <h2 className="text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
          {L.heading}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <CategoryCard
          href="/catalog?cat=memorial"
          image={HERO_MEMORIAL}
          title={L.memorialTitle}
          description={L.memorialDesc}
          cta={L.memorialCta}
          items={L.memorialItems}
          priority
        />
        <CategoryCard
          href="/catalog?cat=home"
          image={HERO_HOME}
          title={L.homeTitle}
          description={L.homeDesc}
          cta={L.homeCta}
          items={L.homeItems}
          priority
        />
      </div>
    </section>
  )
}

function CategoryCard({
  href,
  image,
  title,
  description,
  cta,
  items,
  priority = false,
}: {
  href: string
  image: string
  title: string
  description: string
  cta: string
  items: string[]
  priority?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-3xl bg-card ring-1 ring-black/[0.04] shadow-soft transition-[box-shadow,transform] duration-300 hover:shadow-hover hover:-translate-y-0.5"
    >
      <Link href={href} prefetch className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-foreground/5">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={priority}
            className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <h3 className="absolute bottom-6 left-6 text-3xl font-semibold tracking-tight-custom text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] md:text-4xl">
            {title}
          </h3>
        </div>
        <div className="p-6 md:p-8">
          <p className="text-[15px] leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-[14px] text-foreground/85">
            {items.map((i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="inline-block h-1 w-1 rounded-full bg-foreground/40" />
                {i}
              </li>
            ))}
          </ul>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground">
            {cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
