import type { Locale, StoneColor, StoneShape, StoneFinish, StoneTone, StoneMaterial } from "@/lib/types"

export const toneLabels: Record<StoneTone, Record<Locale, string>> = {
  light: { uk: "Світлий", pl: "Jasny", en: "Light", de: "Hell", lt: "Šviesus" },
  grey: { uk: "Сірий", pl: "Szary", en: "Grey", de: "Grau", lt: "Pilkas" },
  dark: { uk: "Темний", pl: "Ciemny", en: "Dark", de: "Dunkel", lt: "Tamsus" },
  brown: { uk: "Коричневий", pl: "Brązowy", en: "Brown", de: "Braun", lt: "Rudas" },
  coloured: { uk: "Кольоровий", pl: "Kolorowy", en: "Coloured", de: "Farbig", lt: "Spalvotas" },
}

export const materialLabels: Record<StoneMaterial, Record<Locale, string>> = {
  granite: { uk: "Граніт", pl: "Granit", en: "Granite", de: "Granit", lt: "Granitas" },
  gabbro: { uk: "Габро", pl: "Gabro", en: "Gabbro", de: "Gabbro", lt: "Gabbras" },
  marble: { uk: "Мармур", pl: "Marmur", en: "Marble", de: "Marmor", lt: "Marmuras" },
  labradorite: { uk: "Лабрадорит", pl: "Labradoryt", en: "Labradorite", de: "Labradorit", lt: "Labradoritas" },
  quartzite: { uk: "Кварцит", pl: "Kwarcyt", en: "Quartzite", de: "Quarzit", lt: "Kvarcitas" },
  limestone: { uk: "Вапняк", pl: "Wapień", en: "Limestone", de: "Kalkstein", lt: "Klintis" },
  sandstone: { uk: "Пісковик", pl: "Piaskowiec", en: "Sandstone", de: "Sandstein", lt: "Smiltainis" },
  onyx: { uk: "Онікс", pl: "Onyks", en: "Onyx", de: "Onyx", lt: "Oniksas" },
}

export type StoneCountry = "UA" | "IT" | "IN" | "CN" | "BR" | "TR" | "PK" | "OTHER"

export const countryLabels: Record<StoneCountry, Record<Locale, string>> = {
  UA: { uk: "Україна", pl: "Ukraina", en: "Ukraine", de: "Ukraine", lt: "Ukraina" },
  IT: { uk: "Італія", pl: "Włochy", en: "Italy", de: "Italien", lt: "Italija" },
  IN: { uk: "Індія", pl: "Indie", en: "India", de: "Indien", lt: "Indija" },
  CN: { uk: "Китай", pl: "Chiny", en: "China", de: "China", lt: "Kinija" },
  BR: { uk: "Бразилія", pl: "Brazylia", en: "Brazil", de: "Brasilien", lt: "Brazilija" },
  TR: { uk: "Туреччина", pl: "Turcja", en: "Turkey", de: "Türkei", lt: "Turkija" },
  PK: { uk: "Пакистан", pl: "Pakistan", en: "Pakistan", de: "Pakistan", lt: "Pakistanas" },
  OTHER: { uk: "Інше", pl: "Inne", en: "Other", de: "Sonstiges", lt: "Kita" },
}

export function countryFromOrigin(origin?: string): StoneCountry | undefined {
  if (!origin) return undefined
  const s = origin.toLowerCase()
  if (s.includes("ua") || s.includes("україн") || s.includes("укра") || s.includes("костопіл") || s.includes("житомир") || s.includes("рівне") || s.includes("рівнен") || s.includes("вінни") || s.includes("дніпро") || s.includes("хмельн") || s.includes("тернопіл") || s.includes("закарпат") || s.includes("франків") || s.includes("поділ") || s.includes("карпат") || s.includes("волин") || s.includes("ukrain")) return "UA"
  if (s.includes("італ") || s.includes("ital") || s.includes("włoc")) return "IT"
  if (s.includes("інді") || s.includes("ind")) return "IN"
  if (s.includes("кит") || s.includes("china") || s.includes("chin")) return "CN"
  if (s.includes("браз") || s.includes("brazil") || s.includes("brasil")) return "BR"
  if (s.includes("турец") || s.includes("turk") || s.includes("türk")) return "TR"
  if (s.includes("пакист") || s.includes("pakist")) return "PK"
  return "OTHER"
}

