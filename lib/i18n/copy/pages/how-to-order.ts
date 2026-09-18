import type { Locale } from "@/lib/types"
import type { LocalizedFacts } from "@/lib/i18n/copy/facts"

export type HowToOrderCopy = {
  crumb: string
  title: string
  lead: string
  facts: { value: string; label: string }[]
  stepsEyebrow: string
  stepsTitle: string
  steps: { title: string; text: string }[]
  prepEyebrow: string
  prepTitle: string
  prepLeft: string
  prepRight: string
  links: { guide: string; epitaph: string; prices: string }
  installEyebrow: string
  installTitle: string
  installText: string
  faqEyebrow: string
  faqTitle: string
  faq: { q: string; a: string }[]
}

const uk = (f: LocalizedFacts): HowToOrderCopy => ({
  crumb: "Як замовити",
  title: "Як замовити пам'ятник",
  lead: "Шість кроків, один контакт і жодної потреби приїжджати, якщо не хочете. Ескіз і ціну ви бачите до того, як платите бодай гривню.",
  facts: [
    { value: "1 день", label: "ескіз і ціна після фото" },
    { value: f.lead.single, label: "виготовлення одинарного" },
    { value: "1–3 дні", label: "монтаж на місці" },
    { value: f.warranty, label: "гарантії" },
  ],
  stepsEyebrow: "Покроково",
  stepsTitle: "Від фото до встановленого пам'ятника",
  steps: [
    { title: "Фото ділянки і побажання", text: "Сфотографуйте місце з двох-трьох точок, щоб було видно сусідні пам'ятники і підхід. Напишіть, хто спочиває, який камінь до душі, чи є вподобана модель з каталогу. Надішліть у Viber, Telegram або через форму." },
    { title: "Ескіз і ціна — протягом дня", text: "Дизайнер робить ескіз у вашому камені з реальними пропорціями ділянки і називає ціну. Змінюйте скільки завгодно: форму, розмір, шрифт, елементи. Поки не почали різати камінь, правки безкоштовні." },
    { title: "Замір на кладовищі", text: "Виїжджаємо, міряємо ділянку, робимо шурф 60–80 см, щоб побачити ґрунт, і фіксуємо, який фундамент потрібен. Погоджуємо з адміністрацією кладовища, якщо є вимоги до розмірів. У Рівненській і Волинській областях — безкоштовно." },
    { title: "Договір і перший платіж", text: `Підписуємо договір з остаточною ціною, розмірами, каменем і терміном. Оплата ${f.payment.steps[0].share} — на камінь і початок робіт. Далі ціна не змінюється.` },
    { title: "Виготовлення з контролем", text: `Одинарний пам'ятник — ${f.lead.single}, комплекс — ${f.lead.complex}. Портрет погоджуємо на пробному відбитку до гравіювання. Готовий виріб показуємо у цеху або на відео з усіх боків; після приймання — другий платіж.` },
    { title: "Монтаж і гарантія", text: `Бригада заливає фундамент, монтує, герметизує шви й прибирає за собою. Одиночний — за день, комплекс — 1–3 дні. Після монтажу — останній платіж і гарантійний талон на ${f.warranty}.` },
  ],
  prepEyebrow: "Що підготувати",
  prepTitle: "Що знадобиться від вас",
  prepLeft: "Фото ділянки — головне. Не потрібен професійний знімок: телефон, дві-три точки, щоб було видно сусідні пам'ятники, ширину проходу і чи є перепад висоти. З цього ми бачимо, який розмір ділянки реальний і чи потрібна техніка для монтажу.\n\nФото для портрета — будь-яке, де обличчя не менше 2×2 см на оригіналі та в помірній різкості. Художник-ретушер відновлює старі й пошкоджені знімки, прибирає фон, підправляє одяг. Кольорове чи чорно-біле — не має значення для гравіювання.",
  prepRight: "Текст напису: ім'я, дати, епітафія. Якщо не вирішили — підкажемо варіанти, у нас є добірка епітафій і формул для військових, батьків, дітей. Мова напису будь-яка: українська, польська, англійська, німецька.\n\nПобажання щодо каменю. Якщо не знаєте, з чого почати, — прочитайте довідник каменю на сайті або просто скажіть, який колір ближче: чорний, сірий, червоний, зелений чи білий. Решту підберемо.",
  links: { guide: "Довідник каменю", epitaph: "Як написати епітафію", prices: "Ціни" },
  installEyebrow: "Монтаж",
  installTitle: "Чому ми починаємо з ґрунту",
  installText: `${f.installation.survey} ${f.installation.clay} ${f.installation.peat} Саме через фундамент найчастіше «падають» пам'ятники, встановлені без підготовки: через два-три роки стела нахиляється, плита тріскає по шву. Тому фундамент у нас — частина гарантії, а не окрема послуга.\n\n${f.installation.crew}`,
  faqEyebrow: "Питання",
  faqTitle: "Про замовлення запитують",
  faq: [
    { q: "Чи можна замовити, якщо я в іншому місті або за кордоном?", a: "Так, більшість замовлень ми робимо дистанційно. Фото ділянки може зробити родич або ми самі на замірі; ескізи, пробний відбиток портрета й готовий виріб погоджуємо по фото й відео; оплата — картка або переказ. Родини з Польщі, Німеччини, Литви замовляють у нас для поховань в Україні саме так." },
    { q: "Які документи потрібні?", a: "Для замовлення — лише ваші контакти й фото померлого для портрета. Для встановлення на кладовищі адміністрація зазвичай просить свідоцтво про смерть або документ на місце поховання (у різних громадах по-різному). Ми підкажемо, що саме потрібно на вашому кладовищі, і самі узгодимо встановлення." },
    { q: "Коли найкраще ставити пам'ятник?", a: "Мінімум через 6–12 місяців після поховання, коли ґрунт осів. Ставимо з квітня по листопад, поки температура вночі вище нуля, — бетон фундаменту мусить нормально схопитись. Замовляти краще взимку або на початку весни: черга коротша й монтаж потрапляє на початок сезону." },
    { q: "Скільки триває все разом?", a: `Від першого повідомлення до встановленого пам'ятника — зазвичай 6–9 тижнів для одинарного і 8–12 для комплексу. Тиждень іде на ескіз, замір і договір, далі виготовлення (${f.lead.single} або ${f.lead.complex}), потім монтаж. ${f.lead.seasonNote}` },
    { q: "Що робити зі старим пам'ятником або хрестом?", a: "Демонтуємо і вивозимо самі — це частина монтажу. Тимчасовий хрест за бажанням родини можна залишити на ділянці, встановити за пам'ятником або передати в церкву; металевий — утилізуємо." },
    { q: "Чи можна змінити щось під час виготовлення?", a: "До початку обробки каменю — все безкоштовно. Далі залежить від етапу: змінити шрифт чи додати слово в напис — зазвичай без доплати; перегравіювати ім'я або портрет після виконання — це нова стела, тому портрет ми показуємо на пробному відбитку до гравіювання." },
  ],
})

