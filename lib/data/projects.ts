import type { Locale } from "@/lib/types"

export type ProjectCategory =
  | "monument"
  | "countertop"
  | "window-sill"
  | "stairs"
  | "fireplace"
  | "paving"
  | "facade"
  | "interior"

export type Project = {
  slug: string
  category: ProjectCategory
  cover: string
  year: number
  city: string
  title: Record<Locale, string>
  description: Record<Locale, string>
  materials: Record<Locale, string>
}

export const categoryLabels: Record<ProjectCategory, Record<Locale, string>> = {
  monument: { uk: "Пам'ятники", pl: "Pomniki", en: "Monuments", de: "Grabmale", lt: "Paminklai" },
  countertop: { uk: "Стільниці", pl: "Blaty", en: "Countertops", de: "Arbeitsplatten", lt: "Stalviršiai" },
  "window-sill": { uk: "Підвіконня", pl: "Parapety", en: "Window sills", de: "Fensterbänke", lt: "Palangės" },
  stairs: { uk: "Сходи", pl: "Schody", en: "Stairs", de: "Treppen", lt: "Laiptai" },
  fireplace: { uk: "Каміни", pl: "Kominki", en: "Fireplaces", de: "Kamine", lt: "Židiniai" },
  paving: { uk: "Бруківка", pl: "Kostka", en: "Paving", de: "Pflaster", lt: "Grindinys" },
  facade: { uk: "Фасади", pl: "Fasady", en: "Facades", de: "Fassaden", lt: "Fasadai" },
  interior: { uk: "Інтер'єр", pl: "Wnętrza", en: "Interiors", de: "Interieur", lt: "Interjeras" },
}

const u = (id: string) => `https://images.unsplash.com/${id}?w=1600&h=1200&fit=crop&q=80&auto=format`

// Photo map per category (curated working URLs)
const fallback = {
  monument: u("photo-1558618666-fcd25c85cd64"),
  countertop: u("photo-1556909211-36987daf7b4d"),
  "window-sill": u("photo-1615873968403-89e068629265"),
  stairs: u("photo-1617575521317-d2974f3b56d2"),
  fireplace: u("photo-1540518614846-7eded433c457"),
  paving: u("photo-1600607687939-ce8a6c25118c"),
  facade: u("photo-1600121848594-d8644e57abab"),
  interior: u("photo-1556911220-bff31c812dba"),
}

