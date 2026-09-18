import type { Locale } from "@/lib/types"
import type { LocalizedFacts } from "@/lib/i18n/copy/facts"
import type { ProductType } from "@/lib/product-copy"

export type PricesCopy = {
  crumb: string
  title: string
  lead: (minFormatted: string | null) => string
  typesEyebrow: string
  typesTitle: string
  types: Record<ProductType, { label: string; includes: string }>
  tableHead: string[]
  tableCaption: string
  servicesEyebrow: string
  servicesTitle: string
  servicesHead: string[]
  servicesCaption: string
  payEyebrow: string
  payTitle: string
  payNote: string
  payLink: string
  faqEyebrow: string
  faqTitle: string
  faq: { q: string; a: string }[]
  cta: { title: string; text: string; button: string }
}

const paymentLine = (f: LocalizedFacts) => `${f.payment.steps.map((s) => `${s.share} — ${s.when}`).join("; ")}. ${f.payment.methods}`

const uk = (f: LocalizedFacts): PricesCopy => ({
  crumb: "Ціни",
  title: "Ціни на пам'ятники",
  lead: (min) => `Від виробника, з фундаментом і монтажем. ${min ? `Каталог починається з ${min} за одинарний пам'ятник` : "Каталог оновлюється"}`,
  typesEyebrow: "За типом виробу",
  typesTitle: "Скільки коштує пам'ятник",
  types: {
    single: { label: "Одинарний пам'ятник", includes: "стела, тумба, квітник, портрет і напис, фундамент, монтаж" },
    double: { label: "Подвійний пам'ятник", includes: "широка стела або дві, тумба, квітник на дві могили, два портрети" },
    european: { label: "Європейський пам'ятник", includes: "низька стела, надгробна плита, тумба, портрет і напис" },
    cross: { label: "Хрест гранітний", includes: "хрест із суцільної плити, тумба, напис, квітник" },
    child: { label: "Дитячий пам'ятник", includes: "стела зменшеного розміру, тумба, квітник, портрет" },
    complex: { label: "Меморіальний комплекс", includes: "стела, тумба, плита з квітником, облицювання ділянки, фундамент" },
    military: { label: "Військовий пам'ятник", includes: "стела, портрет у формі, символіка, плита, облицювання, документи" },
    special: { label: "Меморіальний виріб", includes: "" },
  },
  tableHead: ["Тип", "Від", "Типово", "До", "Термін", "У базовій ціні"],
  tableCaption: "«Типово» — медіана цін моделей цього типу в каталозі. Усі ціни в гривнях, на дату перегляду сторінки.",
  servicesEyebrow: "Послуги",
  servicesTitle: "Гравіювання, доповнення, благоустрій",
  servicesHead: ["Робота", "Ціна", "Примітка"],
  servicesCaption: "Орієнтовні ціни на роботи окремо від пам'ятника. Точну вартість називаємо після фото.",
  payEyebrow: "Оплата",
  payTitle: "Три платежі",
  payNote: `${f.payment.methods} Гарантія ${f.warranty} на камінь, фундамент і монтаж входить у ціну.`,
  payLink: "Докладніше про доставку й оплату",
  faqEyebrow: "Питання",
  faqTitle: "Про ціни запитують найчастіше",
  faq: [
    { q: "Чому ціна вказана «від»?", a: "Ціна «від» — це базова комплектація моделі в мінімальному стандартному розмірі, з фундаментом і монтажем. Остаточна вартість залежить від розміру ділянки, висоти й товщини стели, кількості гравіювань і додаткових елементів. Після фото ділянки називаємо точну цифру, і вона не змінюється під час роботи." },
    { q: "Чи входить монтаж і фундамент у ціну?", a: "Так. У кожній ціні на сайті вже є армований бетонний фундамент, доставка й монтаж бригадою в межах Рівненської та Волинської областей. В інші регіони доставка рахується за пробігом, і ми називаємо її одразу разом із ціною виробу." },
    { q: "Як оплачувати?", a: paymentLine(f) },
    { q: "Скільки коштує лише гравіювання портрета на вже встановленому пам'ятнику?", a: "Портрет на готовому камені — від 2 000 ₴ разом із ретушшю фото, виконуємо на кладовищі або в цеху, якщо стелу можна зняти. Термін — 7–10 днів. Виїзд по Рівненщині й Волині безкоштовний." },
  ],
  cta: { title: "Точна ціна — за фото ділянки", text: "Надішліть фото місця і модель, яка сподобалась, — протягом робочого дня повернемось із ескізом у вашому камені й остаточною цифрою, яка не зміниться під час роботи.", button: "Отримати точну ціну" },
})