const pl = (f: LocalizedFacts): HowToOrderCopy => ({
  crumb: "Jak zamówić",
  title: "Jak zamówić pomnik",
  lead: "Sześć kroków, jeden kontakt i żadnej potrzeby przyjazdu, jeśli nie chcesz. Szkic i cenę widzisz, zanim zapłacisz choć złotówkę.",
  facts: [
    { value: "1 dzień", label: "szkic i cena po zdjęciu" },
    { value: f.lead.single, label: "wykonanie pojedynczego" },
    { value: "1–3 dni", label: "montaż na miejscu" },
    { value: f.warranty, label: "gwarancji" },
  ],
  stepsEyebrow: "Krok po kroku",
  stepsTitle: "Od zdjęcia do postawionego pomnika",
  steps: [
    { title: "Zdjęcie miejsca i życzenia", text: "Sfotografuj miejsce z dwóch–trzech punktów, tak aby było widać sąsiednie pomniki i dojście. Napisz, kto spoczywa, jaki kamień Ci odpowiada, czy jest model z katalogu, który się spodobał. Wyślij przez Viber, Telegram lub formularz." },
    { title: "Szkic i cena — w ciągu dnia", text: "Projektant robi szkic w Twoim kamieniu z realnymi proporcjami miejsca i podaje cenę. Zmieniaj, ile chcesz: kształt, wymiar, krój pisma, elementy. Dopóki nie zaczniemy ciąć kamienia, poprawki są bezpłatne." },
    { title: "Pomiar na cmentarzu", text: "Przyjeżdżamy, mierzymy miejsce, robimy odkrywkę 60–80 cm, aby zobaczyć grunt, i ustalamy, jaki fundament jest potrzebny. Uzgadniamy z administracją cmentarza, jeśli są wymogi co do wymiarów. W obwodach rówieńskim i wołyńskim — bezpłatnie." },
    { title: "Umowa i pierwsza wpłata", text: `Podpisujemy umowę z ostateczną ceną, wymiarami, kamieniem i terminem. Wpłata ${f.payment.steps[0].share} — na kamień i rozpoczęcie prac. Dalej cena się nie zmienia.` },
    { title: "Wykonanie pod kontrolą", text: `Pomnik pojedynczy — ${f.lead.single}, kompleks — ${f.lead.complex}. Portret uzgadniamy na próbnym odbitku przed grawerowaniem. Gotowy wyrób pokazujemy w zakładzie lub na wideo ze wszystkich stron; po odbiorze — druga wpłata.` },
    { title: "Montaż i gwarancja", text: `Ekipa wylewa fundament, montuje, uszczelnia spoiny i sprząta po sobie. Pojedynczy — w jeden dzień, kompleks — 1–3 dni. Po montażu — ostatnia wpłata i karta gwarancyjna na ${f.warranty}.` },
  ],
  prepEyebrow: "Co przygotować",
  prepTitle: "Co będzie potrzebne od Ciebie",
  prepLeft: "Zdjęcie miejsca — najważniejsze. Nie trzeba profesjonalnego ujęcia: telefon, dwa–trzy punkty, tak aby było widać sąsiednie pomniki, szerokość przejścia i czy jest różnica wysokości. Z tego widzimy, jaki wymiar miejsca jest realny i czy do montażu potrzebny jest sprzęt.\n\nZdjęcie do portretu — dowolne, na którym twarz ma co najmniej 2×2 cm na oryginale i jest umiarkowanie ostra. Retuszer odnawia stare i uszkodzone zdjęcia, usuwa tło, poprawia ubranie. Kolorowe czy czarno-białe — dla grawerowania nie ma znaczenia.",
  prepRight: "Treść napisu: imię, daty, epitafium. Jeśli nie zdecydowaliście — podpowiemy warianty, mamy zbiór epitafiów i formuł dla wojskowych, rodziców, dzieci. Język napisu dowolny: ukraiński, polski, angielski, niemiecki.\n\nŻyczenia co do kamienia. Jeśli nie wiesz, od czego zacząć — przeczytaj przewodnik po kamieniu na stronie albo po prostu powiedz, który kolor jest bliższy: czarny, szary, czerwony, zielony czy biały. Resztę dobierzemy.",
  links: { guide: "Przewodnik po kamieniu", epitaph: "Jak napisać epitafium", prices: "Ceny" },
  installEyebrow: "Montaż",
  installTitle: "Dlaczego zaczynamy od gruntu",
  installText: `${f.installation.survey} ${f.installation.clay} ${f.installation.peat} To właśnie przez fundament najczęściej „padają” pomniki postawione bez przygotowania: po dwóch–trzech latach stela się przechyla, płyta pęka na spoinie. Dlatego fundament jest u nas częścią gwarancji, a nie osobną usługą.\n\n${f.installation.crew}`,
  faqEyebrow: "Pytania",
  faqTitle: "O zamówienie pytają",
  faq: [
    { q: "Czy mogę zamówić, jeśli jestem w innym mieście lub za granicą?", a: "Tak, większość zamówień realizujemy zdalnie. Zdjęcie miejsca może zrobić krewny albo my sami na pomiarze; szkice, próbny odbitek portretu i gotowy wyrób uzgadniamy na zdjęciach i wideo; płatność — karta lub przelew. Rodziny z Polski, Niemiec i Litwy zamawiają u nas na pochówki w Ukrainie właśnie tak." },
    { q: "Jakie dokumenty są potrzebne?", a: "Do zamówienia — tylko Twoje dane kontaktowe i zdjęcie zmarłego do portretu. Do montażu na cmentarzu administracja zwykle prosi o akt zgonu lub dokument na miejsce pochówku (w różnych gminach różnie). Podpowiemy, co dokładnie jest potrzebne na Twoim cmentarzu, i sami uzgodnimy montaż." },
    { q: "Kiedy najlepiej stawiać pomnik?", a: "Co najmniej 6–12 miesięcy po pochówku, gdy grunt osiadł. Stawiamy od kwietnia do listopada, dopóki temperatura w nocy jest powyżej zera — beton fundamentu musi prawidłowo związać. Zamawiać lepiej zimą lub wczesną wiosną: kolejka jest krótsza, a montaż wypada na początek sezonu." },
    { q: "Ile trwa wszystko razem?", a: `Od pierwszej wiadomości do postawionego pomnika — zwykle 6–9 tygodni dla pojedynczego i 8–12 dla kompleksu. Tydzień zajmuje szkic, pomiar i umowa, potem wykonanie (${f.lead.single} lub ${f.lead.complex}), następnie montaż. ${f.lead.seasonNote}` },
    { q: "Co zrobić ze starym pomnikiem lub krzyżem?", a: "Demontujemy i wywozimy sami — to część montażu. Tymczasowy krzyż na życzenie rodziny można zostawić na miejscu, ustawić za pomnikiem lub przekazać do kościoła; metalowy — utylizujemy." },
    { q: "Czy można coś zmienić w trakcie wykonania?", a: "Przed rozpoczęciem obróbki kamienia — wszystko bezpłatnie. Dalej zależy od etapu: zmiana kroju pisma czy dodanie słowa w napisie — zwykle bez dopłaty; ponowne wygrawerowanie imienia lub portretu po wykonaniu — to nowa stela, dlatego portret pokazujemy na próbnym odbitku przed grawerowaniem." },
  ],
})

