import { ConsultButton } from "@/components/consult-button"
import { CONTACT } from "@/lib/site-facts"

/**
 * Як працюємо — три кроки, спільні для обох напрямів, і фінальний CTA.
 * Без цін і каталогів: це рівень «як із нами працювати», а не «що купити».
 * Блок «хто ми» з чотирма тезами прибрано: усе це є на /pro-nas.
 */
const STEPS = [
  { title: "Обираєте камінь", text: "У бібліотеці на сайті або наживо на майданчику в Костополі. Підкажемо, який камінь куди: що тримає гравіювання, що підходить для кухні, що потребує догляду." },
  { title: "Отримуєте проєкт і ціну", text: "Ескіз чи 3D-візуалізація у вашому камені й точна цифра — до того, як ви щось платите. Для пам'ятників — за фото ділянки, для дому — після безкоштовного заміру." },
  { title: "Ми виготовляємо й монтуємо", text: "Той самий цех і та сама бригада для обох напрямів. Готовий виріб показуємо до монтажу, після — гарантійний талон." },
]

export function HomeAbout() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
      <div>
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
              Пам'ятник, стільниця чи сходи. Ескіз і ціну повертаємо протягом
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
