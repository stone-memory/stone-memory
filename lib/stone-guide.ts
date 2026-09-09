import type { StaticImageData } from "next/image"
import type { StoneMaterial, StoneColor } from "@/lib/types"

// Статичний імпорт, а не рядок "/stone/x.jpg" — навмисно. Next додає в імʼя
// файлу хеш вмісту, тому заміна фотографії дає НОВИЙ URL. Зі звичайним шляхом
// URL не змінювався, і браузер із кешем на тиждень (див. headers у
// next.config.mjs) далі показував стару картинку навіть після перезбирання.
import pokostivskyiImg from "@/public/stone/pokostivskyi.jpg"
import gabbroImg from "@/public/stone/gabbro.jpg"
import labradoriteImg from "@/public/stone/labradorite.jpg"
import kapustynskyiImg from "@/public/stone/kapustynskyi.jpg"
import leznykivskyiImg from "@/public/stone/leznykivskyi.jpg"
import didkovytskyiImg from "@/public/stone/didkovytskyi.jpg"
import marbleImg from "@/public/stone/marble.jpg"
// Родовища, що вже фігурували в назвах товарів, але не мали запису в довіднику.
// Свотчі вирізані з рендерів каталогу (074, 075, 083, 069) до появи макрознімків.
import tanskyiImg from "@/public/stone/tanskyi.jpg"
import sofiyivskyiImg from "@/public/stone/sofiyivskyi.jpg"
import maslavskyiImg from "@/public/stone/maslavskyi.jpg"
import berestovetskyiImg from "@/public/stone/berestovetskyi.jpg"
// Камені, що прийшли з розділу «Архітектурний камінь»: ті самі українські
// родовища й імпортний мармур, які ми ріжемо на стільниці, годяться й на
// пам'ятники. Свотчі беремо з його бібліотеки, щоб не тримати два комплекти.
import tokivskyiImg from "@/public/materials/carpazi.webp"
import mezhyritskyiImg from "@/public/materials/flower-of-ukraine.webp"
import kornynskyiImg from "@/public/materials/leopard.webp"
import neroMarquinaImg from "@/public/materials/nero-marquina.webp"
import emperadorImg from "@/public/materials/emperador-dark.webp"
import cremaMarfilImg from "@/public/materials/crema-marfil.webp"

/**
 * Довідник каменю — єдине джерело правди про те, між чим обирає клієнт.
 *
 * Головна теза, заради якої цей модуль існує: вибір ОДИН, а не два.
 * Родовище — це не окрема вісь поверх породи, а правильна назва кольору.
 * «Червоний граніт» без родовища нічого не описує: лезниківський і
 * капустинський обидва червоні й виглядають по-різному.
 *
 * Тому кожен запис = один пункт у селекторі матеріалу, а не комбінація.
 *
 * `priceLevel` навмисно словом, а не коефіцієнтом: різниця між родовищами
 * лежить у межах 0,72–1,28 і діє лише на кам'яну частку ціни (7–35 %
 * залежно від типу виробу). Показувати покупцеві множник — обіцяти
 * точність, якої в даних немає.
 */
export type StoneGuideEntry = {
  /** Значення, яке пишеться в `materialType` товару. */
  key: string
  /** Як це називається в селекторі та в заголовку картки. */
  name: string
  /** Порода — що це за камінь геологічно. */
  rock: "Граніт" | "Габро" | "Лабрадорит" | "Мармур" | "Базальт"
  /** Канонічний колір для фасетів каталогу. */
  color: StoneColor
  /** Як виглядає — зерно, відтінок, поведінка на світлі. */
  look: string
  /** Чому його обирають. Практична причина, не маркетинг. */
  why: string
  priceLevel: "Найдоступніший" | "Середній" | "Вищий" | "Преміум"
  /**
   * Множник вартості САМОГО каменю відносно середнього по ринку.
   *
   * Виміряний like-for-like: ukr.granite.ua продає один і той самий виріб
   * одного розміру з 17 родовищ, 14 порівнянних груп. Діапазон 0,72–1,35.
   * Це множник на камінь, а НЕ на ціну виробу — див. priceWithMaterial().
   */
  coef: number
  /**
   * Макрознімок поверхні каменю. Імпортується статично, щоб URL ніс хеш
   * вмісту — інакше заміна файлу не долітає до браузера через кеш.
   */
  swatch: StaticImageData
  /** `code` товару з каталогу, який показуємо як приклад виробу. */
  exampleCode: string
  /** Фасет каталогу, якщо для цього кольору він існує. */
  facet?: string
  /**
   * Слаг тієї самої колекції в розділі «Архітектурний камінь»
   * (/arkhitekturnyi-kamin/materialy/<slug>) — щоб з довідника пам'ятників можна
   * було перейти до того ж каменю для дому, і навпаки.
   */
  interiorSlug?: string
}

