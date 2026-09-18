import type { Locale } from "@/lib/types"
import type { LocalizedFacts } from "@/lib/i18n/copy/facts"

export type WarrantyCopy = {
  crumb: string
  title: string
  lead: string
  facts: { value: string; label: string }[]
  coversEyebrow: string
  coversTitle: string
  tableHead: string[]
  tableRows: string[][]
  whyEyebrow: string
  whyTitle: string
  whyText: string
  notEyebrow: string
  notTitle: string
  notText: string
  howEyebrow: string
  howTitle: string
  how: { t: string; d: string }[]
  cta: { title: string; text: string; button: string }
}

const uk = (f: LocalizedFacts): WarrantyCopy => ({
  crumb: "Гарантія",
  title: `Гарантія ${f.warranty} — на все, а не лише на камінь`,
  lead: "Камінь, гравіювання, фундамент і монтаж. Якщо за цей час щось просіло, тріснуло або злізло — приїжджаємо й виправляємо безкоштовно. Без дрібного шрифту.",
  facts: [
    { value: f.warranty, label: "на камінь, гравіювання, фундамент, монтаж" },
    { value: "0 ₴", label: "виїзд і роботи за гарантією" },
    { value: "7 днів", label: "на реакцію після звернення" },
    { value: "за собівартістю", label: "негарантійні випадки" },
  ],
  coversEyebrow: "Що покриває",
  coversTitle: "Гарантійні випадки",
  tableHead: ["Що сталося", "Причина", "Що робимо"],
  tableRows: [
    ["Стела нахилилась, плита просіла", "усадка ґрунту, фундамент", "вирівнюємо або переробляємо фундамент безкоштовно"],
    ["Тріщина в камені або по шву", "прихований дефект блоку, монтаж", "замінюємо елемент за наш рахунок"],
    ["Розійшлись шви, відклеївся елемент", "герметик, клей", "переклеюємо й герметизуємо повторно"],
    ["Гравіювання нечитабельне, позолота злізла", "виконання", "оновлюємо безкоштовно"],
    ["Плитка облицювання піднялась", "основа, мороз", "перекладаємо на новій основі"],
  ],
  whyEyebrow: "Чому ми можемо це обіцяти",
  whyTitle: "Гарантія починається з шурфу",
  whyText: `${f.installation.survey} ${f.installation.clay} ${f.installation.peat} Це не «додаткова послуга», а причина, чому ми можемо дати гарантію на геометрію: ми знаємо, на чому стоїть кожен наш пам'ятник.\n\nКамінь беремо блоками з кар'єрів Житомирщини й Рівненщини і ріжемо самі — тому бачимо кожну плиту до полірування і відбраковуємо ті, де є прожилки чи тріщини. Гравіювання показуємо на пробному відбитку, а готовий виріб — до монтажу. Так помилки ловляться в цеху, а не на кладовищі.`,
  notEyebrow: "Не гарантія, але допомагаємо",
  notTitle: "Вандалізм, дерева, чужий монтаж",
  notText: "Зовнішні пошкодження — вандали, впале дерево, техніка сусіднього монтажу — гарантією не покриваються, бо не залежать від нас. Але ми не залишаємо родину з цим: виготовляємо й замінюємо елементи за собівартістю без націнки, виїзд по Рівненщині й Волині безкоштовний. Так само з пам'ятниками, які виготовили не ми: реставруємо, оновлюємо гравіювання, переставляємо на новий фундамент за прайсом.",
  howEyebrow: "Як звернутись",
  howTitle: "Три речі, які потрібні від вас",
  how: [
    { t: "Фото проблеми", d: "Загальний план і крупно те, що непокоїть. Із фото ми зазвичай одразу розуміємо причину." },
    { t: "Номер договору або прізвище", d: "Знайдемо замовлення, розміри й камінь — щоб приїхати з усім потрібним за один раз." },
    { t: "Зручний час", d: "Виїжджаємо протягом 7 днів по Рівненщині й Волині, в інші регіони — за узгодженням." },
  ],
  cta: { title: "Є питання щодо встановленого пам'ятника?", text: "Надішліть фото — скажемо, що з ним і що робити, незалежно від того, хто його виготовляв.", button: "Надіслати фото пам'ятника" },
})

