import Link from "next/link"
import { SERVICE_PRICES, LEAD_TIMES, PAYMENT, DELIVERY, INSTALLATION, WARRANTY_YEARS } from "@/lib/site-facts"

/**
 * Розгорнутий опис послуг для /posluhy.
 *
 * Сім карток угорі сторінки дають по одному реченню на послугу, і на цьому
 * сторінка закінчувалась: 98 слів проти 1 500–2 500 у конкурентів. Тут — що
 * саме входить у кожну послугу, скільки це коштує окремо від пам'ятника і куди
 * йти далі. Цифри беруться з lib/site-facts.ts, а не дублюються рядками.
 *
 * Серверний компонент; сторінка вставляє його в клієнтську обгортку як
 * `details`, і той показує його лише для української локалі.
 */

type Block = {
  id: string
  title: string
  lead: string
  included: string[]
  note?: string
  links: { href: string; label: string }[]
}

const BLOCKS: Block[] = [
  {
    id: "design",
    title: "Дизайн і 3D-візуалізація",
    lead:
      "Пам'ятник починається не з каменю, а з ескізу. Ми беремо ваші фото, побажання й розмір ділянки і за 2–3 дні повертаємо ескіз із розмірами кожного елемента та фотореалістичний рендер у середовищі — щоб ви побачили пропорції до того, як камінь буде розпиляно.",
    included: [
      "перша консультація й підбір моделі з каталогу або з нуля",
      "ескіз із розмірами стели, тумби, квітника, плити",
      "підбір каменю за нашим довідником з 17 варіантів",
      "до п'яти правок ескізу без доплати",
      "3D-рендер із портретом і написами на вашому камені",
    ],
    note: "Ескіз і візуалізація безкоштовні для замовлень із каталогу. За повністю авторський проєкт беремо передоплату, яка зараховується у вартість пам'ятника.",
    links: [
      { href: "/memorial/kameni", label: "Довідник каменю" },
      { href: "/yak-zamovyty", label: "Як проходить замовлення" },
    ],
  },
  {
    id: "engraving",
    title: "Гравіювання та портрети",
    lead:
      "Портрет — це те, на що дивляться найдовше, тому ми робимо його трьома способами й радимо не за ціною, а за каменем: на чорному габро найкраще читається глибоке лазерне гравіювання, на світлому граніті — фотокераміка або кольоровий портрет на склі.",
    included: [
      "ретуш старого фото перед гравіюванням — у вартості",
      "пробний відбиток портрета на погодження",
      "напис: ім'я, дати, епітафія; шрифти на вибір",
      "символіка: хрест, тризуб, шеврон, орнамент, квіти",
      "позолота літер і символів",
    ],
    links: [
      { href: "/blog/fotokeramika-chy-hraviuvannia", label: "Гравіювання, фотокераміка чи кольорове фото" },
      { href: "/blog/epitaph-writing", label: "60 прикладів епітафій" },
    ],
  },
  {
    id: "production",
    title: "Виробництво й обробка",
    lead:
      "Цех у Костополі за 100 км від кар'єрів Житомирщини і за 15 км від берестовецького базальту. Кожен виріб проходить сім етапів: розпил блока, калібрування, шліфування, полірування, фігурне різання, гравіювання і контроль геометрії перед відвантаженням.",
    included: [
      "український граніт, габро, лабрадорит із паспортом партії",
      "полірування до дзеркала або матова й термооброблена поверхня",
      "фігурний розпил: серце, книга, хвиля, арка, хрест із суцільної плити",
      "різьблення: троянда, дубова гілка, ангел, орнамент",
      "усі елементи комплекту з одного блока, щоб відтінок збігався",
    ],
    note: `Терміни: одинарний пам'ятник ${LEAD_TIMES.single}, подвійний і комплекс ${LEAD_TIMES.complex}, хрест ${LEAD_TIMES.cross}. ${LEAD_TIMES.seasonNote}`,
    links: [
      { href: "/memorial/pamyatnyky", label: "Каталог моделей" },
      { href: "/tsiny", label: "Ціни за типами" },
    ],
  },
  {
    id: "delivery",
    title: "Доставка і монтаж",
    lead:
      "Монтаж входить у ціну кожної моделі на сайті, і робить його наша бригада, а не підрядник на місці. Перед установкою робимо шурф, щоб побачити ґрунт, і під нього підбираємо фундамент.",
    included: [
      `безкоштовний виїзд на замір і монтаж: ${DELIVERY.freeRegions}`,
      `інші області — ${DELIVERY.perKm} за пробігом від Костополя`,
      INSTALLATION.survey,
      INSTALLATION.clay,
      INSTALLATION.peat,
      INSTALLATION.crew,
      DELIVERY.packaging,
    ],
    note: `Веземо й за кордон: ${DELIVERY.eu}. Вантаж застрахований, документи на вивіз готуємо ми.`,
    links: [
      { href: "/dostavka-i-oplata", label: "Умови доставки та оплати" },
      { href: "/pamyatnyky", label: "Міста, куди їздимо найчастіше" },
    ],
  },
  {
    id: "landscaping",
    title: "Благоустрій ділянки",
    lead:
      "Комплекс — це не лише стела. Облицювання гранітною плиткою, цоколь, огорожа з кулями або балясинами, лава й стіл, доріжка з бруківки — усе з того самого каменю, що й пам'ятник, тому ділянка виглядає цілісно і за нею легко доглядати.",
    included: [
      "облицювання ділянки плиткою: полірованою або термообробленою",
      "гранітний цоколь і огорожа",
      "лава, стіл, ліхтарі, вази з граніту",
      "бруківка навколо ділянки",
      "дренаж і бетонний пояс під облицюванням",
    ],
    links: [
      { href: "/memorial/pamyatnyky/kompleksy", label: "Меморіальні комплекси" },
      { href: "/blog/garden-stone-composition", label: "Як спланувати ділянку" },
    ],
  },
  {
    id: "care",
    title: "Догляд і реставрація",
    lead:
      "Старий пам'ятник часто можна врятувати: вирівняти нахил, оновити стертий напис, зняти мох і наліт, замінити один елемент замість усього комплекту. Спершу оцінюємо по фото і чесно кажемо, що дешевше — ремонт чи заміна.",
    included: [
      "чистка полірованого каменю без кислот і абразивів",
      "повторне полірування вицвілих площин",
      "оновлення напису, повторна позолота",
      "вирівнювання стели, ремонт фундаменту",
      "заміна квітника, плити або тумби з підбором каменю в тон",
    ],
    note: "Виїзд на огляд у Рівненській і Волинській областях безкоштовний.",
    links: [
      { href: "/blog/restoring-old-monuments", label: "Що можна врятувати, а що краще замінити" },
      { href: "/blog/stone-care-seasons", label: "Догляд по сезонах" },
    ],
  },
  {
    id: "warranty",
    title: `Гарантія ${WARRANTY_YEARS} років`,
    lead:
      "Гарантія поширюється на камінь, фундамент і монтаж разом. Тріщина, нахил, відшарування полірування, вицвітання гравіювання — приїжджаємо й виправляємо за свій рахунок, бо більшість проблем із пам'ятниками йдуть саме від фундаменту, а не від каменю.",
    included: [
      "камінь: тріщини, сколи, зміна кольору не з вини клієнта",
      "фундамент і монтаж: нахил, просідання, розходження швів",
      "гравіювання і позолота: читабельність напису",
      "виїзд на гарантійний огляд без доплати",
    ],
    links: [{ href: "/harantiya", label: "Повні умови гарантії" }],
  },
]

