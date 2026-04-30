import type { Locale } from "@/lib/types"

// -------- Reviews --------
export type SeedReview = {
  id: string
  name: string
  text: string
  rating: number
  date: string
  photo?: string | null
  source: "google" | "manual"
  placement: "home" | "all" | "hidden"
  order?: number
}

function daysAgo(days: number): string {
  const now = Date.now()
  return new Date(now - days * 86400000).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export const seedReviews: SeedReview[] = [
  {
    id: "r1",
    name: "Олена В.",
    text: "Безмежно вдячна команді Stone Memory. Показали ескіз заздалегідь, все зробили акуратно, комунікація на вищому рівні.",
    rating: 5,
    date: daysAgo(7),
    source: "google",
    placement: "home",
    order: 1,
  },
  {
    id: "r2",
    name: "Михайло Т.",
    text: "Замовляли складний сімейний склеп. Інженери врахували всі нюанси схилу на ділянці, зробили потужний фундамент.",
    rating: 5,
    date: daysAgo(14),
    source: "google",
    placement: "home",
    order: 2,
  },
  {
    id: "r3",
    name: "Вікторія С.",
    text: "Справжній преміум сервіс. Скульптор працював над ангелом з мармуру майже три місяці. Фінальний результат перехоплює подих.",
    rating: 5,
    date: daysAgo(21),
    source: "google",
    placement: "home",
    order: 3,
  },
  {
    id: "r4",
    name: "Андрій К.",
    text: "Стільниця з Calacatta — мрія здійснилася. Замір провели швидко, поставили без недоліків, меблі ідеально з нею стали.",
    rating: 5,
    date: daysAgo(30),
    source: "google",
    placement: "home",
    order: 4,
  },
  {
    id: "r5",
    name: "Наталія Д.",
    text: "Камін з Прилузького мармуру — це справжній витвір. Від ескізу до встановлення три тижні, все в термін.",
    rating: 5,
    date: daysAgo(45),
    source: "google",
    placement: "home",
    order: 5,
  },
  {
    id: "r6",
    name: "Roman M.",
    text: "Granite staircase for my house. Quality is perfect, every step polished to a mirror finish. Installation was clean.",
    rating: 5,
    date: daysAgo(60),
    source: "google",
    placement: "home",
    order: 6,
  },
  {
    id: "r7",
    name: "Тетяна П.",
    text: "Замовляла пам'ятник батькам. Дуже уважне ставлення, кілька варіантів ескізу, врахували всі побажання.",
    rating: 5,
    date: daysAgo(90),
    source: "google",
    placement: "all",
  },
  {
    id: "r8",
    name: "Сергій Л.",
    text: "Професіонали своєї справи. Гравіювання портрета зроблено з архівною точністю, навіть дрібні деталі видно чітко.",
    rating: 5,
    date: daysAgo(100),
    source: "google",
    placement: "all",
  },
  {
    id: "r9",
    name: "Irena K.",
    text: "Marmurowy parapet w kuchni. Świetna jakość, terminowo, rozsądna cena. Polecam.",
    rating: 5,
    date: daysAgo(120),
    source: "google",
    placement: "all",
  },
  {
    id: "r10",
    name: "Юлія Т.",
    text: "Реставрація старого пам'ятника бабусі. Попередньо діагностували, запропонували план, зробили як новий.",
    rating: 5,
    date: daysAgo(130),
    source: "google",
    placement: "all",
  },
  {
    id: "r11",
    name: "Олег М.",
    text: "Бруківка на подвір'ї. Геометричний малюнок з двох кольорів — виглядає дуже ефектно. Роботу закінчили за 2 тижні.",
    rating: 4,
    date: daysAgo(150),
    source: "google",
    placement: "all",
  },
  {
    id: "r12",
    name: "Klaus R.",
    text: "Grabmal für meine Mutter. Sehr professionell, von Entwurf bis Montage alles pünktlich und sauber.",
    rating: 5,
    date: daysAgo(170),
    source: "google",
    placement: "all",
  },
]

// -------- FAQ --------
const ukFaq: Array<{ q: string; a: string }> = [
  {
    q: "Який реальний термін виготовлення меморіального комплексу?",
    a: "Стандартний меморіальний комплекс готується 6-10 тижнів: 1 тиждень на ескіз та узгодження, 4-6 тижнів на виготовлення, 1-2 тижні на монтаж. Ексклюзивні проекти зі скульптурою можуть займати до 3-5 місяців.",
  },
  {
    q: "Чи надаєте ви офіційну юридичну гарантію?",
    a: "Так, кожен проект супроводжується юридично оформленим гарантійним сертифікатом. Ми надаємо 5 років гарантії на все — фундамент, монтаж і камінь. Усі матеріали мають сертифікати походження.",
  },
  {
    q: "Як правильно доглядати за полірованим гранітом?",
    a: "Поліроване каміння потребує мінімального догляду: достатньо раз на півроку протирати м'якою тканиною з теплою водою без абразивних засобів. Ми надаємо гайд з догляду та пропонуємо щорічне сервісне обслуговування.",
  },
  {
    q: "Чи можу я замовити пам'ятник дистанційно?",
    a: "Так. Працюємо з клієнтами по всьому світу. Після відеоконсультації надсилаємо детальний ескіз з розмірами і матеріалами, узгоджуємо онлайн і підписуємо договір дистанційно. Монтаж виконуємо по всій Україні та ЄС.",
  },
  {
    q: "Як формується вартість проекту?",
    a: "Ціна залежить від породи каменю, габаритів, складності різьблення та додаткових елементів (огорожа, плитка, лави). Базовий розрахунок надаємо безкоштовно протягом 24 годин після отримання технічного завдання.",
  },
]

export type SeedFaq = {
  id: string
  q: Record<Locale, string>
  a: Record<Locale, string>
  order: number
  hidden?: boolean
}

export const seedFaq: SeedFaq[] = ukFaq.map((f, i) => ({
  id: `faq-${i + 1}`,
  order: i,
  q: { uk: f.q, en: f.q, pl: f.q, de: f.q, lt: f.q },
  a: { uk: f.a, en: f.a, pl: f.a, de: f.a, lt: f.a },
}))

// -------- Business profile --------
export const seedBusinessProfile = {
  legalName: "ФОП Stone Memory",
  displayName: "Stone Memory",
  email: "sttonememory@gmail.com",
  phone: "+380 (67) 808 02 22",
  address: "",
  city: "Костопіль",
  region: "Рівненська область",
  postalCode: "35000",
  country: "Україна",
  vatId: "",
  hours: {
    mon: { open: "09:00", close: "19:00", closed: false },
    tue: { open: "09:00", close: "19:00", closed: false },
    wed: { open: "09:00", close: "19:00", closed: false },
    thu: { open: "09:00", close: "19:00", closed: false },
    fri: { open: "09:00", close: "19:00", closed: false },
    sat: { open: "10:00", close: "16:00", closed: false },
    sun: { open: "00:00", close: "00:00", closed: true },
  },
  holidays: [],
  serviceAreas: ["UA", "PL", "DE", "LT", "EU"],
  currency: "EUR",
  bankingIban: "",
}

// -------- About (full content per locale) --------
export type AboutBadge = { label: string; icon: "award" | "shield" | "users" | "truck" }
export type AboutContent = {
  heading: string
  paragraphs: string[]
  photo: string
  photoAlt: string
  badges: AboutBadge[]
}

export const seedAbout: Record<Locale, AboutContent> = {
  uk: {
    heading: "Про Stone Memory",
    paragraphs: [
      "Stone Memory — виробництво виробів з натурального каменю у Костополі на Рівненщині. Дві рівноцінні лінії: меморіальні комплекси та вироби для дому й саду — стільниці, підвіконня, каміни, сходи, бруківка.",
      "Працюємо з українським гранітом і мармуром, а також з імпортними породами — італійський мармур, індійський і китайський граніт, бразильський кварцит. Підбираємо матеріал під проект і бюджет.",
      "Робимо акуратно, без поспіху, з повагою до матеріалу і клієнта. Даємо 5 років гарантії на все — фундамент, монтаж і сам камінь. Особистий менеджер від запиту до встановлення.",
    ],
    photo: "/services/hero.jpg",
    photoAlt: "Stone Memory — цех",
    badges: [
      { label: "Власне виробництво", icon: "users" },
      { label: "5 років гарантії", icon: "shield" },
      { label: "Монтаж по всій Україні", icon: "truck" },
    ],
  },
  pl: {
    heading: "O Stone Memory",
    paragraphs: [
      "Stone Memory to wytwórnia wyrobów z kamienia naturalnego w mieście Kostopol na Rówieńszczyźnie. Dwie równoważne linie: kompleksy memorialne oraz wyroby dla domu i ogrodu — blaty, parapety, kominki, schody, kostka brukowa.",
      "Pracujemy z ukraińskim granitem i marmurem oraz z gatunkami importowanymi — marmur włoski, granit indyjski i chiński, kwarcyt brazylijski. Dobieramy materiał pod projekt i budżet.",
      "Robimy starannie, bez pośpiechu, z szacunkiem do materiału i klienta. Dajemy 5 lat gwarancji na wszystko — fundament, montaż i sam kamień. Osobisty menedżer od zapytania do montażu.",
    ],
    photo: "/services/hero.jpg",
    photoAlt: "Stone Memory — zakład",
    badges: [
      { label: "Własna produkcja", icon: "users" },
      { label: "5 lat gwarancji", icon: "shield" },
      { label: "Montaż w całej Ukrainie", icon: "truck" },
    ],
  },
  en: {
    heading: "About Stone Memory",
    paragraphs: [
      "Stone Memory is a natural-stone workshop in Kostopil, Rivne region. Two equal product lines: memorial complexes and pieces for home and garden — countertops, window sills, fireplaces, stairs, paving.",
      "We work with Ukrainian granite and marble as well as imported varieties — Italian marble, Indian and Chinese granite, Brazilian quartzite. We pick the material to match the project and the budget.",
      "We work carefully and without rush, with respect to the material and to the client. Five-year warranty on everything — foundation, installation and the stone itself. A dedicated manager from enquiry to installation.",
    ],
    photo: "/services/hero.jpg",
    photoAlt: "Stone Memory workshop",
    badges: [
      { label: "In-house production", icon: "users" },
      { label: "5-year warranty", icon: "shield" },
      { label: "Installation across Ukraine", icon: "truck" },
    ],
  },
  de: {
    heading: "Über Stone Memory",
    paragraphs: [
      "Stone Memory ist eine Naturstein-Werkstatt in Kostopil, Oblast Riwne. Zwei gleichwertige Linien: Grabmal-Komplexe und Stücke für Haus und Garten — Arbeitsplatten, Fensterbänke, Kamine, Treppen, Pflaster.",
      "Wir arbeiten mit ukrainischem Granit und Marmor sowie mit Importsorten — italienischer Marmor, indischer und chinesischer Granit, brasilianischer Quarzit. Wir wählen das Material nach Projekt und Budget.",
      "Wir arbeiten sorgfältig und ohne Eile, mit Respekt vor Material und Kunde. 5 Jahre Garantie auf alles — Fundament, Montage und den Stein. Persönlicher Manager von der Anfrage bis zur Montage.",
    ],
    photo: "/services/hero.jpg",
    photoAlt: "Stone Memory Werkstatt",
    badges: [
      { label: "Eigene Produktion", icon: "users" },
      { label: "5 Jahre Garantie", icon: "shield" },
      { label: "Montage in der ganzen Ukraine", icon: "truck" },
    ],
  },
  lt: {
    heading: "Apie Stone Memory",
    paragraphs: [
      "Stone Memory — natūralaus akmens gaminių dirbtuvė Kostopilyje, Rivnės srityje. Dvi lygiavertės linijos: memorialiniai kompleksai ir gaminiai namams bei sodui — stalviršiai, palangės, židiniai, laiptai, grindinio akmenys.",
      "Dirbame su ukrainietišku granitu ir marmuru bei importuotomis rūšimis — italų marmuru, Indijos ir Kinijos granitu, Brazilijos kvarcitu. Medžiagą parenkame pagal projektą ir biudžetą.",
      "Dirbame kruopščiai, be skubos, gerbdami medžiagą ir klientą. 5 metų garantija viskam — pamatui, montavimui ir pačiam akmeniui. Asmeninis vadybininkas nuo užklausos iki montavimo.",
    ],
    photo: "/services/hero.jpg",
    photoAlt: "Stone Memory dirbtuvė",
    badges: [
      { label: "Nuosava gamyba", icon: "users" },
      { label: "5 m. garantija", icon: "shield" },
      { label: "Montavimas visoje Ukrainoje", icon: "truck" },
    ],
  },
}

// -------- Blog config default --------
export const seedBlogConfig = {
  heroMode: "latest" as "latest" | "pinned",
  pinnedSlug: null as string | null,
}
