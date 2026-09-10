import Link from "next/link"
import { ArrowRight, Gem, Hammer, MapPin, ShieldCheck } from "lucide-react"
import { ConsultButton } from "@/components/consult-button"
import { CONTACT, WARRANTY_YEARS } from "@/lib/site-facts"

/**
 * Про майстерню — спільне для обох напрямів: де ми, як працюємо, чому один
 * цех робить і пам'ятники, і стільниці. Без цін і каталогів: це рівень
 * «хто ми», а не «що купити».
 */
const PILLARS = [
  {
    icon: MapPin,
    title: "Костопіль, Рівненщина",
    text: "Цех і виставковий майданчик за 100 км від кар'єрів Житомирщини. Блоки беремо напряму, без посередників, і бачимо кожну плиту до полірування.",
  },
  {
    icon: Gem,
    title: "Натуральний камінь",
    text: "Український граніт, габро, лабрадорит, італійський та іспанський мармур. На кожну партію — паспорт кар'єру. Штучну «крихту» й підфарбований камінь не використовуємо.",
  },
  {
    icon: Hammer,
    title: "Повний цикл у цеху",
    text: "Розпил, шліфування, полірування, фігурна обробка, гравіювання ручне й лазерне, монтаж власною бригадою з краном. Жоден етап не віддаємо підрядникам.",
  },
  {
    icon: ShieldCheck,
    title: `${WARRANTY_YEARS} років гарантії`,
    text: "На камінь, обробку й монтаж — і для пам'ятника, і для стільниці. Приїжджаємо й виправляємо безкоштовно; на що не поширюється гарантія, допомагаємо за собівартістю.",
  },
]

const STEPS = [
  { title: "Обираєте камінь", text: "У бібліотеці на сайті або наживо на майданчику в Костополі. Підкажемо, який камінь куди: що тримає гравіювання, що не боїться кухні, що потребує догляду." },
  { title: "Отримуєте проєкт і ціну", text: "Ескіз чи 3D-візуалізація у вашому камені й точна цифра — до того, як ви щось платите. Для пам'ятників — за фото ділянки, для дому — після безкоштовного заміру." },
  { title: "Ми виготовляємо й монтуємо", text: "Той самий цех і та сама бригада для обох напрямів. Готовий виріб показуємо до монтажу, після — гарантійний талон." },
]

export function HomeAbout() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Про майстерню</span>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight-custom md:text-5xl text-balance">
            Ми ріжемо камінь, а не перепродаємо його
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            Stone Memory починалась як меморіальна майстерня, і пам'ятники досі — половина нашої роботи. Друга
            половина виросла з того самого каменю: коли ти вмієш відполірувати стелу так, щоб на ній читався
            портрет, стільниця чи сходи — це той самий верстат і ті самі руки.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/pro-nas"
              className="group inline-flex items-center gap-2 rounded-full border border-foreground/15 px-6 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
            >
              Докладніше про нас
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
            <Link
              href="/kontakty"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-6 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
            >
              Приїхати в цех
            </Link>
          </div>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-2xl bg-card p-6 ring-1 ring-black/[0.06] shadow-soft">
              <p.icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
              <dt className="mt-4 text-lg font-semibold tracking-tight-custom">{p.title}</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{p.text}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-16 md:mt-24">
        <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Як це працює</span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight-custom md:text-5xl text-balance">
          Три кроки — для обох напрямів
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl bg-card p-6 ring-1 ring-black/[0.06] shadow-soft">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-sm font-semibold tabular-nums text-background">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight-custom">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-16 rounded-3xl bg-foreground px-6 py-10 text-background md:mt-24 md:px-12 md:py-14">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight-custom md:text-4xl text-balance">
              Не знаєте, з чого почати? Напишіть, що потрібно
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-background/75 md:text-base">
              Пам'ятник, стільниця чи сходи — відповідає майстер, а не бот. Ескіз і ціну повертаємо протягом
              робочого дня.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <ConsultButton className="bg-background text-foreground" topic="Головна: не знаєте, з чого почати">Написати майстру</ConsultButton>
            <a href={CONTACT.phoneHref} className="text-sm font-medium text-background/85 hover:text-background">
              {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
