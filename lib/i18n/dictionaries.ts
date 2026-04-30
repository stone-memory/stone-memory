export type Locale = "uk" | "pl" | "en" | "de" | "lt"

export type Dictionary = {
  nav: {
    memorial: string
    home: string
    services: string
    blog: string
    catalog: string
    contact: string
    selection: string
  }
  hero: {
    badge: string
    title: string
    subtitle: string
    ctaPrimary: string
    ctaSecondary: string
  }
  catalog: {
    label: string
    heading: string
    subheading: string
    count: string
    fromPrice: string
    addToSelection: string
    id: string
    viewAll: string
  }
  services: {
    label: string
    heading: string
    subheading: string
    learnMore: string
  }
  blog: {
    label: string
    heading: string
    subheading: string
    readMore: string
    readingTime: string
    categoryAll: string
    relatedHeading: string
    back: string
  }
  selection: {
    title: string
    subtitle: string
    empty: string
    emptyHint: string
    namePlaceholder: string
    phonePlaceholder: string
    submit: string
    privacy: string
    remove: string
  }
  success: {
    title: string
    body: string
    reference: string
    continueBrowsing: string
  }
  footer: {
    tagline: string
    copyright: string
    privacy: string
    terms: string
    contact: string
    navigation: string
    explore: string
    company: string
    about: string
    careers: string
    press: string
    support: string
    warranty: string
    delivery: string
    faq: string
    subscribe: string
    subscribeDesc: string
    subscribePlaceholder: string
    subscribeCta: string
    hours: string
    hoursValue: string
    address: string
    addressValue: string
  }
}

const uk: Dictionary = {
  nav: {
    memorial: "Пам'ятники",
    home: "Для дому й саду",
    services: "Послуги",
    blog: "Блог",
    catalog: "Каталог",
    contact: "Контакти",
    selection: "Вибране",
  },
  hero: {
    badge: "5 РОКІВ ГАРАНТІЇ",
    title: "Натуральний камінь",
    subtitle: "Пам'ятники, стільниці, підвіконня, сходи, каміни та бруківка. Український граніт і мармур, а також імпортні породи. Власне виробництво в Костополі.",
    ctaPrimary: "Переглянути каталог",
    ctaSecondary: "Наші послуги",
  },
  catalog: {
    label: "КАТАЛОГ",
    heading: "Камінь для пам'яті і для дому",
    subheading: "Пам'ятники, стільниці, підвіконня, каміни, сходи та бруківка. Український граніт, а також імпорт — італійський мармур, індійський і китайський граніт, бразильський кварцит. Виготовляємо у власному цеху.",
    count: "позицій",
    fromPrice: "від",
    addToSelection: "Додати",
    id: "ID",
    viewAll: "Дивитись усі",
  },
  services: {
    label: "ПОСЛУГИ",
    heading: "Від ескізу до встановлення",
    subheading: "Повний цикл: від консультації до монтажу та догляду.",
    learnMore: "Детальніше",
  },
  blog: {
    label: "БЛОГ",
    heading: "Журнал Stone Memory",
    subheading: "Історія, матеріали, догляд і дизайн у світі каменю.",
    readMore: "Читати далі",
    readingTime: "хв читання",
    categoryAll: "Усі",
    relatedHeading: "Схожі статті",
    back: "Назад до блогу",
  },
  selection: {
    title: "Вибране",
    subtitle: "позицій для розрахунку",
    empty: "Ще нічого не вибрано",
    emptyHint: "Перегляньте каталог та натисніть + щоб додати",
    namePlaceholder: "Ваше ім'я",
    phonePlaceholder: "Номер телефону",
    submit: "Отримати розрахунок",
    privacy: "Натискаючи кнопку, ви погоджуєтесь з Політикою конфіденційності.",
    remove: "Видалити",
  },
  success: {
    title: "Заявку отримано",
    body: "Менеджер зв'яжеться з вами протягом 2 робочих годин для обговорення вашого вибору та надання детального розрахунку.",
    reference: "Номер заявки",
    continueBrowsing: "Продовжити перегляд",
  },
  footer: {
    tagline: "Натуральний камінь для пам'яті і для дому. Власне виробництво в Костополі.",
    copyright: "© 2026 Stone Memory. Усі права захищені.",
    privacy: "Конфіденційність",
    terms: "Умови",
    contact: "Контакти",
    navigation: "Навігація",
    explore: "Дослідити",
    company: "Компанія",
    about: "Про нас",
    careers: "Кар'єра",
    press: "Преса",
    support: "Підтримка",
    warranty: "Гарантія",
    delivery: "Доставка та монтаж",
    faq: "Питання й відповіді",
    subscribe: "Підписатися на новини",
    subscribeDesc: "Раз на місяць — нові колекції, історії клієнтів і гайди.",
    subscribePlaceholder: "Ваш email",
    subscribeCta: "Підписатися",
    hours: "Години роботи",
    hoursValue: "Пн–Пт 9:00–19:00 · Сб 10:00–16:00",
    address: "Студія і цех",
    addressValue: "Костопіль, Рівне",
  },
}

