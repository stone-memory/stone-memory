import type { Locale } from "@/lib/types"
import type { LocalizedFacts } from "@/lib/i18n/copy/facts"

export type FaqPageCopy = {
  crumb: string
  title: string
  lead: string
  generalPill: string
  generalEyebrow: string
  generalTitle: string
  groups: { id: string; group: string; items: { q: string; a: string }[] }[]
  moreLead: string
  more: { prices: string; howTo: string; delivery: string; warranty: string; guide: string }
  cta: { title: string; text: string; button: string }
}

const uk = (f: LocalizedFacts): FaqPageCopy => ({
  crumb: "Питання й відповіді",
  title: "Питання й відповіді",
  lead: `Усе, що запитують перед замовленням: ціни, терміни (одинарний — ${f.lead.single}), камінь, фундамент, документи й догляд. Не знайшли своє — напишіть, відповімо протягом години в робочий час.`,
  generalPill: "Ціни, терміни, оплата",
  generalEyebrow: "Найчастіші",
  generalTitle: "Ціни, терміни, оплата, монтаж",
  groups: [
    {
      id: "vybir",
      group: "Вибір і дизайн",
      items: [
        { q: "Чим відрізняється габро від «чорного граніту»?", a: "Це те саме: «чорним гранітом» у побуті називають габро — окрему породу, щільнішу й дрібнозернистішу за граніт. Чорного граніту як такого в Україні не добувають. У нас в картках завжди вказано справжню назву: габро (Головинське або Букинське родовище) або лабрадорит." },
        { q: "Який розмір стели обрати?", a: "Стандарт для одиночного пам'ятника — 80×45×8 см або 100×50×8 см; для подвійного — 120×60×8. Більший розмір потрібен, коли ділянка велика і стела 80 см губиться, або коли на ній має бути два портрети й довга епітафія. На замірі ми ставимо шаблон із картону в реальний розмір — так простіше вирішити, ніж по цифрах." },
        { q: "Чи можна зробити пам'ятник за фото з іншого сайту?", a: "Так. Надішліть фото — зробимо ескіз у своєму камені й назвемо ціну. Форму повторюємо точно, портрет і напис — ваші. Часто виходить дешевше, ніж на сайті, звідки фото, бо ми виробник." },
        { q: "Чи робите ви кольорові портрети?", a: "Так, двома способами: кольорове гравіювання по каменю (стійкіше, спокійніші тони) або фотокераміка — керамічна пластина з друком, що кріпиться на стелу (яскравіше, від 1 300 ₴). Для військових найчастіше беруть чорно-біле глибоке гравіювання: воно найдовговічніше." },
      ],
    },
    {
      id: "dokumenty",
      group: "Документи й кладовище",
      items: [
        { q: "Чи потрібен дозвіл на встановлення пам'ятника?", a: "На більшості кладовищ достатньо повідомити адміністрацію й показати документ на місце поховання. У містах (Рівне, Луцьк, Київ) є регламент розмірів і форма заяви — ми знаємо ці вимоги й оформлюємо самі. Якщо кладовище має обмеження за висотою чи площею, врахуємо їх в ескізі." },
        { q: "Чи є пільги або компенсація для родин загиблих військових?", a: "Так, держава компенсує частину вартості пам'ятника через органи соцзахисту, а низка громад і фондів доплачує. Суми й порядок різняться по областях. Ми готуємо повний пакет документів для компенсації: договір, рахунок, акт, фотофіксацію, і працюємо з фондами за безготівковим розрахунком." },
        { q: "Чи можна встановити пам'ятник, якщо після поховання минуло менше року?", a: "Технічно так, але ми не радимо: свіжий ґрунт осідає ще 6–12 місяців, і навіть добрий фундамент може «повести». Якщо потрібно раніше — робимо палевий фундамент до твердого шару, це трохи дорожче, зате не залежить від усадки." },
      ],
    },
    {
      id: "dohliad",
      group: "Догляд і сервіс",
      items: [
        { q: "Як доглядати за полірованим гранітом?", a: "Двічі на рік — вода і м'яка щітка або губка, без кислот, абразивів і засобів для сантехніки. Мох і наліт знімає розчин господарського мила. Раз на 3–5 років можна оновити захисне просочення — робимо це при гарантійному чи плановому виїзді." },
        { q: "Чи можете ви відреставрувати старий пам'ятник?", a: "Так: чистимо, полируємо повторно, оновлюємо або перегравійовуємо напис, замінюємо тріснуті елементи, переставляємо на новий фундамент. Часто дешевше й швидше, ніж робити новий. Виїзд на огляд по Рівненщині й Волині безкоштовний." },
        { q: "Скільки триває гарантія і що вона покриває?", a: `${f.warranty} на камінь, гравіювання, фундамент і монтаж. Просіло, тріснуло, розійшовся шов, злізла позолота — приїжджаємо й виправляємо безкоштовно. Вандалізм і зовнішні пошкодження — відновлюємо за собівартістю.` },
      ],
    },
  ],
  moreLead: "Докладніше:",
  more: { prices: "ціни", howTo: "як замовити", delivery: "доставка й оплата", warranty: "гарантія", guide: "довідник каменю" },
  cta: { title: "Лишилось питання?", text: "Напишіть у Viber або Telegram. Або залиште заявку, і ми передзвонимо в робочий час.", button: "Поставити питання" },
})

