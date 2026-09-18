import type { Locale } from "@/lib/types"
import type { LocalizedFacts } from "@/lib/i18n/copy/facts"

export type DeliveryCopy = {
  crumb: string
  title: string
  lead: string
  zonesEyebrow: string
  zonesTitle: string
  tableHead: string[]
  tableRows: string[][]
  tableCaption: string
  cityMeta: (distanceKm: number, travel: string, freeTravel: boolean) => string
  packEyebrow: string
  packTitle: string
  packText: string
  installEyebrow: string
  installTitle: string
  installText: string
  payEyebrow: string
  payTitle: string
  payText: string
  faqEyebrow: string
  faqTitle: string
  faq: { q: string; a: string }[]
}

const uk = (f: LocalizedFacts): DeliveryCopy => ({
  crumb: "Доставка і оплата",
  title: "Доставка, монтаж і оплата",
  lead: "Ціна на сайті вже містить фундамент, доставку й монтаж у Рівненській та Волинській областях. Усе, що може додатись, — на цій сторінці, щоб не було сюрпризів.",
  zonesEyebrow: "Доставка",
  zonesTitle: "Куди і за скільки",
  tableHead: ["Зона", "Виїзд на замір і монтаж", "Доставка"],
  tableRows: [
    [f.delivery.freeRegions, "безкоштовно", "безкоштовно"],
    ["Інші області України", "за пробігом", `${f.delivery.perKm} від Костополя`],
    [`ЄС: ${f.delivery.eu}`, "за домовленістю", "з митним оформленням, рахуємо індивідуально"],
  ],
  tableCaption: "Пробіг рахуємо в один бік до кладовища, за картою. Кажемо суму одразу разом із ціною виробу.",
  cityMeta: (km, travel, free) => `${km ? `${km} км, ${travel}` : "цех і майданчик"} · ${free ? "виїзд безкоштовно" : "за пробігом"}`,
  packEyebrow: "Пакування",
  packTitle: "Як їде камінь",
  packText: `${f.delivery.packaging} Стела, тумба, плита і квітник їдуть окремо, кожен елемент у своїй ніші, тому в дорозі ніщо не треться й не б'ється.\n\nПеревозимо власним транспортом з краном-маніпулятором: він же розвантажує біля ділянки, тому ручного перенесення півтонної стели через усе кладовище немає. Якщо проїзд до ділянки вузький — плануємо це на замірі, а не в день монтажу.`,
  installEyebrow: "Монтаж",
  installTitle: "Фундамент, який тримає гарантію",
  installText: `${f.installation.survey} ${f.installation.clay} ${f.installation.peat}\n\n${f.installation.crew} Після монтажу перевіряємо рівень ще раз, герметизуємо шви, забираємо сміття й старий пам'ятник, якщо він був. Ділянку віддаємо готовою — залишається лише посадити квіти.`,
  payEyebrow: "Оплата",
  payTitle: "Три платежі",
  payText: `${f.payment.methods}\n\nЦіна фіксується в договорі після заміру й не змінюється під час роботи — навіть якщо камінь подорожчав. Гарантія ${f.warranty} на камінь, фундамент і монтаж входить у вартість і починається з дня встановлення.`,
  faqEyebrow: "Питання",
  faqTitle: "Про доставку й оплату запитують",
  faq: [
    { q: "Чи можу я забрати пам'ятник сам і встановити своїми силами?", a: "Можна, і ціна зменшиться на вартість монтажу. Але гарантія на фундамент і геометрію в такому разі не діє — ми відповідаємо лише за камінь і гравіювання. Дамо схему фундаменту й інструкцію з монтажу, які використовуємо самі." },
    { q: "Що, якщо пам'ятник пошкодять під час перевезення?", a: `Вантаж застрахований, а пакуємо ми так: ${f.delivery.packaging.toLowerCase()} За десять років жодного розбитого виробу в дорозі, але якщо таке трапиться — виготовляємо новий елемент за наш рахунок.` },
    { q: "Чи працюєте ви з благодійними фондами й підприємствами?", a: "Так. Для фондів, які встановлюють пам'ятники військовим, і для підприємств виставляємо рахунок на юридичну особу, підписуємо договір і акт, надаємо повний пакет документів. Безготівковий розрахунок з ПДВ або без — залежно від вашої форми." },
    { q: "Чи є розстрочка?", a: "Три платежі 30/50/20 — це і є наша розстрочка на час виготовлення, без банку й відсотків. Якщо потрібен довший графік — обговоримо індивідуально; частіше за все ми йдемо назустріч родинам загиблих військових." },
    { q: "Коли монтуєте — можна бути присутнім?", a: "Так, і ми це вітаємо: ви бачите фундамент до того, як його закриє плита, і приймаєте роботу на місці. Якщо приїхати не можете — надсилаємо фото кожного етапу й відео готового результату." },
  ],
})

