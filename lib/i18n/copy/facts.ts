import type { Locale } from "@/lib/types"
import { CITIES, DELIVERY, INSTALLATION, LEAD_TIMES, PAYMENT, SERVICE_PRICES, WARRANTY_YEARS } from "@/lib/site-facts"
import { localizeDuration, yearsLabel } from "@/lib/i18n/copy/common"

/**
 * Факти майстерні (lib/site-facts) для інших мов.
 *
 * Українська версія береться з site-facts напряму — це єдине джерело правди, і
 * виправлення цифри там автоматично потрапляє сюди через `localizeDuration`
 * для термінів. Для pl/en/de/lt тут переклад формулювань; самі числа
 * (відстані, частки оплати, роки гарантії) читаються з тих самих констант.
 */

export type FactCity = { name: string; inCity: string; region: string; travel: string; note: string }

export type LocalizedFacts = {
  warranty: string
  lead: { single: string; double: string; complex: string; cross: string; child: string; military: string; engravingOnly: string; seasonNote: string }
  payment: { steps: { share: string; when: string; what: string }[]; methods: string }
  delivery: { freeRegions: string; perKm: string; eu: string; packaging: string }
  installation: { survey: string; clay: string; peat: string; crew: string }
  /** `price` — функція від форматера гривні, щоб сума показувалась у валюті відвідувача. */
  servicePrices: { name: string; price: (fmt: (uah: number) => string) => string; note: string }[]
  cities: Record<string, FactCity>
}

const leadTimes = (locale: Locale) => ({
  single: localizeDuration(LEAD_TIMES.single, locale),
  double: localizeDuration(LEAD_TIMES.double, locale),
  complex: localizeDuration(LEAD_TIMES.complex, locale),
  cross: localizeDuration(LEAD_TIMES.cross, locale),
  child: localizeDuration(LEAD_TIMES.child, locale),
  military: localizeDuration(LEAD_TIMES.military, locale),
  engravingOnly: localizeDuration(LEAD_TIMES.engravingOnly, locale),
})

const shares = PAYMENT.steps.map((s) => s.share)

const uk: LocalizedFacts = {
  warranty: yearsLabel(WARRANTY_YEARS, "uk"),
  lead: { ...leadTimes("uk"), seasonNote: LEAD_TIMES.seasonNote },
  payment: { steps: [...PAYMENT.steps], methods: PAYMENT.methods },
  delivery: { ...DELIVERY },
  installation: { ...INSTALLATION },
  servicePrices: SERVICE_PRICES.map((s) => ({ name: s.name, price: () => s.price, note: s.note })),
  cities: Object.fromEntries(CITIES.map((c) => [c.slug, { name: c.name, inCity: c.inCity, region: c.region, travel: c.travel, note: c.note }])),
}