const pl = (f: LocalizedFacts): PricesCopy => ({
  crumb: "Ceny",
  title: "Ceny pomników",
  lead: (min) => `Od producenta, z fundamentem i montażem. ${min ? `Katalog zaczyna się od ${min} za pomnik pojedynczy` : "Katalog jest aktualizowany"}`,
  typesEyebrow: "Według typu wyrobu",
  typesTitle: "Ile kosztuje pomnik",
  types: {
    single: { label: "Pomnik pojedynczy", includes: "stela, podstawa, kwietnik, portret i napis, fundament, montaż" },
    double: { label: "Pomnik podwójny", includes: "szeroka stela lub dwie, podstawa, kwietnik na dwa groby, dwa portrety" },
    european: { label: "Pomnik europejski", includes: "niska stela, płyta nagrobna, podstawa, portret i napis" },
    cross: { label: "Krzyż granitowy", includes: "krzyż z jednolitej płyty, podstawa, napis, kwietnik" },
    child: { label: "Pomnik dziecięcy", includes: "stela pomniejszona, podstawa, kwietnik, portret" },
    complex: { label: "Kompleks nagrobny", includes: "stela, podstawa, płyta z kwietnikiem, obłożenie miejsca, fundament" },
    military: { label: "Pomnik wojskowy", includes: "stela, portret w mundurze, symbolika, płyta, obłożenie, dokumenty" },
    special: { label: "Wyrób memorialny", includes: "" },
  },
  tableHead: ["Typ", "Od", "Typowo", "Do", "Termin", "W cenie podstawowej"],
  tableCaption: "„Typowo” — mediana cen modeli tego typu w katalogu. Ceny przeliczone z hrywien po aktualnym kursie, na dzień przeglądania strony.",
  servicesEyebrow: "Usługi",
  servicesTitle: "Grawer, dodatki, zagospodarowanie",
  servicesHead: ["Praca", "Cena", "Uwaga"],
  servicesCaption: "Orientacyjne ceny prac osobno od pomnika. Dokładny koszt podajemy po zdjęciu.",
  payEyebrow: "Płatność",
  payTitle: "Trzy wpłaty",
  payNote: `${f.payment.methods} Gwarancja ${f.warranty} na kamień, fundament i montaż jest w cenie.`,
  payLink: "Więcej o dostawie i płatności",
  faqEyebrow: "Pytania",
  faqTitle: "O ceny pytają najczęściej",
  faq: [
    { q: "Dlaczego cena jest podana „od”?", a: "Cena „od” to podstawowa konfiguracja modelu w minimalnym standardowym wymiarze, z fundamentem i montażem. Ostateczny koszt zależy od wymiaru miejsca, wysokości i grubości steli, liczby grawerów i elementów dodatkowych. Po zdjęciu miejsca podajemy dokładną kwotę i nie zmienia się ona w trakcie pracy." },
    { q: "Czy montaż i fundament są w cenie?", a: "Tak. W każdej cenie na stronie jest już zbrojony fundament betonowy, dostawa i montaż ekipy w granicach obwodów rówieńskiego i wołyńskiego. Do innych regionów dostawę liczymy według kilometrów i podajemy ją od razu razem z ceną wyrobu." },
    { q: "Jak płacić?", a: paymentLine(f) },
    { q: "Ile kosztuje sam grawer portretu na już postawionym pomniku?", a: "Portret na gotowym kamieniu — od 2 000 ₴ razem z retuszem zdjęcia, wykonujemy na cmentarzu lub w zakładzie, jeśli stelę można zdjąć. Termin — 7–10 dni. Dojazd w obwodach rówieńskim i wołyńskim bezpłatny." },
  ],
  cta: { title: "Dokładna cena — na podstawie zdjęcia miejsca", text: "Wyślij zdjęcie miejsca i model, który się spodobał — w ciągu dnia roboczego odeślemy szkic w Twoim kamieniu i ostateczną kwotę, która nie zmieni się w trakcie pracy.", button: "Poznaj dokładną cenę" },
})