const pl = (f: LocalizedFacts): FaqPageCopy => ({
  crumb: "Pytania i odpowiedzi",
  title: "Pytania i odpowiedzi",
  lead: `Wszystko, o co pytają przed zamówieniem: ceny, terminy (pojedynczy — ${f.lead.single}), kamień, fundament, dokumenty i pielęgnacja. Nie znalazłeś swojego pytania — napisz, odpowiemy w ciągu godziny w czasie pracy.`,
  generalPill: "Ceny, terminy, płatność",
  generalEyebrow: "Najczęstsze",
  generalTitle: "Ceny, terminy, płatność, montaż",
  groups: [
    {
      id: "vybir",
      group: "Wybór i projekt",
      items: [
        { q: "Czym różni się gabro od „czarnego granitu”?", a: "To to samo: „czarnym granitem” potocznie nazywa się gabro — osobną skałę, gęstszą i drobnoziarnistą w porównaniu z granitem. Czarnego granitu jako takiego w Ukrainie się nie wydobywa. Na naszych kartach zawsze podana jest prawdziwa nazwa: gabro (złoże Hołowyne lub Buki) albo labradoryt." },
        { q: "Jaki wymiar steli wybrać?", a: "Standard dla pomnika pojedynczego — 80×45×8 cm lub 100×50×8 cm; dla podwójnego — 120×60×8. Większy wymiar jest potrzebny, gdy miejsce jest duże i stela 80 cm się gubi, albo gdy mają być na niej dwa portrety i długie epitafium. Na pomiarze ustawiamy kartonowy szablon w rzeczywistym rozmiarze — tak łatwiej zdecydować niż po liczbach." },
        { q: "Czy można zrobić pomnik według zdjęcia z innej strony?", a: "Tak. Wyślij zdjęcie — zrobimy szkic w swoim kamieniu i podamy cenę. Kształt powtarzamy dokładnie, portret i napis — Twoje. Często wychodzi taniej niż na stronie, z której jest zdjęcie, bo jesteśmy producentem." },
        { q: "Czy robicie kolorowe portrety?", a: "Tak, na dwa sposoby: kolorowy grawer w kamieniu (trwalszy, spokojniejsze tony) albo fotoceramika — płytka ceramiczna z drukiem mocowana na steli (jaśniejsza, od 1 300 ₴). Dla wojskowych najczęściej wybiera się czarno-biały głęboki grawer: jest najtrwalszy." },
      ],
    },
    {
      id: "dokumenty",
      group: "Dokumenty i cmentarz",
      items: [
        { q: "Czy potrzebne jest pozwolenie na postawienie pomnika?", a: "Na większości cmentarzy wystarczy powiadomić administrację i pokazać dokument na miejsce pochówku. W miastach (Równe, Łuck, Kijów) jest regulamin wymiarów i formularz wniosku — znamy te wymogi i załatwiamy to sami. Jeśli cmentarz ma ograniczenia wysokości lub powierzchni, uwzględnimy je w szkicu." },
        { q: "Czy są ulgi lub rekompensata dla rodzin poległych żołnierzy?", a: "Tak, państwo rekompensuje część kosztu pomnika przez organy pomocy społecznej, a wiele gmin i fundacji dopłaca. Kwoty i tryb różnią się w zależności od obwodu. Przygotowujemy pełny pakiet dokumentów do rekompensaty: umowę, fakturę, protokół, dokumentację fotograficzną, i pracujemy z fundacjami bezgotówkowo." },
        { q: "Czy można postawić pomnik, jeśli od pochówku minęło mniej niż rok?", a: "Technicznie tak, ale nie radzimy: świeży grunt osiada jeszcze 6–12 miesięcy i nawet dobry fundament może „pójść”. Jeśli trzeba wcześniej — robimy fundament palowy do twardej warstwy, trochę drożej, ale niezależnie od osiadania." },
      ],
    },
    {
      id: "dohliad",
      group: "Pielęgnacja i serwis",
      items: [
        { q: "Jak dbać o polerowany granit?", a: "Dwa razy w roku — woda i miękka szczotka lub gąbka, bez kwasów, środków ściernych i preparatów do sanitariatów. Mech i nalot usuwa roztwór szarego mydła. Raz na 3–5 lat można odnowić impregnat ochronny — robimy to przy wyjeździe gwarancyjnym lub planowym." },
        { q: "Czy możecie odrestaurować stary pomnik?", a: "Tak: czyścimy, polerujemy ponownie, odnawiamy lub grawerujemy napis na nowo, wymieniamy pęknięte elementy, przestawiamy na nowy fundament. Często taniej i szybciej niż robić nowy. Dojazd na oględziny w obwodach rówieńskim i wołyńskim bezpłatny." },
        { q: "Jak długo trwa gwarancja i co obejmuje?", a: `${f.warranty} na kamień, grawer, fundament i montaż. Osiadło, pękło, rozeszła się spoina, zeszło złocenie — przyjeżdżamy i naprawiamy bezpłatnie. Wandalizm i uszkodzenia zewnętrzne — odnawiamy po kosztach.` },
      ],
    },
  ],
  moreLead: "Więcej:",
  more: { prices: "ceny", howTo: "jak zamówić", delivery: "dostawa i płatność", warranty: "gwarancja", guide: "przewodnik po kamieniu" },
  cta: { title: "Zostało pytanie?", text: "Napisz na Viberze lub Telegramie. Albo zostaw zgłoszenie, a oddzwonimy w godzinach pracy.", button: "Zadaj pytanie" },
})