const pl: LocalizedFacts = {
  warranty: yearsLabel(WARRANTY_YEARS, "pl"),
  lead: { ...leadTimes("pl"), seasonNote: "W sezonie (kwiecień–czerwiec, sierpień–październik) kolejka może być o 2 tygodnie dłuższa." },
  payment: {
    steps: [
      { share: shares[0], when: "przy podpisaniu szkicu", what: "materiały i rozpoczęcie prac" },
      { share: shares[1], when: "gdy kamień jest gotowy i został przez Ciebie odebrany", what: "osobiście w zakładzie lub na wideo" },
      { share: shares[2], when: "po montażu na miejscu", what: "gdy wszystko stoi i wszystko Ci odpowiada" },
    ],
    methods: "Gotówka, karta, przelew (także dla firm i fundacji charytatywnych).",
  },
  delivery: {
    freeRegions: "obwody rówieński i wołyński",
    perKm: "3–5 ₴/km",
    eu: "Polska, Niemcy, Litwa, Czechy",
    packaging: "Drewniana skrzynia, narożniki w styropianie, każdy element osobno. Ładunek jest ubezpieczony.",
  },
  installation: {
    survey: "Przed montażem robimy odkrywkę 60–80 cm, by zobaczyć grunt.",
    clay: "Dla gliny i piasku — zbrojony pas betonowy po obwodzie.",
    peat: "Dla torfu lub gruntu nasypowego — pale zbrojeniowe do twardej warstwy.",
    crew: "Ekipa 2–3 osób, niwelator, uszczelnienie spoin. Montaż pomnika pojedynczego — jeden dzień, kompleksu — 1–3 dni.",
  },
  servicePrices: [
    { name: "Grawer portretu (ręczny lub laserowy)", price: (f) => `od ${f(2000)}`, note: "retusz starego zdjęcia w cenie" },
    { name: "Napis (imię, daty, epitafium)", price: (f) => `od ${f(18)} za znak`, note: "złocenie — od 80 ₴ za znak" },
    { name: "Fotoceramika 24×30 cm", price: (f) => `od ${f(1300)}`, note: "kolorowa, w ramce lub bez" },
    { name: "Grawer symboliki, ornamentu, krzyża", price: (f) => `od ${f(800)}`, note: "zależy od powierzchni rysunku" },
    { name: "Wazon, lampion z granitu", price: (f) => `od ${f(1500)}`, note: "w kolorze pomnika" },
    { name: "Ogrodzenie granitowe (cokół), m.b.", price: (f) => `od ${f(2500)}`, note: "z montażem" },
    { name: "Obłożenie miejsca płytami, m²", price: (f) => `od ${f(2300)}`, note: "granit polerowany lub płomieniowany" },
    { name: "Renowacja: czyszczenie, odnowienie napisu", price: (f) => `od ${f(1200)}`, note: "dojazd w obwodach rówieńskim i wołyńskim bezpłatny" },
  ],
  cities: {
    kostopil: { name: "Kostopol", inCity: "w Kostopolu", region: "obwód rówieński", travel: "zakład w mieście", note: "Tu jest nasz zakład i plac wystawowy: można zobaczyć kamień na żywo, dotknąć polerowania, obejrzeć grawer na prawdziwych stelach, a nie na zdjęciu." },
    rivne: { name: "Równe", inCity: "w Równem", region: "obwód rówieński", travel: "40–50 minut", note: "Najczęstsza trasa pracowni. Jeździmy na pomiar i montaż na wszystkie cmentarze Równego i powiatu, w tym na Nowy Cmentarz (Jubilejne) i cmentarz Dubieński." },
    sarny: { name: "Sarny", inCity: "w Sarnach", region: "obwód rówieński", travel: "około godziny", note: "Sarny, Klesów, Rokitno, Dąbrowica — północ Rówieńszczyzny obsługujemy tak samo jak stolicę obwodu: pomiar, montaż i dojazd gwarancyjny są bezpłatne." },
    lutsk: { name: "Łuck", inCity: "w Łucku", region: "obwód wołyński", travel: "1,5–2 godziny", note: "Wołyń wchodzi w strefę bezpłatnego dojazdu. Pracujemy na cmentarzach Łucka, Kiwerc, Rożyszcz i Kowla; do odległych wsi obwodu też dojeżdżamy bez dopłaty." },
    zhytomyr: { name: "Żytomierz", inCity: "w Żytomierzu", region: "obwód żytomierski", travel: "2–2,5 godziny", note: "Żytomierszczyzna to ojczyzna większości kamienia, z którym pracujemy: granit leznykiwski, gabro hołowyńskie i granit didkowicki wydobywa się tuż obok. Dostawę liczymy według kilometrów." },
    kyiv: { name: "Kijów", inCity: "w Kijowie", region: "obwód kijowski", travel: "4–5 godzin", note: "Do Kijowa wieziemy gotowe i w pełni sprawdzone wyroby: ekipa montuje w jeden–dwa dni, więc klient nie musi tygodniami pilnować procesu. Cena bez stołecznej marży — ten sam kamień, który sprzedaje się w Kijowie, ale prosto z zakładu." },
    zdolbuniv: { name: "Zdołbunów", inCity: "w Zdołbunowie", region: "obwód rówieński", travel: "około godziny", note: "Zdołbunów, Mizocz, Ostrożec — droga prowadzi przez Równe, dlatego pomiar i montaż planujemy razem z wyjazdami do Równego, a to krótsza kolejka na montaż." },
    ostroh: { name: "Ostróg", inCity: "w Ostrogu", region: "obwód rówieński", travel: "1,5 godziny", note: "Stare miasto ze starymi cmentarzami: tu częściej proszą o renowację grobów rodzinnych i dobór kamienia w tonie już stojących pomników, więc przywozimy próbki na miejsce." },
    dubno: { name: "Dubno", inCity: "w Dubnie", region: "obwód rówieński", travel: "1,5–2 godziny", note: "Dubno, Radziwiłłów, Demidówka — południe obwodu, gdzie jeździmy nie rzadziej niż raz na dwa tygodnie. Dojazd i montaż bez dopłaty, jak w całym obwodzie rówieńskim." },
    varash: { name: "Warasz", inCity: "w Waraszu", region: "obwód rówieński", travel: "1–1,5 godziny", note: "Warasz, Włodzimierzec, Rafałówka — północ Rówieńszczyzny z gruntami piaszczystymi, gdzie fundament jest ważniejszy niż kamień: robimy pas betonowy po obwodzie i zbrojenie pod każdy element." },
    kovel: { name: "Kowel", inCity: "w Kowlu", region: "obwód wołyński", travel: "2,5 godziny", note: "Kowel jest w strefie bezpłatnego dojazdu, jak cały Wołyń. Montaż planujemy jednym wyjazdem na kilka zamówień w mieście i powiecie, dlatego termin montażu lepiej uzgodnić z wyprzedzeniem." },
    novovolynsk: { name: "Nowowołyńsk", inCity: "w Nowowołyńsku", region: "obwód wołyński", travel: "3–3,5 godziny", note: "Najdalsze miasto w strefie bezpłatnego dojazdu. Szkic i portret uzgadniamy zdalnie, przyjeżdżamy dwa razy: na pomiar i na montaż wyrobu sprawdzonego już w zakładzie." },
  },
}