const en = (f: LocalizedFacts): HowToOrderCopy => ({
  crumb: "How to order",
  title: "How to order a monument",
  lead: "Six steps, one contact and no need to visit unless you want to. You see the sketch and the price before you pay a single hryvnia.",
  facts: [
    { value: "1 day", label: "sketch and price after the photo" },
    { value: f.lead.single, label: "single monument lead time" },
    { value: "1–3 days", label: "installation on site" },
    { value: f.warranty, label: "warranty" },
  ],
  stepsEyebrow: "Step by step",
  stepsTitle: "From a photo to an installed monument",
  steps: [
    { title: "Photo of the plot and your wishes", text: "Photograph the site from two or three points so the neighbouring monuments and the approach are visible. Tell us who is buried there, which stone you like and whether there is a catalogue model you prefer. Send it via Viber, Telegram or the form." },
    { title: "Sketch and price within a day", text: "The designer draws a sketch in your stone with the real proportions of the plot and names the price. Change as much as you like: shape, size, typeface, elements. Until we start cutting stone, changes are free." },
    { title: "Measurement at the cemetery", text: "We visit, measure the plot, dig a 60–80 cm test pit to see the soil and record which foundation is needed. We coordinate with the cemetery administration if there are size requirements. In the Rivne and Volyn regions this is free." },
    { title: "Contract and first payment", text: `We sign a contract with the final price, dimensions, stone and deadline. A ${f.payment.steps[0].share} payment covers the stone and the start of work. After that the price does not change.` },
    { title: "Production with oversight", text: `A single monument takes ${f.lead.single}, a complex ${f.lead.complex}. The portrait is approved on a test print before engraving. We show the finished piece at the workshop or on video from all sides; after acceptance comes the second payment.` },
    { title: "Installation and warranty", text: `The crew pours the foundation, installs, seals the joints and cleans up. A single monument takes a day, a complex 1–3 days. After installation comes the final payment and a ${f.warranty} warranty card.` },
  ],
  prepEyebrow: "What to prepare",
  prepTitle: "What we need from you",
  prepLeft: "A photo of the plot is the main thing. No professional shot needed: a phone, two or three angles showing the neighbouring monuments, the width of the path and any change in level. From this we see the real size of the plot and whether machinery is needed for installation.\n\nA photo for the portrait: any where the face is at least 2×2 cm on the original and reasonably sharp. Our retoucher restores old and damaged photos, removes the background and tidies clothing. Colour or black and white makes no difference for engraving.",
  prepRight: "The inscription text: name, dates, epitaph. If you haven't decided, we'll suggest options; we keep a collection of epitaphs and formulas for soldiers, parents and children. Any language: Ukrainian, Polish, English, German.\n\nYour wishes for the stone. If you don't know where to start, read the stone guide on the site or just tell us which colour feels right: black, grey, red, green or white. We'll pick the rest.",
  links: { guide: "Stone guide", epitaph: "How to write an epitaph", prices: "Prices" },
  installEyebrow: "Installation",
  installTitle: "Why we start with the soil",
  installText: `${f.installation.survey} ${f.installation.clay} ${f.installation.peat} The foundation is the usual reason monuments installed without preparation “fall”: after two or three years the stele tilts and the slab cracks along the joint. That is why for us the foundation is part of the warranty, not a separate service.\n\n${f.installation.crew}`,
  faqEyebrow: "Questions",
  faqTitle: "What people ask about ordering",
  faq: [
    { q: "Can I order if I live in another city or abroad?", a: "Yes, most of our orders are handled remotely. A relative can photograph the plot, or we do it ourselves at measurement; sketches, the portrait test print and the finished piece are approved by photo and video; payment is by card or transfer. Families from Poland, Germany and Lithuania order from us for burials in Ukraine exactly this way." },
    { q: "What documents are needed?", a: "For the order, only your contact details and a photo of the deceased for the portrait. For installation at the cemetery the administration usually asks for the death certificate or a document for the burial plot (it varies between communities). We'll tell you exactly what your cemetery requires and arrange the installation ourselves." },
    { q: "When is the best time to install a monument?", a: "At least 6–12 months after the burial, once the soil has settled. We install from April to November while night temperatures stay above zero, so the concrete foundation can cure properly. It's best to order in winter or early spring: the queue is shorter and installation falls at the start of the season." },
    { q: "How long does it all take?", a: `From the first message to the installed monument, usually 6–9 weeks for a single monument and 8–12 for a complex. A week goes on the sketch, measurement and contract, then production (${f.lead.single} or ${f.lead.complex}), then installation. ${f.lead.seasonNote}` },
    { q: "What happens to the old monument or cross?", a: "We dismantle and remove it ourselves as part of installation. If the family wishes, a temporary cross can be left on the plot, placed behind the monument or given to the church; a metal one we dispose of." },
    { q: "Can I change something during production?", a: "Before stone processing begins, everything is free. After that it depends on the stage: changing the typeface or adding a word to the inscription is usually free; re-engraving a name or portrait after it is done means a new stele, which is why we show the portrait on a test print before engraving." },
  ],
})