const pl: Dictionary = {
  nav: {
    memorial: "Pomniki",
    home: "Do domu i ogrodu",
    services: "Usługi",
    blog: "Blog",
    catalog: "Katalog",
    contact: "Kontakt",
    selection: "Wybór",
  },
  hero: {
    badge: "5 LAT GWARANCJI",
    title: "Kamień naturalny",
    subtitle: "Pomniki, blaty, parapety, schody, kominki i kostka brukowa. Ukraiński granit i marmur oraz importowane gatunki. Własna produkcja w Kostopolu.",
    ctaPrimary: "Zobacz katalog",
    ctaSecondary: "Nasze usługi",
  },
  catalog: {
    label: "KATALOG",
    heading: "Kamień dla pamięci i dla domu",
    subheading: "Pomniki, blaty, parapety, kominki, schody i kostka brukowa. Ukraiński granit oraz import — włoski marmur, granit indyjski i chiński, kwarcyt brazylijski. Produkcja we własnym zakładzie.",
    count: "pozycji",
    fromPrice: "od",
    addToSelection: "Dodaj",
    id: "ID",
    viewAll: "Zobacz wszystkie",
  },
  services: {
    label: "USŁUGI",
    heading: "Od szkicu do montażu",
    subheading: "Pełen cykl: od konsultacji po instalację i konserwację.",
    learnMore: "Więcej",
  },
  blog: {
    label: "BLOG",
    heading: "Magazyn Stone Memory",
    subheading: "Historia, materiały, pielęgnacja i design w świecie kamienia.",
    readMore: "Czytaj dalej",
    readingTime: "min czytania",
    categoryAll: "Wszystkie",
    relatedHeading: "Powiązane artykuły",
    back: "Powrót do bloga",
  },
  selection: {
    title: "Wybór",
    subtitle: "pozycji do wyceny",
    empty: "Nic jeszcze nie wybrano",
    emptyHint: "Przeglądaj katalog i dotknij + aby dodać",
    namePlaceholder: "Twoje imię",
    phonePlaceholder: "Numer telefonu",
    submit: "Poproś o wycenę",
    privacy: "Przesyłając zgadzasz się z Polityką prywatności.",
    remove: "Usuń",
  },
  success: {
    title: "Zgłoszenie przyjęte",
    body: "Menedżer skontaktuje się z Tobą w ciągu 2 godzin roboczych aby omówić Twój wybór i przedstawić szczegółową wycenę.",
    reference: "Numer",
    continueBrowsing: "Kontynuuj przeglądanie",
  },
  footer: {
    tagline: "Naturalny kamień dla pamięci i dla domu. Własna produkcja w Kostopolu.",
    copyright: "© 2026 Stone Memory. Wszelkie prawa zastrzeżone.",
    privacy: "Prywatność",
    terms: "Warunki",
    contact: "Kontakt",
    navigation: "Nawigacja",
    explore: "Odkryj",
    company: "Firma",
    about: "O nas",
    careers: "Kariera",
    press: "Prasa",
    support: "Wsparcie",
    warranty: "Gwarancja",
    delivery: "Dostawa i montaż",
    faq: "FAQ",
    subscribe: "Zapisz się",
    subscribeDesc: "Raz w miesiącu — nowe kolekcje, historie i poradniki.",
    subscribePlaceholder: "Twój email",
    subscribeCta: "Zapisz się",
    hours: "Godziny pracy",
    hoursValue: "Pn–Pt 9:00–19:00 · Sb 10:00–16:00",
    address: "Studio i zakład",
    addressValue: "Kostopol, Równe, Ukraina",
  },
}