export const STONE_GUIDE: StoneGuideEntry[] = [
  {
    key: "Покостівський",
    name: "Покостівський граніт",
    rock: "Граніт",
    color: "grey",
    look: "Рівний сірий тон із дрібним однорідним зерном, без різких вкраплень.",
    why: "Найспокійніший вигляд і найдоступніша ціна. Добре тримає геометрію на великих плитах, тому його часто беруть на облицювання ділянки й цоколь.",
    priceLevel: "Найдоступніший",
    coef: 0.72,
    swatch: pokostivskyiImg,
    exampleCode: "073",
    interiorSlug: "grey-ukraine",
  },
  {
    key: "gabbro",
    name: "Габро",
    rock: "Габро",
    color: "black",
    look: "Глибокий чорний, майже без вкраплень. Після полірування — дзеркальна поверхня.",
    why: "Дає найбільший контраст під гравіювання: портрет на габро виглядає майже фотографічно. Саме тому це найпоширеніший вибір для пам'ятника з портретом.",
    priceLevel: "Середній",
    coef: 0.8,
    swatch: gabbroImg,
    exampleCode: "003",
    facet: "chorni",
    interiorSlug: "kometa-black",
  },
  {
    key: "labradorite",
    name: "Лабрадорит",
    rock: "Лабрадорит",
    color: "black",
    look: "Темний камінь із синіми та зеленими переливами, які спалахують під кутом до сонця.",
    why: "Той самий контраст під гравіювання, що й габро, але камінь «живий» — виглядає по-різному вранці та ввечері. Обирають, коли хочуть відійти від строгого чорного.",
    priceLevel: "Середній",
    coef: 0.92,
    swatch: labradoriteImg,
    exampleCode: "045",
    facet: "chorni",
    interiorSlug: "volga-blue",
  },
  {
    key: "Капустинський",
    name: "Капустинський граніт",
    rock: "Граніт",
    color: "red",
    look: "Червоно-рожевий, світліший і м'якший за лезниківський, зерно середнє.",
    why: "Тепліший і менш строгий тон. Часто обирають для жіночих і дитячих поховань, а також коли поруч уже стоїть світлий пам'ятник.",
    priceLevel: "Середній",
    coef: 0.98,
    swatch: kapustynskyiImg,
    exampleCode: "019",
    facet: "chervoni",
    interiorSlug: "rosso-santiago",
  },
  {
    key: "Лезниківський",
    name: "Лезниківський граніт",
    rock: "Граніт",
    color: "red",
    look: "Насичений цегляно-червоний з великим зерном. Українська класика.",
    why: "Колір дає польовий шпат у структурі породи, а не покриття, тому сонце його не бере — камінь не вигорає десятиліттями.",
    priceLevel: "Вищий",
    coef: 1.1,
    swatch: leznykivskyiImg,
    exampleCode: "004",
    facet: "chervoni",
    interiorSlug: "maple-red",
  },
  {
    key: "Дідковицький",
    name: "Дідковицький граніт",
    rock: "Граніт",
    color: "green",
    look: "Темно-зелений із сірим підтоном, зерно середнє.",
    why: "Рідший вибір, який добре виглядає поряд із деревами та живою огорожею. Гравіювання заповнюють золотом або білою емаллю — звичайна різьба на зеленому читається слабше.",
    priceLevel: "Вищий",
    coef: 1.08,
    swatch: didkovytskyiImg,
    exampleCode: "013",
    interiorSlug: "star-of-ukraine",
  },
  {
    key: "marble",
    name: "Мармур білий",
    rock: "Мармур",
    color: "white",
    look: "Світлий, майже білий, із характерними прожилками. Кожна плита унікальна.",
    why: "Найм'якший за настроєм камінь — його беруть на дитячі пам'ятники, скульптуру й хрести. Потребує більшого догляду: мармур пористіший за граніт і чутливіший до кислотних опадів.",
    priceLevel: "Преміум",
    coef: 1.35,
    swatch: marbleImg,
    exampleCode: "091",
    interiorSlug: "bianco-carrara",
  },
  {
    key: "Танський",
    name: "Танський граніт",
    rock: "Граніт",
    color: "grey",
    look: "Світло-сірий із дрібним зерном і ледь помітними темними цятками, рівномірний по всій плиті.",
    why: "Найближчий за виглядом до покостівського, але трохи світліший. Беруть, коли поруч уже стоїть світлий пам'ятник і потрібно потрапити в тон.",
    priceLevel: "Найдоступніший",
    coef: 0.9,
    swatch: tanskyiImg,
    exampleCode: "074",
    facet: "siri",
  },
  {
    key: "Софіївський",
    name: "Софіївський граніт",
    rock: "Граніт",
    color: "grey",
    look: "Сіро-бежевий, теплий, із середнім зерном. На сонці виглядає майже білим.",
    why: "Найтепліший зі світлих українських гранітів. Підходить для дитячих пам'ятників і європейських форм, де білий мармур надто холодний, а догляду за ним не хочеться.",
    priceLevel: "Середній",
    coef: 0.95,
    swatch: sofiyivskyiImg,
    exampleCode: "075",
    facet: "siri",
  },
  {
    key: "Маславський",
    name: "Маславський граніт",
    rock: "Граніт",
    color: "green",
    look: "Темно-зелений із сірими прожилками й дрібним зерном, спокійніший за дідковицький.",
    why: "Зелений камінь без різкого малюнка. Добре тримає полірування й читається під золотим гравіюванням; на ділянках під деревами виглядає природніше за чорний.",
    priceLevel: "Середній",
    coef: 1.0,
    swatch: maslavskyiImg,
    exampleCode: "083",
  },
  {
    key: "Берестовецький",
    name: "Берестовецький базальт",
    rock: "Базальт",
    color: "black",
    look: "Темно-сірий до чорного, дуже дрібне однорідне зерно, матовіший за габро після полірування.",
    why: "Наш місцевий камінь: кар'єр у Берестовці за 15 км від цеху в Костополі. Це базальт, а не граніт: щільніший, не боїться морозу, і доставка каменю в ціну майже не входить.",
    priceLevel: "Середній",
    coef: 0.85,
    swatch: berestovetskyiImg,
    exampleCode: "069",
    facet: "chorni",
  },
  {
    key: "Токівський",
    name: "Токівський граніт",
    rock: "Граніт",
    color: "brown",
    look: "Червоно-коричневий із темними вкрапленнями, середнє зерно. У розділі каменю для дому — Carpazi.",
    why: "Тепліший і спокійніший за яскраво-червоний лезниківський. Добре поєднується з чорною тумбою й підходить для ділянок під деревами, де червоний виглядав би різко.",
    priceLevel: "Вищий",
    coef: 1.15,
    swatch: tokivskyiImg,
    exampleCode: "100",
    interiorSlug: "carpazi",
  },
  {
    key: "Межиріцький",
    name: "Межиріцький граніт",
    rock: "Граніт",
    color: "red",
    look: "Червоно-рожевий із сірими «квітами» — великими світлими вкрапленнями. У розділі каменю для дому — Flower of Ukraine.",
    why: "Найвиразніший рисунок серед українських гранітів: підходить для стел без портрета, де камінь сам є декором. Гравіювання читається на ньому гірше, тому портрет робимо на чорній вставці.",
    priceLevel: "Середній",
    coef: 1.02,
    swatch: mezhyritskyiImg,
    exampleCode: "062",
    interiorSlug: "flower-of-ukraine",
    facet: "chervoni",
  },
  {
    key: "Корнинський",
    name: "Корнинський граніт",
    rock: "Граніт",
    color: "grey",
    look: "Сіро-рожевий із плямистим рисунком, за який його називають Leopard. Зерно велике.",
    why: "Світлий і теплий, м'якший за покостівський. Обирають для облицювання ділянки й тумби в парі з чорною стелою, а також для хрестів без портрета.",
    priceLevel: "Середній",
    coef: 0.94,
    swatch: kornynskyiImg,
    exampleCode: "076",
    interiorSlug: "leopard",
    facet: "siri",
  },
  {
    key: "Nero Marquina",
    name: "Мармур Nero Marquina",
    rock: "Мармур",
    color: "black",
    look: "Глибокий чорний мармур із білими прожилками. Іспанія.",
    why: "Для тих, хто хоче чорний камінь із малюнком, а не рівне габро. Це мармур: під портрет його не беремо, але на хрест, плиту й скульптурні елементи він виглядає дорого. Потребує просочення.",
    priceLevel: "Преміум",
    coef: 1.4,
    swatch: neroMarquinaImg,
    exampleCode: "112",
    interiorSlug: "nero-marquina",
  },
  {
    key: "Emperador Dark",
    name: "Мармур Emperador Dark",
    rock: "Мармур",
    color: "brown",
    look: "Темно-коричневий мармур із світлими прожилками. Іспанія.",
    why: "Рідкісний для кладовищ теплий темний колір. Беремо на плити, вази й акценти в комплексах, де хочеться відійти від чорного, не переходячи на червоне.",
    priceLevel: "Преміум",
    coef: 1.4,
    swatch: emperadorImg,
    exampleCode: "111",
    interiorSlug: "emperador-dark",
  },
  {
    key: "Crema Marfil",
    name: "Мармур Crema Marfil",
    rock: "Мармур",
    color: "beige",
    look: "Кремово-бежевий, майже однорідний мармур. Іспанія.",
    why: "Найспокійніший світлий камінь: без різких прожилок, як у Carrara. Для дитячих пам'ятників і скульптури, коли білий здається надто холодним. Потребує просочення й догляду.",
    priceLevel: "Преміум",
    coef: 1.35,
    swatch: cremaMarfilImg,
    exampleCode: "113",
    interiorSlug: "crema-marfil",
  },
]