const en: LocalizedFacts = {
  warranty: yearsLabel(WARRANTY_YEARS, "en"),
  lead: { ...leadTimes("en"), seasonNote: "In season (April–June, August–October) the queue can be up to 2 weeks longer." },
  payment: {
    steps: [
      { share: shares[0], when: "when the sketch is signed off", what: "materials and start of work" },
      { share: shares[1], when: "when the stone is ready and you have accepted it", what: "in person at the workshop or by video" },
      { share: shares[2], when: "after installation on site", what: "when everything stands and you are happy with it" },
    ],
    methods: "Cash, card or bank transfer (including for companies and charitable foundations).",
  },
  delivery: {
    freeRegions: "Rivne and Volyn regions",
    perKm: "3–5 ₴/km",
    eu: "Poland, Germany, Lithuania, Czechia",
    packaging: "Wooden crate, foam corners, each element packed separately. The cargo is insured.",
  },
  installation: {
    survey: "Before installation we dig a 60–80 cm test pit to see the soil.",
    clay: "For clay and sand — a reinforced concrete perimeter beam.",
    peat: "For peat or fill soil — rebar piles down to the firm layer.",
    crew: "A crew of 2–3, a level, sealed joints. Installing a single monument takes one day, a complex 1–3 days.",
  },
  servicePrices: [
    { name: "Portrait engraving (hand or laser)", price: (f) => `from ${f(2000)}`, note: "retouching of an old photo included" },
    { name: "Inscription (name, dates, epitaph)", price: (f) => `from ${f(18)} per character`, note: "gilding — from 80 ₴ per character" },
    { name: "Photo ceramic 24×30 cm", price: (f) => `from ${f(1300)}`, note: "colour, framed or unframed" },
    { name: "Engraving of symbols, ornament, cross", price: (f) => `from ${f(800)}`, note: "depends on the area of the design" },
    { name: "Granite vase or lamp", price: (f) => `from ${f(1500)}`, note: "in the colour of the monument" },
    { name: "Granite fence (plinth), per linear metre", price: (f) => `from ${f(2500)}`, note: "including installation" },
    { name: "Plot cladding with tiles, per m²", price: (f) => `from ${f(2300)}`, note: "granite, polished or flamed" },
    { name: "Restoration: cleaning, renewing the inscription", price: (f) => `from ${f(1200)}`, note: "travel in the Rivne and Volyn regions is free" },
  ],
  cities: {
    kostopil: { name: "Kostopil", inCity: "in Kostopil", region: "Rivne region", travel: "workshop in town", note: "This is where our workshop and display yard are: you can see the stone in person, feel the polish and look at engraving on real steles rather than in photos." },
    rivne: { name: "Rivne", inCity: "in Rivne", region: "Rivne region", travel: "40–50 minutes", note: "The workshop's most frequent route. We measure and install at every cemetery in Rivne and the district, including the New Cemetery (Yuvileine) and the Dubno road cemetery." },
    sarny: { name: "Sarny", inCity: "in Sarny", region: "Rivne region", travel: "about an hour", note: "Sarny, Klesiv, Rokytne, Dubrovytsia — we serve the north of the Rivne region the same as the regional centre: measurement, installation and warranty visits are free." },
    lutsk: { name: "Lutsk", inCity: "in Lutsk", region: "Volyn region", travel: "1.5–2 hours", note: "Volyn is inside our free-travel zone. We work at the cemeteries of Lutsk, Kivertsi, Rozhyshche and Kovel; remote villages of the region are also served without a surcharge." },
    zhytomyr: { name: "Zhytomyr", inCity: "in Zhytomyr", region: "Zhytomyr region", travel: "2–2.5 hours", note: "The Zhytomyr region is the home of most of the stone we work with: Leznyky granite, Holovyne gabbro and Didkovychi granite are quarried nearby. Delivery is charged by mileage." },
    kyiv: { name: "Kyiv", inCity: "in Kyiv", region: "Kyiv region", travel: "4–5 hours", note: "To Kyiv we bring finished, fully checked pieces: the crew installs in one or two days, so you don't have to supervise the process for weeks. No capital-city margin — the same stone sold in Kyiv, but straight from the workshop." },
    zdolbuniv: { name: "Zdolbuniv", inCity: "in Zdolbuniv", region: "Rivne region", travel: "about an hour", note: "Zdolbuniv, Mizoch, Ostrozhets — the road runs through Rivne, so we schedule measurement and installation together with our Rivne trips, which means a shorter wait for installation." },
    ostroh: { name: "Ostroh", inCity: "in Ostroh", region: "Rivne region", travel: "1.5 hours", note: "An old town with old cemeteries: here people more often ask for restoration of family graves and stone matched to monuments already standing, so we bring samples to the site." },
    dubno: { name: "Dubno", inCity: "in Dubno", region: "Rivne region", travel: "1.5–2 hours", note: "Dubno, Radyvyliv, Demydivka — the south of the region, where we go at least once every two weeks. Travel and installation without surcharge, as everywhere in the Rivne region." },
    varash: { name: "Varash", inCity: "in Varash", region: "Rivne region", travel: "1–1.5 hours", note: "Varash, Volodymyrets, Rafalivka — the north of the Rivne region with sandy soils, where the foundation matters more than the stone: we pour a concrete perimeter beam and reinforce under every element." },
    kovel: { name: "Kovel", inCity: "in Kovel", region: "Volyn region", travel: "2.5 hours", note: "Kovel is in the free-travel zone, like all of Volyn. We plan installation as one trip for several orders in the town and district, so it's best to agree the installation date in advance." },
    novovolynsk: { name: "Novovolynsk", inCity: "in Novovolynsk", region: "Volyn region", travel: "3–3.5 hours", note: "The farthest town in the free-travel zone. The sketch and portrait are approved remotely; we come twice: to measure, and to install the piece already checked at the workshop." },
  },
}