const en: Dictionary = {
  nav: {
    memorial: "Monuments",
    home: "Home & Garden",
    services: "Services",
    blog: "Journal",
    catalog: "Catalog",
    contact: "Contact",
    selection: "Selection",
  },
  hero: {
    badge: "5-YEAR GUARANTEE",
    title: "Natural Stone",
    subtitle: "Monuments, countertops, window sills, stairs, fireplaces and paving. Ukrainian granite and marble plus premium imports. Crafted in our Kostopil workshop.",
    ctaPrimary: "Explore Catalog",
    ctaSecondary: "Our Services",
  },
  catalog: {
    label: "CATALOG",
    heading: "Stone for memory and for home",
    subheading: "Monuments, countertops, window sills, fireplaces, stairs and paving. Ukrainian granite plus imports — Italian marble, Indian and Chinese granite, Brazilian quartzite. Made in our own workshop.",
    count: "pieces",
    fromPrice: "from",
    addToSelection: "Add",
    id: "ID",
    viewAll: "View all",
  },
  services: {
    label: "SERVICES",
    heading: "From sketch to installation",
    subheading: "A full cycle: consultation, design, production, delivery, installation, care.",
    learnMore: "Learn more",
  },
  blog: {
    label: "JOURNAL",
    heading: "The Stone Memory Journal",
    subheading: "History, materials, care and design in the world of stone.",
    readMore: "Read",
    readingTime: "min read",
    categoryAll: "All",
    relatedHeading: "Related articles",
    back: "Back to the journal",
  },
  selection: {
    title: "Selection",
    subtitle: "items for quotation",
    empty: "No items selected yet",
    emptyHint: "Browse the catalog and tap + to add",
    namePlaceholder: "Your name",
    phonePlaceholder: "Phone number",
    submit: "Request Calculation",
    privacy: "By submitting you agree to our Privacy Policy.",
    remove: "Remove",
  },
  success: {
    title: "Request received",
    body: "A manager will contact you within 2 business hours to discuss your selection and provide a detailed quote.",
    reference: "Ref",
    continueBrowsing: "Continue browsing",
  },
  footer: {
    tagline: "Natural stone for memory and for home. Crafted in our Kostopil workshop.",
    copyright: "© 2026 Stone Memory. All rights reserved.",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
    navigation: "Navigate",
    explore: "Explore",
    company: "Company",
    about: "About",
    careers: "Careers",
    press: "Press",
    support: "Support",
    warranty: "Warranty",
    delivery: "Delivery & install",
    faq: "FAQ",
    subscribe: "Newsletter",
    subscribeDesc: "Once a month — new collections, customer stories and guides.",
    subscribePlaceholder: "Your email",
    subscribeCta: "Subscribe",
    hours: "Opening hours",
    hoursValue: "Mon–Fri 9:00–19:00 · Sat 10:00–16:00",
    address: "Studio & workshop",
    addressValue: "Kostopil, Rivne, Ukraine",
  },
}

