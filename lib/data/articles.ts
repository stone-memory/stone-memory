import type { Locale } from "@/lib/types"
import { extraArticles } from "@/lib/data/articles-extra"

export type ArticleCategory = "stone" | "memorials" | "design" | "care" | "history"

export type Article = {
  slug: string
  category: ArticleCategory
  cover: string
  readMinutes: number
  date: string
  title: Record<Locale, string>
  excerpt: Record<Locale, string>
  body: Record<Locale, { heading?: string; text: string }[]>
}


export const categoryTitles: Record<ArticleCategory, Record<Locale, string>> = {
  stone: {
    uk: "Камінь і матеріали",
    en: "Stone & materials",
    pl: "Kamień i materiały",
    de: "Stein & Materialien",
    lt: "Akmuo ir medžiagos",
  },
  memorials: {
    uk: "Пам'ятники",
    en: "Memorials",
    pl: "Pomniki",
    de: "Grabmale",
    lt: "Paminklai",
  },
  design: {
    uk: "Дизайн",
    en: "Design",
    pl: "Design",
    de: "Design",
    lt: "Dizainas",
  },
  care: {
    uk: "Догляд",
    en: "Care",
    pl: "Pielęgnacja",
    de: "Pflege",
    lt: "Priežiūra",
  },
  history: {
    uk: "Історія",
    en: "History",
    pl: "Historia",
    de: "Geschichte",
    lt: "Istorija",
  },
}

type Block = { heading?: string; text: string }

/**
 * Українська — повна версія, англійська — скорочена; польська, німецька й
 * литовська читають англійську, поки немає перекладу. Статті живуть у
 * Supabase (таблиця articles) — після правок тут натисніть «Оновити тексти
 * з коду» в /admin/blog, інакше сайт покаже стару версію з бази.
 */
export const body = (uk: Block[], en: Block[]): Article["body"] => ({ uk, en, pl: en, de: en, lt: en })