const pl = (f: LocalizedFacts): WarrantyCopy => ({
  crumb: "Gwarancja",
  title: `Gwarancja ${f.warranty} — na wszystko, nie tylko na kamień`,
  lead: "Kamień, grawer, fundament i montaż. Jeśli w tym czasie coś osiadło, pękło lub odpadło — przyjeżdżamy i naprawiamy bezpłatnie. Bez drobnego druku.",
  facts: [
    { value: f.warranty, label: "na kamień, grawer, fundament, montaż" },
    { value: "0 ₴", label: "dojazd i prace gwarancyjne" },
    { value: "7 dni", label: "na reakcję po zgłoszeniu" },
    { value: "po kosztach", label: "przypadki niegwarancyjne" },
  ],
  coversEyebrow: "Co obejmuje",
  coversTitle: "Przypadki gwarancyjne",
  tableHead: ["Co się stało", "Przyczyna", "Co robimy"],
  tableRows: [
    ["Stela się przechyliła, płyta osiadła", "osiadanie gruntu, fundament", "prostujemy lub przerabiamy fundament bezpłatnie"],
    ["Pęknięcie kamienia lub na spoinie", "ukryta wada bloku, montaż", "wymieniamy element na nasz koszt"],
    ["Rozeszły się spoiny, odkleił się element", "uszczelniacz, klej", "przyklejamy i uszczelniamy ponownie"],
    ["Grawer nieczytelny, złocenie zeszło", "wykonanie", "odnawiamy bezpłatnie"],
    ["Płyty obłożenia się podniosły", "podłoże, mróz", "układamy ponownie na nowym podłożu"],
  ],
  whyEyebrow: "Dlaczego możemy to obiecać",
  whyTitle: "Gwarancja zaczyna się od odkrywki",
  whyText: `${f.installation.survey} ${f.installation.clay} ${f.installation.peat} To nie „usługa dodatkowa”, lecz powód, dla którego możemy dać gwarancję na geometrię: wiemy, na czym stoi każdy nasz pomnik.\n\nKamień bierzemy w blokach z kamieniołomów Żytomierszczyzny i Rówieńszczyzny i tniemy sami — dlatego widzimy każdą płytę przed polerowaniem i odrzucamy te z żyłkami lub pęknięciami. Grawer pokazujemy na próbnym odbitku, a gotowy wyrób — przed montażem. Tak błędy łapie się w zakładzie, a nie na cmentarzu.`,
  notEyebrow: "Nie gwarancja, ale pomagamy",
  notTitle: "Wandalizm, drzewa, cudzy montaż",
  notText: "Uszkodzenia zewnętrzne — wandale, upadłe drzewo, sprzęt sąsiedniego montażu — nie są objęte gwarancją, bo nie zależą od nas. Ale nie zostawiamy rodziny z tym samej: wykonujemy i wymieniamy elementy po kosztach, bez marży, dojazd w obwodach rówieńskim i wołyńskim bezpłatny. Tak samo z pomnikami, których nie wykonaliśmy my: odnawiamy, odświeżamy grawer, przestawiamy na nowy fundament według cennika.",
  howEyebrow: "Jak się zgłosić",
  howTitle: "Trzy rzeczy, które są potrzebne od Ciebie",
  how: [
    { t: "Zdjęcie problemu", d: "Plan ogólny i z bliska to, co niepokoi. Ze zdjęcia zwykle od razu rozumiemy przyczynę." },
    { t: "Numer umowy lub nazwisko", d: "Znajdziemy zamówienie, wymiary i kamień — aby przyjechać ze wszystkim potrzebnym za jednym razem." },
    { t: "Dogodny termin", d: "Przyjeżdżamy w ciągu 7 dni w obwodach rówieńskim i wołyńskim, do innych regionów — po uzgodnieniu." },
  ],
  cta: { title: "Masz pytanie o postawiony pomnik?", text: "Wyślij zdjęcie — powiemy, co z nim jest i co zrobić, niezależnie od tego, kto go wykonał.", button: "Wyślij zdjęcie pomnika" },
})