const en = (f: LocalizedFacts): PricesCopy => ({
  crumb: "Prices",
  title: "Monument prices",
  lead: (min) => `From the manufacturer, with foundation and installation. ${min ? `The catalogue starts at ${min} for a single monument` : "The catalogue is being updated"}`,
  typesEyebrow: "By product type",
  typesTitle: "How much a monument costs",
  types: {
    single: { label: "Single monument", includes: "stele, base, flower bed, portrait and inscription, foundation, installation" },
    double: { label: "Double monument", includes: "a wide stele or two, base, flower bed for two graves, two portraits" },
    european: { label: "European-style monument", includes: "low stele, grave slab, base, portrait and inscription" },
    cross: { label: "Granite cross", includes: "cross from a solid slab, base, inscription, flower bed" },
    child: { label: "Children's monument", includes: "reduced-size stele, base, flower bed, portrait" },
    complex: { label: "Memorial complex", includes: "stele, base, slab with flower bed, plot cladding, foundation" },
    military: { label: "Military monument", includes: "stele, portrait in uniform, insignia, slab, cladding, documents" },
    special: { label: "Memorial piece", includes: "" },
  },
  tableHead: ["Type", "From", "Typical", "Up to", "Lead time", "In the base price"],
  tableCaption: "“Typical” is the median price of models of this type in the catalogue. Prices are converted from hryvnia at the current rate, as of the day you view the page.",
  servicesEyebrow: "Services",
  servicesTitle: "Engraving, additions, landscaping",
  servicesHead: ["Work", "Price", "Note"],
  servicesCaption: "Indicative prices for work ordered separately from a monument. We quote the exact cost after seeing a photo.",
  payEyebrow: "Payment",
  payTitle: "Three payments",
  payNote: `${f.payment.methods} The ${f.warranty} warranty on stone, foundation and installation is included in the price.`,
  payLink: "More about delivery and payment",
  faqEyebrow: "Questions",
  faqTitle: "The most common questions about prices",
  faq: [
    { q: "Why is the price given as “from”?", a: "The “from” price is the base configuration of the model in the minimum standard size, with foundation and installation. The final cost depends on the size of the plot, the height and thickness of the stele, the amount of engraving and extra elements. After a photo of the plot we name an exact figure, and it does not change during the work." },
    { q: "Are installation and the foundation included?", a: "Yes. Every price on the site already includes a reinforced concrete foundation, delivery and installation by our crew within the Rivne and Volyn regions. For other regions delivery is charged by mileage, and we quote it right away together with the price of the piece." },
    { q: "How do I pay?", a: paymentLine(f) },
    { q: "How much is just a portrait engraving on an already installed monument?", a: "A portrait on an existing stone costs from 2,000 ₴ including photo retouching; we do it at the cemetery or in the workshop if the stele can be removed. Lead time 7–10 days. Travel in the Rivne and Volyn regions is free." },
  ],
  cta: { title: "An exact price from a photo of the plot", text: "Send a photo of the site and the model you like. Within one working day we'll return a sketch in your stone and a final figure that won't change during the work.", button: "Get an exact price" },
})

