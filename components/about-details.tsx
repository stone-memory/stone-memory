import Link from "next/link"
import { CONTACT, DELIVERY, LEAD_TIMES, PAYMENT, WARRANTY_YEARS, CITIES } from "@/lib/site-facts"
import { STONE_GUIDE } from "@/lib/stone-guide"

/**
 * Друга половина сторінки «Про нас».
 *
 * Верхній блок (AboutSection) редагується в адмінці і лишається коротким
 * вступом із контактами. Тут — те, що клієнт насправді хоче знати перед
 * замовленням: де цех і чому саме там, як іде робота, що входить у ціну,
 * куди ми їздимо. Жодних вигаданих цифр: усе з lib/site-facts.ts і довідника
 * каменю, тож при зміні факту правиться одне місце.
 */
export function AboutDetails({ modelCount }: { modelCount: number }) {
  const ukrStones = STONE_GUIDE.filter((s) => s.rock !== "Мармур" || s.key === "marble").length
  const freeCities = CITIES.filter((c) => c.freeTravel).map((c) => c.name)

  const facts = [
    { value: String(modelCount), label: "моделей у каталозі" },
    { value: String(STONE_GUIDE.length), label: "каменів у довіднику" },
    { value: `${WARRANTY_YEARS} років`, label: "гарантії на камінь, фундамент і монтаж" },
    { value: LEAD_TIMES.single, label: "виготовлення одинарного пам'ятника" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 md:pb-28">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {facts.map((f) => (
          <div key={f.label} className="rounded-2xl bg-card p-5 ring-1 ring-black/[0.04] shadow-soft">
            <p className="text-2xl font-semibold tracking-tight-custom md:text-3xl">{f.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{f.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 space-y-14 md:mt-20 md:space-y-20">
        <Block eyebrow="Де ми" title="Чому цех саме в Костополі">
          <p>
            Костопіль стоїть між двома джерелами каменю. За 15 кілометрів — Берестовецький кар'єр, звідки ми беремо
            базальт, найщільніший із місцевих каменів. За 100 кілометрів — Житомирщина з її родовищами: Головинське й
            Букинське габро, лезниківський, покостівський, капустинський граніти, лабрадорит. Блоки приходять у цех
            напряму з кар'єру, без посередників і без складу в обласному центрі, тому в ціні немає оренди салону.
          </p>
          <p>
            Адреса цеху: {CONTACT.address}. Тут же виставковий майданчик: можна подивитись камінь наживо, торкнутись
            полірування, побачити гравіювання на реальних стелах. Працюємо {CONTACT.hours.map((h) => `${h.days} ${h.time}`).join(", ")}.
          </p>
        </Block>

        <Block eyebrow="Що робимо" title="Два напрями з одного каменю">
          <p>
            Stone Memory починалась як меморіальна майстерня, і пам'ятники досі половина нашої роботи: одинарні й
            подвійні, хрести, дитячі, військові, меморіальні комплекси, скульптура й нетипові форми. У каталозі {modelCount}{" "}
            моделей, і кожну можна виконати в будь-якому з {STONE_GUIDE.length} каменів довідника — форма і камінь не
            пов'язані.
          </p>
          <p>
            Друга половина виросла з того самого цеху: стільниці, підвіконня, сходи, фасади й бруківка з граніту, мармуру
            та кварцу. Той, хто вміє відполірувати стелу так, щоб на ній читався портрет, ріже й кухонну стільницю. Це
            окремий розділ сайту, <Link href="/arkhitekturnyi-kamin" className="underline underline-offset-4">архітектурний камінь</Link>.
          </p>
        </Block>

        <Block eyebrow="Як працюємо" title="Від фото ділянки до змонтованого пам'ятника">
          <ol className="list-decimal space-y-3 pl-5">
            <li>
              <strong>Запит.</strong> Фото місця, побажання, модель із каталогу або своя ідея. Відповідаємо протягом
              робочого дня, називаємо орієнтовну ціну.
            </li>
            <li>
              <strong>Замір і ескіз.</strong> Виїжджаємо на ділянку самі, у зоні {DELIVERY.freeRegions} безкоштовно.
              Ескіз із розмірами і 3D-рендер погоджуємо по фото й відео, приїжджати в цех не потрібно.
            </li>
            <li>
              <strong>Виготовлення.</strong> {LEAD_TIMES.single} для одинарного, {LEAD_TIMES.complex} для комплексу.
              Перед відвантаженням надсилаємо фото готового виробу або показуємо в цеху.
            </li>
            <li>
              <strong>Монтаж.</strong> Бригада з 2–3 людей, шурф під фундамент, армований бетон, герметизація швів.
              Одинарний пам'ятник ставимо за день, комплекс за 1–3 дні.
            </li>
          </ol>
          <p>
            Оплата трьома частинами: {PAYMENT.steps.map((s) => `${s.share} ${s.when}`).join(", ")}.
          </p>
        </Block>

        <Block eyebrow="Ціна" title="Що входить у кожну ціну на сайті">
          <p>
            Ціна «від» на картці — це виріб у полірованому камені в базовому розмірі, портрет і напис, армований
            фундамент, доставка й монтаж бригадою в Рівненській та Волинській областях. Це та комплектація, яку ви бачите
            на фото. Ціна зростає від розміру, складності різьблення, додаткових елементів і, найменше, від каменю:
            камінь це 15–35 % вартості виробу.
          </p>
          <p>
            Гарантія {WARRANTY_YEARS} років поширюється на камінь, фундамент і монтаж разом. Якщо щось пішло не так,
            приїжджаємо й виправляємо за свій рахунок. Докладніше на сторінці{" "}
            <Link href="/tsiny" className="underline underline-offset-4">цін</Link> і в{" "}
            <Link href="/harantiya" className="underline underline-offset-4">умовах гарантії</Link>.
          </p>
        </Block>

        <Block eyebrow="Куди їздимо" title="Рівненщина, Волинь, уся Україна і ЄС">
          <p>
            Найчастіше працюємо {freeCities.length ? `у містах ${freeCities.join(", ")}` : "по Рівненщині й Волині"} та в
            селах навколо них: виїзд на замір, монтаж і гарантійний огляд там безкоштовні. В інші області доставка
            рахується за пробігом, {DELIVERY.perKm}. У Київ, Житомир, Львів веземо готові й перевірені вироби, монтаж
            займає один-два дні.
          </p>
          <p>
            За кордон відправляємо в {DELIVERY.eu}: дерев'яна обрешітка, кути в пінопласті, кожен елемент окремо, вантаж
            застрахований. Сторінки міст із умовами й термінами зібрані в розділі{" "}
            <Link href="/pamyatnyky" className="underline underline-offset-4">пам'ятники за містами</Link>.
          </p>
        </Block>
      </div>
    </div>
  )
}

function Block({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr] md:gap-12">
      <div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight-custom md:text-3xl text-balance">{title}</h2>
      </div>
      <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground md:text-base">{children}</div>
    </section>
  )
}