const en = (f: LocalizedFacts): WarrantyCopy => ({
  crumb: "Warranty",
  title: `A ${f.warranty} warranty on everything, not just the stone`,
  lead: "Stone, engraving, foundation and installation. If anything sinks, cracks or peels in that time, we come and fix it free of charge. No fine print.",
  facts: [
    { value: f.warranty, label: "on stone, engraving, foundation, installation" },
    { value: "0 ₴", label: "travel and work under warranty" },
    { value: "7 days", label: "to respond after your request" },
    { value: "at cost", label: "non-warranty cases" },
  ],
  coversEyebrow: "What it covers",
  coversTitle: "Warranty cases",
  tableHead: ["What happened", "Cause", "What we do"],
  tableRows: [
    ["Stele tilted, slab sank", "soil settlement, foundation", "we level or rebuild the foundation free of charge"],
    ["Crack in the stone or along a joint", "hidden defect in the block, installation", "we replace the element at our expense"],
    ["Joints opened, an element came unglued", "sealant, adhesive", "we re-glue and re-seal"],
    ["Engraving illegible, gilding peeled", "workmanship", "we renew it free of charge"],
    ["Cladding tiles lifted", "base, frost", "we re-lay them on a new base"],
  ],
  whyEyebrow: "Why we can promise this",
  whyTitle: "The warranty starts with the test pit",
  whyText: `${f.installation.survey} ${f.installation.clay} ${f.installation.peat} This is not an “extra service” but the reason we can guarantee the geometry: we know what every one of our monuments stands on.\n\nWe buy stone in blocks from quarries in the Zhytomyr and Rivne regions and cut it ourselves, so we see every slab before polishing and reject those with veins or cracks. Engraving is shown on a test print and the finished piece before installation. That way mistakes are caught in the workshop, not at the cemetery.`,
  notEyebrow: "Not warranty, but we help",
  notTitle: "Vandalism, trees, someone else's installation",
  notText: "External damage — vandals, a fallen tree, machinery from a neighbouring installation — is not covered by the warranty because it doesn't depend on us. But we don't leave the family to deal with it alone: we make and replace elements at cost with no markup, and travel in the Rivne and Volyn regions is free. The same goes for monuments we didn't make: we restore them, renew the engraving and move them onto a new foundation at list price.",
  howEyebrow: "How to reach us",
  howTitle: "Three things we need from you",
  how: [
    { t: "A photo of the problem", d: "A general view and a close-up of what worries you. From the photo we usually understand the cause straight away." },
    { t: "Contract number or surname", d: "We'll find the order, dimensions and stone so we arrive with everything needed in one trip." },
    { t: "A convenient time", d: "We come within 7 days in the Rivne and Volyn regions; other regions by arrangement." },
  ],
  cta: { title: "A question about an installed monument?", text: "Send a photo and we'll tell you what's wrong and what to do, regardless of who made it.", button: "Send a photo of the monument" },
})