const seedArticles: Article[] = [
  {
    slug: "how-to-choose-granite",
    category: "stone",
    cover: "/blog/how-to-choose-granite.jpg",
    readMinutes: 9,
    date: "2026-03-12",
    title: {
      uk: "Як обрати граніт для пам'ятника: 7 речей, які варто знати до замовлення",
      en: "How to choose granite for a monument: 7 things to know before ordering",
      pl: "Jak wybrać granit na pomnik: 7 rzeczy, które warto wiedzieć",
      de: "Granit für ein Grabmal auswählen: 7 Dinge, die man vorher wissen sollte",
      lt: "Kaip pasirinkti granitą paminklui: 7 dalykai prieš užsakant",
    },
    excerpt: {
      uk: "Родовище, щільність, колір, товщина, поверхня, паспорт каменю і ціна — на що дивитись, щоб пам'ятник стояв десятиліттями, а не два роки.",
      en: "Quarry, density, colour, thickness, finish, quarry passport and price — what to check so the monument lasts decades, not two years.",
      pl: "Złoże, gęstość, kolor, grubość, wykończenie, paszport kamienia i cena.",
      de: "Herkunft, Dichte, Farbe, Stärke, Oberfläche, Steinpass und Preis.",
      lt: "Karjeras, tankis, spalva, storis, apdaila, akmens pasas ir kaina.",
    },
    body: body(
      [
        { text: "Граніт для пам'ятника обирають раз — і на десятиліття. Помилка на цьому етапі не виправляється поліруванням чи гравіюванням: тонка стела трісне на другу зиму, змішаний камінь вигорить плямами, а «економний» блок із прожилкою розколеться під власною вагою. Нижче — сім речей, які ми перевіряємо самі перед тим, як різати, і які варто запитати в будь-якій майстерні." },
        { heading: "1. Родовище, а не «чорний граніт»", text: "В Україні немає чорного граніту. Те, що так називають у салонах, — це габро (Головинське, Букинське родовища) або лабрадорит (Горбулівське, Добринське). Це різні породи з різною поведінкою: габро — рівний глибокий чорний, лабрадорит — із синіми переливами на сонці. Сірий — це покостівський граніт, червоний — лезниківський або капустинський, зелений — дідковицький. Якщо продавець не може назвати родовище, він не знає, що продає. Ми в картці кожного виробу пишемо конкретний кар'єр." },
        { heading: "2. Щільність і водопоглинання", text: "Пам'ятник руйнує не мороз, а вода, яка замерзає всередині каменю. Тому головна цифра — водопоглинання: у габро й лабрадориту воно 0,1–0,2 %, в українських гранітів 0,2–0,4 %. Для порівняння, у мармуру — до 1 %, у штучного «литого граніту» — ще більше. Чим менше камінь п'є, тим довше тримає полірування й гравіювання. Це один із тих параметрів, який є в паспорті кар'єру, і його варто попросити." },
        { heading: "3. Колір — і що з ним стається на сонці", text: "Колір граніту дає мінеральний склад, а не покриття, тому натуральний камінь не вигорає. Але є нюанс: червоні граніти (лезниківський, капустинський) можуть трохи темнішати від вологи, а сірий покостівський — «сивіти» через наліт, якщо його не мити. Чорне габро найстабільніше за кольором і найкраще тримає контраст гравіювання, тому портретні пам'ятники найчастіше роблять саме з нього. Кольоровий камінь красивіший на сонячному відкритому кладовищі, чорний — під деревами." },
        { heading: "4. Товщина стели", text: "Стандарт для одиночної стели — 8 см при висоті до 100 см і 10 см при 120 см і вище. Стели 5–6 см дешевші на третину, і саме вони ламаються при монтажі або від удару гілки. Товщина тумби — не менше 15 см, надгробної плити — 5 см на бетонній основі. Якщо ціна підозріло низька, спочатку запитайте товщину." },
        { heading: "5. Поверхня: полірування, термо, антик", text: "Полірована поверхня — дзеркало, на якому гравіювання дає найбільший контраст; це стандарт для лицьової сторони стели. Термооброблена — матова шорстка фактура, не ковзає і не блищить: для облицювання ділянки, сходинок, доріжок. «Антик» або шліфована — м'який шовковистий блиск для декоративних елементів. Не варто робити всю ділянку полірованою: узимку це ковзанка, а влітку — сліпить." },
        { heading: "6. Паспорт каменю і як виглядає блок", text: "Для українського каменю кар'єр видає паспорт партії: родовище, щільність, водопоглинання, радіаційний клас (для пам'ятників потрібен І клас — він у всіх українських гранітів). Попросіть показати сам блок або плиту до полірування: прожилки, «жили» іншого кольору й дрібні тріщини на сирому камені видно, на полірованому — ні. Ми відбраковуємо такі плити ще в цеху, і саме тому можемо дати гарантію на камінь." },
        { heading: "7. Ціна: що в ній насправді", text: "Камінь — це лише 15–35 % вартості пам'ятника. Решта — різання, полірування, гравіювання, фундамент, доставка й монтаж. Тому різниця між покостівським гранітом і лабрадоритом у ціні одинарного пам'ятника — кілька тисяч гривень, а не подвоєння. Якщо два пам'ятники з «одного каменю» різняться в ціні удвічі, різниця не в камені: це товщина, комплектація, або монтаж, якого в дешевшій ціні просто немає." },
        { heading: "Що робити далі", text: "Подивіться довідник каменю на сайті — там кожна порода з фото, коефіцієнтом ціни й прикладом виробу. У картці будь-якої моделі є селектор каменю: перемикайте й дивіться, як змінюється ціна. А якщо сумніваєтесь — приїжджайте в цех у Костополі, покажемо плити наживо." },
      ],
      [
        { text: "You choose granite for a monument once — and for decades. Below are the seven things we check ourselves before cutting, and which are worth asking any workshop." },
        { heading: "1. Quarry, not \"black granite\"", text: "There is no black granite in Ukraine. What showrooms call that is gabbro (Holovyne, Buky) or labradorite (Horbuliv, Dobryn). Grey is Pokostivka granite, red is Leznyky or Kapustyne, green is Didkovychi. If a seller cannot name the quarry, he does not know what he sells." },
        { heading: "2. Density and water absorption", text: "Frost does not destroy a monument — water freezing inside the stone does. Gabbro and labradorite absorb 0.1–0.2 %, Ukrainian granites 0.2–0.4 %, marble up to 1 %. Ask for the quarry passport." },
        { heading: "3. Colour in sunlight", text: "Granite colour comes from minerals, not a coating, so it does not fade. Black gabbro is the most stable and gives the strongest engraving contrast, which is why portrait monuments are mostly made from it." },
        { heading: "4. Slab thickness", text: "Standard: 8 cm for a stele up to 100 cm high, 10 cm above 120 cm. 5–6 cm slabs are a third cheaper and are the ones that break. If a price looks too low, ask about thickness first." },
        { heading: "5. Finish", text: "Polished for the face of the stele (maximum engraving contrast), flamed for paving and steps (non-slip), honed for decorative parts. Do not polish the whole plot: it is an ice rink in winter." },
        { heading: "6. Passport and the raw block", text: "Ask to see the slab before polishing: veins and hairline cracks show on raw stone and vanish under polish. We reject such slabs in the workshop — that is why we can guarantee the stone." },
        { heading: "7. What the price is made of", text: "Stone is only 15–35 % of a monument's price. The rest is cutting, polishing, engraving, foundation, delivery and installation. If two monuments in \"the same stone\" differ twofold, the difference is thickness, scope or missing installation." },
      ]
    ),
  },
  {
    slug: "single-vs-double-memorial",
    category: "memorials",
    cover: "/blog/single-vs-double-memorial.jpg",
    readMinutes: 8,
    date: "2026-02-28",
    title: {
      uk: "Одиночний чи подвійний пам'ятник: як вирішити, якщо місце поруч",
      en: "Single or double monument: how to decide when the plots are side by side",
      pl: "Pomnik pojedynczy czy podwójny: jak zdecydować",
      de: "Einzel- oder Doppelgrabmal: die Entscheidung",
      lt: "Vienvietis ar dvivietis paminklas: kaip nuspręsti",
    },
    excerpt: {
      uk: "Коли варто ставити подвійний одразу, як залишити місце під другий портрет, чому камінь має бути з однієї партії і скільки це коштує в обох варіантах.",
      en: "When to install a double right away, how to leave space for a second portrait, why the stone must come from one batch, and what both options cost.",
      pl: "Kiedy warto od razu postawić podwójny i ile to kosztuje.",
      de: "Wann sich ein Doppelgrabmal sofort lohnt und was beide Varianten kosten.",
      lt: "Kada verta iš karto statyti dvivietį ir kiek tai kainuoja.",
    },
    body: body(
      [
        { text: "Це одне з найважчих рішень, яке доводиться приймати родинам: ставити пам'ятник на одну могилу чи одразу на дві, коли поруч є місце для другого з подружжя. Тут немає правильної відповіді, але є кілька практичних речей, які допомагають вирішити спокійно." },
        { heading: "Три варіанти, а не два", text: "Перший — одиночний пам'ятник, а другий поставити колись поруч. Другий — подвійний одразу: одна широка стела 120×60 см на спільній тумбі, з місцем під другий портрет і напис. Третій, про який часто забувають, — два одиночні на спільній надгробній плиті: стели по 80×45 см із того самого каменю, поставлені в один час або з різницею в роки, але з однієї партії блоків. Третій варіант найгнучкіший і найчастіше найдоречніший." },
        { heading: "Чому камінь має бути з однієї партії", text: "Габро з одного родовища, але з різних блоків, різниться відтінком: один трохи сіріший, інший глибше чорний. Поруч, на сонці, різницю видно. Якщо ви плануєте два пам'ятники з різницею в роки — скажіть про це одразу: ми відріжемо обидві стели з одного блоку, другу відполіруємо й збережемо в цеху, а гравіювання зробимо, коли настане час. Це не дорожче, зате через десять років пам'ятники будуть однакові." },
        { heading: "Що з другим портретом на подвійному", text: "Найпоширеніша помилка — гравіювати обидва портрети одразу, «щоб не переробляти». Не варто: живій людині незатишно бачити свій портрет на пам'ятнику, а фото, яке подобається сьогодні, за двадцять років може не збігатись із тим, яким людину пам'ятатимуть. Ми залишаємо відполіроване поле під другий портрет і напис; догравіювати на встановленому пам'ятнику можна на місці, без демонтажу, за 7–10 днів." },
        { heading: "Скільки коштує", text: "Одиночний пам'ятник у базовій комплектації — від 17 500 ₴, подвійний — від 28 000 ₴, два одиночні на спільній плиті — від 40 000 ₴. Подвійний дешевший за два окремі, бо це одна тумба, один фундамент і один монтаж. Але якщо другий пам'ятник знадобиться через 20 років, ставити його доведеться в будь-якому разі — і тоді два одиночні з однієї партії обійдуться загалом не дорожче, ніж подвійний сьогодні плюс переробка." },
        { heading: "Розмір ділянки вирішує", text: "Подвійний пам'ятник потребує ділянки шириною не менше 200 см; стандартна одиночна — 100–120 см. На старих кладовищах між могилами часто 60–80 см проходу, і тоді широка стела просто не влазить або перекриває сусідню. Тому ми завжди починаємо з заміру: він безкоштовний у Рівненській і Волинській областях і показує, який із трьох варіантів реальний саме на вашому місці." },
        { heading: "Що ми радимо", text: "Якщо обидва місця вже викуплені і родина впевнена — подвійний. Якщо є сумніви або друга ділянка ще не оформлена — одиночний із каменем із тієї ж партії, відкладеним у цеху. Це рішення можна змінити в будь-який момент, і воно нічого не коштує." },
      ],
      [
        { text: "One of the hardest decisions families face: a monument for one grave, or for two at once when the adjacent plot is reserved. There is no single right answer, but a few practical points help." },
        { heading: "Three options, not two", text: "A single monument now and another one later; a double stele 120×60 cm on a shared base with space left for the second portrait; or two single steles on a shared slab, cut from the same block, installed years apart. The third is the most flexible." },
        { heading: "Why the stone must come from one batch", text: "Gabbro from the same quarry but different blocks differs in tone. Tell us if a second monument is planned: we cut both steles from one block, polish and keep the second in the workshop until it is needed." },
        { heading: "The second portrait", text: "Do not engrave both portraits at once. We leave a polished field for the second portrait and inscription; it can be engraved on site, without dismantling, in 7–10 days." },
        { heading: "What it costs", text: "Single from 17,500 UAH, double from 28,000 UAH, two singles on a shared slab from 40,000 UAH. A double is cheaper than two separate ones because it shares a base, foundation and installation." },
        { heading: "Plot size decides", text: "A double needs at least 200 cm of width; old cemeteries often leave 60–80 cm between graves. That is why we always start with a free survey." },
      ]
    ),
  },
  {
    slug: "stone-care-seasons",
    category: "care",
    cover: "/blog/stone-care-seasons.jpg",
    readMinutes: 7,
    date: "2026-02-14",
    title: {
      uk: "Догляд за гранітним пам'ятником по сезонах: що робити навесні, влітку, восени й узимку",
      en: "Caring for a granite monument through the seasons",
      pl: "Pielęgnacja pomnika granitowego przez cały rok",
      de: "Pflege eines Granitgrabmals im Jahreslauf",
      lt: "Granito paminklo priežiūra per metus",
    },
    excerpt: {
      uk: "Чим мити, чим не мити, як прибрати мох і наліт, що робити з позолотою і чому не варто «допомагати» каменю після зими.",
      en: "What to wash with and what to avoid, how to remove moss and film, what to do with gilding — and why not to \"help\" the stone after winter.",
      pl: "Czym myć, czym nie myć, jak usunąć mech i nalot.",
      de: "Womit reinigen, was vermeiden, wie Moos und Belag entfernen.",
      lt: "Kuo plauti, ko vengti, kaip pašalinti samanas ir apnašas.",
    },
    body: body(
      [
        { text: "Граніт — один із найневибагливіших матеріалів, які є, і більшість проблем із пам'ятниками виникає не через занедбаність, а через надмірну старанність: кислота «для сантехніки», жорстка щітка, плівка на зиму. Ось що справді потрібно, по сезонах." },
        { heading: "Весна: огляд і перше миття", text: "Після сходження снігу — оглянути: чи не нахилилась стела, чи не розійшовся шов між тумбою й стелою, чи не піднялась плитка. Дрібні зміни навесні — нормальна усадка, але якщо є зазор більше 3–4 мм або помітний нахил, подзвоніть нам: за гарантією виїжджаємо безкоштовно. Мити — теплою водою з господарським милом або нейтральним засобом, м'якою губкою. Наліт після зими сходить за одне миття." },
        { heading: "Літо: мох, пилок, сліди від квітів", text: "Найбільше бруду дають квіти й дерева: пилок, смола, рештки вінків. Зелений наліт на північному боці й у швах — це водорості й мох; їх знімає розчин мила або спеціальний засіб для каменю на основі перекису. Не використовуйте хлор і кислоти: полірування вони не зруйнують, але позолоту й фотокераміку — так. Вазу з водою краще спорожняти раз на тиждень: застояна вода залишає вапняне кільце." },
        { heading: "Осінь: підготовка до зими", text: "Прибрати листя з квітника й зі швів — воно тримає вологу. Перевірити герметизацію шва між стелою й тумбою: якщо герметик потріскався, вода потрапить у шов і взимку замерзне. Ми оновлюємо герметик під час планового виїзду; самостійно — нейтральний силікон для зовнішніх робіт, тонким швом. Не накривайте пам'ятник плівкою: під нею збирається конденсат, і саме він дає взимку найбільшу шкоду." },
        { heading: "Зима: не чіпати", text: "Найкраще, що можна зробити з пам'ятником узимку, — залишити його в спокої. Не збивайте лід, не солите доріжку біля тумби (сіль роз'їдає бетон і залишає білі плями на камені), не лийте гарячу воду на замерзлий граніт. Сніг із плити можна змести м'якою щіткою." },
        { heading: "Раз на 3–5 років", text: "Гідрофобне просочення для каменю — прозорий склад, який закриває пори й зменшує наліт удвічі. Наносити на чистий сухий камінь у теплу погоду. Ми робимо це під час гарантійного або планового виїзду; окремо послуга коштує від 1 200 ₴ разом із чищенням." },
        { heading: "Позолота й портрет", text: "Позолота напису тримається 8–12 років; коли починає бліднути — оновлюється на місці за годину. Гравійований портрет не стирається, бо це знята поверхня каменю, а не фарба; він лише може потемніти від нальоту, і тоді допомагає звичайне миття. Фотокераміку не терти: тільки вода й м'яка тканина." },
        { heading: "Коли кликати майстра", text: "Нахил стели, тріщина, піднята плитка, зазор у шві понад 3–4 мм, або просто бажання привести ділянку до ладу після довгої перерви. Для пам'ятників нашого виробництва в межах гарантії виїзд і роботи безкоштовні; для інших — реставрація за прайсом, огляд по Рівненщині й Волині безкоштовний." },
      ],
      [
        { text: "Granite is one of the least demanding materials there is; most problems come not from neglect but from overzealous care — acid cleaners, stiff brushes, plastic covers in winter." },
        { heading: "Spring", text: "Inspect: tilt, gaps in the joint between base and stele, lifted paving. Wash with warm water and mild soap. Gaps over 3–4 mm or a visible tilt — call us; warranty visits are free." },
        { heading: "Summer", text: "Pollen, resin, wreath remains and green algae on the north side. Mild soap or a peroxide-based stone cleaner. No chlorine, no acids — they damage gilding and photoceramics." },
        { heading: "Autumn", text: "Clear leaves from joints and flower bed, check the sealant. Never cover the monument with plastic film: condensation under it does the most winter damage." },
        { heading: "Winter", text: "Leave it alone. No ice chipping, no road salt near the base, no hot water on frozen stone." },
        { heading: "Every 3–5 years", text: "A hydrophobic impregnation halves the build-up of film. We apply it during warranty or scheduled visits." },
        { heading: "Gilding and portrait", text: "Gilding lasts 8–12 years and is renewed on site within an hour. An engraved portrait does not wear off — it is stone, not paint." },
      ]
    ),
  },
  {
    slug: "epitaph-writing",
    category: "design",
    cover: "/blog/epitaph-writing.jpg",
    readMinutes: 9,
    date: "2026-02-01",
    title: {
      uk: "Як написати епітафію: 60 прикладів для мами, тата, чоловіка, дитини, воїна",
      en: "How to write an epitaph: examples for a mother, father, husband, child, soldier",
      pl: "Jak napisać epitafium: przykłady",
      de: "Wie man eine Grabinschrift schreibt: Beispiele",
      lt: "Kaip parašyti epitafiją: pavyzdžiai",
    },
    excerpt: {
      uk: "Скільки слів поміщається на стелі, які шрифти читаються через 30 років, чого уникати — і добірка коротких епітафій, які справді використовують.",
      en: "How many words fit on a stele, which typefaces stay legible after 30 years, what to avoid — and a set of short epitaphs families actually use.",
      pl: "Ile słów mieści się na steli i zbiór krótkich epitafiów.",
      de: "Wie viele Worte auf die Stele passen und eine Auswahl kurzer Inschriften.",
      lt: "Kiek žodžių telpa ant stelos ir trumpų epitafijų rinkinys.",
    },
    body: body(
      [
        { text: "Епітафія — це найважча частина замовлення: не тому, що складно написати, а тому, що хочеться сказати все. Насправді працює навпаки: чим коротше, тим сильніше. Нижче — як ми допомагаємо родинам із текстом, і добірка формул, які використовують найчастіше." },
        { heading: "Скільки слів поміщається", text: "На одиночній стелі 80×45 см під портретом і датами лишається місце на 2–3 рядки по 20–25 символів. На стелі 100×50 — 3–4 рядки. Довший текст доводиться робити дрібним шрифтом, і через кілька років, коли гравіювання трохи потемніє, його важко прочитати. Тому: до 12 слів — ідеально, до 20 — припустимо, більше — краще на окремій плиті або на звороті стели." },
        { heading: "Що читається через 30 років", text: "Прості шрифти без засічок або класична антиква з висотою літер не менше 12 мм для епітафії і 25–30 мм для імені. Курсив і рукописні шрифти красиві на ескізі, але дрібні деталі літер першими забиваються нальотом. Гравіювання із заповненням золотом або білою емаллю додає контрасту на червоному й сірому камені; на чорному габро глибоке гравіювання читається без заповнення." },
        { heading: "Чого уникати", text: "Довгих цитат, які потребують лапок і посилання; абревіатур, зрозумілих лише родині; жартів, які через роки читатимуть чужі люди. Не варто писати те, що вже є на пам'ятнику: «народився — помер» дублює дати. Краще одне речення про людину, ніж три загальні." },
        { heading: "Мамі", text: "«Найкращій мамі — з любов'ю і вдячністю». «Твоє тепло залишилось з нами». «Мамо, ти назавжди в наших серцях». «Дякуємо за життя, за любов, за все». «Спи спокійно, рідна. Ми пам'ятаємо»." },
        { heading: "Татові", text: "«Батькові, який навчив нас жити». «Твоя сила залишилась у нас». «Чесному, доброму, надійному». «Ти був нашим опертям — і залишишся». «З любов'ю від дітей і онуків»." },
        { heading: "Чоловікові, дружині", text: "«Коханому — до зустрічі». «Ти був моїм життям». «Разом назавжди». «Половинко моя, я поруч». «Спасибі за роки щастя»." },
        { heading: "Дитині", text: "«Наш янголятко». «Ти спиш, а ми любимо». «Маленька зірочко, світи нам». «Ми не встигли сказати все — але ти знаєш». «Коротке життя — велика любов»." },
        { heading: "Воїну", text: "«Герої не вмирають». «Життя за Україну». «Захисник. Син. Брат». «Ти тримав небо над нами». «Полеглим — слава, живим — обов'язок пам'ятати». Для військових часто додають позивний у лапках, назву підрозділу й місце загибелі — це доречно й читається як частина історії, а не як напис." },
        { heading: "З Письма й поезії", text: "«Блаженні чисті серцем» (Мт 5:8). «Я — воскресіння і життя» (Ів 11:25). «Любов ніколи не перестає» (1 Кор 13:8). «Все минає, й тільки правда зостається» (Т. Шевченко). «Є вічність — і в ній ми знову зустрінемось» — цю фразу просять частіше за будь-яку цитату." },
        { heading: "Як ми допомагаємо", text: "Надішліть кілька речень про людину — чим займалась, що любила, як її називали вдома. Дизайнер запропонує три-чотири варіанти епітафії у розмірі, який реально поміщається на вашій стелі, і покаже їх на ескізі. Змінювати можна скільки завгодно до початку гравіювання. Мова напису — будь-яка: українська, польська, англійська, німецька; для інших підбираємо шрифт із потрібними літерами." },
      ],
      [
        { text: "The epitaph is the hardest part of an order — not because it is hard to write, but because one wants to say everything. It works the other way round: the shorter, the stronger." },
        { heading: "How many words fit", text: "On a 80×45 cm stele, 2–3 lines of 20–25 characters remain under the portrait and dates. Up to 12 words is ideal, up to 20 acceptable; longer texts belong on a separate plate." },
        { heading: "What stays legible", text: "Simple sans-serif or classic serif faces, letters at least 12 mm for the epitaph and 25–30 mm for the name. Scripts look beautiful on the sketch but clog with film first." },
        { heading: "Examples", text: "For a mother: \"To the best mother — with love and gratitude\". For a father: \"You were our support — and remain so\". For a spouse: \"Together forever\". For a child: \"Our little angel\". For a soldier: \"Heroes do not die\", often with the call sign and unit." },
        { heading: "How we help", text: "Send a few sentences about the person. The designer proposes three or four epitaphs at a size that actually fits your stele and shows them on the sketch. Any language." },
      ]
    ),
  },
  {
    slug: "black-granite-deep-dive",
    category: "stone",
    cover: "/blog/black-granite-deep-dive.jpg",
    readMinutes: 7,
    date: "2026-01-21",
    title: {
      uk: "Габро, лабрадорит і «чорний граніт»: що насправді купують під цією назвою",
      en: "Gabbro, labradorite and \"black granite\": what you actually buy under that name",
      pl: "Gabro, labradoryt i „czarny granit”",
      de: "Gabbro, Labradorit und „schwarzer Granit“",
      lt: "Gabras, labradoritas ir „juodas granitas“",
    },
    excerpt: {
      uk: "Чому чорного граніту в Україні немає, чим Головинське габро відрізняється від Букинського, коли брати лабрадорит і як відрізнити український камінь від індійського й китайського.",
      en: "Why there is no black granite in Ukraine, how Holovyne gabbro differs from Buky, when to take labradorite, and how to tell Ukrainian stone from Indian and Chinese.",
      pl: "Dlaczego w Ukrainie nie ma czarnego granitu i czym różnią się złoża.",
      de: "Warum es in der Ukraine keinen schwarzen Granit gibt.",
      lt: "Kodėl Ukrainoje nėra juodo granito.",
    },
    body: body(
      [
        { text: "«Чорний граніт» — найпопулярніший запит у нашій ніші й водночас найбільша плутанина. Чорного граніту як породи в Україні не добувають. Те, що продають під цією назвою, — це габро або лабрадорит, і різниця між ними важлива для того, як пам'ятник виглядатиме через десять років." },
        { heading: "Габро: чорний без переливів", text: "Габро — магматична порода, щільніша й дрібнозернистіша за граніт, майже без кварцу. Після полірування дає рівну дзеркальну поверхню глибокого чорного кольору. Саме на ній гравіювання дає максимальний контраст: знята поверхня стає світло-сірою, і портрет виглядає як фотографія. Тому 90 % портретних пам'ятників в Україні — з габро. Водопоглинання 0,1–0,15 %, морозостійкість — практично необмежена." },
        { heading: "Головинське проти Букинського", text: "Два головні родовища габро на Житомирщині. Головинське — найглибший, рівний чорний, без відтінків; його беруть, коли потрібен саме «чорний як ніч» і портрет великого розміру. Букинське — з ледь помітним сірим або зеленуватим підтоном при сонячному світлі, дрібне зерно; воно трохи дешевше і не гірше за міцністю. На фото відрізнити їх складно, наживо — можна, якщо поставити поруч. У картці кожного нашого виробу вказано конкретне родовище." },
        { heading: "Лабрадорит: чорний, що спалахує", text: "Лабрадорит — теж магматична порода, але з кристалами лабрадору, які дають синьо-зелені переливи (іризацію) під кутом до світла. У похмуру погоду він виглядає майже як габро, вранці й надвечір — грає кольором. Це вибір для тих, хто хоче відійти від строгого чорного, але зберегти контраст гравіювання. Родовища — Горбулівське та Добринське. Переливи сильніші на великих полірованих площинах, тому лабрадорит особливо добре працює на широких стелах і суцільних плитах." },
        { heading: "Український чи імпортний", text: "Індійський Absolute Black і китайський Shanxi Black — теж габро, і зовні майже не відрізняються від головинського. Різниця у двох речах: ціна (імпорт дорожчий на логістику й посередників) і ризик. У китайського чорного каменю в частини партій зустрічається штучне підфарбовування смолою для «глибини» кольору, яке за два-три роки вигорає плямами. Український камінь ми беремо блоками з кар'єру за 100 км від цеху й бачимо кожну плиту до полірування." },
        { heading: "Як перевірити самому", text: "Проведіть по полірованій поверхні мокрою рукою: справжнє габро не змінює відтінок, підфарбоване темнішає нерівномірно. Подивіться на торець плити: у натурального каменю він того самого кольору, що й лице, у підфарбованого — світліший. І запитайте паспорт партії: у ньому є родовище, і його можна перевірити." },
        { heading: "Що обрати", text: "Портрет великого розміру, військовий пам'ятник, класична строга форма — Головинське габро. Бюджетніше рішення без втрати якості — Букинське. Хочеться «живого» каменю, який виглядає по-різному в різну погоду, — лабрадорит. Усі три є в селекторі каменю в картці будь-якої моделі, з перерахунком ціни." },
      ],
      [
        { text: "\"Black granite\" is the most popular search in our niche and the biggest confusion. No black granite is quarried in Ukraine. What is sold under that name is gabbro or labradorite." },
        { heading: "Gabbro", text: "Denser and finer-grained than granite, almost quartz-free. Polished, it gives a mirror-like deep black surface on which engraving has maximum contrast — hence 90 % of portrait monuments are gabbro. Water absorption 0.1–0.15 %." },
        { heading: "Holovyne vs Buky", text: "Both quarries are in Zhytomyr region. Holovyne is the deepest, even black; Buky has a faint grey or greenish undertone in sunlight and is slightly cheaper. Every product card names the quarry." },
        { heading: "Labradorite", text: "Also black, but with crystals that flash blue and green at an angle to the light. Best on large polished planes — wide steles and solid slabs." },
        { heading: "Ukrainian vs imported", text: "Indian Absolute Black and Chinese Shanxi Black are gabbro too. Some Chinese batches are resin-tinted and fade in patches within a few years. We buy Ukrainian blocks 100 km from the workshop and see every slab before polishing." },
        { heading: "Check it yourself", text: "Wipe the polished face with a wet hand: real gabbro does not change tone. Look at the edge: it should match the face. Ask for the batch passport." },
      ]
    ),
  },
  {
    slug: "history-of-memorial-stone",
    category: "history",
    cover: "/blog/history-of-memorial-stone.jpg",
    readMinutes: 8,
    date: "2026-01-07",
    title: {
      uk: "Від кам'яної баби до лазерного портрета: коротка історія українського пам'ятника",
      en: "From stone idols to laser portraits: a short history of the Ukrainian monument",
      pl: "Krótka historia ukraińskiego pomnika nagrobnego",
      de: "Eine kurze Geschichte des ukrainischen Grabmals",
      lt: "Trumpa ukrainietiško antkapio istorija",
    },
    excerpt: {
      uk: "Козацькі хрести, «дикі» надгробки Полісся, радянські обеліски з мармурової крихти й повернення граніту — як змінювалась форма і чому вона така сьогодні.",
      en: "Cossack crosses, Polissia's field-stone markers, Soviet obelisks of marble chips and the return of granite — how the form changed and why it looks the way it does today.",
      pl: "Krzyże kozackie, polne kamienie Polesia, obeliski radzieckie i powrót granitu.",
      de: "Kosakenkreuze, Feldsteine, sowjetische Obelisken und die Rückkehr des Granits.",
      lt: "Kazokų kryžiai, Polesės lauko akmenys ir granito sugrįžimas.",
    },
    body: body(
      [
        { text: "Форма пам'ятника, яку ми вважаємо «звичайною» — вертикальна стела з портретом на тумбі, — з'явилась менш ніж сто років тому. До того українське надгробок тисячу років було іншим, і дещо з того повертається сьогодні." },
        { heading: "Кам'яні баби й кургани", text: "Найдавніші пам'ятники на нашій землі — половецькі кам'яні баби XI–XIII століть на курганах степу: фігури з піщаника й вапняку заввишки до трьох метрів, обличчям на схід. Це не портрети, а знаки роду, і ідея «людина в камені стоїть над місцем» іде звідти. На Рівненщині й Волині степових баб немає, зате є інша традиція — необроблений валун на могилі, «дикий камінь», який досі можна побачити на старих поліських кладовищах." },
        { heading: "Козацький хрест", text: "XVI–XVIII століття — час кам'яного хреста. Козацькі хрести з піщаника й вапняку, часто «мальтійської» форми з розширеними кінцями, з вирізьбленим написом старослов'янською і датою. Їх ставили без тумби, просто в землю, і саме тому більшість нахилилась або впала за два-три століття. Форма хреста, яку ми сьогодні ріжемо з граніту, — прямий нащадок козацького; ми лише ставимо його на тумбу з фундаментом." },
        { heading: "XIX століття: мармур і залізо", text: "Із появою міських кладовищ у Києві, Львові, Рівному з'являються майстерні й перші «каталоги»: ангели й плакальниці з італійського мармуру для заможних, ковані хрести — для решти. Саме тоді закріплюється тумба-п'єдестал і напис на лицьовій площині. Мармурові скульптури тієї доби сьогодні здебільшого втратили деталі: мармур у нашому кліматі живе 100–150 років, граніт — набагато довше." },
        { heading: "Радянський обеліск", text: "Після 1930-х індивідуальний пам'ятник стає розкішшю. Типовий надгробок 1950–80-х — залізобетонний обеліск або стела з мармурової крихти на цементі, з фотокерамікою в овалі й зіркою або без. Дешево, швидко, й через 20–30 років — тріщини й обсипання: крихта на цементі вбирає воду. Саме ці пам'ятники родини сьогодні замінюють найчастіше, і саме тому ми так наполягаємо на водопоглиненні каменю." },
        { heading: "1990-ті: повернення граніту", text: "З відкриттям кар'єрів Житомирщини для приватних майстерень чорне габро стає доступним, а гравіювання портрета по полірованому каменю — новою нормою. Спочатку ручне, з 2000-х — лазерне й ударне (гравіювання «голкою»), яке дає фотографічну точність. Так народжується форма, яку ми знаємо: полірована стела на тумбі, портрет, напис, квітник." },
        { heading: "Сьогодні: комплекс, символ, форма", text: "Останні десять років форма знову змінюється. Замість однієї стели — ділянка як ціле: облицювання, доріжка, лава, огорожа з того самого каменю. Європейський низький формат замість високої вертикалі. І — після 2014 року — новий тип: військовий пам'ятник із символікою підрозділу, тризубом, прапором і портретом у формі. Це найшвидше зростаючий напрям у нашій майстерні й, на жаль, частина нашої історії, яку ми пишемо зараз." },
        { heading: "Що з цього варто взяти", text: "Хрест на тумбі з фундаментом — козацька форма, яка нарешті стоятиме століттями. «Дикий камінь» Полісся повертається як валун із полірованою площиною під напис. А головний урок радянського обеліска — камінь має бути натуральним і щільним, і ми перевіряємо це кожною плитою." },
      ],
      [
        { text: "The monument shape we consider \"normal\" — a vertical stele with a portrait on a base — appeared less than a hundred years ago. Before that the Ukrainian grave marker looked different for a thousand years, and some of it is coming back." },
        { heading: "Stone idols and mounds", text: "The oldest monuments are 11th–13th-century Cuman stone figures on steppe mounds. In Polissia the tradition was different: an unworked boulder on the grave, still seen in old cemeteries." },
        { heading: "The Cossack cross", text: "16th–18th centuries: sandstone and limestone crosses set straight into the ground — which is why most have tilted or fallen. The granite cross we cut today is its direct descendant, now on a base with a foundation." },
        { heading: "19th century: marble and iron", text: "City cemeteries bring workshops, marble angels for the wealthy and wrought-iron crosses for the rest. The pedestal and front inscription become standard." },
        { heading: "The Soviet obelisk", text: "1950s–80s: concrete obelisks and marble-chip steles with a photoceramic oval. Cheap, quick, and cracking after 20–30 years — chips on cement absorb water. These are the monuments families replace most often today." },
        { heading: "1990s: granite returns", text: "Zhytomyr quarries open to private workshops; black gabbro and portrait engraving become the norm — hand engraving at first, laser and impact engraving from the 2000s." },
        { heading: "Today", text: "The plot as a whole: cladding, path, bench, fence in one stone; the low European format; and, since 2014, the military monument with unit insignia, trident and a portrait in uniform." },
      ]
    ),
  },
  {
    slug: "garden-stone-composition",
    category: "design",
    cover: "/blog/garden-stone-composition.jpg",
    readMinutes: 7,
    date: "2026-04-05",
    title: {
      uk: "Композиція ділянки на кладовищі: стела, квітник, плитка, огорожа — правило 3-5-7",
      en: "Composing a grave plot: stele, flower bed, paving, fence — the 3-5-7 rule",
      pl: "Kompozycja kwatery: stela, kwietnik, płytka, ogrodzenie",
      de: "Die Gestaltung der Grabstelle: Stele, Beet, Pflaster, Einfassung",
      lt: "Kapo sklypo kompozicija: stela, gėlynas, plytelės, tvorelė",
    },
    excerpt: {
      uk: "Як спланувати ділянку, щоб вона виглядала цілісно й за нею було легко доглядати: пропорції, три матеріали, п'ять елементів, сім кроків благоустрою.",
      en: "How to plan the plot so it looks whole and stays easy to maintain: proportions, three materials, five elements, seven landscaping steps.",
      pl: "Jak zaplanować kwaterę: proporcje, trzy materiały, pięć elementów.",
      de: "Wie man die Grabstelle plant: Proportionen, drei Materialien, fünf Elemente.",
      lt: "Kaip suplanuoti sklypą: proporcijos, trys medžiagos, penki elementai.",
    },
    body: body(
      [
        { text: "Пам'ятник — це не лише стела. Родини, які замовляють «просто стелу», через рік повертаються з питанням, що робити з рештою ділянки: з травою, що лізе під тумбу, з нерівною землею, з огорожею, яка не пасує. Простіше й дешевше спланувати все одразу, навіть якщо робити частинами. Ми користуємось простим правилом: три матеріали, п'ять елементів, сім кроків." },
        { heading: "Три матеріали, не більше", text: "Один основний камінь (стела, тумба, квітник), один контрастний (облицювання або підбір під сусідні пам'ятники) і один нейтральний наповнювач (гранітна крихта, бруківка або газон). Коли на ділянці чотири-п'ять різних матеріалів — червона стела, сіра плитка, чорна огорожа, біла крихта, металеві елементи — вона виглядає випадковою. Найкраще працює пара «чорне габро + сірий покостівський»: контраст є, конфлікту немає." },
        { heading: "П'ять елементів", text: "Стела з тумбою — вертикаль, центр композиції. Надгробна плита або квітник — горизонталь, яка «садить» стелу на землю. Облицювання ділянки або засипка — фон. Огорожа або бордюр — межа. І один акцент: ваза, лампада, лава, невисока рослина. Шостий елемент майже завжди зайвий; якщо хочеться і лаву, і стіл, і два ліхтарі — це вже комплекс, і його треба проєктувати в 3D, а не додавати по одному." },
        { heading: "Пропорції", text: "Висота стели — приблизно половина довжини ділянки: на стандартній ділянці 200×100 см — стела 90–110 см; на 250×150 — 120 см. Тумба на 10–15 см ширша за стелу з кожного боку. Квітник по ширині тумби. Плитка навколо — не менше 40 см проходу з боку, з якого підходять. Занадто велика стела на малій ділянці виглядає стиснутою, мала — губиться." },
        { heading: "Сім кроків благоустрою", text: "1. Замір і шурф — щоб знати ґрунт і розміри. 2. Демонтаж старого й планування землі. 3. Бетонна основа під усю ділянку, не лише під тумбу — інакше плитка «поїде» окремо від стели. 4. Монтаж стели, тумби, квітника. 5. Облицювання плиткою (термооброблена, не полірована — щоб не ковзала) або засипка крихтою на геотекстиль, щоб не росла трава. 6. Огорожа або бордюр. 7. Герметизація швів і прибирання. Кроки 5–6 можна відкласти на рік-два, якщо бюджет обмежений: головне — зробити основу в кроці 3 одразу під усе." },
        { heading: "Рослини", text: "Низькі й повільні: самшит, ялівець стелючий, барвінок, очитки. Не саджайте туї й дерева біля стели: за десять років коріння підніме плитку, а крона затінить портрет і дасть мох. Трава — найгірший варіант з погляду догляду: її треба косити, і вона лізе у шви." },
        { heading: "Що коштує", text: "Облицювання ділянки гранітною плиткою — від 2 300 ₴/м², гранітна огорожа з цоколем — від 2 500 ₴/м. п., засипка крихтою з геотекстилем — від 600 ₴/м². Стандартна ділянка 200×150 «під ключ» із плиткою й бордюром — 25 000–40 000 ₴ на додачу до пам'ятника. Порахуємо за фото ділянки безкоштовно." },
      ],
      [
        { text: "A monument is more than a stele. Families who order \"just a stele\" come back a year later asking what to do with the rest of the plot. It is simpler and cheaper to plan it all at once. Our rule: three materials, five elements, seven steps." },
        { heading: "Three materials", text: "One main stone, one contrasting, one neutral filler (chippings, paving or lawn). Black gabbro with grey Pokostivka granite is the pairing that works best." },
        { heading: "Five elements", text: "Stele with base (vertical), slab or flower bed (horizontal), cladding or filler (background), fence or curb (boundary), and one accent — a vase, lamp, bench or low plant. A sixth is almost always too much." },
        { heading: "Proportions", text: "Stele height about half the plot length: 90–110 cm on a 200×100 cm plot. Base 10–15 cm wider than the stele on each side. At least 40 cm of paving on the approach side." },
        { heading: "Seven steps", text: "Survey and test pit; dismantling and levelling; a concrete base under the whole plot; stele, base, flower bed; flamed paving or chippings on geotextile; fence or curb; sealing and clean-up. Steps 5–6 can wait a year if the base was made for the whole plot." },
        { heading: "Costs", text: "Granite paving from 2,300 UAH/m², granite curb-fence from 2,500 UAH per running metre. A 200×150 cm plot turnkey with paving and curb — 25,000–40,000 UAH on top of the monument." },
      ]
    ),
  },
  {
    slug: "granite-vs-marble-outdoors",
    category: "stone",
    cover: "/blog/granite-vs-marble-outdoors.jpg",
    readMinutes: 6,
    date: "2026-03-22",
    title: {
      uk: "Граніт чи мармур для пам'ятника: що стається з кожним через 10, 30 і 100 років",
      en: "Granite or marble for a monument: what happens to each after 10, 30 and 100 years",
      pl: "Granit czy marmur na pomnik",
      de: "Granit oder Marmor für ein Grabmal",
      lt: "Granitas ar marmuras paminklui",
    },
    excerpt: {
      uk: "Мармур красивіший, граніт довговічніший — але це не вся правда. Коли мармур виправданий, як його захистити і чому «мармурова крихта» — це не мармур.",
      en: "Marble is prettier, granite lasts longer — but that is not the whole truth. When marble is justified, how to protect it, and why \"marble chips\" are not marble.",
      pl: "Kiedy marmur jest uzasadniony i jak go chronić.",
      de: "Wann Marmor gerechtfertigt ist und wie man ihn schützt.",
      lt: "Kada marmuras pateisinamas ir kaip jį apsaugoti.",
    },
    body: body(
      [
        { text: "Мармур і граніт — це не «краще і гірше», а два різні матеріали з різною поведінкою просто неба. Ми робимо пам'ятники з обох і чесно кажемо, коли який доречний." },
        { heading: "Що таке мармур і чому він м'який", text: "Мармур — це перекристалізований вапняк, кальцит. Він удвічі м'якший за граніт (3 проти 6–7 за Моосом), пористіший (водопоглинання до 1 % проти 0,1–0,4 %) і, головне, реагує з кислотою. Кислотний дощ, який у нас звичайний, за роки «з'їдає» полірування: поверхня стає матовою, потім шорсткою, потім деталі різьблення округлюються. Це не дефект — це хімія." },
        { heading: "Через 10 років", text: "Граніт: без змін, якщо мити раз на рік. Мармур: полірування помітно потьмяніло, на північному боці — сірий наліт, який уже не змивається водою; гравійований напис без заповнення читається гірше. Із захисним просоченням, оновлюваним кожні 2–3 роки, — стан кращий, але догляд обов'язковий." },
        { heading: "Через 30 років", text: "Граніт: без змін; позолота напису оновлена один-два рази. Мармур: поверхня матова й шорстка, дрібні деталі скульптури згладжені, на стику з тумбою — потемніння від вологи. Це стан більшості мармурових ангелів на старих міських кладовищах." },
        { heading: "Через 100 років", text: "Граніт: стоїть, гравіювання читається — подивіться на гранітні пам'ятники XIX століття на Личаківському чи Байковому. Мармур: скульптура без облич і пальців, написи майже стерті. Красиво по-своєму, але не те, що замовляли." },
        { heading: "Коли мармур виправданий", text: "Дитячі пам'ятники, де важлива м'якість форми й світлий колір. Скульптура — ангел, плакальниця, — де мармур дає деталізацію, недосяжну для граніту. Хрести й невеликі стели в комбінації: мармурова фігура на гранітній тумбі й основі, щоб те, що торкається землі, було з граніту. У всіх випадках — біле просочення від початку й планове оновлення." },
        { heading: "«Мармурова крихта» — це не мармур", text: "Радянські стели з «мармуру» — це мармурова крихта на цементі. Цемент вбирає воду, і через 20–30 років такий пам'ятник тріскає й обсипається. Якщо у вас стоїть саме такий, замінювати його треба на граніт, а не «на такий самий»; сучасних аналогів із крихти ми не робимо й не радимо." },
        { heading: "Наша порада", text: "Для всього, що стоїть просто неба десятиліттями, — граніт або габро. Для акцентів, скульптури, дитячих пам'ятників — мармур на гранітній основі, з просоченням і з розумінням, що за ним треба доглядати. У картках каталогу мармур позначено як «Преміум» саме через це: він дорожчий і в матеріалі, і в догляді." },
      ],
      [
        { text: "Marble and granite are not \"better and worse\" but two materials that behave differently outdoors. We make monuments from both and say honestly which fits where." },
        { heading: "Why marble is soft", text: "Marble is recrystallised limestone: half as hard as granite, more porous, and it reacts with acid. Acid rain eats the polish over the years." },
        { heading: "After 10, 30 and 100 years", text: "Granite: unchanged, unchanged, still standing with legible engraving. Marble: dulled polish and grey film; matte rough surface with softened details; a sculpture without faces and fingers." },
        { heading: "When marble is justified", text: "Children's monuments, sculpture, white accents — always on a granite base, with impregnation renewed every 2–3 years." },
        { heading: "\"Marble chips\" are not marble", text: "Soviet-era steles of marble chips on cement crack after 20–30 years. Replace them with granite, not with more of the same." },
      ]
    ),
  },
  {
    slug: "restoring-old-monuments",
    category: "care",
    cover: "/blog/restoring-old-monuments.jpg",
    readMinutes: 7,
    date: "2026-03-08",
    title: {
      uk: "Реставрація старого пам'ятника: що можна врятувати, що краще замінити і скільки це коштує",
      en: "Restoring an old monument: what can be saved, what to replace, and what it costs",
      pl: "Renowacja starego pomnika: co uratować, co wymienić",
      de: "Restaurierung eines alten Grabmals: was rettbar ist",
      lt: "Seno paminklo restauravimas: ką galima išgelbėti",
    },
    excerpt: {
      uk: "Нахил, тріщина, стертий напис, обсипана крихта — п'ять типових проблем старих пам'ятників, і для кожної чесна відповідь: ремонт чи заміна.",
      en: "Tilt, crack, worn inscription, crumbling chips — five typical problems of old monuments, and an honest answer for each: repair or replace.",
      pl: "Pięć typowych problemów starych pomników: naprawa czy wymiana.",
      de: "Fünf typische Probleme alter Grabmale: Reparatur oder Ersatz.",
      lt: "Penkios tipinės senų paminklų problemos: taisyti ar keisti.",
    },
    body: body(
      [
        { text: "До нас часто приходять із фото старого пам'ятника й питанням: «Це ще можна врятувати?». Приблизно в половині випадків — так, і це в кілька разів дешевше за новий. У другій половині чесніше замінити. Ось як ми вирішуємо." },
        { heading: "Нахил стели або тумби", text: "Найчастіша проблема, і майже завжди — фундамент, а не камінь. Стела гранітна, поставлена на бетонну подушку без армування чи взагалі на землю, за 5–10 років нахиляється від усадки. Лікується демонтажем, новим армованим фундаментом і повторним монтажем того ж каменю: 6 000–12 000 ₴ залежно від розміру. Камінь при цьому не страждає. Якщо нахил більше 10°, робити це треба швидко: наступна зима може перекинути стелу." },
        { heading: "Тріщина", text: "Тріщина в граніті — вирок для елемента: клеїти її можна, але шов буде видно, і в мороз він розійдеться знову. Замінюємо тільки тріснутий елемент — тумбу, квітник або стелу, — а решту лишаємо. Стелу 80×45 з габро з перенесенням портрета й напису — від 12 000 ₴. У мармурі дрібні тріщини іноді можна зашпаклювати й відполірувати, якщо не проходять наскрізь." },
        { heading: "Стертий або нечитабельний напис", text: "На граніті — перегравіювання по старих літерах або заповнення золотом чи емаллю: від 18 ₴ за символ, за годину на місці. На мармурі — глибше перерізання, бо старі літери «пливуть». Портрет із фотокераміки, що вицвів, — заміна на нову пластину від 1 300 ₴; гравійований портрет на граніті — чистка, він не стирається." },
        { heading: "Мармурова крихта, що обсипається", text: "Радянські стели з крихти на цементі не реставруються: цемент наситився водою, і ремонт триматиметься один сезон. Єдине чесне рішення — заміна на граніт. Часто вдається зберегти фотокераміку й перенести її на нову стелу, якщо вона родині дорога." },
        { heading: "Наліт, мох, потемніння", text: "Це не пошкодження, а бруд. Промислове чищення з м'яким абразивом і оновлення захисного просочення повертає граніту 90 % вигляду: 1 200–3 000 ₴ за пам'ятник із виїздом. На мармурі результат скромніший, але помітний." },
        { heading: "Що ми робимо спочатку", text: "Просимо три фото: загальний план, стик стели з тумбою, найпроблемніше місце. З них у 80 % випадків можна назвати діагноз і ціну. Далі — виїзд на огляд, по Рівненщині й Волині безкоштовний. Пишемо два кошториси: реставрація і заміна, — і родина вирішує. Наша практика: якщо реставрація коштує понад 60 % нового пам'ятника, ми чесно радимо новий." },
        { heading: "Що з пам'ятниками не нашого виробництва", text: "Реставруємо всі. Гарантію даємо на те, що зробили: новий фундамент, замінений елемент, нове гравіювання. На старий камінь, який лишився, гарантії немає, але й прихованих доплат теж." },
      ],
      [
        { text: "Families often bring a photo of an old monument and ask: \"Can this still be saved?\" In about half the cases — yes, several times cheaper than a new one. In the other half it is more honest to replace." },
        { heading: "Tilt", text: "Almost always the foundation, not the stone. Dismantle, new reinforced foundation, re-install the same stone: 6,000–12,000 UAH." },
        { heading: "Crack", text: "A crack in granite means replacing that element only — base, flower bed or stele. A 80×45 gabbro stele with portrait and inscription transferred — from 12,000 UAH." },
        { heading: "Worn inscription", text: "Re-engraving over the old letters or filling with gold or enamel — from 18 UAH per character, done on site." },
        { heading: "Crumbling marble chips", text: "Soviet chip-on-cement steles cannot be restored; the honest solution is granite. The photoceramic can often be moved to the new stele." },
        { heading: "Film and moss", text: "Not damage, just dirt. Professional cleaning and impregnation return 90 % of the look: 1,200–3,000 UAH with a visit." },
        { heading: "How we start", text: "Three photos, a diagnosis and price in 80 % of cases, a free inspection in Rivne and Volyn regions, and two estimates: restoration and replacement." },
      ]
    ),
  },
]

export const articles: Article[] = [...seedArticles, ...extraArticles]

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug)
}

export function getArticlesByCategory(cat: ArticleCategory) {
  return articles.filter((a) => a.category === cat)
}
