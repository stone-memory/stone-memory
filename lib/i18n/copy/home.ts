import type { Locale } from "@/lib/types"

/** Тексти головної: два напрями, бібліотека каменю, «як це працює». */
export type HomeCopy = {
  directions: {
    eyebrow: string
    heading: string
    lead: string
    memorial: { eyebrow: string; title: string; text: string; cta: string; alt: string }
    memorialItems: { models: (n: number) => string; leadTime: (t: string) => string; install: string; warranty: (y: string) => string }
    stone: { eyebrow: string; title: string; text: string; cta: string; alt: string; items: string[] }
  }
  library: {
    eyebrow: string
    heading: string
    lead: string
    statNatural: string
    statUkrainian: string
    statMemorial: string
    allAbout: (family: string) => string
    engineeredTitle: string
    engineeredText: (n: number, brands: string) => string
    allMaterials: string
    memorialTag: string
    homeTag: string
    collapse: (family: string) => string
    showAll: (n: number) => string
    familyNote: Record<string, string>
  }
  about: {
    eyebrow: string
    heading: string
    steps: { title: string; text: string }[]
    ctaTitle: string
    ctaText: string
    ctaButton: string
    ctaTopic: string
  }
}

const uk: HomeCopy = {
  directions: {
    eyebrow: "Два напрями",
    heading: "Один цех, один камінь — два призначення",
    lead: "Два напрями роботи, одна майстерня.",
    memorial: {
      eyebrow: "Напрям 01",
      title: "Пам'ятники",
      text: "Одинарні й подвійні пам'ятники, хрести, дитячі та військові, меморіальні комплекси під ключ. Від ескізу до встановлення на кладовищі.",
      cta: "До пам'ятників",
      alt: "Меморіальний комплекс із габро, виготовлений у Костополі",
    },
    memorialItems: {
      models: (n) => `${n} моделей у каталозі`,
      leadTime: (t) => `виготовлення ${t}`,
      install: "монтаж по всій Україні",
      warranty: (y) => `${y} гарантії на все`,
    },
    stone: {
      eyebrow: "Напрям 02",
      title: "Архітектурний камінь",
      text: "Стільниці, підвіконня, сходи, каміни, фасади й бруківка. Проєктуємо, ріжемо під розмір і монтуємо натуральний та інженерний камінь для дому й архітектури.",
      cta: "До архітектурного каменю",
      alt: "Кухонна стільниця з натурального каменю",
      items: ["10 українських гранітів", "мармур, кварцит, кварц, керамограніт", "безкоштовний замір", "калькулятор вартості онлайн"],
    },
  },
  library: {
    eyebrow: "Бібліотека каменю",
    heading: "Камінь, з яким ми працюємо",
    lead: "Одна бібліотека на два напрями. Кожен натуральний камінь тут можна замовити і як стелу на пам'ятник, і як стільницю чи сходи — з того самого блоку, з того самого цеху.",
    statNatural: "натуральних порід",
    statUkrainian: "українських родовищ",
    statMemorial: "для пам'ятників",
    allAbout: (f) => `Усе про ${f.toLowerCase()}`,
    engineeredTitle: "Інженерний камінь — лише для дому",
    engineeredText: (n, brands) => `${n} колекцій кварцу й керамограніту${brands ? ` — ${brands}` : ""}: рівний колір, непориста поверхня, будь-який формат.`,
    allMaterials: "Уся бібліотека матеріалів",
    memorialTag: "Пам'ятники",
    homeTag: "Для дому",
    collapse: (f) => `Згорнути ${f.toLowerCase()}`,
    showAll: (n) => `Показати всі ${n}`,
    familyNote: {
      Граніт: "Український, з кар'єрів Житомирщини, Рівненщини, Кіровоградщини й Дніпропетровщини. Найміцніший і найдовговічніший камінь у нас — і на стелу, і на стільницю.",
      Габро: "Український чорний камінь із Житомирщини: Головинське, Букинське, Лугове. Найщільніша порода в нас; на пам'ятниках тримає портрет, у домі — чорна стільниця без плям.",
      Базальт: "Рівненський і закарпатський камінь із матовою дрібнозернистою поверхнею. Для бруківки, сходів, цоколів і фасадів, де важлива стійкість до морозу.",
      Пісковик: "Теребовлянський камінь із Тернопільщини: теплий сіро-зелений, з природним сколом. Фасади, огорожі, доріжки.",
      Лабрадорит: "Темний камінь із синіми переливами. На пам'ятниках — контраст під гравіювання, у домі — акцентна поверхня, що змінюється зі світлом.",
      Мармур: "Італійський та іспанський. На пам'ятники — для скульптури, дитячих і світлих рішень; у домі — ванни, каміни, підвіконня.",
      Кварцит: "Твердість граніту, рисунок мармуру. Для дому — стільниці й острови.",
      Онікс: "Напівпрозорий шаруватий камінь. Барні стійки, панно й стіни з підсвіткою.",
      Травертин: "Пористий теплий камінь Середземномор'я. Фасади, підлоги, каміни.",
      Вапняк: "Матовий м'який камінь для фасадів, підлог і терас; не для кухні.",
    },
  },
  about: {
    eyebrow: "Як це працює",
    heading: "Три кроки — для обох напрямів",
    steps: [
      { title: "Обираєте камінь", text: "У бібліотеці на сайті або наживо на майданчику в Костополі. Підкажемо, який камінь куди: що тримає гравіювання, що підходить для кухні, що потребує догляду." },
      { title: "Отримуєте проєкт і ціну", text: "Ескіз чи 3D-візуалізація у вашому камені й точна цифра — до того, як ви щось платите. Для пам'ятників — за фото ділянки, для дому — після безкоштовного заміру." },
      { title: "Ми виготовляємо й монтуємо", text: "Той самий цех і та сама бригада для обох напрямів. Готовий виріб показуємо до монтажу, після — гарантійний талон." },
    ],
    ctaTitle: "Не знаєте, з чого почати? Напишіть, що потрібно",
    ctaText: "Пам'ятник, стільниця чи сходи. Ескіз і ціну повертаємо протягом робочого дня.",
    ctaButton: "Написати майстру",
    ctaTopic: "Головна: не знаєте, з чого почати",
  },
}

