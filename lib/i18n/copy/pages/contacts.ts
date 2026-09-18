import type { Locale } from "@/lib/types"
import type { LocalizedFacts } from "@/lib/i18n/copy/facts"

export type ContactsCopy = {
  crumb: string
  title: string
  lead: string
  phone: string
  phoneNote: string
  mail: string
  mailNote: string
  address: string
  addressNote: string
  openMap: string
  hours: string
  hoursNote: string
  closedLabel: string
  mapTitle: string
  visitEyebrow: string
  visitTitle: string
  visit: { title: string; text: string }[]
  areaEyebrow: string
  areaTitle: string
  areaText: string
  allTerms: string
  socialEyebrow: string
  socialTitle: string
  cta: { title: string; text: string; button: string }
}

const uk = (f: LocalizedFacts): ContactsCopy => ({
  crumb: "Контакти",
  title: "Контакти",
  lead: "Цех і виставковий майданчик у Костополі. Пишіть у зручний месенджер — відповідаємо в робочий час протягом години, ескіз і ціну повертаємо того ж дня.",
  phone: "Телефон",
  phoneNote: "Дзвінки, SMS, Viber і Telegram — один номер.",
  mail: "Пошта",
  mailNote: "Для фото ділянки, ескізів і документів для фондів та підприємств.",
  address: "Адреса",
  addressNote: "45 км від Рівного трасою Р-05, 110 км від Луцька.",
  openMap: "Відкрити на мапі",
  hours: "Години роботи",
  hoursNote: "Монтаж на кладовищах — і в неділю, за домовленістю.",
  closedLabel: "за домовленістю",
  mapTitle: "Stone Memory на мапі — Костопіль, провулок Білий, 20",
  visitEyebrow: "Приїхати",
  visitTitle: "Як відбувається візит у цех",
  visit: [
    { title: "Подзвоніть або напишіть", text: "Скажіть, коли зручно приїхати, — підготуємо зразки каменю, які вас цікавлять, і майстер буде на місці." },
    { title: "Подивіться камінь наживо", text: "На майданчику стоять готові стели й зразки всіх родовищ: габро, лабрадорит, покостівський, лезниківський, капустинський, дідковицький, мармур." },
    { title: "Погодьте ескіз на місці", text: "Якщо маєте фото ділянки й побажання — за годину вийдете з ескізом і ціною. Замір і монтаж призначимо одразу." },
  ],
  areaEyebrow: "Замір і монтаж",
  areaTitle: "Куди виїжджаємо",
  areaText: `У Рівненській та Волинській областях замір, монтаж і гарантійний виїзд безкоштовні. В інші регіони України їдемо за фактичним пробігом, у Польщу, Німеччину, Литву й Чехію — з митним оформленням. На кожен виріб — ${f.warranty} гарантії незалежно від того, де він стоїть.`,
  allTerms: "Усі умови доставки",
  socialEyebrow: "Роботи щотижня",
  socialTitle: "Соцмережі",
  cta: { title: "Не хочете дзвонити — залиште заявку", text: "Оберіть модель у каталозі або просто опишіть, що потрібно. Передзвонимо в робочий час, без нав'язливих дзвінків потім.", button: "Залишити заявку" },
})

const pl = (f: LocalizedFacts): ContactsCopy => ({
  crumb: "Kontakt",
  title: "Kontakt",
  lead: "Zakład i plac wystawowy w Kostopolu. Napisz w dogodnym komunikatorze — w godzinach pracy odpowiadamy w ciągu godziny, szkic i cenę odsyłamy tego samego dnia.",
  phone: "Telefon",
  phoneNote: "Rozmowy, SMS, Viber i Telegram — jeden numer.",
  mail: "E-mail",
  mailNote: "Na zdjęcia miejsca, szkice i dokumenty dla fundacji i przedsiębiorstw.",
  address: "Adres",
  addressNote: "45 km od Równego trasą R-05, 110 km od Łucka.",
  openMap: "Otwórz na mapie",
  hours: "Godziny pracy",
  hoursNote: "Montaż na cmentarzach — także w niedzielę, po uzgodnieniu.",
  closedLabel: "po uzgodnieniu",
  mapTitle: "Stone Memory na mapie — Kostopol, zaułek Biały 20",
  visitEyebrow: "Przyjazd",
  visitTitle: "Jak wygląda wizyta w zakładzie",
  visit: [
    { title: "Zadzwoń lub napisz", text: "Powiedz, kiedy wygodnie Ci przyjechać — przygotujemy próbki kamienia, które Cię interesują, a mistrz będzie na miejscu." },
    { title: "Zobacz kamień na żywo", text: "Na placu stoją gotowe stele i próbki wszystkich złóż: gabro, labradoryt, pokostiwski, leznykiwski, kapustyński, didkowicki, marmur." },
    { title: "Uzgodnij szkic na miejscu", text: "Jeśli masz zdjęcie miejsca i życzenia — po godzinie wyjdziesz ze szkicem i ceną. Pomiar i montaż wyznaczymy od razu." },
  ],
  areaEyebrow: "Pomiar i montaż",
  areaTitle: "Gdzie dojeżdżamy",
  areaText: `W obwodach rówieńskim i wołyńskim pomiar, montaż i dojazd gwarancyjny są bezpłatne. Do innych regionów Ukrainy jeździmy według faktycznych kilometrów, do Polski, Niemiec, Litwy i Czech — z odprawą celną. Na każdy wyrób — ${f.warranty} gwarancji niezależnie od tego, gdzie stoi.`,
  allTerms: "Wszystkie warunki dostawy",
  socialEyebrow: "Realizacje co tydzień",
  socialTitle: "Media społecznościowe",
  cta: { title: "Nie chcesz dzwonić — zostaw zgłoszenie", text: "Wybierz model w katalogu albo po prostu opisz, czego potrzebujesz. Oddzwonimy w godzinach pracy, bez natrętnych telefonów potem.", button: "Zostaw zgłoszenie" },
})

