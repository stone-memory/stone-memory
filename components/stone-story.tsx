import { productStory } from "@/lib/product-copy"
import type { StoneItem } from "@/lib/types"

/**
 * «Про цю модель», розміри елементів і чинники ціни — серверний компонент.
 *
 * Текст статичний і лише українською, тож йому нічого робити в клієнтському
 * пакеті: раніше він жив усередині StoneDetailClient разом із усім словником
 * product-copy, і телефон завантажував, розбирав і гідратував кілька
 * кілобайт прози, яка ніколи не змінюється після рендеру. Тепер це HTML із
 * сервера; клієнтська обгортка лише ховає блок для інших локалей.
 */
export function StoneStory({ stone }: { stone: StoneItem }) {
  const story = productStory(stone)
  const [, ...storyRest] = story.intro.split("\n\n")

  return (
    <section className="mt-16 grid gap-10 md:mt-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight-custom md:text-3xl">Про цю модель</h2>
        <div className="mt-5 max-w-2xl space-y-4 text-base leading-relaxed text-foreground/85 md:text-[17px]">
          {storyRest.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <h3 className="mt-10 text-lg font-semibold tracking-tight-custom md:text-xl">Розміри елементів</h3>
        <dl className="mt-3 max-w-2xl divide-y divide-foreground/5 rounded-2xl border border-foreground/10 px-5">
          {story.sizes.map((s) => (
            <div key={s.part} className="flex items-baseline justify-between gap-6 py-2.5 text-[15px]">
              <dt className="text-muted-foreground">{s.part}</dt>
              <dd className="text-right font-medium tabular-nums">{s.size}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Розміри типові для цієї моделі. Ріжемо під вашу ділянку — на замірі уточнюємо кожен елемент.
        </p>
      </div>

      <div>
        <div className="rounded-2xl bg-secondary/60 p-6">
          <h3 className="text-lg font-semibold tracking-tight-custom">Від чого залежить остаточна ціна</h3>
          <ul className="mt-4 space-y-2 text-[15px] text-foreground/85">
            {story.priceFactors.map((it) => (
              <li key={it} className="flex items-start gap-2.5">
                <span className="mt-[0.6rem] inline-block h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                {it}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">Можна додати окремо: {story.extras.join(", ")}.</p>
        </div>
      </div>
    </section>
  )
}
