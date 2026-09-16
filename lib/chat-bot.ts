import type { Locale } from "@/lib/types"

export type BotReply = { text: string }

type BotCopy = {
  askName: string
  welcomeName: (name: string) => string
  askPhone: string
  phoneInvalid: string
  phoneSaved: string
  didntUnderstand: string
  managerNotified: string
  quickReplies: { q: string; a: string }[]
}

function cap(w: string): string {
  if (!w) return w
  return w.split("-").map((p) => p ? p.charAt(0).toLocaleUpperCase() + p.slice(1).toLocaleLowerCase() : p).join("-")
}

export function capitalizeName(value: string): string {
  return value
    .trim()
    .replace(/\s{2,}/g, " ")
    .split(" ")
    .map(cap)
    .join(" ")
}

export function looksLikeName(text: string): boolean {
  const t = text.trim()
  if (t.length < 2 || t.length > 60) return false
  // At least one letter, no digits mostly
  return /\p{L}/u.test(t) && !/\d{3,}/.test(t)
}

export function extractPhone(text: string): string | null {
  const digits = text.replace(/\D/g, "")
  if (digits.length >= 9 && digits.length <= 13) return digits
  return null
}

export function formatPhone(digits: string): string {
  if (digits.startsWith("380") && digits.length === 12) {
    return `+38 0${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`
  }
  if (digits.startsWith("48") && digits.length === 11) {
    return `+48 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
  }
  if (digits.startsWith("49") && digits.length >= 12) {
    return `+49 ${digits.slice(2, 5)} ${digits.slice(5, 9)} ${digits.slice(9)}`
  }
  if (digits.startsWith("370") && digits.length === 11) {
    return `+370 ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`
  }
  if (digits.startsWith("44") && digits.length === 12) {
    return `+44 ${digits.slice(2, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
  }
  return `+${digits}`
}

export const botCopy: Record<Locale, BotCopy> = {
  uk: {
    askName: "Доброго дня! Підкажіть, як до вас звертатися?",
    welcomeName: (n) => `Дуже приємно, ${n}! Щоб менеджер міг продовжити спілкування, залиште, будь ласка, ваш номер телефону — у відповідь можемо надіслати орієнтовну вартість і фото робіт.`,
    askPhone: "Напишіть номер у форматі +380… або просто цифри.",
    phoneInvalid: "Номер виглядає неповним. Напишіть ще раз — достатньо цифр, без пробілів.",
    phoneSaved: "Дякую! Менеджер зв'яжеться з вами найближчим часом.",
    didntUnderstand: "Не впевнений, що зрозумів. Менеджер скоро долучиться і відповість детально. Можете також уточнити нижче нижче — часті питання:",
    managerNotified: "Передав вашу думку менеджеру. Він напише за кілька хвилин.",
    quickReplies: [
      {
        q: "ціна|вартість|скільки коштує|бюджет",
        a: "Ціна «від» у каталозі — за базову комплектацію з фундаментом і монтажем: одинарний пам'ятник від 19 500 ₴, хрест від 25 000 ₴, дитячий від 27 500 ₴, подвійний від 30 000 ₴, європейський від 35 500 ₴, меморіальний комплекс від 113 500 ₴, військовий від 170 000 ₴. Точну суму назвемо після ескізу або фото ділянки.",
      },
      {
        q: "термін|як довго|коли готово|коли буде|скільки часу",
        a: "Одинарний пам'ятник, хрест, дитячий — 5–7 тижнів від затвердження ескізу до встановлення. Подвійний, меморіальний комплекс, військовий — 7–10 тижнів. Гравіювання портрета на готовому камені — 7–10 днів. У сезон (квітень–червень, серпень–жовтень) черга може бути на 2 тижні довшою.",
      },
      {
        q: "монтаж|встановлення|доставка|привезення",
        a: "Доставка й монтаж по всій Україні: Рівненська та Волинська області безкоштовно, далі 3–5 ₴/км. Возимо і в ЄС — Польща, Німеччина, Литва, Чехія. Пакуємо в дерев'яну обрешітку, вантаж застрахований. На місці робимо фундамент, виставляємо по нівеліру, герметизуємо шви: одинарний пам'ятник за один день, комплекс за 1–3 дні.",
      },
      {
        q: "гарантія|warranty",
        a: "5 років гарантії на камінь, фундамент і монтаж — прописано в договорі. Якщо за цей час з'явиться тріщина, просідання чи дефект полірування, усуваємо безкоштовно.",
      },
      {
        q: "матеріал|граніт|мармур|який камінь|порода|карер|кар'єр",
        a: "44 камені на вибір: український граніт (Покостівський, Лезниківський, Капустинський, Токівський та інші), габро (Головинське, Букинське), лабрадорит (Volga Blue, Irina Blue, Black Ice), базальт і мармур (Carrara, Nero Marquina, Emperador). На кожній картці товару можна перемкнути камінь і одразу побачити ціну.",
      },
      {
        q: "фото|портрет|епітаф|гравіюв",
        a: "Гравіюємо портрети, епітафії та орнаменти — вручну й лазером. Відновлюємо навіть зі старих або маленьких фото. Є позолота й сріблення літер, фотокераміка.",
      },
      {
        q: "замір|приїхати|приїдете|виїхати|виїзд",
        a: "Виїзд на замір безкоштовний у Рівненській та Волинській областях, в інших регіонах домовляємось окремо. Напишіть адресу кладовища й зручний час — запропонуємо дату.",
      },
      {
        q: "дистанц|онлайн|з іншої країни|за кордон",
        a: "Так, працюємо дистанційно. Після відеоконсультації надсилаємо ескіз із розмірами й каменем, договір підписуємо електронно, приймання готового каменю — особисто в цеху або відеооглядом. Монтаж — Україна та ЄС.",
      },
      {
        q: "оплата|розрахунок|передоплата",
        a: "Оплата трьома частинами: 30 % при підписанні ескізу, 50 % коли камінь готовий і ви його прийняли, 20 % після монтажу. Готівка, картка, безготівковий переказ — зокрема для юридичних осіб і благодійних фондів.",
      },
      {
        q: "догляд|чистка|миття",
        a: "Полірований камінь — двічі на рік м'якою тканиною з теплою водою, без абразивів і кислот. Після встановлення надаємо пам'ятку з догляду.",
      },
    ],
  },
  pl: {
    askName: "Dzień dobry! Jak się do Pani/Pana zwracać?",
    welcomeName: (n) => `Miło, ${n}! Aby menedżer mógł kontynuować rozmowę, zostaw proszę numer telefonu — odeślemy orientacyjną wycenę i zdjęcia.`,
    askPhone: "Wpisz numer w formacie +48… lub same cyfry.",
    phoneInvalid: "Numer wygląda na niepełny. Wpisz ponownie — same cyfry, bez spacji.",
    phoneSaved: "Dziękuję! Menedżer odezwie się wkrótce.",
    didntUnderstand: "Nie jestem pewien, czy zrozumiałem. Menedżer wkrótce dołączy. Poniżej typowe pytania:",
    managerNotified: "Przekazałem Twoją wiadomość menedżerowi. Odezwie się za chwilę.",
    quickReplies: [
      { q: "cena|koszt|wycena|budżet", a: "Cena „od” w katalogu obejmuje komplet bazowy z fundamentem i montażem: pomnik pojedynczy od 19 500 ₴ (≈ 430 €), krzyż od 25 000 ₴ (≈ 550 €), dziecięcy od 27 500 ₴ (≈ 610 €), podwójny od 30 000 ₴ (≈ 670 €), europejski od 35 500 ₴ (≈ 790 €), kompleks memorialny od 113 500 ₴ (≈ 2 500 €), wojskowy od 170 000 ₴ (≈ 3 800 €). Dokładną kwotę podamy po szkicu lub zdjęciu miejsca." },
      { q: "termin|ile czasu|kiedy gotowe|kiedy będzie", a: "Pomnik pojedynczy, krzyż, dziecięcy — 5–7 tygodni od zatwierdzenia szkicu do montażu. Podwójny, kompleks memorialny, wojskowy — 7–10 tygodni. Grawer portretu na gotowym kamieniu — 7–10 dni. W sezonie (kwiecień–czerwiec, sierpień–październik) kolejka może być o 2 tygodnie dłuższa." },
      { q: "montaż|instalacja|dostawa", a: "Dostawa i montaż w całej Ukrainie: obwód rówieński i wołyński bezpłatnie, dalej 3–5 ₴/km. Jeździmy też do UE — Polska, Niemcy, Litwa, Czechy. Pakujemy w drewnianą skrzynię, ładunek ubezpieczony. Na miejscu fundament, poziomowanie, uszczelnienie: pomnik pojedynczy w jeden dzień, kompleks 1–3 dni." },
      { q: "gwarancja|warranty", a: "5 lat gwarancji na kamień, fundament i montaż — zapisane w umowie. Pęknięcie, osiadanie lub wada polerowania w tym czasie — usuwamy bezpłatnie." },
      { q: "materiał|granit|marmur|kamień", a: "44 kamienie do wyboru: granit ukraiński (Pokostiwski, Łeznykowski, Kapustyński, Tokiwski i inne), gabro (Gołowyńskie, Bukińskie), labradoryt (Volga Blue, Irina Blue, Black Ice), bazalt i marmur (Carrara, Nero Marquina, Emperador). Na każdej karcie produktu można przełączyć kamień i od razu zobaczyć cenę." },
      { q: "grawer|portret|epitafium", a: "Grawerujemy portrety, epitafia i ornamenty — ręcznie i laserem. Odtwarzamy nawet ze starych lub małych zdjęć. Złocenie i srebrzenie liter, fotoceramika." },
      { q: "pomiar|przyjedziecie|wyjazd", a: "Pomiar na miejscu bezpłatny w obwodzie rówieńskim i wołyńskim, w innych regionach do uzgodnienia. Napisz adres cmentarza i dogodny czas — zaproponujemy termin." },
      { q: "zdalnie|online|za granicą", a: "Tak, pracujemy zdalnie. Po konsultacji wideo wysyłamy szkic z wymiarami i kamieniem, umowę podpisujemy elektronicznie, odbiór gotowego kamienia — osobiście w zakładzie lub przez wideo. Montaż — Ukraina i UE." },
      { q: "płatność|przedpłata", a: "Płatność w trzech częściach: 30 % przy podpisaniu szkicu, 50 % gdy kamień jest gotowy i odebrany, 20 % po montażu. Gotówka, karta, przelew — także dla firm i fundacji." },
      { q: "pielęgnacja|czyszczenie", a: "Polerowany kamień — dwa razy w roku miękką szmatką z ciepłą wodą, bez środków ściernych i kwasów. Po montażu przekazujemy instrukcję pielęgnacji." },
    ],
  },
  en: {
    askName: "Hi! What name should we use?",
    welcomeName: (n) => `Nice to meet you, ${n}! To let a manager continue, please share your phone number — we can send a quick quote and work photos.`,
    askPhone: "Just type your phone in international format or digits.",
    phoneInvalid: "The number looks incomplete. Please try again — digits only, no spaces.",
    phoneSaved: "Thanks! A manager will get back to you shortly.",
    didntUnderstand: "Not sure I got that. A manager will join shortly. Common questions below:",
    managerNotified: "Passed your note to a manager. They'll reply in a few minutes.",
    quickReplies: [
      { q: "price|cost|quote|budget", a: "Catalogue “from” prices include the base set with foundation and installation: single monument from ₴19,500 (≈ €430), cross from ₴25,000 (≈ €550), children's from ₴27,500 (≈ €610), double from ₴30,000 (≈ €670), European style from ₴35,500 (≈ €790), memorial complex from ₴113,500 (≈ €2,500), military from ₴170,000 (≈ €3,800). Exact quote after a sketch or a photo of the plot." },
      { q: "lead time|how long|when|timeline", a: "Single monument, cross, children's — 5–7 weeks from sketch approval to installation. Double, memorial complex, military — 7–10 weeks. Portrait engraving on an existing stone — 7–10 days. In season (April–June, August–October) the queue can be 2 weeks longer." },
      { q: "install|delivery|shipping", a: "Delivery and installation across Ukraine: Rivne and Volyn regions free, beyond that ₴3–5 per km. We also deliver to the EU — Poland, Germany, Lithuania, Czechia. Crated in timber, cargo insured. On site: foundation, levelling, sealed joints — a single monument in one day, a complex in 1–3 days." },
      { q: "warranty", a: "5-year warranty on the stone, foundation and installation, written into the contract. Any crack, settling or polishing defect in that time is fixed free of charge." },
      { q: "material|granite|marble|stone", a: "44 stones to choose from: Ukrainian granite (Pokostivka, Leznyky, Kapustyne, Tokivske and more), gabbro (Holovyne, Bukynske), labradorite (Volga Blue, Irina Blue, Black Ice), basalt and marble (Carrara, Nero Marquina, Emperador). Every product page lets you switch the stone and see the price instantly." },
      { q: "engrav|portrait|epitaph", a: "Portraits, epitaphs and ornaments — by hand and laser. We restore even old or small photos. Gilded and silvered lettering, photo ceramics." },
      { q: "measure|visit", a: "On-site measurement is free in Rivne and Volyn regions; elsewhere by arrangement. Send the cemetery address and a convenient time — we'll propose a date." },
      { q: "remote|online|abroad", a: "Yes, we work remotely. After a video consultation we send a sketch with dimensions and stone, the contract is e-signed, and you accept the finished stone in person at the workshop or by video. Installation across Ukraine and the EU." },
      { q: "payment|deposit", a: "Payment in three parts: 30% on signing the sketch, 50% when the stone is ready and accepted, 20% after installation. Cash, card, bank transfer — including for companies and charities." },
      { q: "care|clean|maintenance", a: "Polished stone — twice a year with a soft cloth and warm water, no abrasives or acids. We hand over a care guide after installation." },
    ],
  },
  de: {
    askName: "Guten Tag! Wie dürfen wir Sie anreden?",
    welcomeName: (n) => `Freut uns, ${n}! Damit unser Manager weitermachen kann, hinterlassen Sie bitte Ihre Telefonnummer — wir können ein schnelles Angebot und Fotos senden.`,
    askPhone: "Nummer bitte international oder nur Ziffern.",
    phoneInvalid: "Die Nummer wirkt unvollständig. Bitte erneut — nur Ziffern.",
    phoneSaved: "Danke! Ein Manager meldet sich in Kürze.",
    didntUnderstand: "Nicht ganz sicher. Ein Manager meldet sich gleich. Häufige Fragen:",
    managerNotified: "An den Manager weitergeleitet. Antwort in wenigen Minuten.",
    quickReplies: [
      { q: "preis|kosten|angebot|budget", a: "Katalogpreise „ab“ gelten für die Grundausstattung mit Fundament und Montage: Einzelgrabmal ab 19 500 ₴ (≈ 430 €), Kreuz ab 25 000 ₴ (≈ 550 €), Kindergrabmal ab 27 500 ₴ (≈ 610 €), Doppelgrabmal ab 30 000 ₴ (≈ 670 €), europäischer Stil ab 35 500 ₴ (≈ 790 €), Gedenkkomplex ab 113 500 ₴ (≈ 2 500 €), Soldatengrabmal ab 170 000 ₴ (≈ 3 800 €). Genaues Angebot nach Entwurf oder Foto der Grabstelle." },
      { q: "dauer|zeit|wann fertig", a: "Einzelgrabmal, Kreuz, Kindergrabmal — 5–7 Wochen von der Entwurfsfreigabe bis zur Montage. Doppelgrabmal, Gedenkkomplex, Soldatengrabmal — 7–10 Wochen. Porträtgravur auf vorhandenem Stein — 7–10 Tage. In der Saison (April–Juni, August–Oktober) kann die Wartezeit 2 Wochen länger sein." },
      { q: "montage|lieferung", a: "Lieferung und Montage in der ganzen Ukraine: Gebiete Riwne und Wolyn kostenlos, darüber hinaus 3–5 ₴/km. Auch in die EU — Polen, Deutschland, Litauen, Tschechien. Verpackung in Holzverschlag, Fracht versichert. Vor Ort Fundament, Nivellierung, Fugenabdichtung: Einzelgrabmal an einem Tag, Komplex in 1–3 Tagen." },
      { q: "garantie", a: "5 Jahre Garantie auf Stein, Fundament und Montage — im Vertrag festgehalten. Riss, Setzung oder Polierfehler in dieser Zeit beheben wir kostenlos." },
      { q: "material|granit|marmor|stein", a: "44 Steine zur Auswahl: ukrainischer Granit (Pokostiwka, Lesnyky, Kapustyne, Tokiwske u. a.), Gabbro (Holowyne, Bukynske), Labradorit (Volga Blue, Irina Blue, Black Ice), Basalt und Marmor (Carrara, Nero Marquina, Emperador). Auf jeder Produktseite lässt sich der Stein wechseln, der Preis wird sofort angezeigt." },
      { q: "gravur|porträt|epitaph", a: "Porträts, Epitaphe und Ornamente — von Hand und mit Laser. Wir restaurieren auch alte oder kleine Fotos. Vergoldete und versilberte Schrift, Fotokeramik." },
      { q: "aufmaß|vor ort|besuch", a: "Das Aufmaß vor Ort ist in den Gebieten Riwne und Wolyn kostenlos, sonst nach Absprache. Senden Sie Friedhofsadresse und Wunschzeit — wir schlagen einen Termin vor." },
      { q: "remote|online", a: "Ja, wir arbeiten auch aus der Ferne. Nach der Videoberatung senden wir den Entwurf mit Maßen und Stein, der Vertrag wird elektronisch unterschrieben, die Abnahme des fertigen Steins erfolgt persönlich in der Werkstatt oder per Video. Montage in der Ukraine und EU." },
      { q: "zahlung|anzahlung", a: "Zahlung in drei Teilen: 30 % bei Unterzeichnung des Entwurfs, 50 % wenn der Stein fertig und abgenommen ist, 20 % nach der Montage. Bar, Karte, Überweisung — auch für Firmen und Stiftungen." },
      { q: "pflege|reinigung", a: "Polierten Stein zweimal jährlich mit weichem Tuch und warmem Wasser reinigen, keine Scheuermittel oder Säuren. Nach der Montage erhalten Sie eine Pflegeanleitung." },
    ],
  },
  lt: {
    askName: "Laba diena! Kaip į jus kreiptis?",
    welcomeName: (n) => `Malonu, ${n}! Kad vadybininkas galėtų tęsti, parašykite, prašom, telefono numerį — atsiųsime orientacinę kainą ir darbų nuotraukas.`,
    askPhone: "Numeris tarptautiniu formatu arba tik skaitmenys.",
    phoneInvalid: "Numeris atrodo nepilnas. Bandykite dar kartą — tik skaitmenys.",
    phoneSaved: "Ačiū! Vadybininkas netrukus susisieks.",
    didntUnderstand: "Nesu tikras, ar supratau. Vadybininkas greitai prisijungs. Dažni klausimai:",
    managerNotified: "Perdaviau vadybininkui. Atsakys per kelias minutes.",
    quickReplies: [
      { q: "kaina|kiek kainuoja|biudž", a: "Katalogo kainos „nuo“ — bazinis komplektas su pamatu ir montavimu: vienvietis paminklas nuo 19 500 ₴ (≈ 430 €), kryžius nuo 25 000 ₴ (≈ 550 €), vaikiškas nuo 27 500 ₴ (≈ 610 €), dvivietis nuo 30 000 ₴ (≈ 670 €), europietiško stiliaus nuo 35 500 ₴ (≈ 790 €), memorialinis kompleksas nuo 113 500 ₴ (≈ 2 500 €), karinis nuo 170 000 ₴ (≈ 3 800 €). Tikslią sumą pasakysime po eskizo ar vietos nuotraukos." },
      { q: "terminas|kiek laiko|kada", a: "Vienvietis paminklas, kryžius, vaikiškas — 5–7 savaitės nuo eskizo patvirtinimo iki montavimo. Dvivietis, memorialinis kompleksas, karinis — 7–10 savaičių. Portreto graviravimas ant esamo akmens — 7–10 dienų. Sezono metu (balandis–birželis, rugpjūtis–spalis) eilė gali būti 2 savaitėmis ilgesnė." },
      { q: "montav|pristatym", a: "Pristatymas ir montavimas visoje Ukrainoje: Rivnės ir Volynės sritys nemokamai, toliau 3–5 ₴/km. Vežame ir į ES — Lenkiją, Vokietiją, Lietuvą, Čekiją. Pakuojame į medinį karkasą, krovinys apdraustas. Vietoje pamatas, lygiavimas, siūlių sandarinimas: vienvietis paminklas per dieną, kompleksas per 1–3 dienas." },
      { q: "garantij", a: "5 metų garantija akmeniui, pamatui ir montavimui — įrašyta sutartyje. Įtrūkimą, nusėdimą ar poliravimo defektą per šį laiką šaliname nemokamai." },
      { q: "medžiag|granitas|marmuras|akmuo", a: "44 akmenys pasirinkimui: ukrainietiškas granitas (Pokostivka, Leznyky, Kapustyne, Tokivske ir kt.), gabras (Holovyne, Bukynske), labradoritas (Volga Blue, Irina Blue, Black Ice), bazaltas ir marmuras (Carrara, Nero Marquina, Emperador). Kiekvienoje prekės kortelėje galima perjungti akmenį ir iš karto matyti kainą." },
      { q: "gravir|portret|epitaf", a: "Graviruojame portretus, epitafijas ir ornamentus — rankomis ir lazeriu. Atkuriame net iš senų ar mažų nuotraukų. Auksuotos ir sidabruotos raidės, fotokeramika." },
      { q: "matav|atvyks", a: "Matavimas vietoje nemokamas Rivnės ir Volynės srityse, kitur — pagal susitarimą. Parašykite kapinių adresą ir patogų laiką — pasiūlysime datą." },
      { q: "nuotolin|užsieny", a: "Taip, dirbame nuotoliniu būdu. Po vaizdo konsultacijos siunčiame eskizą su matmenimis ir akmeniu, sutartį pasirašome elektroniškai, gatavą akmenį priimate dirbtuvėje arba per vaizdo įrašą. Montavimas — Ukraina ir ES." },
      { q: "apmokėjim|avansas", a: "Mokėjimas trimis dalimis: 30 % pasirašant eskizą, 50 % kai akmuo pagamintas ir priimtas, 20 % po montavimo. Grynieji, kortelė, pavedimas — taip pat įmonėms ir fondams." },
      { q: "priežiūra|valym", a: "Poliruotą akmenį valykite du kartus per metus minkšta šluoste su šiltu vandeniu, be abrazyvų ir rūgščių. Po montavimo įteikiame priežiūros atmintinę." },
    ],
  },
}

// ================================================================
// FUZZY / SYNONYM MATCHER
// ================================================================
// Previous matcher was a pipe-separated regex of keywords baked into
// botCopy. A user typing "скилки кошту" (typo) or "почому" (synonym
// not in the list) hit the "didn't understand" fallback even though
// the intent was obviously the price question.
//
// New matcher:
//   1. Normalize input (lowercase + strip diacritics + strip punct).
//   2. Tokenize into words ≥ 2 chars.
//   3. For each candidate phrase (canonical question + triggers),
//      score = (matched tokens) / (phrase tokens).
//   4. Two tokens match if equal, substring-stem match (handles
//      "кошту" vs "коштує"), or within a Levenshtein threshold scaled
//      by length (1 edit for ≤5 chars, 2 for ≤8, 3 for longer).
//   5. Best score wins, with a minimum confidence floor of 0.5.
//
// Pure functions — no I/O. Reusable from server or client.

/** Normalize a string for fuzzy comparison. Lowercase + strip
 *  combining marks + strip apostrophes + strip non-letter chars. */
export function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")   // combining marks (decomposed diacritics)
    .replace(/['ʼʹ`]/g, "")  // straight + UA modifier + Cyrillic prime apostrophes
    .replace(/[^\p{L}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function tokensOf(s: string): string[] {
  return normalizeForMatch(s).split(" ").filter((t) => t.length >= 2)
}

/** Classic Levenshtein, O(m·n) time, O(min(m,n)) memory. */
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  let prev = new Array(n + 1)
  let curr = new Array(n + 1)
  for (let j = 0; j <= n; j++) prev[j] = j
  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1])
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[n]
}

function tokensSimilar(a: string, b: string): boolean {
  if (a === b) return true
  if (a.length <= 3 || b.length <= 3) return false
  // Stem match — captures inflected endings (UA, PL especially).
  if (a.includes(b) || b.includes(a)) return true
  const max = Math.max(a.length, b.length)
  const threshold = max <= 5 ? 1 : max <= 8 ? 2 : 3
  return levenshtein(a, b) <= threshold
}

function matchScore(inputTokens: string[], phrase: string): number {
  const phraseTokens = tokensOf(phrase)
  if (phraseTokens.length === 0 || inputTokens.length === 0) return 0
  let hits = 0
  for (const pt of phraseTokens) {
    if (inputTokens.some((it) => tokensSimilar(it, pt))) hits++
  }
  return hits / phraseTokens.length
}

/** User-defined or default FAQ item with synonyms. Decoupled from the
 *  chat-settings store shape so this module stays pure. */
export type FaqItem = {
  label: string
  answer: string
  triggers?: string[]
}

/** Best-effort intent match. Returns null when no candidate clears
 *  the 0.5 confidence floor. */
export function matchQuickReply(
  text: string,
  items: FaqItem[]
): { item: FaqItem; score: number } | null {
  const input = tokensOf(text)
  if (input.length === 0) return null

  let best: { item: FaqItem; score: number } | null = null
  for (const item of items) {
    const phrases = [item.label, ...(item.triggers ?? [])]
    for (const phrase of phrases) {
      const score = matchScore(input, phrase)
      if (score >= 0.5 && (!best || score > best.score)) {
        best = { item, score }
      }
    }
  }
  return best
}

/**
 * Legacy entry — kept so callers without a custom FAQ list (e.g. the
 * widget pre-hydration) still match against the baked-in botCopy
 * keywords. The new fuzzy matcher is invoked under the hood with the
 * legacy pipe-separated keywords folded into triggers.
 */
export function matchFaq(locale: Locale, text: string): BotReply | null {
  const pack = botCopy[locale]
  const items: FaqItem[] = pack.quickReplies.map((r) => ({
    label: "",
    answer: r.a,
    triggers: r.q.split("|").map((t) => t.trim()).filter(Boolean),
  }))
  const m = matchQuickReply(text, items)
  return m ? { text: m.item.answer } : null
}