const en = (f: LocalizedFacts): ContactsCopy => ({
  crumb: "Contacts",
  title: "Contacts",
  lead: "Workshop and display yard in Kostopil. Write to us on whichever messenger suits you: we reply within an hour during working hours and return a sketch and price the same day.",
  phone: "Phone",
  phoneNote: "Calls, SMS, Viber and Telegram — one number.",
  mail: "Email",
  mailNote: "For plot photos, sketches and documents for foundations and companies.",
  address: "Address",
  addressNote: "45 km from Rivne on the R-05 road, 110 km from Lutsk.",
  openMap: "Open on the map",
  hours: "Opening hours",
  hoursNote: "Installation at cemeteries also on Sundays, by arrangement.",
  closedLabel: "by arrangement",
  mapTitle: "Stone Memory on the map — Kostopil, Bilyi Lane 20",
  visitEyebrow: "Visiting",
  visitTitle: "What a visit to the workshop looks like",
  visit: [
    { title: "Call or write", text: "Tell us when it suits you to come; we'll prepare the stone samples you're interested in and the craftsman will be on site." },
    { title: "See the stone in person", text: "Finished steles and samples from every quarry stand in the yard: gabbro, labradorite, Pokostivka, Leznyky, Kapustyne, Didkovychi granite, marble." },
    { title: "Approve the sketch on the spot", text: "If you have a photo of the plot and your wishes, you'll leave within an hour with a sketch and a price. We'll schedule measurement and installation right away." },
  ],
  areaEyebrow: "Measurement and installation",
  areaTitle: "Where we travel",
  areaText: `In the Rivne and Volyn regions measurement, installation and warranty visits are free. To other regions of Ukraine we travel by actual mileage; to Poland, Germany, Lithuania and Czechia with customs clearance. Every piece carries a ${f.warranty} warranty regardless of where it stands.`,
  allTerms: "All delivery terms",
  socialEyebrow: "New work every week",
  socialTitle: "Social media",
  cta: { title: "Don't want to call? Leave a request", text: "Choose a model in the catalogue or simply describe what you need. We'll call back during working hours, with no pushy follow-up calls.", button: "Leave a request" },
})

