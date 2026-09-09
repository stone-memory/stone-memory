import type { Metadata } from "next"
import Link from "next/link"
import { InfoPage, Section, Prose, Table, Faq, CtaBand } from "@/components/info-page"
import { CITIES, DELIVERY, INSTALLATION, PAYMENT, WARRANTY_YEARS } from "@/lib/site-facts"
import { absoluteUrl } from "@/lib/site-config"

const PATH = "/dostavka-i-oplata"

export const metadata: Metadata = {
  title: "Доставка, монтаж і оплата пам'ятників",
  description:
    "Доставка й монтаж пам'ятників по Україні та в ЄС: безкоштовний виїзд у Рівненській і Волинській областях, 3–5 ₴/км в інші регіони. Оплата трьома частинами 30/50/20. Фундамент і гарантія 5 років у ціні.",
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    title: "Доставка, монтаж і оплата — Stone Memory",
    description: "Куди й за скільки доставляємо, як монтуємо, як платити. Без прихованих доплат.",
    url: absoluteUrl(PATH),
    type: "article",
    images: ["/opengraph-image"],
  },
}

const FAQ = [
  {
    q: "Чи можу я забрати пам'ятник сам і встановити своїми силами?",
    a: "Можна, і ціна зменшиться на вартість монтажу. Але гарантія на фундамент і геометрію в такому разі не діє — ми відповідаємо лише за камінь і гравіювання. Дамо схему фундаменту й інструкцію з монтажу, які використовуємо самі.",
  },
  {
    q: "Що, якщо пам'ятник пошкодять під час перевезення?",
    a: `Вантаж застрахований, а пакуємо ми так: ${DELIVERY.packaging.toLowerCase()} За десять років жодного розбитого виробу в дорозі, але якщо таке трапиться — виготовляємо новий елемент за наш рахунок.`,
  },
  {
    q: "Чи працюєте ви з благодійними фондами й підприємствами?",
    a: "Так. Для фондів, які встановлюють пам'ятники військовим, і для підприємств виставляємо рахунок на юридичну особу, підписуємо договір і акт, надаємо повний пакет документів. Безготівковий розрахунок з ПДВ або без — залежно від вашої форми.",
  },
  {
    q: "Чи є розстрочка?",
    a: "Три платежі 30/50/20 — це і є наша розстрочка на час виготовлення, без банку й відсотків. Якщо потрібен довший графік — обговоримо індивідуально; частіше за все ми йдемо назустріч родинам загиблих військових.",
  },
  {
    q: "Коли монтуєте — можна бути присутнім?",
    a: "Так, і ми це вітаємо: ви бачите фундамент до того, як його закриє плита, і приймаєте роботу на місці. Якщо приїхати не можете — надсилаємо фото кожного етапу й відео готового результату.",
  },
]

export default function DeliveryPage() {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <InfoPage
        crumbs={[{ name: "Доставка і оплата" }]}
        title="Доставка, монтаж і оплата"
        lead="Ціна на сайті вже містить фундамент, доставку й монтаж у Рівненській та Волинській областях. Усе, що може додатись, — на цій сторінці, щоб не було сюрпризів."
      >
        <Section eyebrow="Доставка" title="Куди і за скільки">
          <Table
            head={["Зона", "Виїзд на замір і монтаж", "Доставка"]}
            rows={[
              [DELIVERY.freeRegions, "безкоштовно", "безкоштовно"],
              ["Інші області України", "за пробігом", `${DELIVERY.perKm} від Костополя`],
              [`ЄС: ${DELIVERY.eu}`, "за домовленістю", "з митним оформленням, рахуємо індивідуально"],
            ]}
            caption="Пробіг рахуємо в один бік до кладовища, за картою. Кажемо суму одразу разом із ціною виробу."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CITIES.map((c) => (
              <Link
                key={c.slug}
                href={`/pamyatnyky/${c.slug}`}
                className="rounded-2xl bg-card p-5 ring-1 ring-black/[0.06] shadow-soft transition-colors hover:ring-foreground/30"
              >
                <div className="font-semibold">{c.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {c.distanceKm ? `${c.distanceKm} км, ${c.travel}` : "цех і майданчик"} ·{" "}
                  {c.freeTravel ? "виїзд безкоштовно" : "за пробігом"}
                </div>
              </Link>
            ))}
          </div>
        </Section>

        <Section eyebrow="Пакування" title="Як їде камінь">
          <Prose text={`${DELIVERY.packaging} Стела, тумба, плита і квітник їдуть окремо, кожен елемент у своїй ніші, тому в дорозі ніщо не треться й не б'ється.\n\nПеревозимо власним транспортом з краном-маніпулятором: він же розвантажує біля ділянки, тому ручного перенесення півтонної стели через усе кладовище немає. Якщо проїзд до ділянки вузький — плануємо це на замірі, а не в день монтажу.`} />
        </Section>

        <Section eyebrow="Монтаж" title="Фундамент, який тримає гарантію">
          <Prose text={`${INSTALLATION.survey} ${INSTALLATION.clay} ${INSTALLATION.peat}\n\n${INSTALLATION.crew} Після монтажу перевіряємо рівень ще раз, герметизуємо шви, забираємо сміття й старий пам'ятник, якщо він був. Ділянку віддаємо готовою — залишається лише посадити квіти.`} />
        </Section>

        <Section eyebrow="Оплата" title="Три платежі">
          <ol className="grid gap-4 md:grid-cols-3">
            {PAYMENT.steps.map((s) => (
              <li key={s.share} className="rounded-2xl bg-card p-6 ring-1 ring-black/[0.06] shadow-soft">
                <div className="text-3xl font-semibold tracking-tight-custom tabular-nums">{s.share}</div>
                <div className="mt-2 font-medium">{s.when}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.what}</div>
              </li>
            ))}
          </ol>
          <Prose className="mt-6" text={`${PAYMENT.methods}\n\nЦіна фіксується в договорі після заміру й не змінюється під час роботи — навіть якщо камінь подорожчав. Гарантія ${WARRANTY_YEARS} років на камінь, фундамент і монтаж входить у вартість і починається з дня встановлення.`} />
        </Section>

        <Section eyebrow="Питання" title="Про доставку й оплату запитують">
          <Faq items={FAQ} />
        </Section>

        <CtaBand />
      </InfoPage>
    </>
  )
}