const de: LocalizedFacts = {
  warranty: yearsLabel(WARRANTY_YEARS, "de"),
  lead: { ...leadTimes("de"), seasonNote: "In der Saison (April–Juni, August–Oktober) kann die Wartezeit bis zu 2 Wochen länger sein." },
  payment: {
    steps: [
      { share: shares[0], when: "bei Freigabe der Skizze", what: "Material und Arbeitsbeginn" },
      { share: shares[1], when: "wenn der Stein fertig ist und Sie ihn abgenommen haben", what: "persönlich in der Werkstatt oder per Video" },
      { share: shares[2], when: "nach der Montage vor Ort", what: "wenn alles steht und Sie zufrieden sind" },
    ],
    methods: "Bar, Karte oder Überweisung (auch für Unternehmen und gemeinnützige Stiftungen).",
  },
  delivery: {
    freeRegions: "Regionen Riwne und Wolhynien",
    perKm: "3–5 ₴/km",
    eu: "Polen, Deutschland, Litauen, Tschechien",
    packaging: "Holzverschlag, Ecken in Schaumstoff, jedes Element einzeln. Die Fracht ist versichert.",
  },
  installation: {
    survey: "Vor der Montage legen wir eine 60–80 cm tiefe Probegrube an, um den Boden zu sehen.",
    clay: "Bei Lehm und Sand — ein bewehrter Betonring am Umfang.",
    peat: "Bei Torf oder Auffüllboden — Bewehrungspfähle bis zur festen Schicht.",
    crew: "Ein Team aus 2–3 Personen, Nivelliergerät, versiegelte Fugen. Montage eines Einzelgrabmals — ein Tag, einer Grabanlage — 1–3 Tage.",
  },
  servicePrices: [
    { name: "Porträtgravur (Hand oder Laser)", price: (f) => `ab ${f(2000)}`, note: "Retusche eines alten Fotos inklusive" },
    { name: "Inschrift (Name, Daten, Epitaph)", price: (f) => `ab ${f(18)} pro Zeichen`, note: "Vergoldung — ab 80 ₴ pro Zeichen" },
    { name: "Fotokeramik 24×30 cm", price: (f) => `ab ${f(1300)}`, note: "farbig, mit oder ohne Rahmen" },
    { name: "Gravur von Symbolen, Ornament, Kreuz", price: (f) => `ab ${f(800)}`, note: "abhängig von der Fläche des Motivs" },
    { name: "Vase oder Grablaterne aus Granit", price: (f) => `ab ${f(1500)}`, note: "in der Farbe des Grabmals" },
    { name: "Granit-Einfassung (Sockel), lfm", price: (f) => `ab ${f(2500)}`, note: "inklusive Montage" },
    { name: "Grabstellen-Verkleidung mit Platten, m²", price: (f) => `ab ${f(2300)}`, note: "Granit, poliert oder geflammt" },
    { name: "Restaurierung: Reinigung, Erneuerung der Inschrift", price: (f) => `ab ${f(1200)}`, note: "Anfahrt in den Regionen Riwne und Wolhynien kostenlos" },
  ],
  cities: {
    kostopil: { name: "Kostopil", inCity: "in Kostopil", region: "Region Riwne", travel: "Werkstatt in der Stadt", note: "Hier stehen unsere Werkstatt und der Ausstellungsplatz: Sie können den Stein persönlich sehen, die Politur anfassen und Gravuren auf echten Stelen statt auf Fotos betrachten." },
    rivne: { name: "Riwne", inCity: "in Riwne", region: "Region Riwne", travel: "40–50 Minuten", note: "Die häufigste Route der Werkstatt. Wir messen und montieren auf allen Friedhöfen von Riwne und Umgebung, darunter der Neue Friedhof (Juwilejne) und der Friedhof an der Dubno-Straße." },
    sarny: { name: "Sarny", inCity: "in Sarny", region: "Region Riwne", travel: "etwa eine Stunde", note: "Sarny, Klessiw, Rokytne, Dubrowyzja — den Norden der Region Riwne bedienen wir wie die Regionshauptstadt: Aufmaß, Montage und Garantiefahrt sind kostenlos." },
    lutsk: { name: "Luzk", inCity: "in Luzk", region: "Region Wolhynien", travel: "1,5–2 Stunden", note: "Wolhynien liegt in der kostenlosen Anfahrtszone. Wir arbeiten auf den Friedhöfen von Luzk, Kiwerzi, Roschyschtsche und Kowel; auch entlegene Dörfer der Region fahren wir ohne Zuschlag an." },
    zhytomyr: { name: "Schytomyr", inCity: "in Schytomyr", region: "Region Schytomyr", travel: "2–2,5 Stunden", note: "Die Region Schytomyr ist die Heimat des meisten Steins, mit dem wir arbeiten: Leznyky-Granit, Holowyne-Gabbro und Didkowytschi-Granit werden gleich nebenan abgebaut. Die Lieferung wird nach Kilometern berechnet." },
    kyiv: { name: "Kyjiw", inCity: "in Kyjiw", region: "Region Kyjiw", travel: "4–5 Stunden", note: "Nach Kyjiw bringen wir fertige, vollständig geprüfte Stücke: Das Team montiert in ein bis zwei Tagen, sodass Sie den Prozess nicht wochenlang begleiten müssen. Preis ohne Hauptstadtaufschlag — derselbe Stein wie in Kyjiw, aber direkt aus der Werkstatt." },
    zdolbuniv: { name: "Sdolbuniw", inCity: "in Sdolbuniw", region: "Region Riwne", travel: "etwa eine Stunde", note: "Sdolbuniw, Misotsch, Ostroschez — der Weg führt über Riwne, daher planen wir Aufmaß und Montage zusammen mit den Fahrten nach Riwne, was eine kürzere Wartezeit bis zur Aufstellung bedeutet." },
    ostroh: { name: "Ostroh", inCity: "in Ostroh", region: "Region Riwne", travel: "1,5 Stunden", note: "Eine alte Stadt mit alten Friedhöfen: Hier wird häufiger die Restaurierung von Familiengräbern und ein Stein im Ton der bereits stehenden Grabmale gewünscht, deshalb bringen wir Muster vor Ort." },
    dubno: { name: "Dubno", inCity: "in Dubno", region: "Region Riwne", travel: "1,5–2 Stunden", note: "Dubno, Radywyliw, Demydiwka — der Süden der Region, den wir mindestens alle zwei Wochen anfahren. Anfahrt und Montage ohne Zuschlag, wie in der gesamten Region Riwne." },
    varash: { name: "Warasch", inCity: "in Warasch", region: "Region Riwne", travel: "1–1,5 Stunden", note: "Warasch, Wolodymyrez, Rafaliwka — der Norden der Region Riwne mit sandigen Böden, wo das Fundament wichtiger ist als der Stein: Wir gießen einen Betonring am Umfang und bewehren unter jedem Element." },
    kovel: { name: "Kowel", inCity: "in Kowel", region: "Region Wolhynien", travel: "2,5 Stunden", note: "Kowel liegt in der kostenlosen Anfahrtszone, wie ganz Wolhynien. Die Montage planen wir als eine Fahrt für mehrere Aufträge in Stadt und Kreis, daher sollte der Termin frühzeitig abgestimmt werden." },
    novovolynsk: { name: "Nowowolynsk", inCity: "in Nowowolynsk", region: "Region Wolhynien", travel: "3–3,5 Stunden", note: "Die entfernteste Stadt in der kostenlosen Anfahrtszone. Skizze und Porträt stimmen wir aus der Ferne ab und kommen zweimal: zum Aufmaß und zur Montage des bereits in der Werkstatt geprüften Stücks." },
  },
}

