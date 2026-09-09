import type { Locale } from "@/lib/types"

/**
 * Статті, яких бракувало найбільше: аудит (SITE_AUDIT.md §5.2) показав, що
 * конкуренти ранжуються за «скільки коштує встановлення», «пам'ятник
 * військовому», «коли ставити» і «фотокераміка чи гравіювання», а в нас на ці
 * запити не було жодної сторінки.
 *
 * Окремий файл, щоб не роздувати articles.ts; збираються в один список там.
 * Тип дублюється локально, бо articles.ts імпортує цей модуль — зворотний
 * імпорт дав би цикл.
 */

type ArticleCategory = "stone" | "memorials" | "design" | "care" | "history"
type Block = { heading?: string; text: string }
type ExtraArticle = {
  slug: string
  category: ArticleCategory
  cover: string
  readMinutes: number
  date: string
  title: Record<Locale, string>
  excerpt: Record<Locale, string>
  body: Record<Locale, Block[]>
}

const body = (uk: Block[], en: Block[]) => ({ uk, en, pl: en, de: en, lt: en })

export const extraArticles: ExtraArticle[] = [
  {
    slug: "skilky-koshtuye-vstanovlennya-pamyatnyka",
    category: "memorials",
    cover: "/blog/skilky-koshtuye-vstanovlennya-pamyatnyka.jpg",
    readMinutes: 8,
    date: "2026-09-01",
    title: {
      uk: "Скільки коштує встановлення пам'ятника в Україні у 2026 році — і що входить у цю ціну",
      en: "What monument installation costs in Ukraine in 2026 — and what the price includes",
      pl: "Ile kosztuje montaż pomnika w Ukrainie w 2026 roku",
      de: "Was die Montage eines Grabmals in der Ukraine 2026 kostet",
      lt: "Kiek kainuoja paminklo montavimas Ukrainoje 2026 m.",
    },
    excerpt: {
      uk: "Фундамент, демонтаж старого, доставка, монтаж бригадою, облицювання: реальні цифри по кожному пункту і три ознаки, що вам назвали ціну без монтажу.",
      en: "Foundation, dismantling, delivery, crew installation, cladding: real numbers for each item and three signs that you were quoted a price without installation.",
      pl: "Fundament, demontaż, dostawa, montaż: realne liczby.",
      de: "Fundament, Demontage, Lieferung, Montage: echte Zahlen.",
      lt: "Pamatas, demontavimas, pristatymas, montavimas: realūs skaičiai.",
    },
    body: body(
      [
        { text: "«Пам'ятник від 9 000 ₴» — і потім ще стільки ж за фундамент, доставку й «роботу». Так виглядає більшість оголошень, і саме тому родини не можуть порівняти ціни. Розкладемо, з чого складається встановлення, скільки коштує кожна частина і як зрозуміти, що в ціну входить, а що ні." },
        { heading: "Із чого складається встановлення", text: "Демонтаж старого пам'ятника або хреста й вивіз — 1 500–4 000 ₴. Планування ділянки й шурф — входить у замір. Армований бетонний фундамент під тумбу — 3 000–6 000 ₴; під усю ділянку 200×150 см для плитки — 8 000–15 000 ₴. Доставка: у межах області — 0–2 000 ₴, далі — за пробігом, 3–5 ₴/км. Монтаж бригадою з краном-маніпулятором: одиночний пам'ятник — 4 000–7 000 ₴, комплекс — 10 000–25 000 ₴. Герметизація швів, прибирання — входять у монтаж у порядних майстерень." },
        { heading: "Разом для одиночного пам'ятника", text: "Якщо додати все, встановлення одиночного пам'ятника «з нуля» коштує 8 000–15 000 ₴ у межах області. Це від третини до половини вартості самого каменю в нижньому сегменті — і саме цю частину «економний» прайс зазвичай не показує. У Stone Memory усе це вже в ціні «від» кожної моделі: 17 500 ₴ за одиночний пам'ятник — це з фундаментом і монтажем у Рівненській і Волинській областях." },
        { heading: "Разом для комплексу", text: "Комплекс із облицюванням ділянки — інша математика: бетонна основа під усю площу, 3–5 м² плитки, бордюр або огорожа, 1–3 дні роботи бригади. Тут монтаж і благоустрій — 25 000–45 000 ₴ окремо від каменю. Тому комплекс за 60 000 ₴ «без монтажу» насправді коштує 90 000–100 000, а наші 67 000–110 000 ₴ за готову ділянку — це вже все." },
        { heading: "Три ознаки, що ціна без монтажу", text: "1. Ціна дуже кругла й дуже низька: 9 000, 12 000, 15 000. 2. У картці немає слова «фундамент». 3. На запитання «скільки з установкою» вам кажуть «залежить від кладовища». Останнє частково правда — ґрунт справді різний, — але добра майстерня закладає в ціну стандартний фундамент і доплату бере лише за палі на торфі чи насипному." },
        { heading: "Чи можна встановити самому", text: "Технічно так, і ми даємо схему фундаменту тим, хто забирає виріб із цеху. Але половина проблем, з якими до нас звертаються по реставрацію, — це саме самостійний монтаж без армування й без рівня: стела нахиляється за дві зими. Економія 5 000–7 000 ₴ проти переробки за 10 000 через три роки. І гарантії на геометрію в такому разі немає." },
        { heading: "Коли доплата виправдана", text: "Торф або насипний ґрунт — палевий фундамент, +3 000–6 000 ₴. Немає проїзду для крана — ручне перенесення, +2 000–5 000 ₴. Старий бетонний масив під землею, який треба розбити, — за годинами. Про все це ми кажемо після шурфу на замірі, до договору, і в договір ціна входить остаточною." },
        { heading: "Що запитати перед замовленням", text: "«Що саме входить у ціну: фундамент, доставка, монтаж, демонтаж старого?» — і попросити відповідь письмово в комерційній пропозиції. Якщо відповідь «усе, крім…» — це нормально; якщо «залежить» — це не ціна." },
      ],
      [
        { text: "\"Monument from 9,000 UAH\" — and then as much again for the foundation, delivery and \"labour\". That is how most listings look, and why families cannot compare prices." },
        { heading: "What installation consists of", text: "Dismantling the old marker 1,500–4,000 UAH; reinforced foundation under the base 3,000–6,000 UAH, under the whole plot 8,000–15,000; delivery within the region 0–2,000, further 3–5 UAH/km; crew installation with a crane 4,000–7,000 for a single monument, 10,000–25,000 for a complex." },
        { heading: "Totals", text: "Installing a single monument from scratch costs 8,000–15,000 UAH — a third to a half of the stone price in the budget segment. At Stone Memory it is already in every \"from\" price: 17,500 UAH for a single monument includes the foundation and installation in Rivne and Volyn regions." },
        { heading: "Three signs the price excludes installation", text: "A very round, very low number; no word \"foundation\" in the listing; and \"it depends on the cemetery\" when you ask about installation." },
        { heading: "When a surcharge is fair", text: "Peat or fill soil (pile foundation, +3,000–6,000 UAH), no crane access, old concrete underground. We tell you after the test pit, before the contract." },
      ]
    ),
  },
  {
    slug: "pamyatnyk-viyskovomu-symvolika-epitafii",
    category: "design",
    cover: "/blog/pamyatnyk-viyskovomu-symvolika-epitafii.jpg",
    readMinutes: 10,
    date: "2026-08-20",
    title: {
      uk: "Пам'ятник військовому: символіка, портрет у формі, епітафії та як отримати компенсацію",
      en: "A monument for a soldier: insignia, portrait in uniform, epitaphs and how to get the state compensation",
      pl: "Pomnik dla żołnierza: symbolika, portret, epitafia, rekompensata",
      de: "Grabmal für einen Soldaten: Symbolik, Porträt, Inschriften, Entschädigung",
      lt: "Paminklas kariui: simbolika, portretas, epitafijos, kompensacija",
    },
    excerpt: {
      uk: "Що можна і чого не варто розміщувати на стелі, як правильно передати шеврон і нагороди, які епітафії обирають родини і які документи потрібні для державної компенсації.",
      en: "What belongs on the stele and what does not, how to reproduce a unit patch and awards correctly, which epitaphs families choose, and which documents the state compensation requires.",
      pl: "Co umieścić na steli, jak oddać naszywkę i odznaczenia, jakie epitafia wybierają rodziny.",
      de: "Was auf die Stele gehört, wie man Abzeichen wiedergibt, welche Inschriften Familien wählen.",
      lt: "Kas dedama ant stelos, kaip perteikti antsiuvą ir apdovanojimus.",
    },
    body: body(
      [
        { text: "Пам'ятники захисникам — найшвидше зростаючий напрям у нашій майстерні з 2022 року, і водночас найвідповідальніший: тут кожна деталь має значення для родини й для побратимів, які прийдуть. Нижче — те, чого ми навчилися за ці роки, від символіки до паперів." },
        { heading: "Портрет у формі", text: "Найчастіше просять портрет у формі, і це правильно: так людину пам'ятають побратими. Але фото у формі часто одне, зроблене на телефон, з тінню від шолома або в темряві. Наш ретушер відновлює обличчя з кількох фото (цивільного й у формі), «одягає» форму з іншого знімка, вирівнює освітлення. Це стандартна робота, вона входить у ціну. Гравіювання — глибоке лазерне на чорному габро: воно єдине передає дрібні деталі шеврона й нагород так, щоб їх було видно з відстані." },
        { heading: "Що розміщувати на стелі", text: "Герб України або тризуб — угорі або з боку. Шеврон підрозділу — поруч із портретом, у реальних пропорціях; ми просимо фото самого шеврона або посилання на офіційне зображення, бо «з пам'яті» емблеми бригад плутають. Нагороди — якщо є: орден «За мужність», «Золота зірка», медалі — у ряд під портретом, за реальними зображеннями. Позивний — у лапках після імені або окремим рядком; для багатьох родин він важливіший за звання. Дата й місце загибелі — за бажанням; частіше пишуть «загинув, захищаючи Україну» без географії." },
        { heading: "Чого краще уникати", text: "Емблем підрозділів, у яких людина не служила, «для краси». Зброї як декоративного елемента — на думку більшості родин, із якими ми працювали, це заважає, а не допомагає. Прапорів, гравійованих кольором, на червоному чи сірому камені: контрасту не вистачає, і через кілька років прапор виглядає брудною плямою; на габро або окремою кольоровою плиткою — інша річ. Занадто дрібного тексту з переліком боїв — краще окрема плита з епітафією біля підніжжя." },
        { heading: "Епітафії, які обирають родини", text: "«Герої не вмирають». «Життя — за Україну». «Захисник. Син. Брат. Друг». «Ти тримав небо над нами». «Полеглим — слава, живим — обов'язок пам'ятати». «Він не хотів війни. Він хотів, щоб її не було в нас удома». «Іду в бій за тих, хто після мене». Для віруючих родин — «Немає більшої любові, як покласти душу за друзів своїх» (Ів 15:13). Ми пропонуємо три-чотири варіанти на ескізі у розмірі, який справді поміщається." },
        { heading: "Форма й розмір", text: "Військові пам'ятники частіше вищі за цивільні: стела 120×60 або 140×70 см на широкій тумбі, іноді з окремою плитою під епітафію. Популярні форми: пряма стела з тризубом у верхній частині, стела з рельєфною картою України, хрест із прапором. На ділянках військових секторів кладовищ часто є регламент висоти й ширини — ми знаємо вимоги в Рівному, Луцьку, Києві й перевіряємо їх до ескізу." },
        { heading: "Скільки коштує", text: "У нашому каталозі військові пам'ятники — від 87 000 ₴ за одиночний із символікою до 300 000+ за комплекс із лавою, ліхтарями й облицюванням. Ринкова медіана по Україні — близько 190 000 ₴; ми свідомо тримаємо нижче. У ціні: стела, портрет у формі з ретушшю, шеврон і герб, тумба, плита, фундамент, монтаж, документи для компенсації." },
        { heading: "Державна компенсація", text: "Родини загиблих військовослужбовців мають право на компенсацію витрат на встановлення надгробка через органи соціального захисту: сума й порядок відрізняються по областях (від 15 до 50+ тис. ₴), а окремі громади й фонди доплачують. Для цього потрібні: договір із майстернею, рахунок, акт виконаних робіт, фотофіксація встановленого пам'ятника, і зазвичай — квитанції про оплату. Ми готуємо повний пакет і, якщо потрібно, працюємо з фондом напряму за безготівковим розрахунком. Радимо запитати у своєму управлінні соцзахисту до замовлення: там скажуть максимальну суму й перелік паперів саме для вашої громади." },
        { heading: "Терміни", text: "Виготовлення — 7–10 тижнів через складність гравіювання; узгодження ескізу з побратимами чи командиром за бажанням родини — ми надсилаємо ескіз усім, кого родина вкаже. Встановлення до пам'ятних дат — Дня захисників, річниці — плануємо наперед: у серпні–вересні черга найдовша." },
      ],
      [
        { text: "Monuments for defenders are the fastest-growing part of our work since 2022, and the most responsible: every detail matters to the family and to the brothers-in-arms who will come." },
        { heading: "Portrait in uniform", text: "Our retoucher restores the face from several photos, dresses the uniform from another shot and evens the light. Deep laser engraving on black gabbro is the only technique that renders patch and award details visibly from a distance." },
        { heading: "What belongs on the stele", text: "The trident, the unit patch in real proportions (from an official image, not from memory), awards from real images, the call sign after the name. Avoid patches of units the person did not serve in, weapons as decoration and colour flags on red or grey stone." },
        { heading: "Epitaphs families choose", text: "\"Heroes do not die\". \"A life for Ukraine\". \"Defender. Son. Brother. Friend\". \"You held the sky above us\". \"Greater love hath no man than this\" (John 15:13)." },
        { heading: "Price and compensation", text: "From 87,000 UAH for a single monument with insignia to 300,000+ for a complex; the Ukrainian market median is about 190,000. Families of fallen soldiers are entitled to state compensation through social protection offices; we prepare the full document package — contract, invoice, act, photo record — and work with foundations by bank transfer." },
      ]
    ),
  },
  {
    slug: "koly-stavyty-pamyatnyk",
    category: "memorials",
    cover: "/blog/koly-stavyty-pamyatnyk.jpg",
    readMinutes: 6,
    date: "2026-08-05",
    title: {
      uk: "Коли ставити пам'ятник після поховання: усадка ґрунту, сезон і черга в майстерні",
      en: "When to install a monument after the burial: soil settlement, season and the workshop queue",
      pl: "Kiedy postawić pomnik po pogrzebie: osiadanie gruntu i sezon",
      de: "Wann ein Grabmal nach der Beerdigung setzen: Bodensetzung und Saison",
      lt: "Kada statyti paminklą po laidotuvių: grunto sėdimas ir sezonas",
    },
    excerpt: {
      uk: "Чому «через рік» — не забобон, а фізика; у які місяці монтують і чому замовляти краще взимку; що робити, якщо чекати рік не можна.",
      en: "Why \"after a year\" is physics, not superstition; which months we install in and why it pays to order in winter; what to do if you cannot wait a year.",
      pl: "Dlaczego „po roku” to fizyka, a nie przesąd.",
      de: "Warum „nach einem Jahr“ Physik ist und kein Aberglaube.",
      lt: "Kodėl „po metų“ – fizika, o ne prietaras.",
    },
    body: body(
      [
        { text: "Питання «коли можна ставити пам'ятник» ми чуємо щодня, і відповідь на нього має дві частини: коли ґрунт готовий і коли погода дозволяє. Традиція «через рік» збігається з обома, і ось чому." },
        { heading: "Усадка ґрунту", text: "Під час поховання з могили виймають 2–3 м³ землі, а потім засипають назад. Ця земля рихла й осідає під власною вагою й від дощів: на піску — за 4–6 місяців, на глині й суглинку — 8–12, на чорноземі — до півтора року. Якщо поставити півтонну стелу на свіжий ґрунт, вона осяде разом із ним — і нерівномірно, бо під тумбою земля щільніша, ніж під квітником. Звідси нахилені пам'ятники на молодих могилах." },
        { heading: "Що робити, якщо чекати не можна", text: "Іноді потрібно раніше: річниця, пам'ятна дата, родина за кордоном. Тоді ми робимо палевий фундамент: чотири армовані палі до твердого шару ґрунту (60–120 см), на них — залізобетонна рама, на неї — тумба. Такий фундамент не залежить від усадки, бо стоїть на материковому ґрунті. Це +3 000–6 000 ₴ до звичайного, і ми робимо його за замовчуванням на торфі та насипному ґрунті, де усадка триває роками." },
        { heading: "Сезон монтажу", text: "Монтуємо з квітня по листопад: бетону фундаменту потрібна температура вище +5 °C протягом кількох діб, щоб набрати міцність. Узимку можна ставити лише на готовий, залитий раніше фундамент. Найкращі місяці — травень–червень і вересень–жовтень: ґрунт сухий, не спекотно, не заважають дощі. У липні–серпні працюємо зранку, бо полірований камінь на сонці нагрівається до 60 °C." },
        { heading: "Черга в майстерні", text: "Виготовлення одиночного пам'ятника — 5–7 тижнів, комплексу — 7–10. Але в сезон (квітень–червень, серпень–жовтень) черга додає ще два-три тижні. Тому найрозумніше замовляти у грудні–лютому: ескізи, замір по снігу теж можливий, виготовлення взимку в теплому цеху, — і монтаж у перших числах квітня, першими в черзі. Плюс узимку ми даємо знижку на комплекси, бо цех менш завантажений." },
        { heading: "Проводи, Трійця, річниця", text: "Найбільше запитів — «встигнути до Проводів» (тиждень після Великодня). Щоб встигнути, замовлення має бути в лютому. У травні на це вже фізично немає часу, і ми чесно кажемо: краще на місяць пізніше, ніж поставити на сирий фундамент. Річниця — інша справа: дата відома за рік, і спланувати монтаж під неї легко." },
        { heading: "Що з тимчасовим хрестом", text: "Дерев'яний або металевий хрест стоїть до пам'ятника й демонтується під час монтажу. За бажанням родини ми ставимо його за стелою, передаємо до церкви або утилізуємо; спалювати самим не треба. Фото з хреста, якщо є, переносимо на стелу." },
      ],
      [
        { text: "\"When can we install the monument?\" has two answers: when the soil is ready and when the weather allows. The tradition of \"after a year\" matches both." },
        { heading: "Soil settlement", text: "2–3 m³ of loose backfill settles for 4–6 months on sand, 8–12 on clay, up to 18 months on chernozem. A half-tonne stele on fresh soil settles with it — unevenly." },
        { heading: "If you cannot wait", text: "A pile foundation: four reinforced piles down to firm soil and a concrete frame on top. It does not depend on settlement. +3,000–6,000 UAH; standard for peat and fill soil." },
        { heading: "Installation season", text: "April to November — concrete needs +5 °C for several days. Best months: May–June and September–October." },
        { heading: "The queue", text: "Production takes 5–7 weeks (single) or 7–10 (complex), plus two or three weeks in high season. The smartest time to order is December–February: winter production, first in line for April installation, and a winter discount on complexes." },
      ]
    ),
  },
  {
    slug: "fotokeramika-chy-hraviuvannia",
    category: "design",
    cover: "/blog/fotokeramika-chy-hraviuvannia.jpg",
    readMinutes: 7,
    date: "2026-07-15",
    title: {
      uk: "Портрет на пам'ятнику: гравіювання, фотокераміка чи кольорове фото на склі — що обрати",
      en: "The portrait on a monument: engraving, photoceramics or colour photo on glass — which to choose",
      pl: "Portret na pomniku: grawer, fotoceramika czy zdjęcie na szkle",
      de: "Das Porträt auf dem Grabmal: Gravur, Fotokeramik oder Foto auf Glas",
      lt: "Portretas ant paminklo: graviravimas, fotokeramika ar nuotrauka ant stiklo",
    },
    excerpt: {
      uk: "Чотири способи розмістити портрет, скільки живе кожен, як виглядає через 20 років, що з кольором і скільки коштує. І чому ми не радимо клеїти фото на світлий камінь.",
      en: "Four ways to place a portrait, how long each lasts, what it looks like after 20 years, what about colour, and what it costs. And why we do not recommend photos on light stone.",
      pl: "Cztery sposoby na portret: trwałość, wygląd po 20 latach, koszt.",
      de: "Vier Wege für ein Porträt: Haltbarkeit, Aussehen nach 20 Jahren, Kosten.",
      lt: "Keturi būdai portretui: ilgaamžiškumas, išvaizda po 20 metų, kaina.",
    },
    body: body(
      [
        { text: "Портрет — те, на що на пам'ятнику дивляться найдовше, і те, що найгірше переживає час, якщо зроблено неправильно. Є чотири способи, і в кожного своя правда." },
        { heading: "1. Ручне гравіювання", text: "Майстер знімає поверхню полірованого каменю вручну ударним інструментом, точка за точкою. Найстаріший спосіб і досі найвиразніший: у портреті є «рука», м'які переходи, характер. Живе стільки ж, скільки камінь, — це не фарба, а рельєф. Мінуси: залежить від майстра (у нас двоє з досвідом 15+ років), займає 3–5 днів, коштує від 3 500 ₴. Найкраще на чорному габро; на сірому й червоному потребує заповнення." },
        { heading: "2. Лазерне гравіювання", text: "Лазер випалює поверхню за цифровим файлом із фотографічною точністю: кожна зморшка, ґудзик, шеврон. Це стандарт для військових пам'ятників і для великих портретів. Так само вічне, як ручне. Мінус один: на дуже дрібних розмірах (менше 15 см) втрачає півтони, тому портрет 12×15 см краще робити ручним або ударним. Ціна — від 2 000 ₴ разом із ретушшю. Тільки на чорному камені: на сірому лазер дає слабкий контраст." },
        { heading: "3. Фотокераміка", text: "Керамічна пластина з випаленим фото, овальна або прямокутна, кріпиться на стелу. Єдиний спосіб отримати повнокольоровий портрет на будь-якому камені, зокрема на світлому граніті й мармурі. Сучасна кераміка від хорошого виробника тримає колір 25–30 років; дешева — вигорає за 5–7. Мінуси: це окремий елемент, який можна розбити (вандали, гілка), і він виглядає як накладка, а не частина каменю. Ціна — від 1 300 ₴ за 24×30 см. Ми беремо кераміку з гарантією виробника й кріпимо на два штифти плюс клей." },
        { heading: "4. Кольоровий портрет на склі або на камені", text: "Фото на загартованому склі — новий спосіб: яскраве, з глибиною, але живе 10–15 років і потребує рамки. Кольорове гравіювання по каменю — лазер плюс кольорове заповнення: стійкіше за скло, стриманіші тони, від 4 000 ₴. Обидва варіанти доречні там, де колір важливий: дитячі пам'ятники, портрети у вишиванці, форма з кольоровими шевронами." },
        { heading: "Через 20 років", text: "Ручне й лазерне гравіювання — без змін, лише потребує миття. Якісна фотокераміка — трохи бліднішає, але читається. Дешева кераміка й фото на склі — вицвіли або замінені. Наш досвід реставрацій: 9 з 10 портретів, які ми замінюємо, — це кераміка 2000-х років." },
        { heading: "Що з фото", text: "Для будь-якого способу потрібне одне фото, де обличчя не менше 2×2 см на оригіналі та в помірній різкості; краще — два-три, з різних років. Ретушер відновлює старі знімки, прибирає фон, підправляє одяг, за потреби «одягає» форму з іншого фото. Перед гравіюванням ми показуємо пробний відбиток на папері в реальному розмірі — і лише після вашого «так» переносимо на камінь." },
        { heading: "Наша порада", text: "Чорне габро або лабрадорит — лазерне гравіювання, а для «живого» портрета великого розміру — ручне. Світлий або кольоровий камінь — фотокераміка від перевіреного виробника, або чорна вставка під портрет у стелі (ми робимо це часто: сіра стела, чорна полірована плитка з гравійованим портретом). Кольоровий портрет — лише там, де колір справді потрібен, і з розумінням, що його доведеться оновити." },
      ],
      [
        { text: "The portrait is what people look at longest on a monument — and what ages worst if done wrong. There are four methods, each with its own truth." },
        { heading: "Hand engraving", text: "The most expressive; lasts as long as the stone. Depends on the craftsman, takes 3–5 days, from 3,500 UAH. Best on black gabbro." },
        { heading: "Laser engraving", text: "Photographic precision from a digital file — the standard for military monuments and large portraits. From 2,000 UAH with retouching. Black stone only." },
        { heading: "Photoceramics", text: "A ceramic plate with a fired photo — the only way to get full colour on any stone, including light granite and marble. Good ceramics keep colour 25–30 years, cheap ones fade in 5–7. From 1,300 UAH." },
        { heading: "Colour on glass or stone", text: "Bright but short-lived (glass, 10–15 years) or more restrained and durable (colour-filled laser engraving, from 4,000 UAH). Appropriate where colour truly matters: children's monuments, embroidered shirts, uniforms." },
        { heading: "After 20 years", text: "Engraving: unchanged. Good ceramics: slightly paler. Cheap ceramics and glass: faded or replaced. Nine out of ten portraits we replace are 2000s ceramics." },
      ]
    ),
  },
]