const de = (f: LocalizedFacts): PricesCopy => ({
  crumb: "Preise",
  title: "Preise für Grabmale",
  lead: (min) => `Vom Hersteller, mit Fundament und Montage. ${min ? `Der Katalog beginnt bei ${min} für ein Einzelgrabmal` : "Der Katalog wird aktualisiert"}`,
  typesEyebrow: "Nach Produkttyp",
  typesTitle: "Was ein Grabmal kostet",
  types: {
    single: { label: "Einzelgrabmal", includes: "Stele, Sockel, Blumenbeet, Porträt und Inschrift, Fundament, Montage" },
    double: { label: "Doppelgrabmal", includes: "breite Stele oder zwei, Sockel, Blumenbeet für zwei Gräber, zwei Porträts" },
    european: { label: "Grabmal im europäischen Stil", includes: "niedrige Stele, Grabplatte, Sockel, Porträt und Inschrift" },
    cross: { label: "Granitkreuz", includes: "Kreuz aus einer massiven Platte, Sockel, Inschrift, Blumenbeet" },
    child: { label: "Kindergrabmal", includes: "verkleinerte Stele, Sockel, Blumenbeet, Porträt" },
    complex: { label: "Grabanlage", includes: "Stele, Sockel, Platte mit Blumenbeet, Verkleidung der Grabstelle, Fundament" },
    military: { label: "Soldatengrabmal", includes: "Stele, Porträt in Uniform, Symbolik, Platte, Verkleidung, Dokumente" },
    special: { label: "Gedenkstück", includes: "" },
  },
  tableHead: ["Typ", "Ab", "Typisch", "Bis", "Dauer", "Im Grundpreis"],
  tableCaption: "„Typisch“ ist der Medianpreis der Modelle dieses Typs im Katalog. Preise aus Hrywnja zum aktuellen Kurs umgerechnet, Stand des Seitenaufrufs.",
  servicesEyebrow: "Leistungen",
  servicesTitle: "Gravur, Ergänzungen, Grabgestaltung",
  servicesHead: ["Arbeit", "Preis", "Hinweis"],
  servicesCaption: "Richtpreise für Arbeiten getrennt vom Grabmal. Den genauen Preis nennen wir nach dem Foto.",
  payEyebrow: "Zahlung",
  payTitle: "Drei Zahlungen",
  payNote: `${f.payment.methods} Die ${f.warranty} Garantie auf Stein, Fundament und Montage ist im Preis enthalten.`,
  payLink: "Mehr zu Lieferung und Zahlung",
  faqEyebrow: "Fragen",
  faqTitle: "Die häufigsten Fragen zu den Preisen",
  faq: [
    { q: "Warum steht beim Preis „ab“?", a: "Der „ab“-Preis ist die Grundausführung des Modells in der kleinsten Standardgröße, mit Fundament und Montage. Der Endpreis hängt von der Größe der Grabstelle, Höhe und Dicke der Stele, dem Umfang der Gravuren und Zusatzelementen ab. Nach einem Foto der Grabstelle nennen wir die genaue Zahl, und sie ändert sich während der Arbeit nicht." },
    { q: "Sind Montage und Fundament im Preis enthalten?", a: "Ja. Jeder Preis auf der Website enthält bereits ein bewehrtes Betonfundament, Lieferung und Montage durch unser Team in den Regionen Riwne und Wolhynien. In andere Regionen wird die Lieferung nach Kilometern berechnet, und wir nennen sie sofort zusammen mit dem Preis des Stücks." },
    { q: "Wie wird bezahlt?", a: paymentLine(f) },
    { q: "Was kostet nur die Porträtgravur auf einem bereits aufgestellten Grabmal?", a: "Ein Porträt auf vorhandenem Stein kostet ab 2.000 ₴ inklusive Fotoretusche; wir gravieren auf dem Friedhof oder in der Werkstatt, wenn sich die Stele abnehmen lässt. Dauer 7–10 Tage. Anfahrt in den Regionen Riwne und Wolhynien kostenlos." },
  ],
  cta: { title: "Der genaue Preis — nach einem Foto der Grabstelle", text: "Senden Sie ein Foto des Ortes und das Modell, das Ihnen gefällt — innerhalb eines Arbeitstages erhalten Sie eine Skizze in Ihrem Stein und die endgültige Zahl, die sich während der Arbeit nicht ändert.", button: "Genauen Preis erhalten" },
})

