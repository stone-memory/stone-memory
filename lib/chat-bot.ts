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
        a: "Ціна залежить від каменю (граніт, габро, мармур), розміру і обробки. Базовий одиночний пам'ятник — від 1800 €, меморіальний комплекс — від 3500 €. Точний розрахунок надамо після того, як ви поділитесь параметрами або фото.",
      },
      {
        q: "термін|як довго|коли готово|коли буде|скільки часу",
        a: "Меморіальний комплекс — 6–10 тижнів (ескіз, виготовлення, монтаж). Одиночний пам'ятник — 3–5 тижнів. Гравіювання портрета на готовому камені — 7–10 днів.",
      },
      {
        q: "монтаж|встановлення|доставка|привезення",
        a: "Доставка і монтаж — по всій Україні та ЄС. Пакуємо в дерев'яні ящики, страхуємо. На місці: фундамент, нівелір, герметизація швів. Зазвичай за 1 день.",
      },
      {
        q: "гарантія|warranty",
        a: "5 років гарантії на все — фундамент, монтаж і сам камінь. Видаємо юридичний сертифікат. У разі невідповідності товару заявленим характеристикам, дефекти усуваємо безкоштовно.",
      },
      {
        q: "матеріал|граніт|мармур|який камінь|порода|карер|кар'єр",
        a: "Працюємо з українським гранітом і габро — Головинське габро, Лезниківський, Покостівський, Прилузький мармур. А також з імпортом: індійський і китайський граніт. Підберемо під проєкт.",
      },
      {
        q: "фото|портрет|епітаф|гравіюв",
        a: "Гравіюємо портрети, епітафії та орнаменти — ручним різцем і лазером. Навіть зі старих/маленьких фото — відновлюємо ретушшю. Працюємо 5+ мовами, є позолота і сріблення літер.",
      },
      {
        q: "замір|приїхати|приїдете|виїхати|виїзд",
        a: "Безкоштовний виїзд на замір по Рівненській і сусідніх областях. В інших регіонах узгоджуємо індивідуально. Напишіть адресу і коли зручно — запропонуємо час.",
      },
      {
        q: "дистанц|онлайн|з іншої країни|за кордон",
        a: "Так, працюємо дистанційно. Після відеоконсультації надсилаємо ескіз з розмірами і матеріалами, узгоджуємо онлайн, договір — електронно. Монтаж — Україна і ЄС.",
      },
      {
        q: "оплата|розрахунок|передоплата",
        a: "Передоплата 30% після затвердження ескізу, решта — після виготовлення перед монтажем. Готівка, безготівковий розрахунок, картка.",
      },
      {
        q: "догляд|чистка|миття",
        a: "Поліроване каміння — двічі на рік м'якою тканиною з теплою водою без абразивів. Надаємо гайд по догляду і пропонуємо щорічне обслуговування (знижка 20%).",
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
      { q: "cena|koszt|wycena|budżet", a: "Cena zależy od kamienia (granit, gabro, marmur), rozmiaru i obróbki. Pomnik pojedynczy — od 1800 €, kompleks memorialny — od 3500 €. Dokładną wycenę podamy po parametrach lub zdjęciach." },
      { q: "termin|ile czasu|kiedy gotowe|kiedy będzie", a: "Kompleks memorialny — 6–10 tygodni (projekt, produkcja, montaż). Pomnik pojedynczy — 3–5 tygodni. Grawerowanie portretu na gotowym kamieniu — 7–10 dni." },
      { q: "montaż|instalacja|dostawa", a: "Dostawa i montaż w całej Ukrainie i UE. Pakowanie w skrzynie, ubezpieczenie. Fundament, poziomowanie, uszczelnienie — zwykle 1 dzień." },
      { q: "gwarancja|warranty", a: "5 lat gwarancji na wszystko — fundament, montaż i kamień. Prawny certyfikat. Usterki usuwamy bezpłatnie." },
      { q: "materiał|granit|marmur|kamień", a: "Pracujemy z ukraińskim granitem i gabro (Gołowyńskie gabro, Łeznykowski, Pokostiwski) oraz z importem — granit indyjski i chiński. Dobierzemy pod projekt." },
      { q: "grawer|portret|epitafium", a: "Grawerujemy portrety, epitafia i ornamenty — ręcznie i laserem. Odnawiamy ze starych zdjęć. 5+ języków, złocenie liter." },
      { q: "pomiar|przyjedziecie|wyjazd", a: "Darmowy pomiar w woj. rówieńskim i sąsiednich. W innych regionach — indywidualnie. Napisz adres i dogodny termin." },
      { q: "zdalnie|online|za granicą", a: "Pracujemy zdalnie. Po konsultacji wideo wysyłamy szkic z wymiarami i materiałami, umowa elektronicznie. Montaż — Ukraina i UE." },
      { q: "płatność|przedpłata", a: "30% po akceptacji szkicu, reszta — po wykonaniu przed montażem. Gotówka, przelew, karta." },
      { q: "pielęgnacja|czyszczenie", a: "Polerowany kamień — 2× rocznie miękką szmatką z ciepłą wodą bez ściernych środków. Poradnik i serwis roczny (20% rabatu)." },
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
      { q: "price|cost|quote|budget", a: "Price depends on stone (granite, gabbro, marble), size and finish. Single monument — from €1800, memorial complex — from €3500. We'll give an exact quote once you share specs or photos." },
      { q: "lead time|how long|when|timeline", a: "Memorial complex — 6–10 weeks (design, production, installation). Single monument — 3–5 weeks. Portrait engraving on an existing stone — 7–10 days." },
      { q: "install|delivery|shipping", a: "Delivery and installation across Ukraine and the EU. Crated, insured. Foundation, levelling, sealed joints — usually one day." },
      { q: "warranty", a: "5-year warranty on everything — foundation, installation and the stone. Legal certificate included. Defects fixed free of charge." },
      { q: "material|granite|marble|stone", a: "Ukrainian granite and gabbro (Holovyne gabbro, Leznyky, Pokostivka) plus imports — Indian and Chinese granite. We'll pick the right one for your project." },
      { q: "engrav|portrait|epitaph", a: "Portraits, epitaphs and ornaments — hand and laser. We restore from old/small photos with retouch. 5+ languages, gilding available." },
      { q: "measure|visit", a: "Free on-site measurement in Rivne region and neighbouring areas. Elsewhere — by arrangement. Share address and a convenient time." },
      { q: "remote|online|abroad", a: "Yes, we work remotely. Video consultation, sketch with specs, e-sign. Installation across Ukraine and the EU." },
      { q: "payment|deposit", a: "30% deposit after sketch approval, balance after production before installation. Cash, bank transfer, card." },
      { q: "care|clean|maintenance", a: "Polished stone — twice a year, soft cloth, warm water, no abrasives. Care guide and annual service (20% off)." },
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
      { q: "preis|kosten|angebot|budget", a: "Preis hängt vom Stein (Granit, Gabbro, Marmor), Größe und Oberfläche ab. Einzel-Grabmal — ab 1800 €, Gedenkkomplex — ab 3500 €. Genaues Angebot nach Parametern oder Fotos." },
      { q: "dauer|zeit|wann fertig", a: "Gedenkkomplex — 6–10 Wochen (Entwurf, Fertigung, Montage). Einzel-Grabmal — 3–5 Wochen. Porträtgravur auf vorhandenem Stein — 7–10 Tage." },
      { q: "montage|lieferung", a: "Lieferung und Montage in der Ukraine und EU. Holzkisten, versichert. Fundament, Nivellierung, Fugen — meist ein Tag." },
      { q: "garantie", a: "5 Jahre Garantie auf alles — Fundament, Montage, Stein. Rechtliches Zertifikat. Mängel werden kostenlos behoben." },
      { q: "material|granit|marmor|stein", a: "Ukrainischer Granit und Gabbro (Holowyne-Gabbro, Lesnyky, Pokostiwka) sowie Importe — indischer und chinesischer Granit." },
      { q: "gravur|porträt|epitaph", a: "Porträts, Epitaphe, Ornamente — Hand und Laser. Restauration aus alten Fotos. 5+ Sprachen, Vergoldung möglich." },
      { q: "aufmaß|vor ort|besuch", a: "Kostenloses Aufmaß in Oblast Riwne und Umgebung. Sonst — individuell. Adresse und Termin gerne senden." },
      { q: "remote|online", a: "Ja, Remote-Arbeit möglich. Videoberatung, Entwurf mit Maßen, E-Signatur. Montage in Ukraine und EU." },
      { q: "zahlung|anzahlung", a: "30% Anzahlung nach Entwurf, Rest vor Montage. Bar, Überweisung, Karte." },
      { q: "pflege|reinigung", a: "Polierten Stein 2× jährlich mit weichem Tuch und warmem Wasser reinigen, keine Scheuermittel." },
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
      { q: "kaina|kiek kainuoja|biudž", a: "Kaina priklauso nuo akmens (granitas, gabbras, marmuras), dydžio ir apdailos. Vienvietis paminklas — nuo 1800 €, memorialinis kompleksas — nuo 3500 €. Tikslią kainą pateiksime po parametrų." },
      { q: "terminas|kiek laiko|kada", a: "Memorialinis kompleksas — 6–10 savaičių (eskizas, gamyba, montavimas). Vienvietis paminklas — 3–5 savaitės. Portreto graviravimas ant esamo akmens — 7–10 d." },
      { q: "montav|pristatym", a: "Pristatymas ir montavimas Ukrainoje ir ES. Mediniai dėžės, apdrausta. Pamatas, lygis, sandarinimas — paprastai per dieną." },
      { q: "garantij", a: "5 metų garantija viskam — pamatui, montavimui ir akmeniui. Teisinis sertifikatas. Defektus pašaliname nemokamai." },
      { q: "medžiag|granitas|marmuras|akmuo", a: "Ukrainietiškas granitas ir gabbras (Holovynės gabbras, Leznykai, Pokostivka) plius importas — Indijos ir Kinijos granitas." },
      { q: "gravir|portret|epitaf", a: "Portretai, epitafijos ir ornamentai — rankomis ir lazeriu. Atkuriame iš senų nuotraukų. 5+ kalbomis, aukso užpilimas." },
      { q: "matav|atvyks", a: "Nemokamas matavimas Rivnės srityje ir aplinkui. Kitur — individualiai. Parašykite adresą ir laiką." },
      { q: "nuotolin|užsieny", a: "Dirbame nuotoliniu būdu. Vaizdo konsultacija, eskizas su matmenimis, sutartis elektroniškai. Montavimas — UA ir ES." },
      { q: "apmokėjim|avansas", a: "30% avansas po eskizo patvirtinimo, likutis prieš montavimą. Grynieji, pavedimas, kortelė." },
      { q: "priežiūra|valym", a: "Poliruotas akmuo — 2× per metus minkšta šluoste su šiltu vandeniu, be abrazyvų." },
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