const en = (f: LocalizedFacts): FaqPageCopy => ({
  crumb: "Questions and answers",
  title: "Questions and answers",
  lead: `Everything people ask before ordering: prices, lead times (a single monument takes ${f.lead.single}), stone, foundation, documents and care. Can't find yours? Write to us and we'll reply within an hour during working hours.`,
  generalPill: "Prices, lead times, payment",
  generalEyebrow: "Most common",
  generalTitle: "Prices, lead times, payment, installation",
  groups: [
    {
      id: "vybir",
      group: "Choice and design",
      items: [
        { q: "What is the difference between gabbro and “black granite”?", a: "They are the same thing: “black granite” is the everyday name for gabbro, a separate rock that is denser and finer-grained than granite. Black granite as such is not quarried in Ukraine. Our product pages always give the real name: gabbro (Holovyne or Buky quarry) or labradorite." },
        { q: "What size of stele should I choose?", a: "The standard for a single monument is 80×45×8 cm or 100×50×8 cm; for a double, 120×60×8. A larger size is needed when the plot is big and an 80 cm stele gets lost, or when it must carry two portraits and a long epitaph. At measurement we set up a full-size cardboard template, which makes the decision easier than numbers." },
        { q: "Can you make a monument from a photo on another website?", a: "Yes. Send the photo and we'll draw a sketch in our stone and name the price. We copy the shape exactly; the portrait and inscription are yours. It often works out cheaper than on the site the photo came from, because we are the manufacturer." },
        { q: "Do you make colour portraits?", a: "Yes, in two ways: colour engraving on the stone (more durable, softer tones) or photo ceramic, a printed ceramic plate fixed to the stele (brighter, from 1,300 ₴). For soldiers, deep black-and-white engraving is chosen most often: it lasts longest." },
      ],
    },
    {
      id: "dokumenty",
      group: "Documents and the cemetery",
      items: [
        { q: "Do I need a permit to install a monument?", a: "At most cemeteries it's enough to notify the administration and show the document for the burial plot. Cities (Rivne, Lutsk, Kyiv) have size regulations and an application form; we know these requirements and handle the paperwork ourselves. If the cemetery limits height or area, we take that into account in the sketch." },
        { q: "Are there benefits or compensation for the families of fallen soldiers?", a: "Yes, the state compensates part of the cost of the monument through social protection bodies, and a number of communities and foundations pay extra. Amounts and procedures differ by region. We prepare the full document package for compensation: contract, invoice, acceptance certificate, photo record, and we work with foundations by bank transfer." },
        { q: "Can a monument be installed less than a year after the burial?", a: "Technically yes, but we don't advise it: fresh soil keeps settling for another 6–12 months and even a good foundation can shift. If it must be sooner, we build a pile foundation down to the firm layer; it costs a little more but does not depend on settlement." },
      ],
    },
    {
      id: "dohliad",
      group: "Care and service",
      items: [
        { q: "How do I care for polished granite?", a: "Twice a year: water and a soft brush or sponge, no acids, abrasives or bathroom cleaners. Moss and deposits come off with a solution of plain soap. Every 3–5 years the protective sealant can be renewed; we do it during a warranty or scheduled visit." },
        { q: "Can you restore an old monument?", a: "Yes: we clean, re-polish, renew or re-engrave the inscription, replace cracked elements and move it onto a new foundation. It is often cheaper and faster than making a new one. Travel for inspection in the Rivne and Volyn regions is free." },
        { q: "How long is the warranty and what does it cover?", a: `${f.warranty} on the stone, engraving, foundation and installation. If it sinks, cracks, a joint opens or gilding peels, we come and fix it free of charge. Vandalism and external damage we repair at cost.` },
      ],
    },
  ],
  moreLead: "More:",
  more: { prices: "prices", howTo: "how to order", delivery: "delivery and payment", warranty: "warranty", guide: "stone guide" },
  cta: { title: "Still have a question?", text: "Write to us on Viber or Telegram. Or leave a request and we'll call you back during working hours.", button: "Ask a question" },
})