const lt: LocalizedFacts = {
  warranty: yearsLabel(WARRANTY_YEARS, "lt"),
  lead: { ...leadTimes("lt"), seasonNote: "Sezono metu (balandis–birželis, rugpjūtis–spalis) eilė gali būti 2 savaitėmis ilgesnė." },
  payment: {
    steps: [
      { share: shares[0], when: "pasirašant eskizą", what: "medžiagos ir darbų pradžia" },
      { share: shares[1], when: "kai akmuo pagamintas ir jūs jį priėmėte", what: "asmeniškai ceche arba vaizdo įrašu" },
      { share: shares[2], when: "po montavimo vietoje", what: "kai viskas stovi ir jums viskas tinka" },
    ],
    methods: "Grynieji, kortelė, banko pavedimas (taip pat įmonėms ir labdaros fondams).",
  },
  delivery: {
    freeRegions: "Rivnės ir Voluinės sritys",
    perKm: "3–5 ₴/km",
    eu: "Lenkija, Vokietija, Lietuva, Čekija",
    packaging: "Medinė dėžė, kampai putplastyje, kiekvienas elementas atskirai. Krovinys apdraustas.",
  },
  installation: {
    survey: "Prieš montavimą kasame 60–80 cm bandomąją duobę, kad pamatytume gruntą.",
    clay: "Moliui ir smėliui — armuota betono juosta perimetru.",
    peat: "Durpėms ar supiltam gruntui — armatūros poliai iki tvirto sluoksnio.",
    crew: "2–3 žmonių brigada, nivelyras, siūlių sandarinimas. Vienviečio paminklo montavimas — viena diena, komplekso — 1–3 dienos.",
  },
  servicePrices: [
    { name: "Portreto graviravimas (rankinis arba lazerinis)", price: (f) => `nuo ${f(2000)}`, note: "senos nuotraukos retušas įskaičiuotas" },
    { name: "Užrašas (vardas, datos, epitafija)", price: (f) => `nuo ${f(18)} už simbolį`, note: "paauksavimas — nuo 80 ₴ už simbolį" },
    { name: "Fotokeramika 24×30 cm", price: (f) => `nuo ${f(1300)}`, note: "spalvota, su rėmeliu arba be" },
    { name: "Simbolikos, ornamento, kryžiaus graviravimas", price: (f) => `nuo ${f(800)}`, note: "priklauso nuo piešinio ploto" },
    { name: "Granito vaza, žvakidė", price: (f) => `nuo ${f(1500)}`, note: "paminklo spalvos" },
    { name: "Granito tvorelė (cokolis), m", price: (f) => `nuo ${f(2500)}`, note: "su montavimu" },
    { name: "Kapavietės apdaila plytelėmis, m²", price: (f) => `nuo ${f(2300)}`, note: "granitas, poliruotas arba degintas" },
    { name: "Restauravimas: valymas, užrašo atnaujinimas", price: (f) => `nuo ${f(1200)}`, note: "atvykimas Rivnės ir Voluinės srityse nemokamas" },
  ],
  cities: {
    kostopil: { name: "Kostopilis", inCity: "Kostopilyje", region: "Rivnės sritis", travel: "cechas mieste", note: "Čia mūsų cechas ir parodų aikštelė: galite pamatyti akmenį gyvai, paliesti poliravimą, apžiūrėti graviūras ant tikrų stelų, o ne nuotraukose." },
    rivne: { name: "Rivnė", inCity: "Rivnėje", region: "Rivnės sritis", travel: "40–50 minučių", note: "Dažniausias dirbtuvių maršrutas. Vykstame matuoti ir montuoti į visas Rivnės ir rajono kapines, įskaitant Naująsias kapines (Juvileinė) ir Dubno kapines." },
    sarny: { name: "Sarnai", inCity: "Sarnuose", region: "Rivnės sritis", travel: "apie valandą", note: "Sarnai, Klesivas, Rokytnė, Dubrovycia — Rivnės srities šiaurę aptarnaujame kaip ir srities centrą: matavimas, montavimas ir garantinis atvykimas nemokami." },
    lutsk: { name: "Luckas", inCity: "Lucke", region: "Voluinės sritis", travel: "1,5–2 valandos", note: "Voluinė patenka į nemokamo atvykimo zoną. Dirbame Lucko, Kivercių, Rožyščės ir Kovelio kapinėse; į tolimus srities kaimus taip pat atvykstame be priemokos." },
    zhytomyr: { name: "Žytomyras", inCity: "Žytomyre", region: "Žytomyro sritis", travel: "2–2,5 valandos", note: "Žytomyro sritis — daugumos mūsų akmens tėvynė: Leznykų granitas, Holovynės gabras ir Didkovyčių granitas kasami čia pat. Pristatymas skaičiuojamas pagal kilometražą." },
    kyiv: { name: "Kyjivas", inCity: "Kyjive", region: "Kyjivo sritis", travel: "4–5 valandos", note: "Į Kyjivą vežame gatavus ir visiškai patikrintus gaminius: brigada sumontuoja per vieną–dvi dienas, todėl klientui nereikia savaitėmis kontroliuoti proceso. Kaina be sostinės antkainio — tas pats akmuo, kuris parduodamas Kyjive, bet tiesiai iš cecho." },
    zdolbuniv: { name: "Zdolbunivas", inCity: "Zdolbunive", region: "Rivnės sritis", travel: "apie valandą", note: "Zdolbunivas, Mizočas, Ostrožecas — kelias eina per Rivnę, todėl matavimą ir montavimą planuojame kartu su kelionėmis į Rivnę, o tai trumpesnė eilė montavimui." },
    ostroh: { name: "Ostrohas", inCity: "Ostrohe", region: "Rivnės sritis", travel: "1,5 valandos", note: "Senas miestas su senomis kapinėmis: čia dažniau prašo restauruoti šeimos kapus ir parinkti akmenį pagal jau stovinčių paminklų toną, todėl pavyzdžius atsivežame į vietą." },
    dubno: { name: "Dubnas", inCity: "Dubne", region: "Rivnės sritis", travel: "1,5–2 valandos", note: "Dubnas, Radyvylivas, Demydivka — srities pietūs, kur važiuojame ne rečiau kaip kartą per dvi savaites. Atvykimas ir montavimas be priemokos, kaip visoje Rivnės srityje." },
    varash: { name: "Varašas", inCity: "Varaše", region: "Rivnės sritis", travel: "1–1,5 valandos", note: "Varašas, Volodymyrecas, Rafalivka — Rivnės srities šiaurė su smėlingais gruntais, kur pamatas svarbiau nei akmuo: darome betono juostą perimetru ir armuojame po kiekvienu elementu." },
    kovel: { name: "Kovelis", inCity: "Kovelyje", region: "Voluinės sritis", travel: "2,5 valandos", note: "Kovelis — nemokamo atvykimo zonoje, kaip ir visa Voluinė. Montavimą planuojame vienu atvykimu keliems užsakymams mieste ir rajone, todėl montavimo datą geriau suderinti iš anksto." },
    novovolynsk: { name: "Novovolynskas", inCity: "Novovolynske", region: "Voluinės sritis", travel: "3–3,5 valandos", note: "Tolimiausias miestas nemokamo atvykimo zonoje. Eskizą ir portretą suderiname nuotoliniu būdu, atvykstame du kartus: išmatuoti ir sumontuoti jau ceche patikrintą gaminį." },
  },
}

export const FACTS: Record<Locale, LocalizedFacts> = { uk, pl, en, de, lt }