const de: Dictionary = {
  nav: {
    memorial: "Grabmale",
    home: "Haus & Garten",
    services: "Leistungen",
    blog: "Journal",
    catalog: "Katalog",
    contact: "Kontakt",
    selection: "Auswahl",
  },
  hero: {
    badge: "5 JAHRE GARANTIE",
    title: "Naturstein",
    subtitle: "Grabmale, Arbeitsplatten, Fensterbänke, Treppen, Kamine und Pflastersteine. Ukrainischer Granit und Marmor sowie Importsorten. Gefertigt in unserer Werkstatt in Kostopil.",
    ctaPrimary: "Zum Katalog",
    ctaSecondary: "Leistungen",
  },
  catalog: {
    label: "KATALOG",
    heading: "Stein für Erinnerung und Zuhause",
    subheading: "Grabmale, Arbeitsplatten, Fensterbänke, Kamine, Treppen und Pflaster. Ukrainischer Granit sowie Importe — italienischer Marmor, indischer und chinesischer Granit, brasilianischer Quarzit. Gefertigt in unserer eigenen Werkstatt.",
    count: "Stücke",
    fromPrice: "ab",
    addToSelection: "Hinzufügen",
    id: "ID",
    viewAll: "Alle ansehen",
  },
  services: {
    label: "LEISTUNGEN",
    heading: "Von der Skizze bis zur Montage",
    subheading: "Vollständiger Zyklus: Beratung, Entwurf, Fertigung, Lieferung, Montage, Pflege.",
    learnMore: "Mehr erfahren",
  },
  blog: {
    label: "JOURNAL",
    heading: "Das Stone-Memory-Journal",
    subheading: "Geschichte, Material, Pflege und Design in der Welt des Steins.",
    readMore: "Lesen",
    readingTime: "Min. Lesezeit",
    categoryAll: "Alle",
    relatedHeading: "Ähnliche Artikel",
    back: "Zurück zum Journal",
  },
  selection: {
    title: "Auswahl",
    subtitle: "Positionen für Angebot",
    empty: "Noch nichts ausgewählt",
    emptyHint: "Durchstöbern Sie den Katalog und tippen Sie + zum Hinzufügen",
    namePlaceholder: "Ihr Name",
    phonePlaceholder: "Telefonnummer",
    submit: "Angebot anfordern",
    privacy: "Mit dem Absenden stimmen Sie unserer Datenschutzerklärung zu.",
    remove: "Entfernen",
  },
  success: {
    title: "Anfrage erhalten",
    body: "Ein Manager wird Sie innerhalb von 2 Geschäftsstunden kontaktieren um Ihre Auswahl zu besprechen und ein detailliertes Angebot zu erstellen.",
    reference: "Ref",
    continueBrowsing: "Weiter stöbern",
  },
  footer: {
    tagline: "Naturstein für Erinnerung und Zuhause. Gefertigt in unserer Werkstatt in Kostopil.",
    copyright: "© 2026 Stone Memory. Alle Rechte vorbehalten.",
    privacy: "Datenschutz",
    terms: "AGB",
    contact: "Kontakt",
    navigation: "Navigation",
    explore: "Entdecken",
    company: "Unternehmen",
    about: "Über uns",
    careers: "Karriere",
    press: "Presse",
    support: "Support",
    warranty: "Garantie",
    delivery: "Lieferung & Montage",
    faq: "FAQ",
    subscribe: "Newsletter",
    subscribeDesc: "Einmal im Monat — neue Kollektionen, Geschichten und Anleitungen.",
    subscribePlaceholder: "Ihre E-Mail",
    subscribeCta: "Abonnieren",
    hours: "Öffnungszeiten",
    hoursValue: "Mo–Fr 9:00–19:00 · Sa 10:00–16:00",
    address: "Studio & Werkstatt",
    addressValue: "Kostopil, Riwne, Ukraine",
  },
}