export function ServicesDetails() {
  return (
    <div className="mt-16 space-y-14 md:mt-24 md:space-y-20">
      <section aria-labelledby="services-prices">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Ціни на роботи</p>
        <h2 id="services-prices" className="mt-2 text-3xl font-semibold tracking-tight-custom md:text-4xl text-balance">
          Скільки коштують роботи окремо від пам'ятника
        </h2>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
          У ціні кожної моделі в каталозі вже є портрет, напис, фундамент, доставка й монтаж. Цей прайс — для випадків, коли
          пам'ятник уже стоїть і потрібна лише одна робота, або коли до моделі додаються елементи понад базову
          комплектацію. Точну суму називаємо після фото.
        </p>
        <div className="mt-6 overflow-x-auto rounded-3xl bg-card ring-1 ring-black/[0.04] shadow-soft">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-5 py-4 font-medium">Робота</th>
                <th className="px-5 py-4 font-medium">Ціна</th>
                <th className="px-5 py-4 font-medium">Примітка</th>
              </tr>
            </thead>
            <tbody>
              {SERVICE_PRICES.map((s) => (
                <tr key={s.name} className="border-t border-foreground/[0.06]">
                  <td className="px-5 py-3.5 font-medium">{s.name}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">{s.price}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Оплата трьома частинами: {PAYMENT.steps.map((s) => `${s.share} ${s.when}`).join(", ")}. {PAYMENT.methods}
        </p>
      </section>

      {BLOCKS.map((b, i) => (
        <section key={b.id} id={`${b.id}-details`} aria-labelledby={`${b.id}-h`} className="grid grid-cols-1 gap-6 md:grid-cols-[1.2fr_1fr] md:gap-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h2 id={`${b.id}-h`} className="mt-2 text-2xl font-semibold tracking-tight-custom md:text-3xl text-balance">
              {b.title}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground md:text-base">{b.lead}</p>
            {b.note ? <p className="mt-4 text-[15px] leading-relaxed text-foreground/80 md:text-base">{b.note}</p> : null}
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {b.links.map((l) => (
                <Link key={l.href} href={l.href} className="underline-offset-4 hover:underline">
                  {l.label} →
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-card p-6 ring-1 ring-black/[0.04] shadow-soft md:p-7">
            <p className="text-sm font-medium">Що входить</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              {b.included.map((x) => (
                <li key={x} className="flex gap-2.5">
                  <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </div>
  )
}
