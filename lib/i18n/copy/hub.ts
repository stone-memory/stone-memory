import type { Locale } from "@/lib/types"

/** Тексти хабу пам'ятників (/pamyatnyky) і його секцій із components/home-sections.tsx. */
export type HubCopy = {
  intro: { eyebrow: string; heading: string; lead: string; catalog: string; prices: string; consult: string; crumb: string }
  numbers: { models: string; singleWithInstall: string; warranty: string; fromSketch: string; from: string }
  collections: { eyebrow: string; heading: string; all: string; from: string }
  process: {
    eyebrow: string
    heading: string
    lead: string
    consult: string
    details: string
    steps: (leadSingle: string, leadComplex: string, warrantyYears: string) => { title: string; text: string }[]
  }
  regions: { eyebrow: string; heading: string; lead: string; freeTravel: string; byMileage: string; ourWorkshop: string; km: string }
  showcase: { eyebrow: string; heading: string; from: string; alt: string }
  cta: { title: string; text: string; button: string }
}

const uk: HubCopy = {
  intro: {
    eyebrow: "Меморіальний напрям",
    heading: "Пам'ятники з граніту від виробника",
    lead: "Одинарні й подвійні пам'ятники, хрести, дитячі та військові, меморіальні комплекси під ключ. Український граніт, габро й лабрадорит, власний цех у Костополі, монтаж по всій Україні.",
    catalog: "Переглянути каталог",
    prices: "Ціни",
    consult: "Отримати розрахунок",
    crumb: "Пам'ятники",
  },
  numbers: {
    models: "моделей у каталозі",
    singleWithInstall: "одинарний пам'ятник з монтажем",
    warranty: "гарантії на камінь, фундамент і монтаж",
    fromSketch: "від ескізу до встановлення",
    from: "від",
  },
  collections: { eyebrow: "Каталог", heading: "Оберіть тип пам'ятника", all: "Весь каталог", from: "від" },
  process: {
    eyebrow: "Як це відбувається",
    heading: "Від фото ділянки до встановленого пам'ятника",
    lead: "Замовити можна дистанційно з будь-якого міста: усе погодження — по фото, ескізах і відео з цеху. Приїхати треба лише якщо хочете побачити камінь наживо.",
    consult: "Отримати розрахунок",
    details: "Детально про замовлення",
    steps: (single, complex, years) => [
      { title: "Фото ділянки й побажання", text: "Надішліть фото місця в месенджер або через форму." },
      { title: "Ескіз і ціна за день", text: "Протягом робочого дня повертаємось із ескізом й розрахунком. Правки безкоштовні, поки не почали різати камінь." },
      { title: "Замір і 3D-проєкт", text: "Виїжджаємо на кладовище, міряємо ділянку, робимо шурф під фундамент. Для комплексів готуємо 3D-візуалізацію — щоб побачити пропорції до розпилу." },
      { title: "Виготовлення", text: `Одинарний пам'ятник — ${single}, комплекс — ${complex}. Портрет погоджуємо на пробному відбитку, готовий камінь показуємо у цеху або відео.` },
      { title: "Монтаж і гарантія", text: `Бригада ставить фундамент і монтує за 1–3 дні, прибирає за собою. ${years} гарантії на камінь, фундамент і монтаж — приїжджаємо й виправляємо безкоштовно.` },
    ],
  },
  regions: {
    eyebrow: "Де працюємо",
    heading: "Цех у Костополі, монтаж по всій Україні",
    lead: "Виїзд на замір і встановлення в Рівненській та Волинській областях безкоштовний. Далі — за пробігом, без прихованих доплат. Камінь той самий, що продають у Києві, але напряму з цеху.",
    freeTravel: "виїзд безкоштовно",
    byMileage: "за пробігом",
    ourWorkshop: "наш цех",
    km: "км",
  },
  showcase: { eyebrow: "Роботи", heading: "Меморіальні комплекси під ключ", from: "від", alt: "Меморіальний комплекс" },
  cta: {
    title: "Порахуємо вартість за фото ділянки",
    text: "Надішліть фото місця і побажання — протягом робочого дня повернемось з ескізом і ціною. Це безкоштовно й ні до чого не зобов'язує.",
    button: "Надіслати фото ділянки",
  },
}