/** Породи в порядку, у якому їх пояснює сторінка-довідник. */
export const ROCK_TYPES = [
  {
    rock: "Габро" as const,
    colorRule: "Завжди чорний, з якого б родовища не був",
    note: "Родовище на вигляд майже не впливає.",
  },
  {
    rock: "Лабрадорит" as const,
    colorRule: "Чорний із синіми переливами",
    note: "Родовище на вигляд майже не впливає.",
  },
  {
    rock: "Базальт" as const,
    colorRule: "Темно-сірий, майже чорний",
    note: "Місцевий камінь Костопільщини; щільніший за граніт.",
  },
  {
    rock: "Мармур" as const,
    colorRule: "Білий із прожилками",
    note: "Не граніт: м'якший і пористіший.",
  },
  {
    rock: "Граніт" as const,
    colorRule: "Колір залежить від родовища",
    note: "Сірий, червоний, зелений — це різні кар'єри, а не фарбування.",
  },
]

export const guideByColor = (color: StoneColor) => STONE_GUIDE.filter((s) => s.color === color)

export const guideByKey = (key: string | undefined) =>
  key ? STONE_GUIDE.find((s) => s.key === key) : undefined

/**
 * Камінь, який показаний на фотографії товару — дефолт селектора.
 *
 * Спершу пробуємо `materialType`: у частини товарів там уже стоїть родовище
 * («Покостівський», «Лезниківський»). Далі — колір, бо решта рядків несе
 * узагальнене "granite", яке само по собі не вказує на камінь. Порядок саме
 * такий, а не навпаки: конкретне значення точніше за виведене з кольору.
 */