const pl: HomeCopy = {
  directions: {
    eyebrow: "Dwa kierunki",
    heading: "Jeden zakład, jeden kamień — dwa przeznaczenia",
    lead: "Dwa kierunki pracy, jedna pracownia.",
    memorial: {
      eyebrow: "Kierunek 01",
      title: "Pomniki",
      text: "Pomniki pojedyncze i podwójne, krzyże, dziecięce i wojskowe, kompleksy nagrobne pod klucz. Od szkicu do montażu na cmentarzu.",
      cta: "Do pomników",
      alt: "Kompleks nagrobny z gabro wykonany w Kostopolu",
    },
    memorialItems: {
      models: (n) => `${n} modeli w katalogu`,
      leadTime: (t) => `wykonanie ${t}`,
      install: "montaż w całej Ukrainie",
      warranty: (y) => `${y} gwarancji na wszystko`,
    },
    stone: {
      eyebrow: "Kierunek 02",
      title: "Kamień architektoniczny",
      text: "Blaty, parapety, schody, kominki, elewacje i kostka brukowa. Projektujemy, docinamy na wymiar i montujemy kamień naturalny i konglomerat do domu i architektury.",
      cta: "Do kamienia architektonicznego",
      alt: "Blat kuchenny z kamienia naturalnego",
      items: ["10 ukraińskich granitów", "marmur, kwarcyt, kwarc, gres", "bezpłatny pomiar", "kalkulator ceny online"],
    },
  },
  library: {
    eyebrow: "Biblioteka kamienia",
    heading: "Kamień, z którym pracujemy",
    lead: "Jedna biblioteka na dwa kierunki. Każdy kamień naturalny można tu zamówić i jako stelę na pomnik, i jako blat czy schody — z tego samego bloku, z tego samego zakładu.",
    statNatural: "skał naturalnych",
    statUkrainian: "ukraińskich złóż",
    statMemorial: "na pomniki",
    allAbout: (f) => `Wszystko o: ${f.toLowerCase()}`,
    engineeredTitle: "Kamień inżynieryjny — tylko do domu",
    engineeredText: (n, brands) => `${n} kolekcji kwarcu i gresu${brands ? ` — ${brands}` : ""}: jednolity kolor, nieporowata powierzchnia, dowolny format.`,
    allMaterials: "Cała biblioteka materiałów",
    memorialTag: "Pomniki",
    homeTag: "Do domu",
    collapse: (f) => `Zwiń: ${f.toLowerCase()}`,
    showAll: (n) => `Pokaż wszystkie (${n})`,
    familyNote: {
      Граніт: "Ukraiński, z kamieniołomów obwodów żytomierskiego, rówieńskiego, kirowohradzkiego i dniepropetrowskiego. Najmocniejszy i najtrwalszy kamień u nas — i na stelę, i na blat.",
      Габро: "Ukraiński czarny kamień z Żytomierszczyzny: Hołowyne, Bukі, Łuhowe. Najgęstsza skała u nas; na pomnikach trzyma portret, w domu — czarny blat bez plam.",
      Базальт: "Kamień z Rówieńszczyzny i Zakarpacia o matowej, drobnoziarnistej powierzchni. Na kostkę, schody, cokoły i elewacje, gdzie liczy się mrozoodporność.",
      Пісковик: "Kamień terebowelski z Tarnopolszczyzny: ciepły szarozielony, z naturalnym łupaniem. Elewacje, ogrodzenia, ścieżki.",
      Лабрадорит: "Ciemny kamień z niebieskimi refleksami. Na pomnikach — kontrast pod grawer, w domu — powierzchnia akcentowa zmieniająca się ze światłem.",
      Мармур: "Włoski i hiszpański. Na pomniki — do rzeźby, dziecięcych i jasnych realizacji; w domu — łazienki, kominki, parapety.",
      Кварцит: "Twardość granitu, rysunek marmuru. Do domu — blaty i wyspy.",
      Онікс: "Półprzezroczysty kamień warstwowy. Bary, panele i ściany z podświetleniem.",
      Травертин: "Porowaty, ciepły kamień znad Morza Śródziemnego. Elewacje, podłogi, kominki.",
      Вапняк: "Matowy, miękki kamień na elewacje, podłogi i tarasy; nie do kuchni.",
    },
  },
  about: {
    eyebrow: "Jak to działa",
    heading: "Trzy kroki — dla obu kierunków",
    steps: [
      { title: "Wybierasz kamień", text: "W bibliotece na stronie albo na żywo na placu w Kostopolu. Podpowiemy, który kamień gdzie: co trzyma grawer, co pasuje do kuchni, co wymaga pielęgnacji." },
      { title: "Otrzymujesz projekt i cenę", text: "Szkic lub wizualizacja 3D w Twoim kamieniu i dokładna kwota — zanim cokolwiek zapłacisz. Dla pomników — na podstawie zdjęcia miejsca, dla domu — po bezpłatnym pomiarze." },
      { title: "My wykonujemy i montujemy", text: "Ten sam zakład i ta sama ekipa dla obu kierunków. Gotowy wyrób pokazujemy przed montażem, po — karta gwarancyjna." },
    ],
    ctaTitle: "Nie wiesz, od czego zacząć? Napisz, czego potrzebujesz",
    ctaText: "Pomnik, blat czy schody. Szkic i cenę odsyłamy w ciągu dnia roboczego.",
    ctaButton: "Napisz do mistrza",
    ctaTopic: "Головна: не знаєте, з чого почати",
  },
}