const de = (f: LocalizedFacts): WarrantyCopy => ({
  crumb: "Garantie",
  title: `${f.warranty} Garantie — auf alles, nicht nur auf den Stein`,
  lead: "Stein, Gravur, Fundament und Montage. Wenn in dieser Zeit etwas absackt, reißt oder abblättert, kommen wir und beheben es kostenlos. Ohne Kleingedrucktes.",
  facts: [
    { value: f.warranty, label: "auf Stein, Gravur, Fundament, Montage" },
    { value: "0 ₴", label: "Anfahrt und Arbeiten im Garantiefall" },
    { value: "7 Tage", label: "Reaktionszeit nach der Meldung" },
    { value: "zum Selbstkostenpreis", label: "Nicht-Garantiefälle" },
  ],
  coversEyebrow: "Was abgedeckt ist",
  coversTitle: "Garantiefälle",
  tableHead: ["Was passiert ist", "Ursache", "Was wir tun"],
  tableRows: [
    ["Stele hat sich geneigt, Platte ist abgesackt", "Bodensetzung, Fundament", "wir richten aus oder erneuern das Fundament kostenlos"],
    ["Riss im Stein oder entlang der Fuge", "verborgener Blockfehler, Montage", "wir ersetzen das Element auf unsere Kosten"],
    ["Fugen aufgegangen, Element abgelöst", "Dichtmasse, Kleber", "wir verkleben und versiegeln erneut"],
    ["Gravur unleserlich, Vergoldung abgeblättert", "Ausführung", "wir erneuern kostenlos"],
    ["Verkleidungsplatten haben sich gehoben", "Untergrund, Frost", "wir verlegen sie auf neuem Untergrund"],
  ],
  whyEyebrow: "Warum wir das versprechen können",
  whyTitle: "Die Garantie beginnt mit der Probegrube",
  whyText: `${f.installation.survey} ${f.installation.clay} ${f.installation.peat} Das ist keine „Zusatzleistung“, sondern der Grund, warum wir die Geometrie garantieren können: Wir wissen, worauf jedes unserer Grabmale steht.\n\nDen Stein beziehen wir blockweise aus Steinbrüchen der Regionen Schytomyr und Riwne und schneiden ihn selbst — so sehen wir jede Platte vor dem Polieren und sortieren jene mit Adern oder Rissen aus. Die Gravur zeigen wir am Probeabzug, das fertige Stück vor der Montage. So werden Fehler in der Werkstatt entdeckt, nicht auf dem Friedhof.`,
  notEyebrow: "Keine Garantie, aber wir helfen",
  notTitle: "Vandalismus, Bäume, fremde Montage",
  notText: "Äußere Schäden — Vandalen, ein umgestürzter Baum, Technik einer benachbarten Montage — sind nicht von der Garantie gedeckt, weil sie nicht von uns abhängen. Aber wir lassen die Familie damit nicht allein: Wir fertigen und ersetzen Elemente zum Selbstkostenpreis ohne Aufschlag, die Anfahrt in den Regionen Riwne und Wolhynien ist kostenlos. Ebenso bei Grabmalen, die nicht von uns stammen: Wir restaurieren, erneuern die Gravur und setzen sie laut Preisliste auf ein neues Fundament.",
  howEyebrow: "So melden Sie sich",
  howTitle: "Drei Dinge, die wir von Ihnen brauchen",
  how: [
    { t: "Foto des Problems", d: "Gesamtansicht und Nahaufnahme dessen, was Sie beunruhigt. Vom Foto verstehen wir die Ursache meist sofort." },
    { t: "Vertragsnummer oder Nachname", d: "Wir finden den Auftrag, die Maße und den Stein — um mit allem Nötigen in einer Fahrt zu kommen." },
    { t: "Passender Zeitpunkt", d: "In den Regionen Riwne und Wolhynien kommen wir innerhalb von 7 Tagen, in andere Regionen nach Absprache." },
  ],
  cta: { title: "Fragen zu einem aufgestellten Grabmal?", text: "Senden Sie ein Foto — wir sagen Ihnen, was los ist und was zu tun ist, unabhängig davon, wer es gefertigt hat.", button: "Foto des Grabmals senden" },
})