export function defaultStone(item: {
  materialType?: string
  color?: string
}): StoneGuideEntry {
  const byKey = guideByKey(item.materialType)
  if (byKey) return byKey
  const color = item.color === "Рожевий" ? "red" : item.color
  return STONE_GUIDE.find((s) => s.color === color) ?? STONE_GUIDE[1] // габро
}

/**
 * Частка каменю у ціні виробу. Решта — обробка, фундамент, монтаж і маржа.
 *
 * Комплект каменю на одинарний пам'ятник коштує ~8 500 грн: для виробу за
 * 26 000 це третина, для комплексу за 125 000 — сьома частина. Тому зміна
 * каменю рухає ціну комплексу помітно менше, ніж окремої стели.
 */
export function stoneShare(shape: string | undefined): number {
  return (shape ?? "").toLowerCase().includes("комплекс") ? 0.15 : 0.35
}

/**
 * Ціна того самого виробу в іншому камені.
 *
 * Коефіцієнт множиться НЕ на всю ціну, а лише на кам'яну частку: інакше ми
 * вигадали б різницю, якої на ринку немає. З 1385 зібраних пам'ятників лише
 * 3 взагалі вказують родовище — камінь ціну виробу майже не визначає.
 */
export function priceWithMaterial(
  basePrice: number,
  from: StoneGuideEntry,
  to: StoneGuideEntry,
  shape?: string
): number {
  const k = stoneShare(shape)
  const ratio = (1 - k + k * to.coef) / (1 - k + k * from.coef)
  return Math.round((basePrice * ratio) / 500) * 500
}

export type { StoneMaterial, StoneColor }

/**
 * Значення для поля «Матеріал» в адмінці.
 *
 * Це саме ці сім, а не породи ("granite", "marble"): дефолт селектора каменю
 * шукає запис за точним `key`, і узагальнене "granite" у нього не потрапляє —
 * доводиться вгадувати за кольором. Тому адмін обирає конкретний камінь.
 */
export const STONE_KEYS = STONE_GUIDE.map((s) => s.key)