const en: HomeCopy = {
  directions: {
    eyebrow: "Two directions",
    heading: "One workshop, one stone — two purposes",
    lead: "Two lines of work, one workshop.",
    memorial: {
      eyebrow: "Direction 01",
      title: "Monuments",
      text: "Single and double monuments, crosses, children's and military memorials, turnkey memorial complexes. From sketch to installation at the cemetery.",
      cta: "To monuments",
      alt: "Gabbro memorial complex made in Kostopil",
    },
    memorialItems: {
      models: (n) => `${n} models in the catalogue`,
      leadTime: (t) => `production ${t}`,
      install: "installation across Ukraine",
      warranty: (y) => `${y} warranty on everything`,
    },
    stone: {
      eyebrow: "Direction 02",
      title: "Architectural stone",
      text: "Countertops, window sills, stairs, fireplaces, facades and paving. We design, cut to size and install natural and engineered stone for homes and architecture.",
      cta: "To architectural stone",
      alt: "Natural stone kitchen countertop",
      items: ["10 Ukrainian granites", "marble, quartzite, quartz, porcelain", "free measurement", "online price calculator"],
    },
  },
  library: {
    eyebrow: "Stone library",
    heading: "The stone we work with",
    lead: "One library for two directions. Every natural stone here can be ordered both as a monument stele and as a countertop or stairs — from the same block, from the same workshop.",
    statNatural: "natural stone types",
    statUkrainian: "Ukrainian quarries",
    statMemorial: "for monuments",
    allAbout: (f) => `All about ${f.toLowerCase()}`,
    engineeredTitle: "Engineered stone — for the home only",
    engineeredText: (n, brands) => `${n} quartz and porcelain collections${brands ? ` — ${brands}` : ""}: even colour, non-porous surface, any format.`,
    allMaterials: "Full material library",
    memorialTag: "Monuments",
    homeTag: "For the home",
    collapse: (f) => `Collapse ${f.toLowerCase()}`,
    showAll: (n) => `Show all ${n}`,
    familyNote: {
      Граніт: "Ukrainian, from quarries in the Zhytomyr, Rivne, Kirovohrad and Dnipro regions. The strongest and most durable stone we have — for a stele and for a countertop alike.",
      Габро: "Ukrainian black stone from the Zhytomyr region: Holovyne, Buky, Luhove. Our densest rock; on monuments it holds a portrait, at home it is a black countertop with no stains.",
      Базальт: "Stone from Rivne and Zakarpattia with a matte, fine-grained surface. For paving, stairs, plinths and facades where frost resistance matters.",
      Пісковик: "Terebovlia stone from the Ternopil region: warm grey-green with a natural split face. Facades, fences, paths.",
      Лабрадорит: "Dark stone with blue iridescence. On monuments — contrast for engraving; at home — an accent surface that changes with the light.",
      Мармур: "Italian and Spanish. For monuments — sculpture, children's and light-toned designs; at home — bathrooms, fireplaces, window sills.",
      Кварцит: "The hardness of granite, the pattern of marble. For the home — countertops and islands.",
      Онікс: "Translucent layered stone. Bar counters, panels and backlit walls.",
      Травертин: "Porous, warm Mediterranean stone. Facades, floors, fireplaces.",
      Вапняк: "Matte, soft stone for facades, floors and terraces; not for kitchens.",
    },
  },
  about: {
    eyebrow: "How it works",
    heading: "Three steps — for both directions",
    steps: [
      { title: "You choose the stone", text: "In the library on the site or in person at our yard in Kostopil. We'll advise which stone suits what: which holds engraving, which works in a kitchen, which needs care." },
      { title: "You get a design and a price", text: "A sketch or 3D visualisation in your stone and an exact figure — before you pay anything. For monuments, from a photo of the plot; for the home, after a free measurement." },
      { title: "We make and install", text: "The same workshop and the same crew for both directions. We show the finished piece before installation and hand over a warranty card afterwards." },
    ],
    ctaTitle: "Not sure where to start? Tell us what you need",
    ctaText: "A monument, a countertop or stairs. We return a sketch and a price within one working day.",
    ctaButton: "Write to the workshop",
    ctaTopic: "Головна: не знаєте, з чого почати",
  },
}

