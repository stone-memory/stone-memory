import type { Locale } from "@/lib/types"
import type { FactCity, LocalizedFacts } from "@/lib/i18n/copy/facts"

/** Дані міста, які потрібні текстам: локалізовані назви з FACTS плюс числа з site-facts. */
export type CityInput = FactCity & { slug: string; distanceKm: number; freeTravel: boolean }

export type CityCopy = {
  crumb: string
  title: string
  lead: string
  facts: { singleLabel: string; complexLabel: string; distanceValue: string; distanceLabel: string; travelValue: string; travelLabel: string; from: string }
  howTitle: string
  howText: string
  links: { howTo: string; delivery: string; prices: string }
  catalogEyebrow: string
  catalogTitle: string
  militaryEyebrow: string
  militaryTitle: string
  militaryText: (count: string, minFormatted: string | null) => string
  militaryLink: string
  faqEyebrow: string
  faqTitle: string
  faq: { q: string; a: string }[]
  othersEyebrow: string
  othersTitle: string
  noCityBefore: string
  noCityAfter: string
  cta: string
}

const paymentLine = (f: LocalizedFacts) => `${f.payment.steps.map((s) => `${s.share} — ${s.when}`).join("; ")}. ${f.payment.methods}`

const uk = (f: LocalizedFacts, c: CityInput): CityCopy => {
  const travel = c.freeTravel
    ? `Виїзд на замір і монтаж ${c.inCity} безкоштовний — ${c.region} входить у нашу зону обслуговування без доплат.`
    : `Доставка ${c.inCity} рахується за пробігом: ${c.distanceKm} км від Костополя, ${f.delivery.perKm} в один бік. Точну суму називаємо разом із ціною виробу.`
  const isHome = c.slug === "kostopil"
  return {
    crumb: `Пам'ятники ${c.inCity}`,
    title: `Пам'ятники ${c.inCity}`,
    lead: `Виготовляємо в Костополі, встановлюємо ${c.inCity}. ${c.freeTravel ? "Замір, доставка й монтаж — безкоштовно." : `Доставка ${c.distanceKm} км, ${c.travel}.`} Ціна від виробника, без салонної націнки.`,
    facts: {
      singleLabel: "одинарний пам'ятник з монтажем",
      complexLabel: "меморіальний комплекс",
      distanceValue: c.distanceKm ? `${c.distanceKm} км` : "цех тут",
      distanceLabel: c.distanceKm ? `від цеху, ${c.travel}` : c.name,
      travelValue: c.freeTravel ? "0 ₴" : f.delivery.perKm,
      travelLabel: c.freeTravel ? "виїзд і монтаж" : "доставка, за пробігом",
      from: "від",
    },
    howTitle: `Як ми працюємо ${c.inCity}`,
    howText: isHome
      ? `${c.note}\n\nВи надсилаєте фото ділянки або заходите в цех, ми за день повертаємо ескіз і ціну, виїжджаємо на замір, робимо шурф під фундамент і погоджуємо все з адміністрацією кладовища. Виготовлення — ${f.lead.single} для одинарного і ${f.lead.complex} для комплексу, монтаж бригадою за 1–3 дні. Гарантія ${f.warranty} на камінь, фундамент і монтаж: приїжджаємо й виправляємо безкоштовно.`
      : `${c.note}\n\nПроцес той самий, що й для клієнтів у Костополі: ви надсилаєте фото ділянки, ми за день повертаємо ескіз і ціну, виїжджаємо на замір ${c.inCity}, робимо шурф під фундамент і погоджуємо все з адміністрацією кладовища. Виготовлення — ${f.lead.single} для одинарного і ${f.lead.complex} для комплексу, монтаж бригадою за 1–3 дні. Гарантія ${f.warranty} на камінь, фундамент і монтаж діє ${c.inCity} так само, як і біля цеху: приїжджаємо й виправляємо безкоштовно.`,
    links: { howTo: "Як замовити", delivery: "Доставка й оплата", prices: "Ціни" },
    catalogEyebrow: "З каталогу",
    catalogTitle: "Що замовляють",
    militaryEyebrow: "Захисникам",
    militaryTitle: `Військові пам'ятники ${c.inCity}`,
    militaryText: (count, min) => `Для родин загиблих військових ми готуємо повний пакет документів для компенсації від держави та фондів: договір, рахунок, акт, фотофіксацію. Портрет у формі, шеврон підрозділу, герб і нагороди гравіюємо за наданими зображеннями. У каталозі ${count}${min ? `, від ${min}` : ""}; будь-яку доопрацьовуємо під конкретну людину.`,
    militaryLink: "Військові пам'ятники",
    faqEyebrow: "Питання",
    faqTitle: `Про замовлення ${c.inCity} запитують`,
    faq: [
      { q: `Скільки коштує доставка й монтаж ${c.inCity}?`, a: `${travel} Сам монтаж і армований фундамент уже входять у ціну кожної моделі на сайті.` },
      { q: "Чи треба їхати до вас у Костопіль?", a: `Ні. Ескіз, ціну, пробний відбиток портрета й готовий виріб погоджуємо по фото й відео, замір робимо ми самі ${c.inCity}. Приїхати варто лише якщо хочете побачити камінь наживо — ${c.distanceKm ? `це ${c.distanceKm} км, ${c.travel}` : "цех у місті"}.` },
      { q: `Скільки триває замовлення ${c.inCity}?`, a: `Одинарний пам'ятник — ${f.lead.single} від підписання ескізу, комплекс — ${f.lead.complex}. Монтаж ${c.inCity} — один день для одиночного, 1–3 дні для комплексу. ${f.lead.seasonNote}` },
      { q: "Як оплатити?", a: paymentLine(f) },
    ],
    othersEyebrow: "Інші міста",
    othersTitle: "Куди ще виїжджаємо",
    noCityBefore: "Немає вашого міста? Працюємо по всій Україні — подзвоніть ",
    noCityAfter: ", скажемо вартість доставки за хвилину.",
    cta: `Порахуємо пам'ятник ${c.inCity} за фото ділянки`,
  }
}