const de = (f: LocalizedFacts): FaqPageCopy => ({
  crumb: "Fragen und Antworten",
  title: "Fragen und Antworten",
  lead: `Alles, was vor der Bestellung gefragt wird: Preise, Fristen (Einzelgrabmal — ${f.lead.single}), Stein, Fundament, Dokumente und Pflege. Nicht gefunden? Schreiben Sie uns — wir antworten während der Arbeitszeit innerhalb einer Stunde.`,
  generalPill: "Preise, Fristen, Zahlung",
  generalEyebrow: "Am häufigsten",
  generalTitle: "Preise, Fristen, Zahlung, Montage",
  groups: [
    {
      id: "vybir",
      group: "Auswahl und Gestaltung",
      items: [
        { q: "Worin unterscheidet sich Gabbro von „schwarzem Granit“?", a: "Es ist dasselbe: „Schwarzer Granit“ ist die umgangssprachliche Bezeichnung für Gabbro — ein eigenes Gestein, dichter und feinkörniger als Granit. Schwarzen Granit als solchen gibt es in der Ukraine nicht. Auf unseren Produktseiten steht immer der echte Name: Gabbro (Vorkommen Holowyne oder Buky) oder Labradorit." },
        { q: "Welche Stelengröße soll ich wählen?", a: "Standard für ein Einzelgrabmal sind 80×45×8 cm oder 100×50×8 cm; für ein Doppelgrabmal 120×60×8. Eine größere Stele braucht es, wenn die Grabstelle groß ist und 80 cm untergehen, oder wenn zwei Porträts und ein langes Epitaph Platz finden müssen. Beim Aufmaß stellen wir eine Kartonschablone in Originalgröße auf — so lässt es sich leichter entscheiden als nach Zahlen." },
        { q: "Können Sie ein Grabmal nach einem Foto von einer anderen Website fertigen?", a: "Ja. Senden Sie das Foto — wir fertigen eine Skizze in unserem Stein und nennen den Preis. Die Form übernehmen wir exakt, Porträt und Inschrift sind Ihre. Oft wird es günstiger als auf der Website, von der das Foto stammt, weil wir der Hersteller sind." },
        { q: "Machen Sie farbige Porträts?", a: "Ja, auf zwei Arten: Farbgravur im Stein (haltbarer, ruhigere Töne) oder Fotokeramik — eine bedruckte Keramikplatte, die an der Stele befestigt wird (leuchtender, ab 1.300 ₴). Für Soldaten wird meist die tiefe Schwarz-Weiß-Gravur gewählt: Sie hält am längsten." },
      ],
    },
    {
      id: "dokumenty",
      group: "Dokumente und Friedhof",
      items: [
        { q: "Braucht man eine Genehmigung für die Aufstellung?", a: "Auf den meisten Friedhöfen genügt es, die Verwaltung zu informieren und das Dokument über die Grabstelle vorzulegen. In Städten (Riwne, Luzk, Kyjiw) gibt es Größenvorgaben und ein Antragsformular — wir kennen diese Anforderungen und erledigen das selbst. Hat der Friedhof Höhen- oder Flächenbeschränkungen, berücksichtigen wir sie in der Skizze." },
        { q: "Gibt es Vergünstigungen oder Entschädigungen für Familien gefallener Soldaten?", a: "Ja, der Staat erstattet über die Sozialämter einen Teil der Grabmalkosten, und einige Gemeinden und Stiftungen zahlen zusätzlich. Beträge und Verfahren unterscheiden sich je nach Region. Wir stellen den vollständigen Dokumentensatz für die Erstattung zusammen: Vertrag, Rechnung, Abnahmeprotokoll, Fotodokumentation, und arbeiten mit Stiftungen per Überweisung." },
        { q: "Kann ein Grabmal aufgestellt werden, wenn seit der Beisetzung weniger als ein Jahr vergangen ist?", a: "Technisch ja, aber wir raten ab: Frischer Boden setzt sich noch 6–12 Monate, und selbst ein gutes Fundament kann sich verziehen. Wenn es früher sein muss, bauen wir ein Pfahlfundament bis zur festen Schicht — etwas teurer, aber unabhängig von der Setzung." },
      ],
    },
    {
      id: "dohliad",
      group: "Pflege und Service",
      items: [
        { q: "Wie pflegt man polierten Granit?", a: "Zweimal im Jahr: Wasser und eine weiche Bürste oder ein Schwamm, ohne Säuren, Scheuermittel oder Sanitärreiniger. Moos und Beläge löst eine Kernseifenlösung. Alle 3–5 Jahre kann die Schutzimprägnierung erneuert werden — das machen wir bei einem Garantie- oder Planbesuch." },
        { q: "Können Sie ein altes Grabmal restaurieren?", a: "Ja: Wir reinigen, polieren nach, erneuern oder gravieren die Inschrift neu, ersetzen gerissene Elemente und setzen es auf ein neues Fundament. Oft günstiger und schneller als ein neues. Die Anfahrt zur Besichtigung in den Regionen Riwne und Wolhynien ist kostenlos." },
        { q: "Wie lange gilt die Garantie und was deckt sie ab?", a: `${f.warranty} auf Stein, Gravur, Fundament und Montage. Abgesackt, gerissen, Fuge geöffnet, Vergoldung abgeblättert — wir kommen und beheben es kostenlos. Vandalismus und äußere Schäden beheben wir zum Selbstkostenpreis.` },
      ],
    },
  ],
  moreLead: "Mehr dazu:",
  more: { prices: "Preise", howTo: "So bestellen Sie", delivery: "Lieferung und Zahlung", warranty: "Garantie", guide: "Steinführer" },
  cta: { title: "Noch eine Frage?", text: "Schreiben Sie uns per Viber oder Telegram. Oder hinterlassen Sie eine Anfrage, und wir rufen während der Arbeitszeit zurück.", button: "Frage stellen" },
})