const de: HomeCopy = {
  directions: {
    eyebrow: "Zwei Richtungen",
    heading: "Eine Werkstatt, ein Stein — zwei Bestimmungen",
    lead: "Zwei Arbeitsbereiche, eine Werkstatt.",
    memorial: {
      eyebrow: "Richtung 01",
      title: "Grabmale",
      text: "Einzel- und Doppelgrabmale, Kreuze, Kinder- und Soldatengrabmale, schlüsselfertige Grabanlagen. Vom Entwurf bis zur Aufstellung auf dem Friedhof.",
      cta: "Zu den Grabmalen",
      alt: "Grabanlage aus Gabbro, gefertigt in Kostopil",
    },
    memorialItems: {
      models: (n) => `${n} Modelle im Katalog`,
      leadTime: (t) => `Fertigung ${t}`,
      install: "Montage in der ganzen Ukraine",
      warranty: (y) => `${y} Garantie auf alles`,
    },
    stone: {
      eyebrow: "Richtung 02",
      title: "Architekturstein",
      text: "Arbeitsplatten, Fensterbänke, Treppen, Kamine, Fassaden und Pflaster. Wir planen, schneiden auf Maß und montieren Natur- und Kunststein für Haus und Architektur.",
      cta: "Zum Architekturstein",
      alt: "Küchenarbeitsplatte aus Naturstein",
      items: ["10 ukrainische Granite", "Marmor, Quarzit, Quarz, Feinsteinzeug", "kostenloses Aufmaß", "Online-Preisrechner"],
    },
  },
  library: {
    eyebrow: "Steinbibliothek",
    heading: "Der Stein, mit dem wir arbeiten",
    lead: "Eine Bibliothek für zwei Richtungen. Jeder Naturstein hier lässt sich sowohl als Grabstele als auch als Arbeitsplatte oder Treppe bestellen — aus demselben Block, aus derselben Werkstatt.",
    statNatural: "Natursteinarten",
    statUkrainian: "ukrainische Vorkommen",
    statMemorial: "für Grabmale",
    allAbout: (f) => `Alles über ${f}`,
    engineeredTitle: "Kunststein — nur fürs Haus",
    engineeredText: (n, brands) => `${n} Kollektionen aus Quarz und Feinsteinzeug${brands ? ` — ${brands}` : ""}: gleichmäßige Farbe, porenfreie Oberfläche, jedes Format.`,
    allMaterials: "Gesamte Materialbibliothek",
    memorialTag: "Grabmale",
    homeTag: "Fürs Haus",
    collapse: (f) => `${f} einklappen`,
    showAll: (n) => `Alle ${n} anzeigen`,
    familyNote: {
      Граніт: "Ukrainisch, aus Steinbrüchen der Regionen Schytomyr, Riwne, Kropywnyzkyj und Dnipro. Unser festester und langlebigster Stein — für die Stele wie für die Arbeitsplatte.",
      Габро: "Ukrainischer schwarzer Stein aus der Region Schytomyr: Holowyne, Buky, Luhowe. Unser dichtestes Gestein; auf Grabmalen hält es das Porträt, im Haus ist es eine schwarze Arbeitsplatte ohne Flecken.",
      Базальт: "Stein aus Riwne und Transkarpatien mit matter, feinkörniger Oberfläche. Für Pflaster, Treppen, Sockel und Fassaden, wo Frostbeständigkeit zählt.",
      Пісковик: "Terebowlja-Stein aus der Region Ternopil: warmes Graugrün mit natürlicher Spaltfläche. Fassaden, Zäune, Wege.",
      Лабрадорит: "Dunkler Stein mit blauem Schimmer. Auf Grabmalen Kontrast für die Gravur, im Haus eine Akzentfläche, die sich mit dem Licht verändert.",
      Мармур: "Italienisch und spanisch. Für Grabmale — Skulpturen, Kindergrabmale und helle Lösungen; im Haus — Bäder, Kamine, Fensterbänke.",
      Кварцит: "Die Härte von Granit, die Zeichnung von Marmor. Fürs Haus — Arbeitsplatten und Kücheninseln.",
      Онікс: "Halbtransparenter, geschichteter Stein. Bartresen, Paneele und hinterleuchtete Wände.",
      Травертин: "Poröser, warmer Stein aus dem Mittelmeerraum. Fassaden, Böden, Kamine.",
      Вапняк: "Matter, weicher Stein für Fassaden, Böden und Terrassen; nicht für die Küche.",
    },
  },
  about: {
    eyebrow: "So funktioniert es",
    heading: "Drei Schritte — für beide Richtungen",
    steps: [
      { title: "Sie wählen den Stein", text: "In der Bibliothek auf der Website oder vor Ort auf unserem Platz in Kostopil. Wir sagen Ihnen, welcher Stein wohin passt: welcher die Gravur hält, welcher in die Küche gehört, welcher Pflege braucht." },
      { title: "Sie erhalten Entwurf und Preis", text: "Skizze oder 3D-Visualisierung in Ihrem Stein und eine genaue Zahl — bevor Sie etwas bezahlen. Für Grabmale nach einem Foto der Grabstelle, fürs Haus nach dem kostenlosen Aufmaß." },
      { title: "Wir fertigen und montieren", text: "Dieselbe Werkstatt und dasselbe Team für beide Richtungen. Das fertige Stück zeigen wir vor der Montage, danach gibt es die Garantiekarte." },
    ],
    ctaTitle: "Sie wissen nicht, wo Sie anfangen sollen? Schreiben Sie uns, was Sie brauchen",
    ctaText: "Grabmal, Arbeitsplatte oder Treppe. Skizze und Preis erhalten Sie innerhalb eines Arbeitstages.",
    ctaButton: "Der Werkstatt schreiben",
    ctaTopic: "Головна: не знаєте, з чого почати",
  },
}

