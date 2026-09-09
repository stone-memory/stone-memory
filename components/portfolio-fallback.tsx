import Link from "next/link"
import { InfoPage, Section, Prose, CtaBand, LinkPills } from "@/components/info-page"
import { StoneCard } from "@/components/stone-card"
import { productType } from "@/lib/product-copy"
import { CITIES } from "@/lib/site-facts"
import type { StoneItem } from "@/lib/types"

/**
 * Портфоліо, поки в адмінці немає жодного проєкту.
 *
 * Сторінка /proekty стояла порожньою — заголовок, фільтри і прочерк — при
 * priority 0.9 у sitemap. Фото в каталозі — це змонтовані ділянки, тобто
 * фактично виконані роботи, тому до появи справжніх проєктів показуємо їх:
 * комплекси й військові, від найскладніших. Щойно в /admin/projects з'явиться
 * перший проєкт, сторінка повертається до звичайного портфоліо.
 */
export function PortfolioFallback({ stones }: { stones: StoneItem[] }) {
  const monuments = stones.filter((s) => s.category === "memorial")
  const complexes = monuments
    .filter((s) => ["complex", "military"].includes(productType(s)))
    .sort((a, b) => (b.priceFrom ?? 0) - (a.priceFrom ?? 0))
    .slice(0, 12)

  return (
    <InfoPage
      crumbs={[{ name: "Наші роботи" }]}
      title="Наші роботи"
      lead="Меморіальні комплекси й військові пам'ятники, які ми виготовили в Костополі та встановили для родин по Україні. Кожну з цих робіт можна повторити у вашому камені й розмірі."
    >
      <Section>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {complexes.map((s, i) => (
            <StoneCard key={s.id} item={s} priority={i < 3} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Як читати ці фото" title="На кожному знімку — готова ділянка">
        <Prose text="Ми знімаємо не стелу в цеху, а змонтований результат: фундамент, облицювання, квітник, огорожу, доріжку. Так видно пропорції й те, як камінь виглядає на кладовищі при денному світлі, а не під лампами. Ціна в картці — за все, що на фото, у базовому розмірі.\n\nЯкщо ви бачили роботу деінде й хочете так само — надішліть фото. Зробимо ескіз у своєму камені й порахуємо; часто виходить дешевше, бо ми виробник." />
        <div className="mt-6">
          <LinkPills
            items={[
              { href: "/memorial/pamyatnyky/kompleksy", label: "Усі комплекси" },
              { href: "/memorial/pamyatnyky/viyskovi", label: "Військові" },
              { href: "/memorial/pamyatnyky", label: "Весь каталог" },
              ...CITIES.slice(1, 4).map((c) => ({ href: `/pamyatnyky/${c.slug}`, label: `Роботи ${c.inCity.replace(/^у /, "")}` })),
            ]}
          />
        </div>
      </Section>

      <Section>
        <p className="text-sm text-muted-foreground">
          Свіжі роботи щотижня — в{" "}
          <Link href="https://www.instagram.com/sttonememory" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">
            Instagram
          </Link>
          .
        </p>
      </Section>

      <CtaBand title="Хочете так само?" text="Надішліть фото ділянки й роботу, яка сподобалась, — зробимо ескіз у вашому камені й порахуємо вартість." />
    </InfoPage>
  )
}