const pl = (f: LocalizedFacts): DeliveryCopy => ({
  crumb: "Dostawa i płatność",
  title: "Dostawa, montaż i płatność",
  lead: "Cena na stronie zawiera już fundament, dostawę i montaż w obwodach rówieńskim i wołyńskim. Wszystko, co może się doliczyć, jest na tej stronie — żeby nie było niespodzianek.",
  zonesEyebrow: "Dostawa",
  zonesTitle: "Gdzie i za ile",
  tableHead: ["Strefa", "Dojazd na pomiar i montaż", "Dostawa"],
  tableRows: [
    [f.delivery.freeRegions, "bezpłatnie", "bezpłatnie"],
    ["Inne obwody Ukrainy", "według kilometrów", `${f.delivery.perKm} od Kostopola`],
    [`UE: ${f.delivery.eu}`, "po uzgodnieniu", "z odprawą celną, liczymy indywidualnie"],
  ],
  tableCaption: "Kilometry liczymy w jedną stronę do cmentarza, według mapy. Kwotę podajemy od razu razem z ceną wyrobu.",
  cityMeta: (km, travel, free) => `${km ? `${km} km, ${travel}` : "zakład i plac"} · ${free ? "dojazd bezpłatny" : "według kilometrów"}`,
  packEyebrow: "Pakowanie",
  packTitle: "Jak jedzie kamień",
  packText: `${f.delivery.packaging} Stela, podstawa, płyta i kwietnik jadą osobno, każdy element w swojej niszy, dlatego w drodze nic się nie trze ani nie obija.\n\nPrzewozimy własnym transportem z HDS-em: on też rozładowuje przy miejscu, więc nie ma ręcznego przenoszenia półtonowej steli przez cały cmentarz. Jeśli dojazd do miejsca jest wąski — planujemy to na pomiarze, a nie w dniu montażu.`,
  installEyebrow: "Montaż",
  installTitle: "Fundament, który trzyma gwarancję",
  installText: `${f.installation.survey} ${f.installation.clay} ${f.installation.peat}\n\n${f.installation.crew} Po montażu jeszcze raz sprawdzamy poziom, uszczelniamy spoiny, zabieramy śmieci i stary pomnik, jeśli był. Miejsce oddajemy gotowe — zostaje tylko posadzić kwiaty.`,
  payEyebrow: "Płatność",
  payTitle: "Trzy wpłaty",
  payText: `${f.payment.methods}\n\nCena jest ustalana w umowie po pomiarze i nie zmienia się w trakcie pracy — nawet jeśli kamień podrożał. Gwarancja ${f.warranty} na kamień, fundament i montaż jest w cenie i biegnie od dnia montażu.`,
  faqEyebrow: "Pytania",
  faqTitle: "O dostawę i płatność pytają",
  faq: [
    { q: "Czy mogę odebrać pomnik sam i postawić własnymi siłami?", a: "Można, a cena zmniejszy się o koszt montażu. Ale gwarancja na fundament i geometrię wtedy nie obowiązuje — odpowiadamy tylko za kamień i grawer. Damy schemat fundamentu i instrukcję montażu, z których sami korzystamy." },
    { q: "Co, jeśli pomnik zostanie uszkodzony w transporcie?", a: `Ładunek jest ubezpieczony, a pakujemy tak: ${f.delivery.packaging.toLowerCase()} Przez dziesięć lat ani jednego rozbitego wyrobu w drodze, ale jeśli tak się zdarzy — wykonujemy nowy element na nasz koszt.` },
    { q: "Czy pracujecie z fundacjami i przedsiębiorstwami?", a: "Tak. Dla fundacji, które stawiają pomniki wojskowym, i dla przedsiębiorstw wystawiamy fakturę na osobę prawną, podpisujemy umowę i protokół, przekazujemy pełny pakiet dokumentów. Rozliczenie bezgotówkowe z VAT lub bez — zależnie od Waszej formy." },
    { q: "Czy jest możliwość rat?", a: "Trzy wpłaty 30/50/20 to nasze raty na czas wykonania, bez banku i odsetek. Jeśli potrzebny jest dłuższy harmonogram — omówimy indywidualnie; najczęściej wychodzimy naprzeciw rodzinom poległych żołnierzy." },
    { q: "Czy można być obecnym przy montażu?", a: "Tak, i bardzo to popieramy: widzisz fundament, zanim zakryje go płyta, i odbierasz pracę na miejscu. Jeśli nie możesz przyjechać — wysyłamy zdjęcia każdego etapu i wideo gotowego rezultatu." },
  ],
})