export const filterLabels: Record<Locale, {
  heading: string
  searchPlaceholder: string
  color: string
  shape: string
  finish: string
  priceRange: string
  tone: string
  material: string
  country: string
  sortBy: string
  clear: string
  showResults: string
  showFilters: string
  noResults: string
  inStock: string
  featured: string
  apply: string
  close: string
  priceMin: string
  priceMax: string
  sort: {
    featured: string
    popular: string
    priceAsc: string
    priceDesc: string
  }
  anyColor: string
  anyShape: string
  anyFinish: string
  addToSelection: string
  buyNow: string
  specifications: string
  description: string
  descriptionBody: (id: string, category: "memorial" | "home") => string
  relatedTitle: string
  back: string
  shareTitle: string
}> = {
  uk: {
    heading: "Фільтри",
    searchPlaceholder: "Номер…",
    color: "Колір",
    shape: "Форма",
    finish: "Поверхня",
    priceRange: "Ціна",
    tone: "Тон",
    material: "Матеріал",
    country: "Країна",
    sortBy: "Сортувати",
    clear: "Скинути",
    showResults: "Показати",
    showFilters: "Фільтри",
    noResults: "Нічого не знайдено за фільтрами",
    inStock: "В наявності",
    featured: "Рекомендовані",
    apply: "Застосувати",
    close: "Закрити",
    priceMin: "від",
    priceMax: "до",
    sort: {
      featured: "Рекомендовані",
      popular: "Популярне",
      priceAsc: "Ціна: зростає",
      priceDesc: "Ціна: спадає",
    },
    anyColor: "Будь-який",
    anyShape: "Будь-яка",
    anyFinish: "Будь-яка",
    addToSelection: "Додати до вибраного",
    buyNow: "Замовити",
    specifications: "Характеристики",
    description: "Опис",
    descriptionBody: (id, category) =>
      `${category === "memorial" ? "Пам'ятник" : "Виріб з натурального каменю"} № ${id}. Натуральний граніт або мармур — український або імпортний (Італія, Індія, Китай, Бразилія). 7 етапів обробки у цеху в Костополі: розпил, шліфування, полірування, гравірування, герметизація, контроль. Морозостійкий, стійкий до УФ. Паспорт матеріалу, 5 років гарантії на все — фундамент, монтаж і камінь.`,
    relatedTitle: "Схожі позиції",
    back: "Назад до каталогу",
    shareTitle: "Поділитися",
  },
  pl: {
    heading: "Filtry",
    searchPlaceholder: "Numer…",
    color: "Kolor",
    shape: "Kształt",
    finish: "Wykończenie",
    tone: "Ton",
    material: "Materiał",
    country: "Kraj",
    priceRange: "Cena",
    sortBy: "Sortuj",
    clear: "Wyczyść",
    showResults: "Pokaż",
    showFilters: "Filtry",
    noResults: "Brak wyników dla wybranych filtrów",
    inStock: "Dostępne",
    featured: "Polecane",
    apply: "Zastosuj",
    close: "Zamknij",
    priceMin: "od",
    priceMax: "do",
    sort: {
      featured: "Polecane",
      popular: "Popularne",
      priceAsc: "Cena rosnąco",
      priceDesc: "Cena malejąco",
    },
    anyColor: "Dowolny",
    anyShape: "Dowolny",
    anyFinish: "Dowolne",
    addToSelection: "Dodaj do wyboru",
    buyNow: "Zamów",
    specifications: "Specyfikacja",
    description: "Opis",
    descriptionBody: (id, category) =>
      `${category === "memorial" ? "Pomnik" : "Wyrób z kamienia naturalnego"} nr ${id}. Naturalny granit lub marmur — ukraiński albo importowany (Włochy, Indie, Chiny, Brazylia). 7 etapów obróbki: cięcie, szlifowanie, polerowanie, grawerowanie, uszczelnianie, kontrola. Odporny na mróz i UV. Paszport materiału, 5 lat gwarancji na wszystko — fundament, montaż i kamień.`,
    relatedTitle: "Podobne pozycje",
    back: "Powrót do katalogu",
    shareTitle: "Udostępnij",
  },
  en: {
    heading: "Filters",
    searchPlaceholder: "Number…",
    color: "Colour",
    shape: "Shape",
    finish: "Finish",
    tone: "Tone",
    material: "Material",
    country: "Country",
    priceRange: "Price",
    sortBy: "Sort",
    clear: "Clear",
    showResults: "Show",
    showFilters: "Filters",
    noResults: "No items match your filters",
    inStock: "In stock",
    featured: "Featured",
    apply: "Apply",
    close: "Close",
    priceMin: "from",
    priceMax: "to",
    sort: {
      featured: "Featured",
      popular: "Most popular",
      priceAsc: "Price: low to high",
      priceDesc: "Price: high to low",
    },
    anyColor: "Any",
    anyShape: "Any",
    anyFinish: "Any",
    addToSelection: "Add to selection",
    buyNow: "Order",
    specifications: "Specifications",
    description: "Description",
    descriptionBody: (id, category) =>
      `${category === "memorial" ? "Monument" : "Natural stone piece"} No. ${id}. Natural granite or marble — Ukrainian or imported (Italy, India, China, Brazil). Seven stages of hand-finishing in our Kostopil workshop: cutting, grinding, polishing, engraving, sealing, QC. Frost- and UV-resistant. Material passport included, 5-year warranty on everything — foundation, installation and stone.`,
    relatedTitle: "Related pieces",
    back: "Back to catalog",
    shareTitle: "Share",
  },
  de: {
    heading: "Filter",
    searchPlaceholder: "Nummer…",
    color: "Farbe",
    shape: "Form",
    finish: "Oberfläche",
    tone: "Ton",
    material: "Material",
    country: "Herkunft",
    priceRange: "Preis",
    sortBy: "Sortieren",
    clear: "Zurücksetzen",
    showResults: "Anzeigen",
    showFilters: "Filter",
    noResults: "Keine Treffer für Ihre Filter",
    inStock: "Vorrätig",
    featured: "Empfohlen",
    apply: "Anwenden",
    close: "Schließen",
    priceMin: "von",
    priceMax: "bis",
    sort: {
      featured: "Empfohlen",
      popular: "Beliebt",
      priceAsc: "Preis aufsteigend",
      priceDesc: "Preis absteigend",
    },
    anyColor: "Beliebig",
    anyShape: "Beliebig",
    anyFinish: "Beliebig",
    addToSelection: "Zur Auswahl",
    buyNow: "Bestellen",
    specifications: "Spezifikation",
    description: "Beschreibung",
    descriptionBody: (id, category) =>
      `${category === "memorial" ? "Grabmal" : "Naturstein-Werkstück"} Nr. ${id}. Natürlicher Granit oder Marmor — ukrainisch oder importiert (Italien, Indien, China, Brasilien). Sieben Stufen in unserer Werkstatt in Kostopil: Zuschnitt, Schleifen, Polieren, Gravur, Versiegelung, QK. Frost- und UV-beständig. Material-Pass, 5 Jahre Garantie auf alles — Fundament, Montage und Stein.`,
    relatedTitle: "Ähnliche Stücke",
    back: "Zurück zum Katalog",
    shareTitle: "Teilen",
  },
  lt: {
    heading: "Filtrai",
    searchPlaceholder: "Numeris…",
    color: "Spalva",
    shape: "Forma",
    finish: "Apdaila",
    tone: "Tonas",
    material: "Medžiaga",
    country: "Šalis",
    priceRange: "Kaina",
    sortBy: "Rūšiuoti",
    clear: "Išvalyti",
    showResults: "Rodyti",
    showFilters: "Filtrai",
    noResults: "Nerasta pagal pasirinktus filtrus",
    inStock: "Turime",
    featured: "Rekomenduojama",
    apply: "Taikyti",
    close: "Uždaryti",
    priceMin: "nuo",
    priceMax: "iki",
    sort: {
      featured: "Rekomenduojama",
      popular: "Populiariausi",
      priceAsc: "Kaina: didėjanti",
      priceDesc: "Kaina: mažėjanti",
    },
    anyColor: "Bet kokia",
    anyShape: "Bet kokia",
    anyFinish: "Bet kokia",
    addToSelection: "Į pasirinkimą",
    buyNow: "Užsakyti",
    specifications: "Specifikacija",
    description: "Aprašymas",
    descriptionBody: (id, category) =>
      `${category === "memorial" ? "Paminklas" : "Natūralaus akmens gaminys"} Nr. ${id}. Natūralus granitas arba marmuras — ukrainietiškas arba importuotas (Italija, Indija, Kinija, Brazilija). Septyni rankinės apdailos etapai Kostopilio dirbtuvėje: pjovimas, šlifavimas, poliravimas, graviravimas, sandarinimas, kokybės kontrolė. Atsparus šalčiui ir UV. Medžiagos pasas, 5 m. garantija viskam — pamatui, montavimui ir akmeniui.`,
    relatedTitle: "Panašūs",
    back: "Atgal į katalogą",
    shareTitle: "Dalintis",
  },
}

