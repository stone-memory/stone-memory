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
    text: "Пам'ятник для мами вийшов саме таким, як на ескізі. Замір зробили швидко, встановили акуратно, прибрали за собою.",
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
    text: "Pomnik dla ojca wykonany dokładnie według projektu. Świetna jakość, terminowo, rozsądna cena. Polecam.",
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
// 12 найпоширеніших реальних запитань — на основі того, що питають клієнти
// у чаті, по телефону та на ярмарках. Без юридичних формулювань.
//
// Структура: для кожного питання заповнюємо всі 5 мов вручну,
// щоб клієнт у Польщі/Литві бачив повноцінну відповідь, а не mock-переклад.

export type SeedFaq = {
  id: string
  q: Record<Locale, string>
  a: Record<Locale, string>
  order: number
  hidden?: boolean
}

export const seedFaq: SeedFaq[] = [
  {
    id: "faq-lead-time",
    order: 0,
    q: {
      uk: "За скільки виготовите пам'ятник?",
      pl: "W jakim czasie wykonacie pomnik?",
      en: "How long does it take to make a monument?",
      de: "Wie lange dauert die Herstellung eines Grabmals?",
      lt: "Per kiek laiko pagaminsite paminklą?",
    },
    a: {
      uk: "Стандартний пам'ятник з гравіюванням і монтажем — 5–7 тижнів від підписання ескізу. Подвійний або з огорожею і плиткою — 7–10 тижнів. У сезон (квітень–червень, серпень–жовтень) черга може бути на 2 тижні довшою. Якщо терміново — підкажемо позиції з нашого складу, які можна адаптувати швидше.",
      pl: "Standardowy pomnik z grawerunkiem i montażem — 5–7 tygodni od podpisania szkicu. Podwójny lub z ogrodzeniem i płytkami — 7–10 tygodni. W sezonie (kwiecień–czerwiec, sierpień–październik) kolejka może być dłuższa o 2 tygodnie. Jeśli pilne — pokażemy pozycje z magazynu, które można dostosować szybciej.",
      en: "A standard monument with engraving and installation takes 5–7 weeks from sketch approval. A double monument or one with fencing and tiles — 7–10 weeks. In peak season (April–June, August–October) the queue may add 2 weeks. If urgent, we can suggest stock items that can be adapted faster.",
      de: "Ein Standard-Grabmal mit Gravur und Montage dauert 5–7 Wochen ab Skizzenfreigabe. Ein Doppelgrabmal oder eines mit Einfassung und Platten — 7–10 Wochen. In der Hauptsaison (April–Juni, August–Oktober) kann die Warteschlange 2 Wochen länger sein. Bei Eile schlagen wir Lagerware vor, die sich schneller anpassen lässt.",
      lt: "Standartinis paminklas su graviravimu ir montavimu — 5–7 savaitės nuo eskizo patvirtinimo. Dvivietis arba su tvorele ir plytelėmis — 7–10 savaičių. Sezono metu (balandis–birželis, rugpjūtis–spalis) eilė gali pailgėti 2 savaitėmis. Jei skubu — parinksime sandėlio pozicijas, kurias galima pritaikyti greičiau.",
    },
  },
  {
    id: "faq-warranty",
    order: 1,
    q: {
      uk: "Яка у вас гарантія?",
      pl: "Jaka jest gwarancja?",
      en: "What is your warranty?",
      de: "Welche Garantie geben Sie?",
      lt: "Kokia jūsų garantija?",
    },
    a: {
      uk: "Даємо 5 років гарантії на все — фундамент, монтаж, камінь і гравіювання. Якщо за цей час щось просіло, тріснуло або злізло гравіювання — приїжджаємо безкоштовно і виправляємо. Якщо камінь розбили вандали або сталося щось зовнішнє — допомагаємо за прайсом, без націнки.",
      pl: "Dajemy 5 lat gwarancji na wszystko — fundament, montaż, kamień i grawerunek. Jeśli w tym czasie coś osiądzie, pęknie albo zetrze się grawer — przyjeżdżamy bezpłatnie i naprawiamy. Jeśli kamień zniszczyli wandale lub zdarzyło się coś zewnętrznego — pomagamy w cenie cennikowej, bez narzutu.",
      en: "We give a 5-year warranty on everything — foundation, installation, stone and engraving. If anything sinks, cracks or the engraving fades during this period, we come and fix it for free. If the stone is damaged by vandals or some external event — we help at cost, without markup.",
      de: "Wir geben 5 Jahre Garantie auf alles — Fundament, Montage, Stein und Gravur. Setzt sich etwas, reißt oder verblasst die Gravur in dieser Zeit, kommen wir kostenlos und reparieren. Bei Vandalismus oder externen Schäden helfen wir zum Selbstkostenpreis, ohne Aufschlag.",
      lt: "Suteikiame 5 metų garantiją viskam — pamatui, montavimui, akmeniui ir graviravimui. Jei per šį laiką kas nors nusėdo, įtrūko ar nusitrynė graviravimas — atvažiuojame nemokamai ir taisome. Jei akmenį sugadino vandalai ar nutiko kažkas iš išorės — padedame savikainos kaina, be antkainio.",
    },
  },
  {
    id: "faq-price-range",
    order: 2,
    q: {
      uk: "Скільки коштує пам'ятник?",
      pl: "Ile kosztuje pomnik?",
      en: "How much does a monument cost?",
      de: "Was kostet ein Grabmal?",
      lt: "Kiek kainuoja paminklas?",
    },
    a: {
      uk: "Простий одиночний пам'ятник з габро з гравіюванням — від 18 000 ₴ (≈€400). Подвійний — від 35 000 ₴ (≈€780). Комплекс з плиткою, огорожею і лавою — 60 000–150 000 ₴ (€1 300–3 300). Скульптури і ексклюзив — від 200 000 ₴. Точна ціна після фото ділянки і узгодження ескізу — розраховуємо безкоштовно за 24 години.",
      pl: "Prosty pojedynczy pomnik z gabra z grawerunkiem — od 18 000 UAH (≈€400). Podwójny — od 35 000 UAH (≈€780). Kompleks z płytkami, ogrodzeniem i ławką — 60 000–150 000 UAH (€1 300–3 300). Rzeźby i projekty ekskluzywne — od 200 000 UAH. Dokładna cena po zdjęciach miejsca i akceptacji szkicu — wyceniamy bezpłatnie w 24 godziny.",
      en: "A simple single monument in gabbro with engraving starts at 18 000 UAH (≈€400). A double — from 35 000 UAH (≈€780). A complex with tiles, fencing and a bench — 60 000–150 000 UAH (€1 300–3 300). Sculpture and exclusive work — from 200 000 UAH. Exact pricing after seeing photos of the plot and approving the sketch — free quote within 24 hours.",
      de: "Ein einfaches Einzelgrabmal aus Gabbro mit Gravur ab 18 000 UAH (≈€400). Ein Doppelgrabmal ab 35 000 UAH (≈€780). Ein Komplex mit Platten, Einfassung und Bank — 60 000–150 000 UAH (€1 300–3 300). Skulpturen und Exklusivarbeiten — ab 200 000 UAH. Genauer Preis nach Fotos der Stelle und Skizzen-Freigabe — kostenlos in 24 Stunden.",
      lt: "Paprastas vienvietis paminklas iš gabbro su graviravimu — nuo 18 000 UAH (≈€400). Dvivietis — nuo 35 000 UAH (≈€780). Kompleksas su plytelėmis, tvorele ir suoleliu — 60 000–150 000 UAH (€1 300–3 300). Skulptūros ir išskirtiniai darbai — nuo 200 000 UAH. Tiksli kaina po sklypo nuotraukų ir eskizo patvirtinimo — nemokamai per 24 valandas.",
    },
  },
  {
    id: "faq-installation-area",
    order: 3,
    q: {
      uk: "Куди ви виїжджаєте на монтаж?",
      pl: "Gdzie jeździcie z montażem?",
      en: "Where do you install?",
      de: "Wo montieren Sie?",
      lt: "Kur važiuojate montuoti?",
    },
    a: {
      uk: "По всій Україні — без обмежень. Виїзд по Рівненській і Волинській областях — безкоштовний. По інших регіонах України — за фактичним пробігом (3–5 ₴/км). По ЄС возимо у Польщу, Німеччину, Литву, Чехію — там працюємо з місцевими бригадами для встановлення, узгоджуємо логістику з замовником.",
      pl: "Po całej Ukrainie — bez ograniczeń. Wyjazd po obwodzie rówieńskim i wołyńskim — bezpłatny. Po innych regionach Ukrainy — wg rzeczywistego przebiegu (3–5 UAH/km). Po UE wozimy do Polski, Niemiec, Litwy, Czech — tam pracujemy z lokalnymi ekipami do ustawienia, logistykę uzgadniamy z klientem.",
      en: "Across all of Ukraine — no limits. Travel within Rivne and Volyn regions is free. Other Ukrainian regions — at actual mileage (3–5 UAH/km). In the EU we ship to Poland, Germany, Lithuania, Czech Republic — installation done with local crews, logistics agreed with the client.",
      de: "In der gesamten Ukraine — ohne Einschränkungen. Anfahrt in den Oblasten Riwne und Wolyn — kostenlos. Andere ukrainische Regionen — nach tatsächlichem Kilometerstand (3–5 UAH/km). In der EU liefern wir nach Polen, Deutschland, Litauen, Tschechien — Montage mit lokalen Teams, Logistik nach Absprache.",
      lt: "Visoje Ukrainoje — be apribojimų. Išvykimas Rivnės ir Voluinės srityse — nemokamas. Kituose Ukrainos regionuose — pagal faktinę ridą (3–5 UAH/km). ES vežame į Lenkiją, Vokietiją, Lietuvą, Čekiją — ten dirbame su vietos brigadomis montuojant, logistiką derinime su klientu.",
    },
  },
  {
    id: "faq-photo-engraving",
    order: 4,
    q: {
      uk: "Чи можна зробити портрет з маленького або старого фото?",
      pl: "Czy zrobicie portret ze starego lub małego zdjęcia?",
      en: "Can you make a portrait from a small or old photo?",
      de: "Können Sie ein Porträt aus einem kleinen oder alten Foto machen?",
      lt: "Ar galite padaryti portretą iš senos ar mažos nuotraukos?",
    },
    a: {
      uk: "Так, у нас є художник-ретушер, який працює з архівними і пошкодженими фото. Мінімум: розмір обличчя 2×2 см на оригіналі, помірна різкість. Робимо ретуш у Photoshop, реставруємо очі, добавляємо контраст. Перед гравіюванням показуємо макет — якщо схожість недостатня, перероблюємо безкоштовно. Гравіюємо лазером на чорному граніті — найкраща деталізація.",
      pl: "Tak, mamy artystę-retuszera, który pracuje z archiwalnymi i uszkodzonymi zdjęciami. Minimum: rozmiar twarzy 2×2 cm w oryginale, umiarkowana ostrość. Retuszujemy w Photoshopie, odnawiamy oczy, dodajemy kontrast. Przed grawerunkiem pokazujemy makietę — jeśli podobieństwo niewystarczające, przerabiamy bezpłatnie. Grawerujemy laserem na czarnym granicie — najlepsza szczegółowość.",
      en: "Yes, we have a retoucher who works with archival and damaged photos. Minimum: face size 2×2 cm in the original, moderate sharpness. We retouch in Photoshop, restore eyes, add contrast. Before engraving we show a mock-up — if the likeness is not good enough, we redo it for free. We laser-engrave on black granite — best detail level.",
      de: "Ja, wir haben einen Retuscheur, der mit Archiv- und beschädigten Fotos arbeitet. Minimum: Gesichtsgröße 2×2 cm im Original, moderate Schärfe. Wir retuschieren in Photoshop, stellen Augen wieder her, fügen Kontrast hinzu. Vor der Gravur zeigen wir einen Entwurf — passt die Ähnlichkeit nicht, machen wir es kostenlos neu. Gravieren mit Laser auf schwarzem Granit — beste Detailtiefe.",
      lt: "Taip, turime retušuotoją, kuris dirba su archyvinėmis ir pažeistomis nuotraukomis. Minimumas: veido dydis 2×2 cm originale, vidutinis ryškumas. Retušuojame Photoshope, atkuriame akis, pridedame kontrasto. Prieš graviravimą rodome maketą — jei panašumas nepakankamas, perdarome nemokamai. Graviruojame lazeriu ant juodo granito — geriausias detalumas.",
    },
  },
  {
    id: "faq-stone-types",
    order: 5,
    q: {
      uk: "Який камінь обрати: габро, граніт, мармур чи лабрадорит?",
      pl: "Jaki kamień wybrać: gabro, granit, marmur czy labradoryt?",
      en: "Which stone to pick: gabbro, granite, marble or labradorite?",
      de: "Welcher Stein: Gabbro, Granit, Marmor oder Labradorit?",
      lt: "Kurį akmenį pasirinkti: gabbro, granitą, marmurą ar labradoritą?",
    },
    a: {
      uk: "Габро — найпопулярніший для пам'ятників: глибокий чорний, найкраще тримає гравіювання, ціна оптимальна. Граніт — універсал: кольори від сірого до червоного, дуже міцний, для відкритих ділянок ідеальний. Мармур — для внутрішніх інтер'єрів і захищених від дощу місць (на пам'ятниках з часом сіріє). Лабрадорит — преміум: блакитні переливи, дороже за габро, але унікальний вигляд.",
      pl: "Gabro — najpopularniejsze do pomników: głęboka czerń, najlepiej trzyma grawerunek, optymalna cena. Granit — uniwersalny: kolory od szarego po czerwony, bardzo trwały, idealny na otwarte miejsca. Marmur — do wnętrz i miejsc chronionych przed deszczem (na pomnikach z czasem szarzeje). Labradoryt — premium: niebieskie przebłyski, droższy od gabra, ale unikalny wygląd.",
      en: "Gabbro is the most popular for monuments: deep black, holds engraving best, optimal price. Granite is universal: colours from grey to red, very durable, perfect for open spaces. Marble for indoor interiors and rain-protected places (on monuments it greys over time). Labradorite is premium: blue iridescence, more expensive than gabbro but unique look.",
      de: "Gabbro ist am beliebtesten für Grabmale: tiefes Schwarz, hält Gravur am besten, optimaler Preis. Granit ist universell: Farben von Grau bis Rot, sehr beständig, ideal für offene Plätze. Marmor für Innenräume und vor Regen geschützte Orte (auf Grabmalen vergraut er mit der Zeit). Labradorit ist Premium: blaue Reflexe, teurer als Gabbro, aber einzigartig.",
      lt: "Gabbro — populiariausias paminklams: gilus juodumas, geriausiai laiko graviravimą, optimali kaina. Granitas — universalus: spalvos nuo pilkos iki raudonos, labai patvarus, idealus atviroms erdvėms. Marmuras — vidaus interjerams ir nuo lietaus apsaugotoms vietoms (ant paminklų laikui bėgant pilksta). Labradoritas — premium: mėlyni atspindžiai, brangesnis už gabbro, bet unikalus.",
    },
  },
  {
    id: "faq-deposit",
    order: 6,
    q: {
      uk: "Чи треба передоплата? Як ви приймаєте оплату?",
      pl: "Czy potrzebna jest zaliczka? Jak przyjmujecie płatność?",
      en: "Do you need a deposit? How do you take payment?",
      de: "Brauchen Sie eine Anzahlung? Wie nehmen Sie Zahlung entgegen?",
      lt: "Ar reikia avanso? Kaip priimate apmokėjimą?",
    },
    a: {
      uk: "Передоплата 30% при підписанні ескізу — на матеріали і початок робіт. 50% — після того як готовий камінь і ви його прийняли (можна відеоконтролем або на нашому виробництві). Решта 20% — після монтажу. Готівка, картка, банківський переказ на ФОП. Для ЄС — переказ у євро на IBAN, надсилаємо рахунок-фактуру.",
      pl: "Zaliczka 30% przy podpisaniu szkicu — na materiały i rozpoczęcie pracy. 50% — po przygotowaniu kamienia i akceptacji (można wideo-kontrolą lub osobiście u nas). Pozostałe 20% — po montażu. Gotówka, karta, przelew bankowy na firmę. Dla UE — przelew w euro na IBAN, wystawiamy fakturę.",
      en: "30% deposit when signing the sketch — for materials and starting work. 50% — when the stone is ready and you've approved it (video review or in-person visit). The remaining 20% — after installation. Cash, card, bank transfer. For the EU — wire in euros to IBAN, we issue an invoice.",
      de: "30% Anzahlung bei Skizzen-Unterzeichnung — für Material und Arbeitsbeginn. 50% — wenn der Stein fertig ist und Sie ihn freigegeben haben (Videokontrolle oder vor Ort). Die restlichen 20% — nach der Montage. Bar, Karte, Banküberweisung. Für EU — Euro-Überweisung auf IBAN, Rechnung wird ausgestellt.",
      lt: "30% avansas pasirašant eskizą — medžiagoms ir darbų pradžiai. 50% — kai akmuo paruoštas ir jį priėmėte (vaizdo kontrolė arba apsilankymas mūsų ceche). Likę 20% — po montavimo. Grynais, kortele, banko pavedimu. ES — pavedimu eurais į IBAN, išrašome sąskaitą.",
    },
  },
  {
    id: "faq-design-changes",
    order: 7,
    q: {
      uk: "Чи можна вносити зміни в ескіз під час виготовлення?",
      pl: "Czy można wprowadzać zmiany w szkicu podczas produkcji?",
      en: "Can I make changes to the sketch during production?",
      de: "Kann ich während der Fertigung Änderungen am Entwurf machen?",
      lt: "Ar galima keisti eskizą gamybos metu?",
    },
    a: {
      uk: "До початку обробки каменю — зміни безкоштовні (це перший тиждень після затвердження). Після — залежить від етапу. Поміняти шрифт чи додати слово — зазвичай безкоштовно. Перегравірувати ім'я або поміняти портрет — це нова заготовка, додатково 20–40% від базової ціни. Тому ми тричі узгоджуємо ескіз перед підписанням, щоб уникнути таких ситуацій.",
      pl: "Przed rozpoczęciem obróbki kamienia — zmiany bezpłatne (pierwszy tydzień po akceptacji). Później — zależy od etapu. Zmiana czcionki lub dodanie słowa — zwykle bezpłatne. Przegrawerowanie imienia lub zmiana portretu — to nowa płyta, dodatkowo 20–40% ceny bazowej. Dlatego trzykrotnie uzgadniamy szkic przed podpisaniem.",
      en: "Before stone processing begins, changes are free (the first week after approval). Later it depends on the stage. Changing a font or adding a word — usually free. Re-engraving a name or replacing a portrait — that's a new blank, an additional 20–40% of the base price. That's why we review the sketch three times before signing.",
      de: "Vor Beginn der Steinbearbeitung — Änderungen kostenlos (erste Woche nach Freigabe). Danach hängt es von der Phase ab. Schriftart ändern oder ein Wort hinzufügen — meist kostenlos. Namen neu gravieren oder Porträt ersetzen — das ist ein neuer Rohling, zusätzlich 20–40% des Grundpreises. Deshalb stimmen wir die Skizze dreimal vor der Unterschrift ab.",
      lt: "Iki akmens apdirbimo pradžios — pakeitimai nemokami (pirma savaitė po patvirtinimo). Vėliau priklauso nuo etapo. Pakeisti šriftą ar pridėti žodį — paprastai nemokama. Iš naujo graviruoti vardą ar pakeisti portretą — tai nauja ruošinys, papildomai 20–40% bazinės kainos. Todėl tris kartus aptariam eskizą prieš pasirašymą.",
    },
  },
  {
    id: "faq-foundation",
    order: 8,
    q: {
      uk: "Як ви робите фундамент? Чи не просяде?",
      pl: "Jak robicie fundament? Czy nie osiądzie?",
      en: "How do you do the foundation? Won't it sink?",
      de: "Wie bauen Sie das Fundament? Wird es nicht absacken?",
      lt: "Kaip darote pamatą? Ar nenusės?",
    },
    a: {
      uk: "Перед монтажем робимо геологію ділянки — копаємо шурф 60–80 см щоб побачити склад ґрунту. Для глини і піску — бетонний пояс по периметру з армуванням. Для торфу або насипного — паля з арматури глибиною до твердого шару. Бетон марки М300 з гідроізоляцією. Перевіряємо лазерним рівнем — допуск 2 мм на 1 м. Гарантуємо що не просяде в межах 5 років, а на практиці тримається 30+.",
      pl: "Przed montażem robimy geologię miejsca — kopiemy szurf 60–80 cm, by zobaczyć skład gruntu. Dla gliny i piasku — pas betonowy po obwodzie ze zbrojeniem. Dla torfu lub nasypu — pal zbrojeniowy do twardej warstwy. Beton M300 z hydroizolacją. Sprawdzamy laserem — tolerancja 2 mm na 1 m. Gwarantujemy brak osiadania w 5 lat, w praktyce trzyma 30+.",
      en: "Before installation we do site geology — we dig a 60–80 cm pit to see the soil composition. For clay and sand — a concrete perimeter belt with rebar. For peat or fill — a rebar pile to the solid layer. M300 concrete with waterproofing. We check with a laser level — 2 mm tolerance per metre. We guarantee no settling for 5 years; in practice it holds 30+.",
      de: "Vor der Montage prüfen wir den Boden — wir graben 60–80 cm tief, um die Bodenzusammensetzung zu sehen. Für Lehm und Sand — Betongürtel mit Bewehrung. Für Torf oder Aufschüttung — Bewehrungspfahl bis zur festen Schicht. Beton M300 mit Abdichtung. Mit Laser-Wasserwaage geprüft — 2 mm Toleranz pro Meter. Wir garantieren 5 Jahre kein Setzen, praktisch hält es 30+.",
      lt: "Prieš montavimą atliekame geologiją — kasame 60–80 cm šurfą pamatyti gruntą. Moliui ir smėliui — betoninis perimetro juosta su armatūra. Durpėms ar pilamai žemei — armatūros polis iki kieto sluoksnio. Betonas M300 su hidroizoliacija. Tikriname lazeriu — 2 mm leistinas nuokrypis 1 m. Garantuojame nenuses 5 metus, praktiškai laiko 30+.",
    },
  },
  {
    id: "faq-care",
    order: 9,
    q: {
      uk: "Як доглядати за пам'ятником, щоб довго зберігав вигляд?",
      pl: "Jak dbać o pomnik, aby długo zachował wygląd?",
      en: "How do I care for the monument to keep it looking good?",
      de: "Wie pflege ich das Grabmal, damit es lange schön bleibt?",
      lt: "Kaip prižiūrėti paminklą, kad ilgai išliktų gražus?",
    },
    a: {
      uk: "Двічі на рік — м'якою тканиною з теплою водою (без мила, без хімії). Раз на 2–3 роки — гідрофобний склад на основі силоксанів (ми безкоштовно нанесемо при першому щорічному обслуговуванні). Не сипати сіль взимку — використовуйте пісок. Сніг чистити тільки пластиковою лопатою. Свічки ставити на металеву підставку, не прямо на камінь — віск тяжко знімається.",
      pl: "Dwa razy w roku — miękką szmatką z ciepłą wodą (bez mydła, bez chemii). Co 2–3 lata — środek hydrofobowy na bazie siloksanów (nakładamy bezpłatnie przy pierwszym serwisie rocznym). Nie sypać soli zimą — używać piasku. Śnieg zgarniać tylko plastikową łopatą. Świece stawiać na metalowej podstawce, nie wprost na kamieniu — wosk trudno usunąć.",
      en: "Twice a year — soft cloth with warm water (no soap, no chemicals). Every 2–3 years — siloxane-based hydrophobic treatment (we apply it for free at the first annual service). Don't use salt in winter — use sand. Clear snow only with a plastic shovel. Place candles on a metal stand, not directly on the stone — wax is hard to remove.",
      de: "Zweimal jährlich — weiches Tuch mit warmem Wasser (keine Seife, keine Chemie). Alle 2–3 Jahre — Siloxan-Hydrophobierung (beim ersten Jahresservice kostenlos). Im Winter kein Salz — Sand verwenden. Schnee nur mit Plastikschaufel räumen. Kerzen auf Metallständer stellen, nicht direkt auf den Stein — Wachs ist schwer zu entfernen.",
      lt: "Du kartus per metus — minkšta šluoste su šiltu vandeniu (be muilo, be chemijos). Kas 2–3 metus — silikoksano hidrofobinis sluoksnis (nemokamai uždedame per pirmą metinį aptarnavimą). Žiemą nebarstyti druska — naudokite smėlį. Sniegą valyti tik plastikiniu kastuvu. Žvakes statyti ant metalinio stovo, ne tiesiai ant akmens — vašką sunku pašalinti.",
    },
  },
  {
    id: "faq-restoration",
    order: 10,
    q: {
      uk: "Чи реставруєте старі пам'ятники?",
      pl: "Czy renowujecie stare pomniki?",
      en: "Do you restore old monuments?",
      de: "Restaurieren Sie alte Grabmale?",
      lt: "Ar restauruojate senus paminklus?",
    },
    a: {
      uk: "Так, але чесно скажемо: іноді вигідніше зробити новий. Реставрація має сенс якщо камінь історичний (понад 50 років), цілий, з мінімальними тріщинами. Вирівнюємо просівший фундамент, відновлюємо гравіювання, поліруємо знову. Якщо тріщини глибокі, фундамент розвалився — кажемо прямо: новий пам'ятник буде дешевше і прослужить 50+ років. Виїзд для оцінки — безкоштовний.",
      pl: "Tak, ale powiemy uczciwie: czasem opłaca się zrobić nowy. Renowacja ma sens jeśli kamień jest historyczny (ponad 50 lat), nieuszkodzony, z minimalnymi pęknięciami. Wyrównujemy osiadły fundament, odnawiamy grawerunek, polerujemy. Jeśli pęknięcia głębokie, fundament rozpadł się — mówimy wprost: nowy pomnik będzie tańszy i posłuży 50+ lat. Wizyta oceniająca — bezpłatna.",
      en: "Yes, but we'll be honest: sometimes a new monument is the better deal. Restoration makes sense if the stone is historical (over 50 years old), intact, with minimal cracks. We level a sunk foundation, refresh engraving, re-polish. If cracks are deep and the foundation has collapsed — we say it straight: a new monument will be cheaper and last 50+ years. Assessment visit is free.",
      de: "Ja, aber wir sagen ehrlich: manchmal ist ein neues Grabmal besser. Restaurierung lohnt sich, wenn der Stein historisch ist (über 50 Jahre alt), intakt, mit minimalen Rissen. Wir richten gesetzte Fundamente, frischen Gravuren auf, polieren neu. Bei tiefen Rissen oder zerfallenem Fundament — sagen wir es direkt: ein neues Grabmal wird billiger und hält 50+ Jahre. Besichtigung kostenlos.",
      lt: "Taip, bet pasakysime sąžiningai: kartais naudingiau padaryti naują. Restauracija prasminga, jei akmuo istorinis (per 50 metų), nepažeistas, su minimaliais įtrūkimais. Lyginame nusėdusį pamatą, atnaujiname graviravimą, vėl poliruojame. Jei įtrūkimai gilūs, pamatas subyrėjo — sakome tiesiai: naujas paminklas bus pigesnis ir tarnaus 50+ metų. Apžiūra — nemokama.",
    },
  },
  {
    id: "faq-religion",
    order: 11,
    q: {
      uk: "Чи робите ви пам'ятники з різних релігійних символів?",
      pl: "Czy robicie pomniki z różnymi symbolami religijnymi?",
      en: "Do you do monuments with different religious symbols?",
      de: "Machen Sie Grabmale mit verschiedenen religiösen Symbolen?",
      lt: "Ar darote paminklus su skirtingais religiniais simboliais?",
    },
    a: {
      uk: "Так — без обмежень. Православний хрест, католицький, протестантський, грецький, єврейська менора і Маген-Давид, ісламський півмісяць, буддійські символи, нерелігійні (дерево життя, голуб, троянда). Маємо бібліотеку з 200+ варіантів символів, можемо адаптувати будь-який під ваше побажання. Сімейні герби — теж робимо, потрібен тільки чіткий зразок.",
      pl: "Tak — bez ograniczeń. Krzyż prawosławny, katolicki, protestancki, grecki, menora i gwiazda Dawida, półksiężyc, symbole buddyjskie, niereligijne (drzewo życia, gołąb, róża). Mamy bibliotekę 200+ symboli, możemy dostosować każdy. Herby rodzinne — też robimy, potrzebny dobry wzór.",
      en: "Yes — without restrictions. Orthodox cross, Catholic, Protestant, Greek; menorah and Star of David; crescent; Buddhist symbols; non-religious ones (tree of life, dove, rose). We keep a library of 200+ symbol variants and can adapt any to your wishes. Family crests — we do those too, just need a clear sample.",
      de: "Ja — ohne Einschränkungen. Orthodoxes Kreuz, katholisch, protestantisch, griechisch; Menora und Davidstern; Halbmond; buddhistische Symbole; nicht-religiöse (Lebensbaum, Taube, Rose). Wir haben eine Bibliothek von 200+ Symbolen und können jedes anpassen. Familienwappen — auch, braucht nur eine klare Vorlage.",
      lt: "Taip — be apribojimų. Stačiatikių kryžius, katalikų, protestantų, graikų; menora ir Dovydo žvaigždė; pusmėnulis; budistiniai simboliai; nereliginiai (gyvenimo medis, balandis, rožė). Turime 200+ simbolių biblioteką, galime pritaikyti bet kurį. Šeimos herbai — taip pat, reikia tik aiškaus pavyzdžio.",
    },
  },
]