export const projects: Project[] = [
  {
    slug: "memorial-family-kyiv",
    category: "monument",
    cover: fallback.monument,
    year: 2025,
    city: "Київ",
    title: {
      uk: "Сімейний меморіальний комплекс, Київ",
      pl: "Rodzinny kompleks memorialny, Kijów",
      en: "Family memorial complex, Kyiv",
      de: "Familien-Grabmal, Kyiv",
      lt: "Šeimos memorialinis kompleksas, Kyjivas",
    },
    description: {
      uk: "Подвійний пам'ятник з Головинського габро. Фундамент, монтаж, гравіювання портретів, огорожа з граніту, декоративна засипка.",
      pl: "Podwójny pomnik z gabra Hołowyńskiego. Fundament, montaż, grawerowanie portretów, granitowe ogrodzenie, dekoracyjna zasypka.",
      en: "Double monument in Holovyne gabbro. Foundation, installation, portrait engraving, granite border, decorative gravel.",
      de: "Doppel-Grabmal aus Holovyne-Gabbro. Fundament, Montage, Porträtgravur, Granit-Einfassung, Dekorkies.",
      lt: "Dvigubas paminklas iš Holovynės gabbro. Pamatas, montavimas, portretų graviravimas, granito aptvaras, dekoratyvinis žvyras.",
    },
    materials: {
      uk: "Габро Головине · поліроване",
      pl: "Gabro Hołowyńskie · polerowane",
      en: "Holovyne gabbro · polished",
      de: "Holovyne-Gabbro · poliert",
      lt: "Holovynės gabbras · poliruotas",
    },
  },
  {
    slug: "kitchen-calacatta-lviv",
    category: "countertop",
    cover: fallback.countertop,
    year: 2026,
    city: "Львів",
    title: {
      uk: "Кухонна стільниця Calacatta, Львів",
      pl: "Blat kuchenny Calacatta, Lwów",
      en: "Calacatta kitchen countertop, Lviv",
      de: "Calacatta-Küchenplatte, Lwiw",
      lt: "Calacatta virtuvės stalviršis, Lvivas",
    },
    description: {
      uk: "Стільниця з італійського мармуру Calacatta, 3.2 м, з інтегрованою мийкою. Замір, виготовлення, монтаж за 12 днів.",
      pl: "Blat z włoskiego marmuru Calacatta, 3.2 m, ze zintegrowanym zlewem. Pomiar, produkcja, montaż w 12 dni.",
      en: "Italian Calacatta marble countertop, 3.2 m, with integrated sink. Measure, fabrication, install in 12 days.",
      de: "Italienische Calacatta-Marmorplatte, 3,2 m, integrierte Spüle. Aufmaß, Fertigung, Montage in 12 Tagen.",
      lt: "Italų Calacatta marmuro stalviršis, 3.2 m, su integruota kriaukle. Matavimas, gamyba, montavimas per 12 dienų.",
    },
    materials: {
      uk: "Мармур Calacatta · поліроване",
      pl: "Marmur Calacatta · polerowany",
      en: "Calacatta marble · polished",
      de: "Calacatta-Marmor · poliert",
      lt: "Calacatta marmuras · poliruotas",
    },
  },
  {
    slug: "stairs-granite-rivne",
    category: "stairs",
    cover: fallback.stairs,
    year: 2025,
    city: "Рівне",
    title: {
      uk: "Гранітні сходи у приватному будинку, Рівне",
      pl: "Granitowe schody, Równe",
      en: "Granite staircase, private home, Rivne",
      de: "Granittreppe, Privathaus, Riwne",
      lt: "Granito laiptai privačiame name, Rivnė",
    },
    description: {
      uk: "18 ступенів з Покостівського сірого, матова обробка. Балясини з того ж каменю, поручні з дубу. Монтаж за 3 дні.",
      pl: "18 stopni z granitu Pokostiwskyj szarego, wykończenie matowe. Balustrada z tego samego kamienia.",
      en: "18 steps in Pokostivskyi grey granite, honed finish. Balustrade in matching stone.",
      de: "18 Stufen aus Pokostivskyi-Granit grau, geschliffen. Geländer aus dem gleichen Stein.",
      lt: "18 pakopų iš Pokostivskio pilko granito, matinė apdaila. Turėklai iš to paties akmens.",
    },
    materials: {
      uk: "Покостівський сірий · шліфовано",
      pl: "Pokostiwskyj szary · szlifowane",
      en: "Pokostivskyi grey · honed",
      de: "Pokostivskyi grau · geschliffen",
      lt: "Pokostivskio pilkas · šlifuotas",
    },
  },
  {
    slug: "fireplace-marble-odessa",
    category: "fireplace",
    cover: fallback.fireplace,
    year: 2026,
    city: "Одеса",
    title: {
      uk: "Камін з мармуру, Одеса",
      pl: "Kominek marmurowy, Odessa",
      en: "Marble fireplace, Odesa",
      de: "Marmorkamin, Odessa",
      lt: "Marmurinis židinys, Odesa",
    },
    description: {
      uk: "Портал каміна з Прилузького мармуру. Різьблені деталі, полірована поверхня, індивідуальний дизайн від архітектора.",
      pl: "Portal kominka z marmuru Pryłuzkiego. Ornamenty rzeźbione, powierzchnia polerowana.",
      en: "Fireplace portal in Pryluzkyi marble. Carved details, polished surface, custom design.",
      de: "Kaminportal aus Pryluzkyi-Marmor. Geschnitzte Details, polierte Oberfläche.",
      lt: "Židinio portalas iš Pryluzkio marmuro. Droži detalės, poliruotas paviršius.",
    },
    materials: {
      uk: "Прилузький мармур · поліроване",
      pl: "Marmur Pryłuzki · polerowany",
      en: "Pryluzkyi marble · polished",
      de: "Pryluzkyi-Marmor · poliert",
      lt: "Pryluzkio marmuras · poliruotas",
    },
  },
  {
    slug: "paving-courtyard-kostopil",
    category: "paving",
    cover: fallback.paving,
    year: 2025,
    city: "Костопіль",
    title: {
      uk: "Бруківка у подвір'ї, Костопіль",
      pl: "Kostka brukowa na podwórku, Kostopol",
      en: "Granite paving, Kostopil courtyard",
      de: "Pflasterung im Hof, Kostopil",
      lt: "Grindinys kieme, Kostopilis",
    },
    description: {
      uk: "Волинська бруківка 10×10 см, площа 180 м². Комбінація сірого і червоного каменю, геометричний малюнок.",
      pl: "Wołyńska kostka 10×10 cm, pow. 180 m². Kombinacja szarego i czerwonego kamienia.",
      en: "Volyn paving 10×10 cm, 180 m². Combination of grey and red stone in a geometric pattern.",
      de: "Wolyn-Pflaster 10×10 cm, 180 m². Kombination grau/rot, geometrisches Muster.",
      lt: "Volynės grindinys 10×10 cm, 180 m². Pilkas ir raudonas, geometrinis raštas.",
    },
    materials: {
      uk: "Граніт · натуральна поверхня",
      pl: "Granit · powierzchnia naturalna",
      en: "Granite · natural finish",
      de: "Granit · Natur",
      lt: "Granitas · natūrali",
    },
  },
  {
    slug: "sill-quartzite-kharkiv",
    category: "window-sill",
    cover: fallback["window-sill"],
    year: 2026,
    city: "Харків",
    title: {
      uk: "Підвіконня з кварциту, Харків",
      pl: "Parapety z kwarcytu, Charków",
      en: "Quartzite window sills, Kharkiv",
      de: "Quarzit-Fensterbänke, Charkiw",
      lt: "Kvarcito palangės, Charkovas",
    },
    description: {
      uk: "8 підвіконь з Taj Mahal Quartzite, загальна довжина 14 м. Полірована поверхня, фацет 30°.",
      pl: "8 parapetów z Taj Mahal Quartzite, łącznie 14 m. Polerowane, fazowanie 30°.",
      en: "8 sills in Taj Mahal quartzite, total 14 m. Polished, 30° bevel edge.",
      de: "8 Fensterbänke aus Taj Mahal Quarzit, 14 m gesamt. Poliert, 30°-Fase.",
      lt: "8 palangės iš Taj Mahal kvarcito, 14 m. Poliruotos, 30° briauna.",
    },
    materials: {
      uk: "Taj Mahal кварцит · поліроване",
      pl: "Kwarcyt Taj Mahal · polerowany",
      en: "Taj Mahal quartzite · polished",
      de: "Taj Mahal Quarzit · poliert",
      lt: "Taj Mahal kvarcitas · poliruotas",
    },
  },
  {
    slug: "facade-granite-kyiv",
    category: "facade",
    cover: fallback.facade,
    year: 2024,
    city: "Київ",
    title: {
      uk: "Гранітний фасад офісу, Київ",
      pl: "Granitowa elewacja biura, Kijów",
      en: "Office granite facade, Kyiv",
      de: "Granit-Bürofassade, Kyiv",
      lt: "Granito fasadas, Kyjivas",
    },
    description: {
      uk: "Вентильований фасад з Лезниківського червоного граніту. Площа 340 м². Механічне кріплення з нержавіючої сталі.",
      pl: "Elewacja wentylowana z granitu Leznykiwskiego czerwonego. 340 m². Mocowanie ze stali nierdzewnej.",
      en: "Ventilated facade in Leznykivskyi red granite. 340 m². Stainless steel mechanical fixing.",
      de: "Vorgehängte Fassade aus Leznykivskyi-Rotgranit. 340 m². Edelstahl-Befestigung.",
      lt: "Ventiliuojamas fasadas iš Leznykivskio raudono granito. 340 m². Nerūdijančio plieno tvirtinimas.",
    },
    materials: {
      uk: "Лезниківський червоний · поліроване",
      pl: "Leznykiwski czerwony · polerowany",
      en: "Leznykivskyi red · polished",
      de: "Leznykivskyi rot · poliert",
      lt: "Leznykivskio raudonas · poliruotas",
    },
  },
  {
    slug: "memorial-cross-vinnytsia",
    category: "monument",
    cover: u("photo-1583845112239-97ef1341b271"),
    year: 2025,
    city: "Вінниця",
    title: {
      uk: "Пам'ятник з хрестом, Вінниця",
      pl: "Pomnik z krzyżem, Winnica",
      en: "Cross memorial, Vinnytsia",
      de: "Kreuzgrabmal, Winnyzja",
      lt: "Paminklas su kryžiumi, Vinica",
    },
    description: {
      uk: "Одиночний пам'ятник з габро з різьбленим хрестом. Гравірування портрету за фото, епітафія золотом.",
      pl: "Pojedynczy pomnik z gabra z rzeźbionym krzyżem. Grawerowanie portretu ze zdjęcia, epitafium złocone.",
      en: "Single gabbro memorial with carved cross. Portrait engraved from photo, gilded epitaph.",
      de: "Einzel-Grabmal aus Gabbro mit geschnitztem Kreuz. Porträt nach Foto, vergoldete Gravur.",
      lt: "Vienišas gabbro paminklas su droži kryžiumi. Portretas iš nuotraukos, auksuotas užrašas.",
    },
    materials: {
      uk: "Добринське габро · поліроване",
      pl: "Dobrynske gabro · polerowane",
      en: "Dobrynske gabbro · polished",
      de: "Dobrynske-Gabbro · poliert",
      lt: "Dobrynskio gabbras · poliruotas",
    },
  },
  {
    slug: "bathroom-onyx-kyiv",
    category: "interior",
    cover: fallback.interior,
    year: 2026,
    city: "Київ",
    title: {
      uk: "Інтер'єр з оніксом, Київ",
      pl: "Wnętrze z onyksem, Kijów",
      en: "Onyx interior, Kyiv",
      de: "Onyx-Interieur, Kyiv",
      lt: "Onikso interjeras, Kyjivas",
    },
    description: {
      uk: "Стіна з медового оніксу з підсвіткою, 4 м². Стільниця, душова панель, фацетовані деталі.",
      pl: "Ściana z miodowego onyksu z podświetleniem, 4 m². Blat, panel prysznicowy.",
      en: "Backlit honey-onyx wall 4 m². Vanity top, shower panel, bevelled details.",
      de: "Hinterleuchtete Honig-Onyx-Wand 4 m². Waschtisch, Duschpaneel.",
      lt: "Apšviestas medaus onikso sienelė 4 m². Stalviršis, dušo panelė.",
    },
    materials: {
      uk: "Онікс · поліроване · підсвітка",
      pl: "Onyks · polerowany · podświetlany",
      en: "Onyx · polished · backlit",
      de: "Onyx · poliert · hinterleuchtet",
      lt: "Oniksas · poliruotas · apšviestas",
    },
  },
]

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug)
}