const pl = (f: LocalizedFacts, c: CityInput): CityCopy => {
  const travel = c.freeTravel
    ? `Dojazd na pomiar i montaż ${c.inCity} jest bezpłatny — ${c.region} wchodzi w naszą strefę obsługi bez dopłat.`
    : `Dostawę ${c.inCity} liczymy według kilometrów: ${c.distanceKm} km od Kostopola, ${f.delivery.perKm} w jedną stronę. Dokładną kwotę podajemy razem z ceną wyrobu.`
  const isHome = c.slug === "kostopil"
  return {
    crumb: `Pomniki ${c.inCity}`,
    title: `Pomniki ${c.inCity}`,
    lead: `Wykonujemy w Kostopolu, stawiamy ${c.inCity}. ${c.freeTravel ? "Pomiar, dostawa i montaż — bezpłatnie." : `Dostawa ${c.distanceKm} km, ${c.travel}.`} Cena od producenta, bez marży salonu.`,
    facts: {
      singleLabel: "pomnik pojedynczy z montażem",
      complexLabel: "kompleks nagrobny",
      distanceValue: c.distanceKm ? `${c.distanceKm} km` : "zakład tutaj",
      distanceLabel: c.distanceKm ? `od zakładu, ${c.travel}` : c.name,
      travelValue: c.freeTravel ? "0 ₴" : f.delivery.perKm,
      travelLabel: c.freeTravel ? "dojazd i montaż" : "dostawa, według kilometrów",
      from: "od",
    },
    howTitle: `Jak pracujemy ${c.inCity}`,
    howText: isHome
      ? `${c.note}\n\nWysyłasz zdjęcie miejsca albo wchodzisz do zakładu, my w ciągu dnia odsyłamy szkic i cenę, jedziemy na pomiar, robimy odkrywkę pod fundament i uzgadniamy wszystko z administracją cmentarza. Wykonanie — ${f.lead.single} dla pojedynczego i ${f.lead.complex} dla kompleksu, montaż ekipą w 1–3 dni. Gwarancja ${f.warranty} na kamień, fundament i montaż: przyjeżdżamy i naprawiamy bezpłatnie.`
      : `${c.note}\n\nProces jest taki sam jak dla klientów w Kostopolu: wysyłasz zdjęcie miejsca, my w ciągu dnia odsyłamy szkic i cenę, jedziemy na pomiar ${c.inCity}, robimy odkrywkę pod fundament i uzgadniamy wszystko z administracją cmentarza. Wykonanie — ${f.lead.single} dla pojedynczego i ${f.lead.complex} dla kompleksu, montaż ekipą w 1–3 dni. Gwarancja ${f.warranty} na kamień, fundament i montaż działa ${c.inCity} tak samo jak przy zakładzie: przyjeżdżamy i naprawiamy bezpłatnie.`,
    links: { howTo: "Jak zamówić", delivery: "Dostawa i płatność", prices: "Ceny" },
    catalogEyebrow: "Z katalogu",
    catalogTitle: "Co zamawiają",
    militaryEyebrow: "Obrońcom",
    militaryTitle: `Pomniki wojskowe ${c.inCity}`,
    militaryText: (count, min) => `Dla rodzin poległych żołnierzy przygotowujemy pełny pakiet dokumentów do rekompensaty od państwa i fundacji: umowę, fakturę, protokół, dokumentację fotograficzną. Portret w mundurze, naszywkę jednostki, godło i odznaczenia grawerujemy według dostarczonych obrazów. W katalogu ${count}${min ? `, od ${min}` : ""}; każdy dopracowujemy pod konkretną osobę.`,
    militaryLink: "Pomniki wojskowe",
    faqEyebrow: "Pytania",
    faqTitle: `O zamówienie ${c.inCity} pytają`,
    faq: [
      { q: `Ile kosztuje dostawa i montaż ${c.inCity}?`, a: `${travel} Sam montaż i zbrojony fundament są już w cenie każdego modelu na stronie.` },
      { q: "Czy trzeba jechać do Was do Kostopola?", a: `Nie. Szkic, cenę, próbny odbitek portretu i gotowy wyrób uzgadniamy na zdjęciach i wideo, pomiar robimy sami ${c.inCity}. Warto przyjechać tylko, jeśli chcesz zobaczyć kamień na żywo — ${c.distanceKm ? `to ${c.distanceKm} km, ${c.travel}` : "zakład w mieście"}.` },
      { q: `Ile trwa zamówienie ${c.inCity}?`, a: `Pomnik pojedynczy — ${f.lead.single} od podpisania szkicu, kompleks — ${f.lead.complex}. Montaż ${c.inCity} — jeden dzień dla pojedynczego, 1–3 dni dla kompleksu. ${f.lead.seasonNote}` },
      { q: "Jak zapłacić?", a: paymentLine(f) },
    ],
    othersEyebrow: "Inne miasta",
    othersTitle: "Gdzie jeszcze dojeżdżamy",
    noCityBefore: "Nie ma Twojego miasta? Pracujemy w całej Ukrainie — zadzwoń ",
    noCityAfter: ", koszt dostawy podamy w minutę.",
    cta: `Wyliczymy pomnik ${c.inCity} na podstawie zdjęcia miejsca`,
  }
}