// -------- Business profile --------
export const seedBusinessProfile = {
  legalName: "ФОП Stone Memory",
  displayName: "Stone Memory",
  email: "info@stonememory.com.ua",
  phone: "+380 (68) 808 02 22",
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
      "Stone Memory — меморіальна майстерня в Костополі на Рівненщині. Виготовляємо одиночні та подвійні пам'ятники, сімейні й військові меморіальні комплекси, хрести, обеліски, надгробні плити та елементи благоустрою поховання.",
      "Працюємо з українським гранітом і габро — Головинське габро, Лезниківський, Покостівський, — а також з імпортними породами: індійський і китайський граніт. Підбираємо матеріал під проєкт і бюджет.",
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
      "Stone Memory to pracownia memorialna w Kostopolu na Rówieńszczyźnie. Wykonujemy pomniki pojedyncze i podwójne, rodzinne oraz wojskowe kompleksy memorialne, krzyże, obeliski, płyty nagrobne i elementy zagospodarowania grobu.",
      "Pracujemy z ukraińskim granitem i gabro — gabro gołowyńskie, łeznykowski, pokostiwski — oraz z gatunkami importowanymi: granit indyjski i chiński. Dobieramy materiał pod projekt i budżet.",
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
      "Stone Memory is a memorial workshop in Kostopil, Rivne region. We make single and double monuments, family and military memorial complexes, crosses, obelisks, grave slabs and grave-surround elements.",
      "We work with Ukrainian granite and gabbro — Holovyne gabbro, Leznyky, Pokostivka — as well as imported varieties: Indian and Chinese granite. We pick the material to match the project and the budget.",
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
      "Stone Memory ist eine Grabmal-Werkstatt in Kostopil, Oblast Riwne. Wir fertigen Einzel- und Doppelgrabmale, Familien- und Militär-Gedenkkomplexe, Kreuze, Obelisken, Grabplatten und Einfassungen.",
      "Wir arbeiten mit ukrainischem Granit und Gabbro — Holowyne-Gabbro, Lesnyky, Pokostiwka — sowie mit Importsorten: indischer und chinesischer Granit. Wir wählen das Material nach Projekt und Budget.",
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
      "Stone Memory — memorialinė dirbtuvė Kostopilyje, Rivnės srityje. Gaminame vienviečius ir dvivietius paminklus, šeimos bei karių memorialinius kompleksus, kryžius, obeliskus, kapo plokštes ir kapo aptvarų elementus.",
      "Dirbame su ukrainietišku granitu ir gabbru — Holovynės gabbras, Leznykai, Pokostivka — bei importuotomis rūšimis: Indijos ir Kinijos granitu. Medžiagą parenkame pagal projektą ir biudžetą.",
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