const lt: HomeCopy = {
  directions: {
    eyebrow: "Dvi kryptys",
    heading: "Vienas cechas, vienas akmuo — dvi paskirtys",
    lead: "Dvi darbo kryptys, vienos dirbtuvės.",
    memorial: {
      eyebrow: "Kryptis 01",
      title: "Paminklai",
      text: "Vienviečiai ir dviviečiai paminklai, kryžiai, vaikų ir kariniai paminklai, memorialiniai kompleksai iki galo. Nuo eskizo iki pastatymo kapinėse.",
      cta: "Į paminklus",
      alt: "Gabro memorialinis kompleksas, pagamintas Kostopilyje",
    },
    memorialItems: {
      models: (n) => `${n} modelių kataloge`,
      leadTime: (t) => `gamyba ${t}`,
      install: "montavimas visoje Ukrainoje",
      warranty: (y) => `${y} garantija viskam`,
    },
    stone: {
      eyebrow: "Kryptis 02",
      title: "Architektūrinis akmuo",
      text: "Stalviršiai, palangės, laiptai, židiniai, fasadai ir grindinys. Projektuojame, pjauname pagal matmenis ir montuojame natūralų bei dirbtinį akmenį namams ir architektūrai.",
      cta: "Į architektūrinį akmenį",
      alt: "Virtuvės stalviršis iš natūralaus akmens",
      items: ["10 ukrainietiškų granitų", "marmuras, kvarcitas, kvarcas, keraminis granitas", "nemokamas išmatavimas", "kainos skaičiuoklė internete"],
    },
  },
  library: {
    eyebrow: "Akmens biblioteka",
    heading: "Akmuo, su kuriuo dirbame",
    lead: "Viena biblioteka dviem kryptims. Kiekvieną natūralų akmenį čia galima užsakyti ir kaip paminklo stelą, ir kaip stalviršį ar laiptus — iš to paties bloko, iš to paties cecho.",
    statNatural: "natūralių uolienų",
    statUkrainian: "ukrainietiškų karjerų",
    statMemorial: "paminklams",
    allAbout: (f) => `Viskas apie: ${f.toLowerCase()}`,
    engineeredTitle: "Dirbtinis akmuo — tik namams",
    engineeredText: (n, brands) => `${n} kvarco ir keraminio granito kolekcijų${brands ? ` — ${brands}` : ""}: tolygi spalva, neporėtas paviršius, bet koks formatas.`,
    allMaterials: "Visa medžiagų biblioteka",
    memorialTag: "Paminklai",
    homeTag: "Namams",
    collapse: (f) => `Suskleisti: ${f.toLowerCase()}`,
    showAll: (n) => `Rodyti visus (${n})`,
    familyNote: {
      Граніт: "Ukrainietiškas, iš Žytomyro, Rivnės, Kropyvnyckio ir Dnipro sričių karjerų. Tvirčiausias ir ilgaamžiškiausias mūsų akmuo — ir stelai, ir stalviršiui.",
      Габро: "Ukrainietiškas juodas akmuo iš Žytomyro srities: Holovynė, Buky, Luhovė. Tankiausia mūsų uoliena; ant paminklų išlaiko portretą, namuose — juodas stalviršis be dėmių.",
      Базальт: "Rivnės ir Užkarpatės akmuo su matiniu smulkiagrūdžiu paviršiumi. Grindiniui, laiptams, cokoliams ir fasadams, kur svarbus atsparumas šalčiui.",
      Пісковик: "Terebovlios akmuo iš Ternopilio srities: šiltas pilkai žalias, natūralaus skėlimo. Fasadai, tvoros, takai.",
      Лабрадорит: "Tamsus akmuo su mėlynais atspindžiais. Ant paminklų — kontrastas graviūrai, namuose — akcentinis paviršius, kintantis su šviesa.",
      Мармур: "Itališkas ir ispaniškas. Paminklams — skulptūrai, vaikų ir šviesiems sprendimams; namuose — vonios, židiniai, palangės.",
      Кварцит: "Granito kietumas, marmuro raštas. Namams — stalviršiai ir salos.",
      Онікс: "Pusiau permatomas sluoksniuotas akmuo. Baro stalai, pano ir apšviestos sienos.",
      Травертин: "Porėtas šiltas Viduržemio jūros akmuo. Fasadai, grindys, židiniai.",
      Вапняк: "Matinis minkštas akmuo fasadams, grindims ir terasoms; ne virtuvei.",
    },
  },
  about: {
    eyebrow: "Kaip tai veikia",
    heading: "Trys žingsniai — abiem kryptims",
    steps: [
      { title: "Renkatės akmenį", text: "Bibliotekoje svetainėje arba gyvai mūsų aikštelėje Kostopilyje. Patarsime, kuris akmuo kam: kuris išlaiko graviūrą, kuris tinka virtuvei, kuriam reikia priežiūros." },
      { title: "Gaunate projektą ir kainą", text: "Eskizas ar 3D vizualizacija jūsų akmenyje ir tiksli suma — prieš jums ką nors sumokant. Paminklams — pagal kapavietės nuotrauką, namams — po nemokamo išmatavimo." },
      { title: "Mes gaminame ir montuojame", text: "Tas pats cechas ir ta pati brigada abiem kryptims. Gatavą gaminį parodome prieš montavimą, po jo — garantinis talonas." },
    ],
    ctaTitle: "Nežinote, nuo ko pradėti? Parašykite, ko reikia",
    ctaText: "Paminklas, stalviršis ar laiptai. Eskizą ir kainą grąžiname per darbo dieną.",
    ctaButton: "Parašyti meistrui",
    ctaTopic: "Головна: не знаєте, з чого почати",
  },
}

export const HOME_COPY: Record<Locale, HomeCopy> = { uk, pl, en, de, lt }