const de = (f: LocalizedFacts): HowToOrderCopy => ({
  crumb: "So bestellen Sie",
  title: "So bestellen Sie ein Grabmal",
  lead: "Sechs Schritte, ein Ansprechpartner und keine Anreise nötig, wenn Sie nicht möchten. Skizze und Preis sehen Sie, bevor Sie auch nur eine Hrywnja bezahlen.",
  facts: [
    { value: "1 Tag", label: "Skizze und Preis nach dem Foto" },
    { value: f.lead.single, label: "Fertigung Einzelgrabmal" },
    { value: "1–3 Tage", label: "Montage vor Ort" },
    { value: f.warranty, label: "Garantie" },
  ],
  stepsEyebrow: "Schritt für Schritt",
  stepsTitle: "Vom Foto zum aufgestellten Grabmal",
  steps: [
    { title: "Foto der Grabstelle und Wünsche", text: "Fotografieren Sie den Ort aus zwei bis drei Blickwinkeln, sodass Nachbargrabmale und der Zugang zu sehen sind. Schreiben Sie, wer dort ruht, welcher Stein Ihnen gefällt und ob es ein Wunschmodell aus dem Katalog gibt. Senden Sie es per Viber, Telegram oder über das Formular." },
    { title: "Skizze und Preis — innerhalb eines Tages", text: "Der Designer fertigt eine Skizze in Ihrem Stein mit den realen Proportionen der Grabstelle und nennt den Preis. Ändern Sie so viel Sie möchten: Form, Größe, Schrift, Elemente. Solange der Stein nicht geschnitten ist, sind Änderungen kostenlos." },
    { title: "Aufmaß auf dem Friedhof", text: "Wir kommen vorbei, messen die Grabstelle, legen eine 60–80 cm tiefe Probegrube an, um den Boden zu sehen, und halten fest, welches Fundament nötig ist. Bei Größenvorgaben stimmen wir uns mit der Friedhofsverwaltung ab. In den Regionen Riwne und Wolhynien kostenlos." },
    { title: "Vertrag und erste Zahlung", text: `Wir unterzeichnen einen Vertrag mit Endpreis, Maßen, Stein und Termin. Die Zahlung von ${f.payment.steps[0].share} deckt den Stein und den Arbeitsbeginn. Danach ändert sich der Preis nicht mehr.` },
    { title: "Fertigung mit Kontrolle", text: `Einzelgrabmal — ${f.lead.single}, Grabanlage — ${f.lead.complex}. Das Porträt stimmen wir vor der Gravur am Probeabzug ab. Das fertige Stück zeigen wir in der Werkstatt oder per Video von allen Seiten; nach der Abnahme folgt die zweite Zahlung.` },
    { title: "Montage und Garantie", text: `Das Team gießt das Fundament, montiert, versiegelt die Fugen und räumt auf. Einzelgrabmal — an einem Tag, Grabanlage — 1–3 Tage. Nach der Montage folgen die letzte Zahlung und die Garantiekarte für ${f.warranty}.` },
  ],
  prepEyebrow: "Was vorzubereiten ist",
  prepTitle: "Was wir von Ihnen brauchen",
  prepLeft: "Das Foto der Grabstelle ist das Wichtigste. Kein Profifoto nötig: Handy, zwei bis drei Blickwinkel, sodass Nachbargrabmale, die Breite des Weges und ein eventueller Höhenunterschied zu sehen sind. Daran erkennen wir die tatsächliche Größe der Grabstelle und ob für die Montage Technik nötig ist.\n\nDas Foto für das Porträt: beliebig, solange das Gesicht im Original mindestens 2×2 cm groß und einigermaßen scharf ist. Unser Retuscheur restauriert alte und beschädigte Aufnahmen, entfernt den Hintergrund, korrigiert die Kleidung. Farbe oder Schwarz-Weiß spielt für die Gravur keine Rolle.",
  prepRight: "Der Text der Inschrift: Name, Daten, Epitaph. Falls noch unentschieden, schlagen wir Varianten vor; wir haben eine Sammlung von Epitaphen und Formeln für Soldaten, Eltern, Kinder. Die Sprache ist frei: Ukrainisch, Polnisch, Englisch, Deutsch.\n\nIhre Wünsche zum Stein. Wenn Sie nicht wissen, wo Sie anfangen sollen, lesen Sie den Steinführer auf der Website oder sagen Sie einfach, welche Farbe Ihnen näher ist: Schwarz, Grau, Rot, Grün oder Weiß. Den Rest wählen wir aus.",
  links: { guide: "Steinführer", epitaph: "Wie man ein Epitaph schreibt", prices: "Preise" },
  installEyebrow: "Montage",
  installTitle: "Warum wir mit dem Boden beginnen",
  installText: `${f.installation.survey} ${f.installation.clay} ${f.installation.peat} Gerade am Fundament „fallen“ Grabmale, die ohne Vorbereitung aufgestellt wurden: Nach zwei bis drei Jahren neigt sich die Stele, die Platte reißt an der Fuge. Deshalb ist das Fundament bei uns Teil der Garantie und keine Zusatzleistung.\n\n${f.installation.crew}`,
  faqEyebrow: "Fragen",
  faqTitle: "Was zur Bestellung gefragt wird",
  faq: [
    { q: "Kann ich bestellen, wenn ich in einer anderen Stadt oder im Ausland lebe?", a: "Ja, die meisten Aufträge erledigen wir aus der Ferne. Das Foto der Grabstelle kann ein Verwandter machen oder wir selbst beim Aufmaß; Skizzen, Probeabzug des Porträts und das fertige Stück stimmen wir per Foto und Video ab; bezahlt wird per Karte oder Überweisung. Familien aus Polen, Deutschland und Litauen bestellen bei uns für Bestattungen in der Ukraine genau so." },
    { q: "Welche Dokumente werden benötigt?", a: "Für die Bestellung nur Ihre Kontaktdaten und ein Foto des Verstorbenen für das Porträt. Für die Aufstellung auf dem Friedhof verlangt die Verwaltung meist die Sterbeurkunde oder ein Dokument über die Grabstelle (je nach Gemeinde unterschiedlich). Wir sagen Ihnen, was auf Ihrem Friedhof genau nötig ist, und stimmen die Aufstellung selbst ab." },
    { q: "Wann ist der beste Zeitpunkt für die Aufstellung?", a: "Frühestens 6–12 Monate nach der Beisetzung, wenn sich der Boden gesetzt hat. Wir stellen von April bis November auf, solange die Nachttemperaturen über null liegen — der Fundamentbeton muss richtig abbinden. Bestellen sollten Sie am besten im Winter oder zu Frühlingsbeginn: Die Wartezeit ist kürzer, und die Montage fällt auf den Saisonanfang." },
    { q: "Wie lange dauert alles zusammen?", a: `Von der ersten Nachricht bis zum aufgestellten Grabmal meist 6–9 Wochen für ein Einzelgrabmal und 8–12 für eine Grabanlage. Eine Woche entfällt auf Skizze, Aufmaß und Vertrag, dann die Fertigung (${f.lead.single} oder ${f.lead.complex}), dann die Montage. ${f.lead.seasonNote}` },
    { q: "Was geschieht mit dem alten Grabmal oder Kreuz?", a: "Wir bauen es selbst ab und entsorgen es — das gehört zur Montage. Ein provisorisches Kreuz kann auf Wunsch der Familie auf der Grabstelle bleiben, hinter dem Grabmal aufgestellt oder der Kirche übergeben werden; ein Metallkreuz entsorgen wir." },
    { q: "Kann während der Fertigung noch etwas geändert werden?", a: "Vor Beginn der Steinbearbeitung — alles kostenlos. Danach hängt es von der Phase ab: Schrift ändern oder ein Wort zur Inschrift hinzufügen ist meist ohne Aufpreis; Name oder Porträt nach der Ausführung neu zu gravieren bedeutet eine neue Stele, deshalb zeigen wir das Porträt vor der Gravur am Probeabzug." },
  ],
})