const en = (f: LocalizedFacts): DeliveryCopy => ({
  crumb: "Delivery and payment",
  title: "Delivery, installation and payment",
  lead: "The price on the site already includes the foundation, delivery and installation in the Rivne and Volyn regions. Anything that could be added is on this page, so there are no surprises.",
  zonesEyebrow: "Delivery",
  zonesTitle: "Where and for how much",
  tableHead: ["Zone", "Travel for measurement and installation", "Delivery"],
  tableRows: [
    [f.delivery.freeRegions, "free", "free"],
    ["Other regions of Ukraine", "by mileage", `${f.delivery.perKm} from Kostopil`],
    [`EU: ${f.delivery.eu}`, "by arrangement", "with customs clearance, priced individually"],
  ],
  tableCaption: "Mileage is counted one way to the cemetery, by map. We quote the amount immediately, together with the price of the piece.",
  cityMeta: (km, travel, free) => `${km ? `${km} km, ${travel}` : "workshop and yard"} · ${free ? "free travel" : "by mileage"}`,
  packEyebrow: "Packaging",
  packTitle: "How the stone travels",
  packText: `${f.delivery.packaging} The stele, base, slab and flower bed travel separately, each element in its own slot, so nothing rubs or knocks on the way.\n\nWe transport with our own truck fitted with a crane: it also unloads next to the plot, so there is no carrying a half-tonne stele by hand across the cemetery. If access to the plot is narrow, we plan for it at measurement rather than on installation day.`,
  installEyebrow: "Installation",
  installTitle: "A foundation that upholds the warranty",
  installText: `${f.installation.survey} ${f.installation.clay} ${f.installation.peat}\n\n${f.installation.crew} After installation we check the level again, seal the joints and take away the rubbish and the old monument if there was one. We hand over the plot finished; all that's left is to plant flowers.`,
  payEyebrow: "Payment",
  payTitle: "Three payments",
  payText: `${f.payment.methods}\n\nThe price is fixed in the contract after measurement and does not change during the work, even if stone prices rise. The ${f.warranty} warranty on stone, foundation and installation is included in the price and starts on the day of installation.`,
  faqEyebrow: "Questions",
  faqTitle: "What people ask about delivery and payment",
  faq: [
    { q: "Can I collect the monument myself and install it on my own?", a: "You can, and the price drops by the cost of installation. But the warranty on the foundation and geometry then does not apply; we are responsible only for the stone and engraving. We'll give you the foundation drawing and the installation instructions we use ourselves." },
    { q: "What if the monument is damaged in transit?", a: `The cargo is insured, and this is how we pack: ${f.delivery.packaging.toLowerCase()} In ten years not a single piece has been broken on the road, but if it happens we make a new element at our expense.` },
    { q: "Do you work with charitable foundations and companies?", a: "Yes. For foundations that install monuments for soldiers and for companies we invoice the legal entity, sign a contract and acceptance certificate, and provide the full set of documents. Bank transfer with or without VAT, depending on your status." },
    { q: "Is there an instalment plan?", a: "The three payments of 30/50/20 are our instalment plan for the production period, with no bank and no interest. If you need a longer schedule, we'll discuss it individually; most often we accommodate the families of fallen soldiers." },
    { q: "Can I be present at the installation?", a: "Yes, and we welcome it: you see the foundation before the slab covers it and accept the work on site. If you can't come, we send photos of every stage and a video of the finished result." },
  ],
})