const pl: HubCopy = {
  intro: {
    eyebrow: "Dział pomników",
    heading: "Pomniki granitowe od producenta",
    lead: "Pomniki pojedyncze i podwójne, krzyże, dziecięce i wojskowe, kompleksy nagrobne pod klucz. Ukraiński granit, gabro i labradoryt, własny zakład w Kostopolu, montaż w całej Ukrainie.",
    catalog: "Zobacz katalog",
    prices: "Ceny",
    consult: "Poproś o wycenę",
    crumb: "Pomniki",
  },
  numbers: {
    models: "modeli w katalogu",
    singleWithInstall: "pomnik pojedynczy z montażem",
    warranty: "gwarancji na kamień, fundament i montaż",
    fromSketch: "od szkicu do montażu",
    from: "od",
  },
  collections: { eyebrow: "Katalog", heading: "Wybierz typ pomnika", all: "Cały katalog", from: "od" },
  process: {
    eyebrow: "Jak to przebiega",
    heading: "Od zdjęcia miejsca do postawionego pomnika",
    lead: "Zamówić można zdalnie z dowolnego miasta: wszystko uzgadniamy na zdjęciach, szkicach i wideo z zakładu. Przyjechać trzeba tylko, jeśli chcesz zobaczyć kamień na żywo.",
    consult: "Poproś o wycenę",
    details: "Szczegóły zamówienia",
    steps: (single, complex, years) => [
      { title: "Zdjęcie miejsca i życzenia", text: "Wyślij zdjęcie miejsca przez komunikator lub formularz." },
      { title: "Szkic i cena w ciągu dnia", text: "W ciągu dnia roboczego odsyłamy szkic i wycenę. Poprawki są bezpłatne, dopóki nie zaczniemy ciąć kamienia." },
      { title: "Pomiar i projekt 3D", text: "Jedziemy na cmentarz, mierzymy miejsce, robimy odkrywkę pod fundament. Dla kompleksów przygotowujemy wizualizację 3D — by zobaczyć proporcje przed cięciem." },
      { title: "Wykonanie", text: `Pomnik pojedynczy — ${single}, kompleks — ${complex}. Portret uzgadniamy na próbnym odbitku, gotowy kamień pokazujemy w zakładzie lub na wideo.` },
      { title: "Montaż i gwarancja", text: `Ekipa stawia fundament i montuje w 1–3 dni, sprząta po sobie. ${years} gwarancji na kamień, fundament i montaż — przyjeżdżamy i naprawiamy bezpłatnie.` },
    ],
  },
  regions: {
    eyebrow: "Gdzie pracujemy",
    heading: "Zakład w Kostopolu, montaż w całej Ukrainie",
    lead: "Dojazd na pomiar i montaż w obwodach rówieńskim i wołyńskim jest bezpłatny. Dalej — według kilometrów, bez ukrytych dopłat. Ten sam kamień, który sprzedają w Kijowie, ale prosto z zakładu.",
    freeTravel: "dojazd bezpłatny",
    byMileage: "według kilometrów",
    ourWorkshop: "nasz zakład",
    km: "km",
  },
  showcase: { eyebrow: "Realizacje", heading: "Kompleksy nagrobne pod klucz", from: "od", alt: "Kompleks nagrobny" },
  cta: {
    title: "Wycenimy na podstawie zdjęcia miejsca",
    text: "Wyślij zdjęcie miejsca i życzenia — w ciągu dnia roboczego odeślemy szkic i cenę. To bezpłatne i do niczego nie zobowiązuje.",
    button: "Wyślij zdjęcie miejsca",
  },
}