const lt = (f: LocalizedFacts): HowToOrderCopy => ({
  crumb: "Kaip užsakyti",
  title: "Kaip užsakyti paminklą",
  lead: "Šeši žingsniai, vienas kontaktas ir jokios būtinybės atvykti, jei nenorite. Eskizą ir kainą matote prieš sumokėdami bent grivną.",
  facts: [
    { value: "1 diena", label: "eskizas ir kaina po nuotraukos" },
    { value: f.lead.single, label: "vienviečio gamyba" },
    { value: "1–3 dienos", label: "montavimas vietoje" },
    { value: f.warranty, label: "garantija" },
  ],
  stepsEyebrow: "Žingsnis po žingsnio",
  stepsTitle: "Nuo nuotraukos iki pastatyto paminklo",
  steps: [
    { title: "Kapavietės nuotrauka ir pageidavimai", text: "Nufotografuokite vietą iš dviejų–trijų taškų, kad matytųsi kaimyniniai paminklai ir priėjimas. Parašykite, kas ten palaidotas, koks akmuo patinka, ar yra pamėgtas modelis iš katalogo. Atsiųskite per Viber, Telegram arba formą." },
    { title: "Eskizas ir kaina — per dieną", text: "Dizaineris padaro eskizą jūsų akmenyje su tikromis kapavietės proporcijomis ir pasako kainą. Keiskite kiek norite: formą, dydį, šriftą, elementus. Kol nepradėjome pjauti akmens, pataisymai nemokami." },
    { title: "Išmatavimas kapinėse", text: "Atvykstame, išmatuojame vietą, kasame 60–80 cm bandomąją duobę, kad pamatytume gruntą, ir užfiksuojame, kokio pamato reikia. Suderiname su kapinių administracija, jei yra reikalavimų matmenims. Rivnės ir Voluinės srityse — nemokamai." },
    { title: "Sutartis ir pirmas mokėjimas", text: `Pasirašome sutartį su galutine kaina, matmenimis, akmeniu ir terminu. ${f.payment.steps[0].share} mokėjimas — už akmenį ir darbų pradžią. Toliau kaina nesikeičia.` },
    { title: "Gamyba su kontrole", text: `Vienvietis paminklas — ${f.lead.single}, kompleksas — ${f.lead.complex}. Portretą suderiname bandomajame atspaude prieš graviravimą. Gatavą gaminį parodome ceche arba vaizdo įraše iš visų pusių; po priėmimo — antras mokėjimas.` },
    { title: "Montavimas ir garantija", text: `Brigada išlieja pamatą, sumontuoja, užsandarina siūles ir po savęs sutvarko. Vienvietis — per dieną, kompleksas — 1–3 dienos. Po montavimo — paskutinis mokėjimas ir garantinis talonas ${f.warranty}.` },
  ],
  prepEyebrow: "Ką pasiruošti",
  prepTitle: "Ko reikės iš jūsų",
  prepLeft: "Kapavietės nuotrauka — svarbiausia. Profesionalios nereikia: telefonas, du–trys taškai, kad matytųsi kaimyniniai paminklai, tako plotis ir ar yra aukščių skirtumas. Iš to matome, koks tikras kapavietės dydis ir ar montavimui reikės technikos.\n\nNuotrauka portretui — bet kokia, kurioje veidas originale ne mažesnis nei 2×2 cm ir pakankamai ryškus. Retušuotojas atkuria senas ir pažeistas nuotraukas, pašalina foną, pataiso drabužius. Spalvota ar nespalvota — graviravimui nesvarbu.",
  prepRight: "Užrašo tekstas: vardas, datos, epitafija. Jei dar neapsisprendėte — pasiūlysime variantų, turime epitafijų ir formuluočių rinkinį kariams, tėvams, vaikams. Užrašo kalba bet kokia: ukrainiečių, lenkų, anglų, vokiečių.\n\nPageidavimai dėl akmens. Jei nežinote, nuo ko pradėti — perskaitykite akmens žinyną svetainėje arba tiesiog pasakykite, kuri spalva artimesnė: juoda, pilka, raudona, žalia ar balta. Likusį parinksime.",
  links: { guide: "Akmens žinynas", epitaph: "Kaip parašyti epitafiją", prices: "Kainos" },
  installEyebrow: "Montavimas",
  installTitle: "Kodėl pradedame nuo grunto",
  installText: `${f.installation.survey} ${f.installation.clay} ${f.installation.peat} Būtent dėl pamato dažniausiai „griūva“ be pasiruošimo pastatyti paminklai: po dvejų–trejų metų stela pasvyra, plokštė įskyla per siūlę. Todėl pamatas pas mus — garantijos dalis, o ne atskira paslauga.\n\n${f.installation.crew}`,
  faqEyebrow: "Klausimai",
  faqTitle: "Apie užsakymą klausia",
  faq: [
    { q: "Ar galiu užsakyti, jei esu kitame mieste ar užsienyje?", a: "Taip, daugumą užsakymų atliekame nuotoliniu būdu. Kapavietės nuotrauką gali padaryti giminaitis arba mes patys matuodami; eskizus, portreto bandomąjį atspaudą ir gatavą gaminį suderiname pagal nuotraukas ir vaizdo įrašus; mokėjimas — kortele arba pavedimu. Šeimos iš Lenkijos, Vokietijos, Lietuvos užsako pas mus laidojimams Ukrainoje būtent taip." },
    { q: "Kokių dokumentų reikia?", a: "Užsakymui — tik jūsų kontaktai ir mirusiojo nuotrauka portretui. Statymui kapinėse administracija paprastai prašo mirties liudijimo arba dokumento dėl laidojimo vietos (skirtingose bendruomenėse skirtingai). Pasakysime, ko tiksliai reikia jūsų kapinėse, ir patys suderinsime statymą." },
    { q: "Kada geriausia statyti paminklą?", a: "Ne anksčiau kaip po 6–12 mėnesių po laidotuvių, kai gruntas nusėdo. Statome nuo balandžio iki lapkričio, kol naktį temperatūra aukščiau nulio — pamato betonas turi tinkamai sukietėti. Užsakyti geriau žiemą arba pavasario pradžioje: eilė trumpesnė, o montavimas patenka į sezono pradžią." },
    { q: "Kiek trunka viskas kartu?", a: `Nuo pirmos žinutės iki pastatyto paminklo — paprastai 6–9 savaitės vienviečiam ir 8–12 kompleksui. Savaitė skiriama eskizui, matavimui ir sutarčiai, toliau gamyba (${f.lead.single} arba ${f.lead.complex}), tada montavimas. ${f.lead.seasonNote}` },
    { q: "Ką daryti su senu paminklu ar kryžiumi?", a: "Išmontuojame ir išvežame patys — tai montavimo dalis. Laikiną kryžių šeimos pageidavimu galima palikti kapavietėje, pastatyti už paminklo arba perduoti bažnyčiai; metalinį — utilizuojame." },
    { q: "Ar galima ką nors keisti gamybos metu?", a: "Iki akmens apdirbimo pradžios — viskas nemokamai. Toliau priklauso nuo etapo: pakeisti šriftą ar pridėti žodį užraše — paprastai be priemokos; iš naujo išgraviruoti vardą ar portretą po atlikimo — tai nauja stela, todėl portretą parodome bandomajame atspaude prieš graviravimą." },
  ],
})

export const HOW_TO_ORDER_COPY: Record<Locale, (f: LocalizedFacts) => HowToOrderCopy> = { uk, pl, en, de, lt }