const lt = (f: LocalizedFacts): FaqPageCopy => ({
  crumb: "Klausimai ir atsakymai",
  title: "Klausimai ir atsakymai",
  lead: `Viskas, ko klausia prieš užsakymą: kainos, terminai (vienvietis — ${f.lead.single}), akmuo, pamatas, dokumentai ir priežiūra. Neradote savo — parašykite, atsakysime per valandą darbo laiku.`,
  generalPill: "Kainos, terminai, apmokėjimas",
  generalEyebrow: "Dažniausi",
  generalTitle: "Kainos, terminai, apmokėjimas, montavimas",
  groups: [
    {
      id: "vybir",
      group: "Pasirinkimas ir dizainas",
      items: [
        { q: "Kuo skiriasi gabras nuo „juodo granito“?", a: "Tai tas pats: „juodu granitu“ buityje vadinamas gabras — atskira uoliena, tankesnė ir smulkiagrūdiškesnė už granitą. Juodo granito kaip tokio Ukrainoje nekasama. Mūsų kortelėse visada nurodytas tikras pavadinimas: gabras (Holovynės arba Bukų karjeras) arba labradoritas." },
        { q: "Kokį stelos dydį pasirinkti?", a: "Standartas vienviečiam paminklui — 80×45×8 cm arba 100×50×8 cm; dviviečiam — 120×60×8. Didesnis dydis reikalingas, kai kapavietė didelė ir 80 cm stela pasimeta, arba kai joje turi būti du portretai ir ilga epitafija. Matuodami pastatome kartoninį šabloną tikro dydžio — taip lengviau apsispręsti nei pagal skaičius." },
        { q: "Ar galima pagaminti paminklą pagal nuotrauką iš kitos svetainės?", a: "Taip. Atsiųskite nuotrauką — padarysime eskizą iš savo akmens ir pasakysime kainą. Formą pakartojame tiksliai, portretas ir užrašas — jūsų. Dažnai išeina pigiau nei svetainėje, iš kurios nuotrauka, nes esame gamintojas." },
        { q: "Ar darote spalvotus portretus?", a: "Taip, dviem būdais: spalvotas graviravimas akmenyje (patvaresnis, ramesni tonai) arba fotokeramika — keraminė plokštelė su spaudiniu, tvirtinama ant stelos (ryškesnė, nuo 1 300 ₴). Kariams dažniausiai renkamas juodai baltas gilus graviravimas: jis ilgaamžiškiausias." },
      ],
    },
    {
      id: "dokumenty",
      group: "Dokumentai ir kapinės",
      items: [
        { q: "Ar reikia leidimo paminklui statyti?", a: "Daugumoje kapinių pakanka pranešti administracijai ir parodyti dokumentą dėl laidojimo vietos. Miestuose (Rivnė, Luckas, Kyjivas) yra matmenų reglamentas ir prašymo forma — žinome šiuos reikalavimus ir įforminame patys. Jei kapinės riboja aukštį ar plotą, atsižvelgsime į tai eskize." },
        { q: "Ar yra lengvatų ar kompensacijų žuvusių karių šeimoms?", a: "Taip, valstybė kompensuoja dalį paminklo kainos per socialinės apsaugos įstaigas, o kai kurios bendruomenės ir fondai primoka. Sumos ir tvarka skiriasi pagal sritis. Rengiame visą dokumentų paketą kompensacijai: sutartį, sąskaitą, aktą, fotofiksaciją, ir su fondais dirbame pavedimu." },
        { q: "Ar galima statyti paminklą, jei po laidotuvių praėjo mažiau nei metai?", a: "Techniškai taip, bet nepatariame: šviežias gruntas sėda dar 6–12 mėnesių, ir net geras pamatas gali „pasivesti“. Jei reikia anksčiau — darome polinį pamatą iki tvirto sluoksnio, tai kiek brangiau, bet nepriklauso nuo sėdimo." },
      ],
    },
    {
      id: "dohliad",
      group: "Priežiūra ir servisas",
      items: [
        { q: "Kaip prižiūrėti poliruotą granitą?", a: "Du kartus per metus — vanduo ir minkštas šepetys ar kempinė, be rūgščių, abrazyvų ir santechnikos priemonių. Samanas ir apnašas nuima ūkinio muilo tirpalas. Kartą per 3–5 metus galima atnaujinti apsauginę impregnaciją — tai darome garantinio ar planinio atvykimo metu." },
        { q: "Ar galite restauruoti seną paminklą?", a: "Taip: valome, poliruojame iš naujo, atnaujiname arba iš naujo graviruojame užrašą, keičiame įtrūkusius elementus, perstatome ant naujo pamato. Dažnai pigiau ir greičiau nei daryti naują. Atvykimas apžiūrai Rivnės ir Voluinės srityse nemokamas." },
        { q: "Kiek trunka garantija ir ką ji apima?", a: `${f.warranty} akmeniui, graviravimui, pamatui ir montavimui. Nusėdo, įskilo, išsiskyrė siūlė, nusilupo paauksavimas — atvykstame ir pataisome nemokamai. Vandalizmą ir išorinius pažeidimus atkuriame savikaina.` },
      ],
    },
  ],
  moreLead: "Išsamiau:",
  more: { prices: "kainos", howTo: "kaip užsakyti", delivery: "pristatymas ir apmokėjimas", warranty: "garantija", guide: "akmens žinynas" },
  cta: { title: "Liko klausimas?", text: "Parašykite per Viber arba Telegram. Arba palikite užklausą, ir perskambinsime darbo laiku.", button: "Užduoti klausimą" },
})

export const FAQ_PAGE_COPY: Record<Locale, (f: LocalizedFacts) => FaqPageCopy> = { uk, pl, en, de, lt }