const lt: Dictionary = {
  nav: {
    memorial: "Paminklai",
    home: "Namams ir sodui",
    services: "Paslaugos",
    blog: "Žurnalas",
    catalog: "Katalogas",
    contact: "Kontaktai",
    selection: "Pasirinkimas",
  },
  hero: {
    badge: "5 METŲ GARANTIJA",
    title: "Natūralus akmuo",
    subtitle: "Paminklai, stalviršiai, palangės, laiptai, židiniai ir grindinio akmenys. Ukrainietiškas granitas ir marmuras bei importas. Pagaminta mūsų dirbtuvėje Kostopilyje.",
    ctaPrimary: "Katalogas",
    ctaSecondary: "Paslaugos",
  },
  catalog: {
    label: "KATALOGAS",
    heading: "Akmuo atminimui ir namams",
    subheading: "Paminklai, stalviršiai, palangės, židiniai, laiptai ir grindinio akmenys. Ukrainietiškas granitas bei importuotos rūšys — italų marmuras, Indijos ir Kinijos granitas, Brazilijos kvarcitas. Gaminama mūsų pačių dirbtuvėje.",
    count: "prekių",
    fromPrice: "nuo",
    addToSelection: "Pridėti",
    id: "ID",
    viewAll: "Žiūrėti visus",
  },
  services: {
    label: "PASLAUGOS",
    heading: "Nuo eskizo iki montavimo",
    subheading: "Pilnas ciklas: konsultacija, dizainas, gamyba, pristatymas, montavimas, priežiūra.",
    learnMore: "Sužinoti daugiau",
  },
  blog: {
    label: "ŽURNALAS",
    heading: "Stone Memory žurnalas",
    subheading: "Istorija, medžiagos, priežiūra ir dizainas akmens pasaulyje.",
    readMore: "Skaityti",
    readingTime: "min skaitymo",
    categoryAll: "Visi",
    relatedHeading: "Susiję straipsniai",
    back: "Atgal į žurnalą",
  },
  selection: {
    title: "Pasirinkimas",
    subtitle: "prekių skaičiavimui",
    empty: "Dar nieko nepasirinkta",
    emptyHint: "Naršykite kataloge ir paspauskite + kad pridėtumėte",
    namePlaceholder: "Jūsų vardas",
    phonePlaceholder: "Telefono numeris",
    submit: "Prašyti skaičiavimo",
    privacy: "Pateikdami sutinkate su Privatumo politika.",
    remove: "Pašalinti",
  },
  success: {
    title: "Užklausa gauta",
    body: "Vadybininkas susisieks su jumis per 2 darbo valandas aptarti jūsų pasirinkimą ir pateikti išsamų pasiūlymą.",
    reference: "Nr",
    continueBrowsing: "Tęsti naršymą",
  },
  footer: {
    tagline: "Natūralus akmuo atminimui ir namams. Pagaminta mūsų dirbtuvėje Kostopilyje.",
    copyright: "© 2026 Stone Memory. Visos teisės saugomos.",
    privacy: "Privatumas",
    terms: "Sąlygos",
    contact: "Kontaktai",
    navigation: "Navigacija",
    explore: "Naršyti",
    company: "Įmonė",
    about: "Apie mus",
    careers: "Karjera",
    press: "Spauda",
    support: "Pagalba",
    warranty: "Garantija",
    delivery: "Pristatymas ir montavimas",
    faq: "DUK",
    subscribe: "Naujienlaiškis",
    subscribeDesc: "Kartą per mėnesį — naujos kolekcijos, istorijos ir gidai.",
    subscribePlaceholder: "Jūsų el. paštas",
    subscribeCta: "Prenumeruoti",
    hours: "Darbo laikas",
    hoursValue: "Pr–Pn 9:00–19:00 · Š 10:00–16:00",
    address: "Studija ir dirbtuvė",
    addressValue: "Kostopilis, Rivnė, Ukraina",
  },
}

export const dictionaries: Record<Locale, Dictionary> = { uk, pl, en, de, lt }

export const localeNames: Record<Locale, { name: string; flag: string }> = {
  uk: { name: "Українська", flag: "🇺🇦" },
  pl: { name: "Polski", flag: "🇵🇱" },
  en: { name: "English", flag: "🇬🇧" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  lt: { name: "Lietuvių", flag: "🇱🇹" },
}