const en = (f: LocalizedFacts, c: CityInput): CityCopy => {
  const travel = c.freeTravel
    ? `Travel for measurement and installation ${c.inCity} is free: the ${c.region} is inside our service zone with no surcharges.`
    : `Delivery ${c.inCity} is charged by mileage: ${c.distanceKm} km from Kostopil, ${f.delivery.perKm} one way. We quote the exact amount together with the price of the piece.`
  const isHome = c.slug === "kostopil"
  return {
    crumb: `Monuments ${c.inCity}`,
    title: `Monuments ${c.inCity}`,
    lead: `Made in Kostopil, installed ${c.inCity}. ${c.freeTravel ? "Measurement, delivery and installation are free." : `Delivery ${c.distanceKm} km, ${c.travel}.`} Manufacturer's price, no showroom margin.`,
    facts: {
      singleLabel: "single monument with installation",
      complexLabel: "memorial complex",
      distanceValue: c.distanceKm ? `${c.distanceKm} km` : "workshop here",
      distanceLabel: c.distanceKm ? `from the workshop, ${c.travel}` : c.name,
      travelValue: c.freeTravel ? "0 ₴" : f.delivery.perKm,
      travelLabel: c.freeTravel ? "travel and installation" : "delivery, by mileage",
      from: "from",
    },
    howTitle: `How we work ${c.inCity}`,
    howText: isHome
      ? `${c.note}\n\nYou send a photo of the plot or drop into the workshop, we return a sketch and price within a day, come out to measure, dig a test pit for the foundation and agree everything with the cemetery administration. Production takes ${f.lead.single} for a single monument and ${f.lead.complex} for a complex; the crew installs in 1–3 days. A ${f.warranty} warranty on stone, foundation and installation: we come and fix it free of charge.`
      : `${c.note}\n\nThe process is the same as for clients in Kostopil: you send a photo of the plot, we return a sketch and price within a day, come out to measure ${c.inCity}, dig a test pit for the foundation and agree everything with the cemetery administration. Production takes ${f.lead.single} for a single monument and ${f.lead.complex} for a complex; the crew installs in 1–3 days. The ${f.warranty} warranty on stone, foundation and installation applies ${c.inCity} just as it does next to the workshop: we come and fix it free of charge.`,
    links: { howTo: "How to order", delivery: "Delivery and payment", prices: "Prices" },
    catalogEyebrow: "From the catalogue",
    catalogTitle: "What people order",
    militaryEyebrow: "For defenders",
    militaryTitle: `Military monuments ${c.inCity}`,
    militaryText: (count, min) => `For the families of fallen soldiers we prepare the full document package for compensation from the state and foundations: contract, invoice, acceptance certificate, photo record. The portrait in uniform, unit patch, emblem and decorations are engraved from the images you provide. The catalogue has ${count}${min ? `, from ${min}` : ""}; any of them can be adapted to a specific person.`,
    militaryLink: "Military monuments",
    faqEyebrow: "Questions",
    faqTitle: `What people ask about ordering ${c.inCity}`,
    faq: [
      { q: `How much are delivery and installation ${c.inCity}?`, a: `${travel} Installation itself and the reinforced foundation are already included in the price of every model on the site.` },
      { q: "Do I have to come to you in Kostopil?", a: `No. The sketch, price, portrait test print and finished piece are approved by photo and video, and we do the measurement ourselves ${c.inCity}. It's only worth coming if you want to see the stone in person — ${c.distanceKm ? `that's ${c.distanceKm} km, ${c.travel}` : "the workshop is in town"}.` },
      { q: `How long does an order take ${c.inCity}?`, a: `A single monument takes ${f.lead.single} from signing off the sketch, a complex ${f.lead.complex}. Installation ${c.inCity} is one day for a single monument and 1–3 days for a complex. ${f.lead.seasonNote}` },
      { q: "How do I pay?", a: paymentLine(f) },
    ],
    othersEyebrow: "Other cities",
    othersTitle: "Where else we travel",
    noCityBefore: "Your city isn't listed? We work across Ukraine — call ",
    noCityAfter: " and we'll tell you the delivery cost in a minute.",
    cta: `We'll price a monument ${c.inCity} from a photo of the plot`,
  }
}

const de = (f: LocalizedFacts, c: CityInput): CityCopy => {
  const travel = c.freeTravel
    ? `Die Anfahrt für Aufmaß und Montage ${c.inCity} ist kostenlos — die ${c.region} liegt ohne Zuschläge in unserem Servicegebiet.`
    : `Die Lieferung ${c.inCity} wird nach Kilometern berechnet: ${c.distanceKm} km ab Kostopil, ${f.delivery.perKm} einfach. Den genauen Betrag nennen wir zusammen mit dem Preis des Stücks.`
  const isHome = c.slug === "kostopil"
  return {
    crumb: `Grabmale ${c.inCity}`,
    title: `Grabmale ${c.inCity}`,
    lead: `Gefertigt in Kostopil, aufgestellt ${c.inCity}. ${c.freeTravel ? "Aufmaß, Lieferung und Montage — kostenlos." : `Lieferung ${c.distanceKm} km, ${c.travel}.`} Herstellerpreis, ohne Salonaufschlag.`,
    facts: {
      singleLabel: "Einzelgrabmal mit Montage",
      complexLabel: "Grabanlage",
      distanceValue: c.distanceKm ? `${c.distanceKm} km` : "Werkstatt hier",
      distanceLabel: c.distanceKm ? `von der Werkstatt, ${c.travel}` : c.name,
      travelValue: c.freeTravel ? "0 ₴" : f.delivery.perKm,
      travelLabel: c.freeTravel ? "Anfahrt und Montage" : "Lieferung, nach Kilometern",
      from: "ab",
    },
    howTitle: `So arbeiten wir ${c.inCity}`,
    howText: isHome
      ? `${c.note}\n\nSie senden ein Foto der Grabstelle oder kommen in die Werkstatt, wir liefern innerhalb eines Tages Skizze und Preis, fahren zum Aufmaß, legen eine Probegrube fürs Fundament an und stimmen alles mit der Friedhofsverwaltung ab. Fertigung — ${f.lead.single} für ein Einzelgrabmal und ${f.lead.complex} für eine Grabanlage, Montage durch das Team in 1–3 Tagen. ${f.warranty} Garantie auf Stein, Fundament und Montage: Wir kommen und beheben kostenlos.`
      : `${c.note}\n\nDer Ablauf ist derselbe wie für Kunden in Kostopil: Sie senden ein Foto der Grabstelle, wir liefern innerhalb eines Tages Skizze und Preis, fahren zum Aufmaß ${c.inCity}, legen eine Probegrube fürs Fundament an und stimmen alles mit der Friedhofsverwaltung ab. Fertigung — ${f.lead.single} für ein Einzelgrabmal und ${f.lead.complex} für eine Grabanlage, Montage durch das Team in 1–3 Tagen. Die ${f.warranty} Garantie auf Stein, Fundament und Montage gilt ${c.inCity} genauso wie neben der Werkstatt: Wir kommen und beheben kostenlos.`,
    links: { howTo: "So bestellen Sie", delivery: "Lieferung und Zahlung", prices: "Preise" },
    catalogEyebrow: "Aus dem Katalog",
    catalogTitle: "Was bestellt wird",
    militaryEyebrow: "Für Verteidiger",
    militaryTitle: `Soldatengrabmale ${c.inCity}`,
    militaryText: (count, min) => `Für die Familien gefallener Soldaten stellen wir den vollständigen Dokumentensatz für die Erstattung durch Staat und Stiftungen zusammen: Vertrag, Rechnung, Abnahmeprotokoll, Fotodokumentation. Porträt in Uniform, Einheitsabzeichen, Wappen und Auszeichnungen gravieren wir nach den bereitgestellten Bildern. Im Katalog ${count}${min ? `, ab ${min}` : ""}; jedes passen wir an die konkrete Person an.`,
    militaryLink: "Soldatengrabmale",
    faqEyebrow: "Fragen",
    faqTitle: `Was zur Bestellung ${c.inCity} gefragt wird`,
    faq: [
      { q: `Was kosten Lieferung und Montage ${c.inCity}?`, a: `${travel} Montage und bewehrtes Fundament sind bereits im Preis jedes Modells auf der Website enthalten.` },
      { q: "Muss ich zu Ihnen nach Kostopil kommen?", a: `Nein. Skizze, Preis, Probeabzug des Porträts und das fertige Stück stimmen wir per Foto und Video ab, das Aufmaß machen wir selbst ${c.inCity}. Kommen lohnt sich nur, wenn Sie den Stein persönlich sehen möchten — ${c.distanceKm ? `das sind ${c.distanceKm} km, ${c.travel}` : "die Werkstatt liegt in der Stadt"}.` },
      { q: `Wie lange dauert eine Bestellung ${c.inCity}?`, a: `Einzelgrabmal — ${f.lead.single} ab Freigabe der Skizze, Grabanlage — ${f.lead.complex}. Montage ${c.inCity} — ein Tag für ein Einzelgrabmal, 1–3 Tage für eine Grabanlage. ${f.lead.seasonNote}` },
      { q: "Wie wird bezahlt?", a: paymentLine(f) },
    ],
    othersEyebrow: "Weitere Städte",
    othersTitle: "Wohin wir noch fahren",
    noCityBefore: "Ihre Stadt ist nicht dabei? Wir arbeiten in der ganzen Ukraine — rufen Sie an: ",
    noCityAfter: ", die Lieferkosten nennen wir in einer Minute.",
    cta: `Wir kalkulieren ein Grabmal ${c.inCity} nach einem Foto der Grabstelle`,
  }
}

const lt = (f: LocalizedFacts, c: CityInput): CityCopy => {
  const travel = c.freeTravel
    ? `Atvykimas išmatuoti ir montuoti ${c.inCity} nemokamas — ${c.region} įeina į mūsų aptarnavimo zoną be priemokų.`
    : `Pristatymas ${c.inCity} skaičiuojamas pagal kilometražą: ${c.distanceKm} km nuo Kostopilio, ${f.delivery.perKm} į vieną pusę. Tikslią sumą pasakome kartu su gaminio kaina.`
  const isHome = c.slug === "kostopil"
  return {
    crumb: `Paminklai ${c.inCity}`,
    title: `Paminklai ${c.inCity}`,
    lead: `Gaminame Kostopilyje, statome ${c.inCity}. ${c.freeTravel ? "Matavimas, pristatymas ir montavimas — nemokamai." : `Pristatymas ${c.distanceKm} km, ${c.travel}.`} Gamintojo kaina, be salono antkainio.`,
    facts: {
      singleLabel: "vienvietis paminklas su montavimu",
      complexLabel: "memorialinis kompleksas",
      distanceValue: c.distanceKm ? `${c.distanceKm} km` : "cechas čia",
      distanceLabel: c.distanceKm ? `nuo cecho, ${c.travel}` : c.name,
      travelValue: c.freeTravel ? "0 ₴" : f.delivery.perKm,
      travelLabel: c.freeTravel ? "atvykimas ir montavimas" : "pristatymas pagal kilometražą",
      from: "nuo",
    },
    howTitle: `Kaip dirbame ${c.inCity}`,
    howText: isHome
      ? `${c.note}\n\nJūs atsiunčiate kapavietės nuotrauką arba užeinate į cechą, mes per dieną grąžiname eskizą ir kainą, atvykstame išmatuoti, kasame bandomąją duobę pamatui ir viską suderiname su kapinių administracija. Gamyba — ${f.lead.single} vienviečiam ir ${f.lead.complex} kompleksui, brigados montavimas per 1–3 dienas. ${f.warranty} garantija akmeniui, pamatui ir montavimui: atvykstame ir pataisome nemokamai.`
      : `${c.note}\n\nProcesas tas pats kaip klientams Kostopilyje: atsiunčiate kapavietės nuotrauką, mes per dieną grąžiname eskizą ir kainą, atvykstame išmatuoti ${c.inCity}, kasame bandomąją duobę pamatui ir viską suderiname su kapinių administracija. Gamyba — ${f.lead.single} vienviečiam ir ${f.lead.complex} kompleksui, brigados montavimas per 1–3 dienas. ${f.warranty} garantija akmeniui, pamatui ir montavimui ${c.inCity} galioja taip pat, kaip ir prie cecho: atvykstame ir pataisome nemokamai.`,
    links: { howTo: "Kaip užsakyti", delivery: "Pristatymas ir apmokėjimas", prices: "Kainos" },
    catalogEyebrow: "Iš katalogo",
    catalogTitle: "Ką užsako",
    militaryEyebrow: "Gynėjams",
    militaryTitle: `Kariniai paminklai ${c.inCity}`,
    militaryText: (count, min) => `Žuvusių karių šeimoms rengiame visą dokumentų paketą kompensacijai iš valstybės ir fondų: sutartį, sąskaitą, aktą, fotofiksaciją. Portretą uniformoje, padalinio ševroną, herbą ir apdovanojimus graviruojame pagal pateiktus vaizdus. Kataloge ${count}${min ? `, nuo ${min}` : ""}; bet kurį pritaikome konkrečiam žmogui.`,
    militaryLink: "Kariniai paminklai",
    faqEyebrow: "Klausimai",
    faqTitle: `Apie užsakymą ${c.inCity} klausia`,
    faq: [
      { q: `Kiek kainuoja pristatymas ir montavimas ${c.inCity}?`, a: `${travel} Pats montavimas ir armuotas pamatas jau įskaičiuoti į kiekvieno modelio kainą svetainėje.` },
      { q: "Ar reikia važiuoti pas jus į Kostopilį?", a: `Ne. Eskizą, kainą, portreto bandomąjį atspaudą ir gatavą gaminį suderiname pagal nuotraukas ir vaizdo įrašus, išmatuojame patys ${c.inCity}. Atvykti verta tik jei norite pamatyti akmenį gyvai — ${c.distanceKm ? `tai ${c.distanceKm} km, ${c.travel}` : "cechas mieste"}.` },
      { q: `Kiek trunka užsakymas ${c.inCity}?`, a: `Vienvietis paminklas — ${f.lead.single} nuo eskizo pasirašymo, kompleksas — ${f.lead.complex}. Montavimas ${c.inCity} — viena diena vienviečiam, 1–3 dienos kompleksui. ${f.lead.seasonNote}` },
      { q: "Kaip mokėti?", a: paymentLine(f) },
    ],
    othersEyebrow: "Kiti miestai",
    othersTitle: "Kur dar atvykstame",
    noCityBefore: "Nėra jūsų miesto? Dirbame visoje Ukrainoje — paskambinkite ",
    noCityAfter: ", pristatymo kainą pasakysime per minutę.",
    cta: `Apskaičiuosime paminklą ${c.inCity} pagal kapavietės nuotrauką`,
  }
}

export const CITY_COPY: Record<Locale, (f: LocalizedFacts, c: CityInput) => CityCopy> = { uk, pl, en, de, lt }