const lt = (f: LocalizedFacts): WarrantyCopy => ({
  crumb: "Garantija",
  title: `${f.warranty} garantija — viskam, ne tik akmeniui`,
  lead: "Akmuo, graviravimas, pamatas ir montavimas. Jei per šį laiką kas nors nusėdo, įskilo ar nusilupo — atvykstame ir pataisome nemokamai. Be smulkaus šrifto.",
  facts: [
    { value: f.warranty, label: "akmeniui, graviravimui, pamatui, montavimui" },
    { value: "0 ₴", label: "atvykimas ir darbai pagal garantiją" },
    { value: "7 dienos", label: "reakcijai po kreipimosi" },
    { value: "savikaina", label: "negarantiniai atvejai" },
  ],
  coversEyebrow: "Ką apima",
  coversTitle: "Garantiniai atvejai",
  tableHead: ["Kas atsitiko", "Priežastis", "Ką darome"],
  tableRows: [
    ["Stela pasviro, plokštė nusėdo", "grunto sėdimas, pamatas", "išlyginame arba perdarome pamatą nemokamai"],
    ["Įtrūkimas akmenyje arba per siūlę", "paslėptas bloko defektas, montavimas", "pakeičiame elementą savo sąskaita"],
    ["Išsiskyrė siūlės, atsiklijavo elementas", "hermetikas, klijai", "perklijuojame ir užsandariname iš naujo"],
    ["Graviūra neįskaitoma, paauksavimas nusilupo", "atlikimas", "atnaujiname nemokamai"],
    ["Apdailos plytelės pakilo", "pagrindas, šaltis", "perklojame ant naujo pagrindo"],
  ],
  whyEyebrow: "Kodėl galime tai pažadėti",
  whyTitle: "Garantija prasideda nuo bandomosios duobės",
  whyText: `${f.installation.survey} ${f.installation.clay} ${f.installation.peat} Tai ne „papildoma paslauga“, o priežastis, kodėl galime duoti garantiją geometrijai: žinome, ant ko stovi kiekvienas mūsų paminklas.\n\nAkmenį imame blokais iš Žytomyro ir Rivnės sričių karjerų ir pjauname patys — todėl matome kiekvieną plokštę prieš poliravimą ir atmetame tas, kuriose yra gyslų ar įtrūkimų. Graviūrą parodome bandomajame atspaude, o gatavą gaminį — prieš montavimą. Taip klaidos pagaunamos ceche, o ne kapinėse.`,
  notEyebrow: "Ne garantija, bet padedame",
  notTitle: "Vandalizmas, medžiai, svetimas montavimas",
  notText: "Išoriniai pažeidimai — vandalai, nuvirtęs medis, kaimyninio montavimo technika — garantija nedengiami, nes nuo mūsų nepriklauso. Bet nepaliekame šeimos su tuo vienos: gaminame ir keičiame elementus savikaina be antkainio, atvykimas Rivnės ir Voluinės srityse nemokamas. Taip pat ir su paminklais, kuriuos pagamino ne mes: restauruojame, atnaujiname graviūrą, perstatome ant naujo pamato pagal kainoraštį.",
  howEyebrow: "Kaip kreiptis",
  howTitle: "Trys dalykai, kurių reikia iš jūsų",
  how: [
    { t: "Problemos nuotrauka", d: "Bendras planas ir iš arti tai, kas neramina. Iš nuotraukos paprastai iš karto suprantame priežastį." },
    { t: "Sutarties numeris arba pavardė", d: "Rasime užsakymą, matmenis ir akmenį — kad atvyktume su visu reikalingu vieną kartą." },
    { t: "Patogus laikas", d: "Rivnės ir Voluinės srityse atvykstame per 7 dienas, į kitus regionus — susitarus." },
  ],
  cta: { title: "Turite klausimą dėl pastatyto paminklo?", text: "Atsiųskite nuotrauką — pasakysime, kas su juo ir ką daryti, nepriklausomai nuo to, kas jį pagamino.", button: "Atsiųsti paminklo nuotrauką" },
})

export const WARRANTY_COPY: Record<Locale, (f: LocalizedFacts) => WarrantyCopy> = { uk, pl, en, de, lt }
