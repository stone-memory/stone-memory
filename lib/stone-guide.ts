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
// Розширення довідника (вересень 2026): родовища, які ринок продає окремо, а в нас
// ховались за узагальненими «Габро» й «Лабрадорит», плюс сусідні танські й сірі.
import bukynskeImg from "@/public/stone/bukynske.jpg"
import antikNeroImg from "@/public/stone/antik-nero.jpg"
import volgaBlueExtraImg from "@/public/stone/volga-blue-extra.jpg"
import blackIceImg from "@/public/stone/black-ice.jpg"
import kostopilskyiImg from "@/public/stone/kostopilskyi.jpg"
import khustovskyiImg from "@/public/stone/khustovskyi.jpg"
import greenishTanskyImg from "@/public/stone/greenish-tansky.jpg"
import eveningWarsawImg from "@/public/stone/evening-warsaw.jpg"
import realGreyImg from "@/public/stone/real-grey.jpg"
import cardinalGreyImg from "@/public/stone/cardinal-grey.jpg"
import greyQuoinImg from "@/public/stone/grey-quoin.jpg"
import kostyantynivskyImg from "@/public/stone/kostyantynivsky.jpg"
import boguslavskyImg from "@/public/stone/boguslavsky.jpg"
import symonyGreyImg from "@/public/stone/symony-grey.jpg"
import cavialeNeroImg from "@/public/stone/caviale-nero.jpg"
import witheredImg from "@/public/stone/withered.jpg"
import rossoToledoImg from "@/public/stone/rosso-toledo.jpg"
import karminImg from "@/public/stone/karmin.jpg"
import ukrainianAutumnImg from "@/public/stone/ukrainian-autumn.jpg"
import leopardBrownImg from "@/public/stone/leopard-brown.jpg"
import rosaKyshynImg from "@/public/stone/rosa-kyshyn.jpg"
import calacattaOroImg from "@/public/stone/calacatta-oro.jpg"
import statuarioImg from "@/public/stone/statuario.jpg"
import marmaraWhiteImg from "@/public/stone/marmara-white.jpg"

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
    name: "Головинське габро",
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
    name: "Добринський лабрадорит (Extra Blue Ukraine)",
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
    name: "Мармур Bianco Carrara",
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
  {
    key: "Букинське",
    name: "Букинське габро",
    rock: "Габро",
    color: "black",
    look: "Насичений чорний із дуже дрібним зерном; після полірування майже дзеркальний, без сірих плям.",
    why: "Найщільніше з габро: водопоглинання до 0,1 %, тому не темніє від вологи. Портрет тримає так само, як Головинське.",
    priceLevel: "Вищий",
    coef: 1.12,
    swatch: bukynskeImg,
    exampleCode: "003",
    interiorSlug: "bukynske",
  },
  {
    key: "Лугове",
    name: "Лугове габро (Antik Nero)",
    rock: "Габро",
    color: "black",
    look: "Чорний із ледь помітним сіро-зеленим відтінком, середнє зерно; менш дзеркальний за Головинське.",
    why: "Найдоступніший чорний камінь довідника: на облицювання, цоколь і плитку, де потрібен чорний без преміальної ціни.",
    priceLevel: "Найдоступніший",
    coef: 0.72,
    swatch: antikNeroImg,
    exampleCode: "003",
    interiorSlug: "antik-nero",
  },
  {
    key: "Горбулівський",
    name: "Горбулівський лабрадорит (Volga Blue Extra)",
    rock: "Лабрадорит",
    color: "black",
    look: "Чорно-сіре тло з великими кристалами, які під кутом спалахують синім і зеленим.",
    why: "Найбільші кристали серед українських лабрадоритів: перелив видно з відстані, тому його беруть на стелу, а не на дрібні елементи.",
    priceLevel: "Вищий",
    coef: 1.1,
    swatch: volgaBlueExtraImg,
    exampleCode: "045",
    interiorSlug: "volga-blue-extra",
  },
  {
    key: "Невирівський",
    name: "Невирівський лабрадорит (Black Ice)",
    rock: "Лабрадорит",
    color: "black",
    look: "Графітово-чорний, майже без переливу; лише зрідка сріблясто-фіолетовий спалах.",
    why: "Для тих, кому потрібен глибокий чорний, але щільніший за габро: тримає гравіювання й не боїться морозу.",
    priceLevel: "Найдоступніший",
    coef: 0.83,
    swatch: blackIceImg,
    exampleCode: "045",
    interiorSlug: "black-ice",
  },
  {
    key: "Костопільський",
    name: "Костопільський базальт",
    rock: "Базальт",
    color: "black",
    look: "Темно-сірий, майже чорний, дуже дрібне зерно; поверхня матовіша за габро.",
    why: "Місцевий камінь із сусіднього кар'єру: найкоротша доставка й стабільні партії. На цоколь, плитку й бруківку навколо ділянки.",
    priceLevel: "Середній",
    coef: 0.85,
    swatch: kostopilskyiImg,
    exampleCode: "069",
    interiorSlug: "kostopilskyi",
  },
  {
    key: "Хустовський",
    name: "Хустовський базальт",
    rock: "Базальт",
    color: "black",
    look: "Сіро-чорний, дрібнозернистий, зрідка з дрібними порами.",
    why: "Закарпатський базальт із теплішим тоном, ніж берестовецький. Годиться на колоту бруківку та облицювання.",
    priceLevel: "Середній",
    coef: 0.85,
    swatch: khustovskyiImg,
    exampleCode: "069",
    interiorSlug: "khustovskyi",
  },
  {
    key: "Північно-Танський",
    name: "Північно-Танський граніт (Greenish Tansky)",
    rock: "Граніт",
    color: "grey",
    look: "Сірий з оливковим відтінком, середнє зерно, рівномірний.",
    why: "Єдиний сіро-зелений серед сірих гранітів: коли Покостівський здається надто холодним, а Маславський надто темним.",
    priceLevel: "Середній",
    coef: 0.92,
    swatch: greenishTanskyImg,
    exampleCode: "074",
    interiorSlug: "greenish-tansky",
  },
  {
    key: "Західно-Танський",
    name: "Західно-Танський граніт (Evening Warsaw)",
    rock: "Граніт",
    color: "grey",
    look: "Темно-сірий із дрібними чорними вкрапленнями, рівний тон без плям.",
    why: "Темніший за Танський, тому портрет читається краще. Один із найпоширеніших гранітів у виробників пам'ятників.",
    priceLevel: "Середній",
    coef: 0.9,
    swatch: eveningWarsawImg,
    exampleCode: "074",
    interiorSlug: "evening-warsaw",
  },
  {
    key: "Янцівський",
    name: "Янцівський граніт (Real Grey)",
    rock: "Граніт",
    color: "grey",
    look: "Світло-сірий, дрібнозернистий, дуже однорідний; світліший за Покостівський.",
    why: "Найрівніший світло-сірий: без плям і жил, добре тримає геометрію на великих плитах облицювання.",
    priceLevel: "Вищий",
    coef: 1.08,
    swatch: realGreyImg,
    exampleCode: "073",
    interiorSlug: "real-grey",
  },
  {
    key: "Жежелівський",
    name: "Жежелівський граніт (Cardinal Grey)",
    rock: "Граніт",
    color: "grey",
    look: "Сірий із легким блакитним відтінком, середнє зерно, дрібні чорні цятки.",
    why: "Холодний сірий для сучасних форм і європейських пам'ятників, де потрібен світлий камінь без теплого підтону.",
    priceLevel: "Вищий",
    coef: 1.05,
    swatch: cardinalGreyImg,
    exampleCode: "075",
    interiorSlug: "cardinal-grey",
  },
  {
    key: "Старобабанський",
    name: "Старобабанський граніт (Grey Quoin)",
    rock: "Граніт",
    color: "grey",
    look: "Сіре тло з рожевими вкрапленнями польового шпату, середнє зерно.",
    why: "Сірий із теплим рожевим відтінком: м'якший за Покостівський і добре виглядає поруч із червоним каменем у двоколірних роботах.",
    priceLevel: "Середній",
    coef: 1.0,
    swatch: greyQuoinImg,
    exampleCode: "076",
    interiorSlug: "grey-quoin",
  },
  {
    key: "Костянтинівський",
    name: "Костянтинівський граніт",
    rock: "Граніт",
    color: "grey",
    look: "Дрібнозернистий холодний сірий із темними вкрапленнями.",
    why: "Дрібне зерно дає чіткий контур гравіювання на світлому камені, коли чорний не підходить.",
    priceLevel: "Вищий",
    coef: 1.1,
    swatch: kostyantynivskyImg,
    exampleCode: "073",
    interiorSlug: "kostyantynivsky",
  },
  {
    key: "Богуславський",
    name: "Богуславський граніт",
    rock: "Граніт",
    color: "grey",
    look: "Сіро-рожевий, середньо-крупне зерно, помітні рожеві та чорні кристали.",
    why: "Виразне зерно й теплий відтінок для тих, хто хоче живішу поверхню, ніж у рівних сірих гранітів.",
    priceLevel: "Середній",
    coef: 1.0,
    swatch: boguslavskyImg,
    exampleCode: "076",
    interiorSlug: "boguslavsky",
  },
  {
    key: "Симонівський",
    name: "Симонівський граніт (Symony Grey)",
    rock: "Граніт",
    color: "grey",
    look: "Сірий із теплим бежевим підтоном, середнє зерно, рівномірний.",
    why: "М'який сірий для тих, кому Покостівський здається надто холодним; добре виглядає з бронзовими літерами.",
    priceLevel: "Середній",
    coef: 1.02,
    swatch: symonyGreyImg,
    exampleCode: "075",
    interiorSlug: "symony-grey",
  },
  {
    key: "Новоселівський",
    name: "Новоселівський граніт (Caviale Nero)",
    rock: "Граніт",
    color: "black",
    look: "Дуже темно-сірий, майже чорний, дрібне зерно з білими цятками, як чорна ікра.",
    why: "Чорний із живою поверхнею: з відстані читається як габро, зблизька видно зерно. Портрет тримає гірше за габро, тому частіше на комплекси й облицювання.",
    priceLevel: "Вищий",
    coef: 1.1,
    swatch: cavialeNeroImg,
    exampleCode: "003",
    interiorSlug: "caviale-nero",
  },
  {
    key: "Новоданилівський",
    name: "Новоданилівський граніт (Withered)",
    rock: "Граніт",
    color: "red",
    look: "Приглушений бордово-червоний із коричневим відтінком, середнє зерно, темні вкраплення.",
    why: "Найспокійніший з червоних: без яскравості Лезниківського, тому підходить на весь комплекс, а не лише на акцент.",
    priceLevel: "Вищий",
    coef: 1.11,
    swatch: witheredImg,
    exampleCode: "062",
    interiorSlug: "withered",
  },
  {
    key: "Омелянівський",
    name: "Омелянівський граніт (Rosso Toledo)",
    rock: "Граніт",
    color: "red",
    look: "Рожево-червоний, крупне зерно, сірі та чорні кристали.",
    why: "Найкрупніше зерно серед червоних: виразна поверхня для стел і тумб, які мають бути помітними.",
    priceLevel: "Вищий",
    coef: 1.07,
    swatch: rossoToledoImg,
    exampleCode: "019",
    interiorSlug: "rosso-toledo",
  },
  {
    key: "Крупський",
    name: "Крупський граніт (Karmin)",
    rock: "Граніт",
    color: "red",
    look: "Насичений карміново-рожевий, середнє зерно, рівномірний.",
    why: "Найяскравіший рожевий камінь довідника: для вставок, квітників і дитячих пам'ятників, де потрібен теплий колір.",
    priceLevel: "Вищий",
    coef: 1.05,
    swatch: karminImg,
    exampleCode: "019",
    interiorSlug: "karmin",
  },
  {
    key: "Василівський",
    name: "Василівський граніт (Ukrainian Autumn)",
    rock: "Граніт",
    color: "green",
    look: "Крупнозернистий, осінні тони: оливковий, іржавий, чорний; кожна плита з власним рисунком.",
    why: "Для тих, хто хоче живий природний камінь замість рівного тону. Портрет на ньому не гравіюють, беруть під плиту й тумбу.",
    priceLevel: "Вищий",
    coef: 1.05,
    swatch: ukrainianAutumnImg,
    exampleCode: "083",
    interiorSlug: "ukrainian-autumn",
  },
  {
    key: "Брусилівський",
    name: "Брусилівський граніт (Leopard)",
    rock: "Граніт",
    color: "brown",
    look: "Коричнево-сіре тло з великими темними плямами, крупне зерно.",
    why: "Коричневий із виразним рисунком; та сама комерційна назва, що в сірого Корнинського, але інший камінь. На облицювання й цоколь.",
    priceLevel: "Середній",
    coef: 1.0,
    swatch: leopardBrownImg,
    exampleCode: "100",
    interiorSlug: "leopard-brown",
  },
  {
    key: "Кишинський",
    name: "Кишинський граніт (Rosa Kyshyn)",
    rock: "Граніт",
    color: "brown",
    look: "Рожево-коричневий, середнє зерно, чорні цятки.",
    why: "Теплий коричневий, який не вигорає на сонці; для стели й плити в одному тоні без контрастних елементів.",
    priceLevel: "Вищий",
    coef: 1.15,
    swatch: rosaKyshynImg,
    exampleCode: "100",
    interiorSlug: "rosa-kyshyn",
  },
  {
    key: "Calacatta Oro",
    name: "Мармур Calacatta Oro",
    rock: "Мармур",
    color: "white",
    look: "Яскраво-білий із широкими золотисто-сірими жилами, рідкими й виразними.",
    why: "Найстатусніший білий мармур для скульптури й дитячих пам'ятників. М'який, потребує просочення; кожен блок підбираємо за рисунком.",
    priceLevel: "Преміум",
    coef: 1.4,
    swatch: calacattaOroImg,
    exampleCode: "091",
    interiorSlug: "calacatta-oro",
  },
  {
    key: "Statuario",
    name: "Мармур Statuario",
    rock: "Мармур",
    color: "white",
    look: "Чисто білий із тонкими чіткими темно-сірими жилами.",
    why: "Камінь скульпторів: найбіліший фон для барельєфа й різьблення. Для вулиці лише з обробкою і під наглядом.",
    priceLevel: "Преміум",
    coef: 1.4,
    swatch: statuarioImg,
    exampleCode: "091",
    interiorSlug: "statuario",
  },
  {
    key: "Marmara White",
    name: "Мармур Marmara White",
    rock: "Мармур",
    color: "white",
    look: "Білий із паралельними прямими сірими смугами.",
    why: "Доступніший за Carrara білий мармур зі спокійним рисунком; для плит, ваз і елементів благоустрою.",
    priceLevel: "Преміум",
    coef: 1.3,
    swatch: marmaraWhiteImg,
    exampleCode: "091",
    interiorSlug: "marmara-white",
  },
]

/** Породи в порядку, у якому їх пояснює сторінка-довідник. */
export const ROCK_TYPES = [
  {
    rock: "Габро" as const,
    colorRule: "Завжди чорний, з якого б родовища не був",
    note: "Родовище дає глибину чорного й зерно: Головинське найтемніше, Букинське найдрібніше, Лугове з сіро-зеленим відтінком.",
  },
  {
    rock: "Лабрадорит" as const,
    colorRule: "Чорний із синіми переливами",
    note: "Родовище визначає перелив: синій у Добринського, синьо-зелений у Горбулівського, майже без переливу в Невирівського.",
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