const en: HubCopy = {
  intro: {
    eyebrow: "Memorial direction",
    heading: "Granite monuments from the manufacturer",
    lead: "Single and double monuments, crosses, children's and military memorials, turnkey memorial complexes. Ukrainian granite, gabbro and labradorite, our own workshop in Kostopil, installation across Ukraine.",
    catalog: "Browse the catalogue",
    prices: "Prices",
    consult: "Get a quote",
    crumb: "Monuments",
  },
  numbers: {
    models: "models in the catalogue",
    singleWithInstall: "single monument with installation",
    warranty: "warranty on stone, foundation and installation",
    fromSketch: "from sketch to installation",
    from: "from",
  },
  collections: { eyebrow: "Catalogue", heading: "Choose a monument type", all: "Full catalogue", from: "from" },
  process: {
    eyebrow: "How it works",
    heading: "From a photo of the plot to an installed monument",
    lead: "You can order remotely from any city: everything is agreed on photos, sketches and video from the workshop. You only need to visit if you want to see the stone in person.",
    consult: "Get a quote",
    details: "Ordering in detail",
    steps: (single, complex, years) => [
      { title: "Photo of the plot and your wishes", text: "Send a photo of the site via messenger or the form." },
      { title: "Sketch and price within a day", text: "Within one working day we come back with a sketch and a quote. Changes are free until we start cutting stone." },
      { title: "Measurement and 3D design", text: "We visit the cemetery, measure the plot and dig a test pit for the foundation. For complexes we prepare a 3D visualisation to check proportions before cutting." },
      { title: "Production", text: `A single monument takes ${single}, a complex ${complex}. The portrait is approved on a test print; we show the finished stone at the workshop or on video.` },
      { title: "Installation and warranty", text: `The crew builds the foundation and installs in 1–3 days, cleaning up afterwards. ${years} warranty on stone, foundation and installation — we come back and fix it free of charge.` },
    ],
  },
  regions: {
    eyebrow: "Where we work",
    heading: "Workshop in Kostopil, installation across Ukraine",
    lead: "Travel for measurement and installation in the Rivne and Volyn regions is free. Beyond that — by mileage, no hidden charges. The same stone sold in Kyiv, but straight from the workshop.",
    freeTravel: "free travel",
    byMileage: "by mileage",
    ourWorkshop: "our workshop",
    km: "km",
  },
  showcase: { eyebrow: "Our work", heading: "Turnkey memorial complexes", from: "from", alt: "Memorial complex" },
  cta: {
    title: "We'll price it from a photo of the plot",
    text: "Send a photo of the site and your wishes — within one working day we'll return a sketch and a price. It's free and carries no obligation.",
    button: "Send a photo of the plot",
  },
}

const de: HubCopy = {
  intro: {
    eyebrow: "Bereich Grabmale",
    heading: "Grabmale aus Granit vom Hersteller",
    lead: "Einzel- und Doppelgrabmale, Kreuze, Kinder- und Soldatengrabmale, schlüsselfertige Grabanlagen. Ukrainischer Granit, Gabbro und Labradorit, eigene Werkstatt in Kostopil, Montage in der ganzen Ukraine.",
    catalog: "Katalog ansehen",
    prices: "Preise",
    consult: "Angebot anfordern",
    crumb: "Grabmale",
  },
  numbers: {
    models: "Modelle im Katalog",
    singleWithInstall: "Einzelgrabmal mit Montage",
    warranty: "Garantie auf Stein, Fundament und Montage",
    fromSketch: "vom Entwurf bis zur Aufstellung",
    from: "ab",
  },
  collections: { eyebrow: "Katalog", heading: "Wählen Sie den Grabmaltyp", all: "Gesamter Katalog", from: "ab" },
  process: {
    eyebrow: "So läuft es ab",
    heading: "Vom Foto der Grabstelle zum aufgestellten Grabmal",
    lead: "Bestellen können Sie aus jeder Stadt aus der Ferne: alles wird über Fotos, Skizzen und Videos aus der Werkstatt abgestimmt. Vorbeikommen müssen Sie nur, wenn Sie den Stein persönlich sehen möchten.",
    consult: "Angebot anfordern",
    details: "Bestellung im Detail",
    steps: (single, complex, years) => [
      { title: "Foto der Grabstelle und Wünsche", text: "Senden Sie ein Foto des Ortes per Messenger oder über das Formular." },
      { title: "Skizze und Preis innerhalb eines Tages", text: "Innerhalb eines Arbeitstages melden wir uns mit Skizze und Kalkulation. Änderungen sind kostenlos, solange der Stein nicht geschnitten ist." },
      { title: "Aufmaß und 3D-Entwurf", text: "Wir fahren zum Friedhof, messen die Grabstelle und legen eine Probegrube fürs Fundament an. Für Grabanlagen erstellen wir eine 3D-Visualisierung, um die Proportionen vor dem Schnitt zu prüfen." },
      { title: "Fertigung", text: `Einzelgrabmal — ${single}, Grabanlage — ${complex}. Das Porträt stimmen wir am Probeabzug ab, den fertigen Stein zeigen wir in der Werkstatt oder per Video.` },
      { title: "Montage und Garantie", text: `Das Team setzt das Fundament und montiert in 1–3 Tagen, danach wird aufgeräumt. ${years} Garantie auf Stein, Fundament und Montage — wir kommen und beheben kostenlos.` },
    ],
  },
  regions: {
    eyebrow: "Wo wir arbeiten",
    heading: "Werkstatt in Kostopil, Montage in der ganzen Ukraine",
    lead: "Anfahrt für Aufmaß und Aufstellung in den Regionen Riwne und Wolhynien ist kostenlos. Darüber hinaus nach Kilometern, ohne versteckte Zuschläge. Derselbe Stein wie in Kyjiw, aber direkt aus der Werkstatt.",
    freeTravel: "Anfahrt kostenlos",
    byMileage: "nach Kilometern",
    ourWorkshop: "unsere Werkstatt",
    km: "km",
  },
  showcase: { eyebrow: "Arbeiten", heading: "Schlüsselfertige Grabanlagen", from: "ab", alt: "Grabanlage" },
  cta: {
    title: "Wir kalkulieren nach einem Foto der Grabstelle",
    text: "Senden Sie ein Foto des Ortes und Ihre Wünsche — innerhalb eines Arbeitstages erhalten Sie Skizze und Preis. Kostenlos und unverbindlich.",
    button: "Foto der Grabstelle senden",
  },
}