const de = (f: LocalizedFacts): DeliveryCopy => ({
  crumb: "Lieferung und Zahlung",
  title: "Lieferung, Montage und Zahlung",
  lead: "Der Preis auf der Website enthält bereits Fundament, Lieferung und Montage in den Regionen Riwne und Wolhynien. Alles, was hinzukommen kann, steht auf dieser Seite — damit es keine Überraschungen gibt.",
  zonesEyebrow: "Lieferung",
  zonesTitle: "Wohin und zu welchem Preis",
  tableHead: ["Zone", "Anfahrt für Aufmaß und Montage", "Lieferung"],
  tableRows: [
    [f.delivery.freeRegions, "kostenlos", "kostenlos"],
    ["Andere Regionen der Ukraine", "nach Kilometern", `${f.delivery.perKm} ab Kostopil`],
    [`EU: ${f.delivery.eu}`, "nach Vereinbarung", "mit Zollabwicklung, individuell kalkuliert"],
  ],
  tableCaption: "Die Kilometer rechnen wir einfach bis zum Friedhof, laut Karte. Den Betrag nennen wir sofort zusammen mit dem Preis des Stücks.",
  cityMeta: (km, travel, free) => `${km ? `${km} km, ${travel}` : "Werkstatt und Platz"} · ${free ? "Anfahrt kostenlos" : "nach Kilometern"}`,
  packEyebrow: "Verpackung",
  packTitle: "Wie der Stein reist",
  packText: `${f.delivery.packaging} Stele, Sockel, Platte und Blumenbeet reisen getrennt, jedes Element in seiner Nische, sodass unterwegs nichts reibt oder schlägt.\n\nWir transportieren mit eigenem Fahrzeug mit Ladekran: Er entlädt auch neben der Grabstelle, sodass keine halbe Tonne Stele von Hand über den Friedhof getragen wird. Ist die Zufahrt zur Grabstelle eng, planen wir das beim Aufmaß und nicht am Montagetag.`,
  installEyebrow: "Montage",
  installTitle: "Ein Fundament, das die Garantie trägt",
  installText: `${f.installation.survey} ${f.installation.clay} ${f.installation.peat}\n\n${f.installation.crew} Nach der Montage prüfen wir die Waage erneut, versiegeln die Fugen und nehmen Abfall und das alte Grabmal mit, falls es eines gab. Die Grabstelle übergeben wir fertig — es bleibt nur noch, Blumen zu pflanzen.`,
  payEyebrow: "Zahlung",
  payTitle: "Drei Zahlungen",
  payText: `${f.payment.methods}\n\nDer Preis wird nach dem Aufmaß im Vertrag festgelegt und ändert sich während der Arbeit nicht — auch wenn der Stein teurer wird. Die ${f.warranty} Garantie auf Stein, Fundament und Montage ist im Preis enthalten und beginnt am Tag der Aufstellung.`,
  faqEyebrow: "Fragen",
  faqTitle: "Was zu Lieferung und Zahlung gefragt wird",
  faq: [
    { q: "Kann ich das Grabmal selbst abholen und aufstellen?", a: "Ja, und der Preis verringert sich um die Montagekosten. Die Garantie auf Fundament und Geometrie gilt dann aber nicht — wir haften nur für Stein und Gravur. Wir geben Ihnen den Fundamentplan und die Montageanleitung, die wir selbst verwenden." },
    { q: "Was, wenn das Grabmal beim Transport beschädigt wird?", a: `Die Fracht ist versichert, und wir verpacken so: ${f.delivery.packaging.toLowerCase()} In zehn Jahren ist kein einziges Stück unterwegs zerbrochen, aber sollte es passieren, fertigen wir das neue Element auf unsere Kosten.` },
    { q: "Arbeiten Sie mit Stiftungen und Unternehmen?", a: "Ja. Für Stiftungen, die Grabmale für Soldaten errichten, und für Unternehmen stellen wir die Rechnung auf die juristische Person aus, unterzeichnen Vertrag und Abnahmeprotokoll und übergeben den vollständigen Dokumentensatz. Überweisung mit oder ohne Mehrwertsteuer, je nach Ihrer Rechtsform." },
    { q: "Gibt es Ratenzahlung?", a: "Die drei Zahlungen 30/50/20 sind unsere Ratenzahlung für die Fertigungszeit, ohne Bank und ohne Zinsen. Wenn Sie einen längeren Zeitplan brauchen, besprechen wir das individuell; am häufigsten kommen wir den Familien gefallener Soldaten entgegen." },
    { q: "Kann ich bei der Montage dabei sein?", a: "Ja, und wir begrüßen das: Sie sehen das Fundament, bevor die Platte es verdeckt, und nehmen die Arbeit vor Ort ab. Wenn Sie nicht kommen können, senden wir Fotos jeder Phase und ein Video des fertigen Ergebnisses." },
  ],
})

