import type { Metadata } from "next"
import Link from "next/link"
import { InfoPage, Section, Faq, CtaBand, LinkPills } from "@/components/info-page"
import { fetchFaqItems } from "@/lib/data-source"
import { seedFaq } from "@/lib/data/seeds"
import { faqPageSchema } from "@/lib/seo/schemas/faqPage"
import { LEAD_TIMES, WARRANTY_YEARS } from "@/lib/site-facts"
import { absoluteUrl } from "@/lib/site-config"
import type { Locale } from "@/lib/types"

const PATH = "/pytannya"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Питання й відповіді про пам'ятники",
  description:
    "Відповіді на найчастіші питання: скільки коштує пам'ятник, за скільки виготовите, який камінь обрати, як робите фундамент, чи можна замовити дистанційно, як доглядати, що з документами.",
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    title: "Питання й відповіді — Stone Memory",
    description: "Ціни, терміни, камінь, монтаж, догляд, документи — усе, що запитують перед замовленням пам'ятника.",
    url: absoluteUrl(PATH),
    type: "website",
    images: ["/opengraph-image"],
  },
}

type FaqRow = { id: string; data: unknown; order: number }
type FaqShape = { q?: Record<Locale, string>; a?: Record<Locale, string>; order?: number }

/**
 * Питання, яких у базі немає, але які ставлять у чат і по телефону. Групи —
 * для навігації: сторінка довга, і людина шукає своє питання за темою.
 */
const EXTRA: { group: string; items: { q: string; a: string }[] }[] = [
  {
    group: "Вибір і дизайн",
    items: [
      {
        q: "Чим відрізняється габро від «чорного граніту»?",
        a: "Це те саме: «чорним гранітом» у побуті називають габро — окрему породу, щільнішу й дрібнозернистішу за граніт. Чорного граніту як такого в Україні не добувають. У нас в картках завжди вказано справжню назву: габро (Головинське або Букинське родовище) або лабрадорит.",
      },
      {
        q: "Який розмір стели обрати?",
        a: "Стандарт для одиночного пам'ятника — 80×45×8 см або 100×50×8 см; для подвійного — 120×60×8. Більший розмір потрібен, коли ділянка велика і стела 80 см губиться, або коли на ній має бути два портрети й довга епітафія. На замірі ми ставимо шаблон із картону в реальний розмір — так простіше вирішити, ніж по цифрах.",
      },
      {
        q: "Чи можна зробити пам'ятник за фото з іншого сайту?",
        a: "Так. Надішліть фото — зробимо ескіз у своєму камені й назвемо ціну. Форму повторюємо точно, портрет і напис — ваші. Часто виходить дешевше, ніж на сайті, звідки фото, бо ми виробник.",
      },
      {
        q: "Чи робите ви кольорові портрети?",
        a: "Так, двома способами: кольорове гравіювання по каменю (стійкіше, спокійніші тони) або фотокераміка — керамічна пластина з друком, що кріпиться на стелу (яскравіше, від 1 300 ₴). Для військових найчастіше беруть чорно-біле глибоке гравіювання: воно найдовговічніше.",
      },
    ],
  },
  {
    group: "Документи й кладовище",
    items: [
      {
        q: "Чи потрібен дозвіл на встановлення пам'ятника?",
        a: "На більшості кладовищ достатньо повідомити адміністрацію й показати документ на місце поховання. У містах (Рівне, Луцьк, Київ) є регламент розмірів і форма заяви — ми знаємо ці вимоги й оформлюємо самі. Якщо кладовище має обмеження за висотою чи площею, врахуємо їх в ескізі.",
      },
      {
        q: "Чи є пільги або компенсація для родин загиблих військових?",
        a: "Так, держава компенсує частину вартості пам'ятника через органи соцзахисту, а низка громад і фондів доплачує. Суми й порядок різняться по областях. Ми готуємо повний пакет документів для компенсації: договір, рахунок, акт, фотофіксацію, і працюємо з фондами за безготівковим розрахунком.",
      },
      {
        q: "Чи можна встановити пам'ятник, якщо після поховання минуло менше року?",
        a: "Технічно так, але ми не радимо: свіжий ґрунт осідає ще 6–12 місяців, і навіть добрий фундамент може «повести». Якщо потрібно раніше — робимо палевий фундамент до твердого шару, це трохи дорожче, зате не залежить від усадки.",
      },
    ],
  },
  {
    group: "Догляд і сервіс",
    items: [
      {
        q: "Як доглядати за полірованим гранітом?",
        a: "Двічі на рік — вода і м'яка щітка або губка, без кислот, абразивів і засобів для сантехніки. Мох і наліт знімає розчин господарського мила. Раз на 3–5 років можна оновити захисне просочення — робимо це при гарантійному чи плановому виїзді.",
      },
      {
        q: "Чи можете ви відреставрувати старий пам'ятник?",
        a: "Так: чистимо, полируємо повторно, оновлюємо або перегравійовуємо напис, замінюємо тріснуті елементи, переставляємо на новий фундамент. Часто дешевше й швидше, ніж робити новий. Виїзд на огляд по Рівненщині й Волині безкоштовний.",
      },
      {
        q: "Скільки триває гарантія і що вона покриває?",
        a: `${WARRANTY_YEARS} років на камінь, гравіювання, фундамент і монтаж. Просіло, тріснуло, розійшовся шов, злізла позолота — приїжджаємо й виправляємо безкоштовно. Вандалізм і зовнішні пошкодження — відновлюємо за собівартістю.`,
      },
    ],
  },
]