const lt: HubCopy = {
  intro: {
    eyebrow: "Memorialinė kryptis",
    heading: "Granito paminklai iš gamintojo",
    lead: "Vienviečiai ir dviviečiai paminklai, kryžiai, vaikų ir kariniai paminklai, memorialiniai kompleksai iki galo. Ukrainietiškas granitas, gabras ir labradoritas, nuosavas cechas Kostopilyje, montavimas visoje Ukrainoje.",
    catalog: "Peržiūrėti katalogą",
    prices: "Kainos",
    consult: "Gauti skaičiavimą",
    crumb: "Paminklai",
  },
  numbers: {
    models: "modelių kataloge",
    singleWithInstall: "vienvietis paminklas su montavimu",
    warranty: "garantija akmeniui, pamatui ir montavimui",
    fromSketch: "nuo eskizo iki pastatymo",
    from: "nuo",
  },
  collections: { eyebrow: "Katalogas", heading: "Pasirinkite paminklo tipą", all: "Visas katalogas", from: "nuo" },
  process: {
    eyebrow: "Kaip tai vyksta",
    heading: "Nuo kapavietės nuotraukos iki pastatyto paminklo",
    lead: "Užsakyti galima nuotoliniu būdu iš bet kurio miesto: viską suderiname pagal nuotraukas, eskizus ir vaizdo įrašus iš cecho. Atvykti reikia tik jei norite pamatyti akmenį gyvai.",
    consult: "Gauti skaičiavimą",
    details: "Išsamiai apie užsakymą",
    steps: (single, complex, years) => [
      { title: "Kapavietės nuotrauka ir pageidavimai", text: "Atsiųskite vietos nuotrauką per programėlę arba formą." },
      { title: "Eskizas ir kaina per dieną", text: "Per darbo dieną grįžtame su eskizu ir skaičiavimu. Pataisymai nemokami, kol nepradėjome pjauti akmens." },
      { title: "Išmatavimas ir 3D projektas", text: "Atvykstame į kapines, išmatuojame vietą, kasame bandomąją duobę pamatui. Kompleksams rengiame 3D vizualizaciją — pamatyti proporcijas prieš pjovimą." },
      { title: "Gamyba", text: `Vienvietis paminklas — ${single}, kompleksas — ${complex}. Portretą suderiname bandomajame atspaude, gatavą akmenį parodome ceche arba vaizdo įraše.` },
      { title: "Montavimas ir garantija", text: `Brigada įrengia pamatą ir sumontuoja per 1–3 dienas, po savęs sutvarko. ${years} garantija akmeniui, pamatui ir montavimui — atvykstame ir pataisome nemokamai.` },
    ],
  },
  regions: {
    eyebrow: "Kur dirbame",
    heading: "Cechas Kostopilyje, montavimas visoje Ukrainoje",
    lead: "Atvykimas išmatuoti ir montuoti Rivnės ir Voluinės srityse nemokamas. Toliau — pagal kilometražą, be paslėptų priemokų. Tas pats akmuo, kurį parduoda Kyjive, bet tiesiai iš cecho.",
    freeTravel: "atvykimas nemokamas",
    byMileage: "pagal kilometražą",
    ourWorkshop: "mūsų cechas",
    km: "km",
  },
  showcase: { eyebrow: "Darbai", heading: "Memorialiniai kompleksai iki galo", from: "nuo", alt: "Memorialinis kompleksas" },
  cta: {
    title: "Apskaičiuosime kainą pagal kapavietės nuotrauką",
    text: "Atsiųskite vietos nuotrauką ir pageidavimus — per darbo dieną grąžinsime eskizą ir kainą. Tai nemokama ir niekam neįpareigoja.",
    button: "Atsiųsti kapavietės nuotrauką",
  },
}

export const HUB_COPY: Record<Locale, HubCopy> = { uk, pl, en, de, lt }