const lt = (f: LocalizedFacts): PricesCopy => ({
  crumb: "Kainos",
  title: "Paminklų kainos",
  lead: (min) => `Iš gamintojo, su pamatu ir montavimu. ${min ? `Katalogas prasideda nuo ${min} už vienvietį paminklą` : "Katalogas atnaujinamas"}`,
  typesEyebrow: "Pagal gaminio tipą",
  typesTitle: "Kiek kainuoja paminklas",
  types: {
    single: { label: "Vienvietis paminklas", includes: "stela, postamentas, gėlynas, portretas ir užrašas, pamatas, montavimas" },
    double: { label: "Dvivietis paminklas", includes: "plati stela arba dvi, postamentas, gėlynas dviem kapams, du portretai" },
    european: { label: "Europietiškas paminklas", includes: "žema stela, antkapio plokštė, postamentas, portretas ir užrašas" },
    cross: { label: "Granito kryžius", includes: "kryžius iš vientisos plokštės, postamentas, užrašas, gėlynas" },
    child: { label: "Vaikų paminklas", includes: "sumažinta stela, postamentas, gėlynas, portretas" },
    complex: { label: "Memorialinis kompleksas", includes: "stela, postamentas, plokštė su gėlynu, kapavietės apdaila, pamatas" },
    military: { label: "Karinis paminklas", includes: "stela, portretas uniformoje, simbolika, plokštė, apdaila, dokumentai" },
    special: { label: "Memorialinis gaminys", includes: "" },
  },
  tableHead: ["Tipas", "Nuo", "Tipiškai", "Iki", "Terminas", "Bazinėje kainoje"],
  tableCaption: "„Tipiškai“ — šio tipo modelių kainų mediana kataloge. Kainos perskaičiuotos iš grivinų dabartiniu kursu puslapio peržiūros dieną.",
  servicesEyebrow: "Paslaugos",
  servicesTitle: "Graviravimas, papildymai, aplinkos tvarkymas",
  servicesHead: ["Darbas", "Kaina", "Pastaba"],
  servicesCaption: "Orientacinės darbų kainos atskirai nuo paminklo. Tikslią kainą pasakome po nuotraukos.",
  payEyebrow: "Apmokėjimas",
  payTitle: "Trys mokėjimai",
  payNote: `${f.payment.methods} ${f.warranty} garantija akmeniui, pamatui ir montavimui įskaičiuota į kainą.`,
  payLink: "Daugiau apie pristatymą ir apmokėjimą",
  faqEyebrow: "Klausimai",
  faqTitle: "Apie kainas klausia dažniausiai",
  faq: [
    { q: "Kodėl kaina nurodyta „nuo“?", a: "Kaina „nuo“ — tai bazinė modelio komplektacija minimalaus standartinio dydžio, su pamatu ir montavimu. Galutinė kaina priklauso nuo kapavietės dydžio, stelos aukščio ir storio, graviūrų kiekio ir papildomų elementų. Po kapavietės nuotraukos pasakome tikslią sumą, ir ji darbo metu nesikeičia." },
    { q: "Ar montavimas ir pamatas įskaičiuoti į kainą?", a: "Taip. Kiekvienoje kainoje svetainėje jau yra armuotas betoninis pamatas, pristatymas ir brigados montavimas Rivnės ir Voluinės srityse. Į kitus regionus pristatymas skaičiuojamas pagal kilometražą, ir jį pasakome iš karto kartu su gaminio kaina." },
    { q: "Kaip mokėti?", a: paymentLine(f) },
    { q: "Kiek kainuoja tik portreto graviravimas ant jau pastatyto paminklo?", a: "Portretas ant esamo akmens — nuo 2 000 ₴ kartu su nuotraukos retušu, atliekame kapinėse arba ceche, jei stelą galima nuimti. Terminas — 7–10 dienų. Atvykimas Rivnės ir Voluinės srityse nemokamas." },
  ],
  cta: { title: "Tiksli kaina — pagal kapavietės nuotrauką", text: "Atsiųskite vietos nuotrauką ir patikusį modelį — per darbo dieną grąžinsime eskizą jūsų akmenyje ir galutinę sumą, kuri darbo metu nesikeis.", button: "Gauti tikslią kainą" },
})

export const PRICES_COPY: Record<Locale, (f: LocalizedFacts) => PricesCopy> = { uk, pl, en, de, lt }