const lt = (f: LocalizedFacts): DeliveryCopy => ({
  crumb: "Pristatymas ir apmokėjimas",
  title: "Pristatymas, montavimas ir apmokėjimas",
  lead: "Kaina svetainėje jau apima pamatą, pristatymą ir montavimą Rivnės ir Voluinės srityse. Viskas, kas gali prisidėti, — šiame puslapyje, kad nebūtų netikėtumų.",
  zonesEyebrow: "Pristatymas",
  zonesTitle: "Kur ir už kiek",
  tableHead: ["Zona", "Atvykimas išmatuoti ir montuoti", "Pristatymas"],
  tableRows: [
    [f.delivery.freeRegions, "nemokamai", "nemokamai"],
    ["Kitos Ukrainos sritys", "pagal kilometražą", `${f.delivery.perKm} nuo Kostopilio`],
    [`ES: ${f.delivery.eu}`, "susitarus", "su muitinės įforminimu, skaičiuojame individualiai"],
  ],
  tableCaption: "Kilometražą skaičiuojame į vieną pusę iki kapinių, pagal žemėlapį. Sumą pasakome iš karto kartu su gaminio kaina.",
  cityMeta: (km, travel, free) => `${km ? `${km} km, ${travel}` : "cechas ir aikštelė"} · ${free ? "atvykimas nemokamas" : "pagal kilometražą"}`,
  packEyebrow: "Pakavimas",
  packTitle: "Kaip keliauja akmuo",
  packText: `${f.delivery.packaging} Stela, postamentas, plokštė ir gėlynas keliauja atskirai, kiekvienas elementas savo nišoje, todėl kelyje niekas nesitrina ir nesidaužo.\n\nVežame nuosavu transportu su kranu-manipuliatoriumi: jis pat iškrauna prie kapavietės, todėl pustonės stelos rankomis per visas kapines nešti nereikia. Jei privažiavimas iki kapavietės siauras — tai suplanuojame matuodami, o ne montavimo dieną.`,
  installEyebrow: "Montavimas",
  installTitle: "Pamatas, kuris laiko garantiją",
  installText: `${f.installation.survey} ${f.installation.clay} ${f.installation.peat}\n\n${f.installation.crew} Po montavimo dar kartą patikriname lygį, užsandariname siūles, išvežame šiukšles ir seną paminklą, jei toks buvo. Kapavietę atiduodame paruoštą — lieka tik pasodinti gėles.`,
  payEyebrow: "Apmokėjimas",
  payTitle: "Trys mokėjimai",
  payText: `${f.payment.methods}\n\nKaina fiksuojama sutartyje po išmatavimo ir darbo metu nesikeičia — net jei akmuo pabrango. ${f.warranty} garantija akmeniui, pamatui ir montavimui įskaičiuota į kainą ir prasideda nuo pastatymo dienos.`,
  faqEyebrow: "Klausimai",
  faqTitle: "Apie pristatymą ir apmokėjimą klausia",
  faq: [
    { q: "Ar galiu pasiimti paminklą pats ir pastatyti savo jėgomis?", a: "Galima, ir kaina sumažės montavimo kainos suma. Bet garantija pamatui ir geometrijai tada negalioja — atsakome tik už akmenį ir graviravimą. Duosime pamato schemą ir montavimo instrukciją, kuriomis patys naudojamės." },
    { q: "O jei paminklą pažeis vežant?", a: `Krovinys apdraustas, o pakuojame taip: ${f.delivery.packaging.toLowerCase()} Per dešimt metų nė vieno sudaužyto gaminio kelyje, bet jei taip atsitiktų — naują elementą gaminame savo sąskaita.` },
    { q: "Ar dirbate su labdaros fondais ir įmonėmis?", a: "Taip. Fondams, kurie stato paminklus kariams, ir įmonėms išrašome sąskaitą juridiniam asmeniui, pasirašome sutartį ir aktą, pateikiame visą dokumentų paketą. Atsiskaitymas pavedimu su PVM arba be — priklausomai nuo jūsų formos." },
    { q: "Ar yra išsimokėjimas?", a: "Trys mokėjimai 30/50/20 — tai ir yra mūsų išsimokėjimas gamybos laikotarpiu, be banko ir palūkanų. Jei reikia ilgesnio grafiko — aptarsime individualiai; dažniausiai einame į kompromisą su žuvusių karių šeimomis." },
    { q: "Ar galima dalyvauti montuojant?", a: "Taip, ir tai sveikiname: matote pamatą prieš jį uždengiant plokšte ir priimate darbą vietoje. Jei atvykti negalite — siunčiame kiekvieno etapo nuotraukas ir gatavo rezultato vaizdo įrašą." },
  ],
})

export const DELIVERY_COPY: Record<Locale, (f: LocalizedFacts) => DeliveryCopy> = { uk, pl, en, de, lt }