export const colorLabels: Record<StoneColor, Record<Locale, string>> = {
  black: { uk: "Чорний", pl: "Czarny", en: "Black", de: "Schwarz", lt: "Juoda" },
  grey: { uk: "Сірий", pl: "Szary", en: "Grey", de: "Grau", lt: "Pilka" },
  white: { uk: "Білий", pl: "Biały", en: "White", de: "Weiß", lt: "Balta" },
  red: { uk: "Червоний", pl: "Czerwony", en: "Red", de: "Rot", lt: "Raudona" },
  green: { uk: "Зелений", pl: "Zielony", en: "Green", de: "Grün", lt: "Žalia" },
  blue: { uk: "Синій", pl: "Niebieski", en: "Blue", de: "Blau", lt: "Mėlyna" },
  brown: { uk: "Коричневий", pl: "Brązowy", en: "Brown", de: "Braun", lt: "Ruda" },
  beige: { uk: "Бежевий", pl: "Beżowy", en: "Beige", de: "Beige", lt: "Smėlinė" },
  multi: { uk: "Мультиколір", pl: "Multikolor", en: "Multi", de: "Mehrfarbig", lt: "Įvairiaspalvė" },
}

export const shapeLabels: Record<StoneShape, Record<Locale, string>> = {
  classic: { uk: "Класична", pl: "Klasyczny", en: "Classic", de: "Klassisch", lt: "Klasikinė" },
  arch: { uk: "Арка", pl: "Łukowa", en: "Arch", de: "Bogen", lt: "Arka" },
  heart: { uk: "Серце", pl: "Serce", en: "Heart", de: "Herz", lt: "Širdis" },
  cross: { uk: "Хрест", pl: "Krzyż", en: "Cross", de: "Kreuz", lt: "Kryžius" },
  modern: { uk: "Сучасна", pl: "Nowoczesny", en: "Modern", de: "Modern", lt: "Moderni" },
  obelisk: { uk: "Обеліск", pl: "Obelisk", en: "Obelisk", de: "Obelisk", lt: "Obeliskas" },
  natural: { uk: "Природна", pl: "Naturalny", en: "Natural", de: "Natürlich", lt: "Natūrali" },
}

export const finishLabels: Record<StoneFinish, Record<Locale, string>> = {
  polished: { uk: "Полірована", pl: "Polerowane", en: "Polished", de: "Poliert", lt: "Poliruota" },
  honed: { uk: "Шліфована", pl: "Szlifowane", en: "Honed", de: "Geschliffen", lt: "Šlifuota" },
  flamed: { uk: "Термо", pl: "Palone", en: "Flamed", de: "Geflammt", lt: "Deginta" },
  antique: { uk: "Антик", pl: "Antykowane", en: "Antiqued", de: "Antik", lt: "Antikuota" },
  natural: { uk: "Природна", pl: "Naturalne", en: "Natural", de: "Natur", lt: "Natūrali" },
  split: { uk: "Колота", pl: "Łupane", en: "Split", de: "Gespalten", lt: "Skaldyta" },
}