const de = (f: LocalizedFacts): ContactsCopy => ({
  crumb: "Kontakt",
  title: "Kontakt",
  lead: "Werkstatt und Ausstellungsplatz in Kostopil. Schreiben Sie uns über den Messenger Ihrer Wahl — während der Arbeitszeit antworten wir innerhalb einer Stunde, Skizze und Preis erhalten Sie am selben Tag.",
  phone: "Telefon",
  phoneNote: "Anrufe, SMS, Viber und Telegram — eine Nummer.",
  mail: "E-Mail",
  mailNote: "Für Fotos der Grabstelle, Skizzen und Dokumente für Stiftungen und Unternehmen.",
  address: "Adresse",
  addressNote: "45 km von Riwne über die R-05, 110 km von Luzk.",
  openMap: "Auf der Karte öffnen",
  hours: "Öffnungszeiten",
  hoursNote: "Montage auf Friedhöfen auch sonntags, nach Vereinbarung.",
  closedLabel: "nach Vereinbarung",
  mapTitle: "Stone Memory auf der Karte — Kostopil, Bilyj-Gasse 20",
  visitEyebrow: "Anreise",
  visitTitle: "So läuft ein Besuch in der Werkstatt ab",
  visit: [
    { title: "Anrufen oder schreiben", text: "Sagen Sie, wann es Ihnen passt — wir legen die Steinmuster bereit, die Sie interessieren, und der Meister ist vor Ort." },
    { title: "Den Stein persönlich ansehen", text: "Auf dem Platz stehen fertige Stelen und Muster aller Vorkommen: Gabbro, Labradorit, Pokostivka, Leznyky, Kapustyne, Didkovychi-Granit, Marmor." },
    { title: "Die Skizze vor Ort abstimmen", text: "Wenn Sie ein Foto der Grabstelle und Ihre Wünsche mitbringen, gehen Sie nach einer Stunde mit Skizze und Preis. Aufmaß und Montage terminieren wir sofort." },
  ],
  areaEyebrow: "Aufmaß und Montage",
  areaTitle: "Wohin wir fahren",
  areaText: `In den Regionen Riwne und Wolhynien sind Aufmaß, Montage und Garantiefahrt kostenlos. In andere Regionen der Ukraine fahren wir nach tatsächlichen Kilometern, nach Polen, Deutschland, Litauen und Tschechien mit Zollabwicklung. Auf jedes Stück gibt es ${f.warranty} Garantie, egal wo es steht.`,
  allTerms: "Alle Lieferbedingungen",
  socialEyebrow: "Jede Woche neue Arbeiten",
  socialTitle: "Soziale Medien",
  cta: { title: "Sie möchten nicht anrufen? Hinterlassen Sie eine Anfrage", text: "Wählen Sie ein Modell im Katalog oder beschreiben Sie einfach, was Sie brauchen. Wir rufen während der Arbeitszeit zurück — ohne aufdringliche Anrufe danach.", button: "Anfrage hinterlassen" },
})

const lt = (f: LocalizedFacts): ContactsCopy => ({
  crumb: "Kontaktai",
  title: "Kontaktai",
  lead: "Cechas ir parodų aikštelė Kostopilyje. Rašykite patogia programėle — darbo laiku atsakome per valandą, eskizą ir kainą grąžiname tą pačią dieną.",
  phone: "Telefonas",
  phoneNote: "Skambučiai, SMS, Viber ir Telegram — vienas numeris.",
  mail: "El. paštas",
  mailNote: "Kapavietės nuotraukoms, eskizams ir dokumentams fondams bei įmonėms.",
  address: "Adresas",
  addressNote: "45 km nuo Rivnės keliu R-05, 110 km nuo Lucko.",
  openMap: "Atidaryti žemėlapyje",
  hours: "Darbo laikas",
  hoursNote: "Montavimas kapinėse — ir sekmadienį, susitarus.",
  closedLabel: "susitarus",
  mapTitle: "Stone Memory žemėlapyje — Kostopilis, Bilyj skersgatvis 20",
  visitEyebrow: "Atvykti",
  visitTitle: "Kaip vyksta vizitas į cechą",
  visit: [
    { title: "Paskambinkite arba parašykite", text: "Pasakykite, kada patogu atvykti — paruošime jus dominančius akmens pavyzdžius, ir meistras bus vietoje." },
    { title: "Pamatykite akmenį gyvai", text: "Aikštelėje stovi gatavos stelos ir visų karjerų pavyzdžiai: gabras, labradoritas, Pokostivkos, Leznykų, Kapustynės, Didkovyčių granitas, marmuras." },
    { title: "Suderinkite eskizą vietoje", text: "Jei turite kapavietės nuotrauką ir pageidavimus — po valandos išeisite su eskizu ir kaina. Matavimą ir montavimą paskirsime iš karto." },
  ],
  areaEyebrow: "Matavimas ir montavimas",
  areaTitle: "Kur atvykstame",
  areaText: `Rivnės ir Voluinės srityse matavimas, montavimas ir garantinis atvykimas nemokami. Į kitus Ukrainos regionus važiuojame pagal faktinį kilometražą, į Lenkiją, Vokietiją, Lietuvą ir Čekiją — su muitinės įforminimu. Kiekvienam gaminiui — ${f.warranty} garantija, nepriklausomai nuo to, kur jis stovi.`,
  allTerms: "Visos pristatymo sąlygos",
  socialEyebrow: "Darbai kas savaitę",
  socialTitle: "Socialiniai tinklai",
  cta: { title: "Nenorite skambinti — palikite užklausą", text: "Pasirinkite modelį kataloge arba tiesiog aprašykite, ko reikia. Perskambinsime darbo laiku, be įkyrių skambučių vėliau.", button: "Palikti užklausą" },
})

export const CONTACTS_COPY: Record<Locale, (f: LocalizedFacts) => ContactsCopy> = { uk, pl, en, de, lt }