export default async function FaqPage() {
  const rows = (await fetchFaqItems()) as FaqRow[]
  const base: FaqShape[] = rows.length > 0 ? rows.map((r) => r.data as FaqShape) : seedFaq
  const general = base
    .filter((f) => f.q?.uk && f.a?.uk)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((f) => ({ q: f.q!.uk, a: f.a!.uk }))

  const all = [...general, ...EXTRA.flatMap((g) => g.items)]
  const schema = faqPageSchema(all.map((f) => ({ question: f.q, answer: f.a })), "uk")

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <InfoPage
        crumbs={[{ name: "Питання й відповіді" }]}
        title="Питання й відповіді"
        lead={`Усе, що запитують перед замовленням: ціни, терміни (одинарний — ${LEAD_TIMES.single}), камінь, фундамент, документи й догляд. Не знайшли своє — напишіть, відповімо протягом години в робочий час.`}
      >
        <Section>
          <LinkPills
            items={[
              { href: "#zahalni", label: "Ціни, терміни, оплата" },
              ...EXTRA.map((g) => ({ href: `#${slug(g.group)}`, label: g.group })),
            ]}
          />
        </Section>

        <Section id="zahalni" eyebrow="Найчастіші" title="Ціни, терміни, оплата, монтаж">
          <Faq items={general} />
        </Section>

        {EXTRA.map((g) => (
          <Section key={g.group} id={slug(g.group)} title={g.group}>
            <Faq items={g.items} />
          </Section>
        ))}

        <Section>
          <p className="max-w-3xl text-[15px] text-muted-foreground">
            Докладніше: <Link href="/tsiny" className="underline underline-offset-4 hover:text-foreground">ціни</Link>,{" "}
            <Link href="/yak-zamovyty" className="underline underline-offset-4 hover:text-foreground">як замовити</Link>,{" "}
            <Link href="/dostavka-i-oplata" className="underline underline-offset-4 hover:text-foreground">доставка й оплата</Link>,{" "}
            <Link href="/harantiya" className="underline underline-offset-4 hover:text-foreground">гарантія</Link>,{" "}
            <Link href="/memorial/kameni" className="underline underline-offset-4 hover:text-foreground">довідник каменю</Link>.
          </p>
        </Section>

        <CtaBand title="Лишилось питання?" text="Напишіть у Viber або Telegram — відповідає майстер, а не бот. Або залиште заявку, і ми передзвонимо в робочий час." />
      </InfoPage>
    </>
  )
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-zа-яіїєґ0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
