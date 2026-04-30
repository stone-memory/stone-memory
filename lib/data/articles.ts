import type { Locale } from "@/lib/types"

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

const u = (id: string) => `https://images.unsplash.com/${id}?w=1600&h=1000&fit=crop&q=80`

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

const LOREM_UK = [
  "Текст готується нашим редактором. Якщо вам цікава тема — напишіть нам, і ми розкажемо більше.",
]
const LOREM_EN = [
  "A deeper version of this article is coming from our editor. Drop us a line if you want the long read.",
]

const body = (uk: string, en: string) => ({
  uk: [{ text: uk }],
  en: [{ text: en }],
  pl: [{ text: en }],
  de: [{ text: en }],
  lt: [{ text: en }],
})

export const articles: Article[] = [
  {
    slug: "how-to-choose-granite",
    category: "stone",
    cover: u("photo-1565043666747-69f6646db940"),
    readMinutes: 7,
    date: "2026-03-12",
    title: {
      uk: "Як обрати граніт: 7 речей, які має знати кожен покупець",
      en: "How to choose granite: 7 things every buyer should know",
      pl: "Jak wybrać granit: 7 rzeczy, które warto wiedzieć",
      de: "Granit richtig auswählen: 7 Dinge, die jeder Käufer kennen sollte",
      lt: "Kaip pasirinkti granitą: 7 dalykai kiekvienam pirkėjui",
    },
    excerpt: {
      uk: "Походження, щільність, абсорбція, колір, поверхня, розмір і ціна — гайд, щоб не схибити.",
      en: "Origin, density, absorption, colour, finish, size and price — a guide so you don't get it wrong.",
      pl: "Pochodzenie, gęstość, absorpcja, kolor, wykończenie, rozmiar i cena.",
      de: "Herkunft, Dichte, Absorption, Farbe, Oberfläche, Größe und Preis.",
      lt: "Kilmė, tankis, absorbcija, spalva, apdaila, dydis ir kaina.",
    },
    body: {
      uk: [
        { heading: "1. Походження", text: "Українські родовища дають усю необхідну палітру: Головинське габро — найглибший чорний, Лезниківський — насичений червоний, Покостівський — аристократичний сірий, Головинський лабрадорит — гра синіх відблисків." },
        { heading: "2. Щільність та абсорбція", text: "Шукайте показник ≤0.3% — це означає, що камінь не вбиратиме воду." },
        { heading: "3. Колір", text: "Чорний — класика, сірий — універсальність, лабрадорит — глибина та блиск." },
        { heading: "4. Поверхня", text: "Полірована, шліфована, термо, антик. Кожна має свій характер." },
        { heading: "5. Розмір", text: "Не беріть стандарт «про запас». Проектуйте під місце." },
        { heading: "6. Сертифікати", text: "Запитуйте документ походження — для українського каменю ми надаємо паспорт із кар'єру." },
        { heading: "7. Ціна", text: "Дешевше — часто означає тонший або змішаний камінь. Перевіряйте товщину." },
      ],
      en: [
        { heading: "1. Origin", text: "Ukrainian deposits cover the full palette: Holovyne gabbro for the deepest black, Leznykivskyi for saturated red, Pokostivskyi for aristocratic grey, Holovynskyi labradorite for the play of blue reflections." },
        { heading: "2. Density and absorption", text: "Aim for ≤0.3% absorption — that guarantees the stone will not drink water." },
        { heading: "3. Colour", text: "Black is classic. Grey is universal. Labradorite brings depth and shimmer." },
        { heading: "4. Finish", text: "Polished, honed, flamed, antiqued. Each carries its own character." },
        { heading: "5. Size", text: "Don't over-order. Design for the place." },
        { heading: "6. Certificates", text: "Ask for the origin certificate — for Ukrainian stone we provide the quarry passport." },
        { heading: "7. Price", text: "Cheaper usually means thinner or mixed material. Always check the thickness." },
      ],
      pl: [{ text: "Pełna wersja wkrótce." }],
      de: [{ text: "Vollständige Version folgt." }],
      lt: [{ text: "Pilna versija netrukus." }],
    },
  },
  {
    slug: "single-vs-double-memorial",
    category: "memorials",
    cover: u("photo-1518837695005-2083093ee35b"),
    readMinutes: 6,
    date: "2026-02-28",
    title: {
      uk: "Одинарний чи подвійний пам'ятник: як обрати",
      en: "Single or double memorial: how to decide",
      pl: "Pomnik pojedynczy czy podwójny",
      de: "Einzel- oder Doppelgrabmal: wie entscheiden",
      lt: "Vienvietis ar dvivietis paminklas",
    },
    excerpt: {
      uk: "Практичні критерії, етика і символіка — допомагаємо прийняти зважене рішення.",
      en: "Practical criteria, ethics and symbolism — helping you make a grounded decision.",
      pl: "Kryteria, etyka i symbolika.",
      de: "Kriterien, Ethik und Symbolik.",
      lt: "Kriterijai, etika ir simbolika.",
    },
    body: {
      uk: [
        { heading: "Коли подвійний виправданий", text: "Подвійний пам'ятник має сенс, коли місце на кладовищі відведено для подружжя або близьких родичів, і ви хочете уникнути переробки через 10–20 років. Інший випадок — виконавча воля людини, яка ще жива: простір готовий, другу частину напису гравіруємо пізніше." },
        { heading: "Як це виглядає технічно", text: "Підвійний виготовляється з одного блоку з одним фундаментом — це дешевше і міцніше, ніж два окремих монументи. Ширина зазвичай 140–180 см проти 70–90 см у одинарного. Напис можна зробити «глухим» і додати пізніше, або зразу з двох боків." },
        { heading: "Етичні моменти", text: "Якщо одна людина ще жива, напис лишаємо без дати смерті — тільки ім'я і рік народження. Це нормально. Деякі замовники хочуть навіть портрет заздалегідь — у такому разі використовуємо техніку «лазерне гравіювання», щоб за потреби можна було оновити." },
        { heading: "Коли краще одинарний", text: "Якщо сімейний план міняється, або якщо ви не впевнені. Одинарний завжди можна доповнити поряд через кілька років, просто з іншим дизайном — деяким клієнтам це подобається більше, ніж жорстка симетрія." },
        { heading: "Що обговорюємо на консультації", text: "Розміри ділянки, розташування сонця (щоб портрети не вигорали), орієнтацію напису до дороги, тип каменю (чорний чи сірий краще «тримає» подвійну композицію), тип фундаменту під регіональний ґрунт." },
      ],
      en: [
        { heading: "When a double monument makes sense", text: "A double memorial makes sense when the cemetery plot is reserved for a couple or close relatives, and you want to avoid rework 10–20 years later. Another case is someone's expressed will while still alive: the space is prepared, the second part of the inscription is engraved later." },
        { heading: "How it looks technically", text: "A double is carved from a single block with one foundation — cheaper and stronger than two separate monuments. Width is typically 140–180 cm vs 70–90 cm for a single. Inscriptions can be left blind and added later, or done on both sides from the start." },
        { heading: "Ethical notes", text: "If one of the people is still alive, we leave the inscription without the date of death — just the name and year of birth. That's normal. Some clients even want a portrait prepared in advance; in that case we use laser engraving so the image can be refreshed if needed." },
        { heading: "When a single is better", text: "If the family plan is changing, or you are unsure. A single can always be complemented later with another piece next to it — some clients prefer that organic growth to strict symmetry." },
        { heading: "What we discuss at the consultation", text: "Plot dimensions, sun orientation (so portraits don't fade), inscription orientation to the path, stone type (black or grey hold a double composition better), foundation type for the local soil." },
      ],
      pl: [{ text: "Pełna wersja wkrótce." }],
      de: [{ text: "Vollständige Version folgt." }],
      lt: [{ text: "Pilna versija netrukus." }],
    },
  },
  {
    slug: "stone-care-seasons",
    category: "care",
    cover: u("photo-1606744837616-56c9a5c6a6eb"),
    readMinutes: 5,
    date: "2026-02-14",
    title: {
      uk: "Догляд за каменем: чотири сезони — чотири підходи",
      en: "Stone care across four seasons",
      pl: "Pielęgnacja kamienia w czterech porach roku",
      de: "Steinpflege durch vier Jahreszeiten",
      lt: "Akmens priežiūra keturiais metų laikais",
    },
    excerpt: {
      uk: "Що робити після зими, як готувати камінь до спеки, коли потрібна гідрофобізація.",
      en: "What to do after winter, how to prepare stone for heat, when to apply hydrophobic treatment.",
      pl: "Po zimie, przed upałem, kiedy hydrofobizować.",
      de: "Nach dem Winter, vor der Hitze, wann hydrophobieren.",
      lt: "Po žiemos, prieš karščius, kada hidrofobizuoti.",
    },
    body: {
      uk: [
        { heading: "Весна: після зими", text: "Як тільки земля відтає, пройдіть пам'ятник м'якою тканиною з теплою водою (без мила, без абразивів) — знімаєте шар зимового бруду. Перевірте шви між плитами: якщо в них є тріщини — викликайте майстра на перегерметизацію. Це займає 15 хвилин і захистить від води, яка замерзне наступної зими." },
        { heading: "Літо: захист і гідрофобізація", text: "Раз на 2–3 роки наносьте гідрофобний склад на основі силоксанів — він не змінює вигляд каменю, але не дає воді і маслам проникати всередину. На чорному граніті влітку слідкуйте за пташиним послідом: він кислотний і залишає плями, якщо не змити одразу." },
        { heading: "Осінь: перевірка фундаменту", text: "Поки земля ще не промерзла — огляньте простір навколо пам'ятника. Якщо одна сторона просіла на 1–2 см — це вже сигнал. Ми рекомендуємо замовляти щорічне сервісне обслуговування: приїжджає майстер, робить фото-звіт і за потреби піднімає пам'ятник." },
        { heading: "Зима: обережно зі снігом і сіллю", text: "Ніколи не посипайте плити технічною сіллю — вона роз'їдає поверхню і деградує шви. Для ожеледиці використовуйте пісок або дрібний щебінь. Сніг скидайте пластиковою лопатою, не металевою — металева залишає мікродряпини на полірованій поверхні." },
        { heading: "Чого не робити ніколи", text: "Не мийте кислотними засобами (розчинник для плитки, будь-що з рН <5). Не використовуйте парогенератор — перепад температур може дати тріщину на полірованому камені. Не клеїте звичайним скотчем квіти чи прикраси — слід залишається на роки." },
      ],
      en: [
        { heading: "Spring: after winter", text: "As soon as the ground thaws, wipe the monument with a soft cloth and warm water (no soap, no abrasives) — this removes the winter grime layer. Check the joints between plates: if there are cracks, call a craftsman to re-seal. Takes 15 minutes and prevents water from freezing inside next winter." },
        { heading: "Summer: protection and hydrophobic treatment", text: "Every 2–3 years apply a siloxane-based hydrophobic compound — it doesn't change the stone's appearance but prevents water and oils from penetrating. On black granite watch out for bird droppings in summer: they are acidic and leave marks if not washed off immediately." },
        { heading: "Autumn: foundation check", text: "Before the ground freezes, inspect the perimeter. If one side has sunk by 1–2 cm, that's already a warning. We recommend booking annual service: a craftsman visits, takes a photo report, and re-levels if needed." },
        { heading: "Winter: careful with snow and salt", text: "Never use road salt on slabs — it etches the surface and degrades joints. Use sand or fine gravel for ice. Clear snow with a plastic shovel, not metal — metal leaves micro-scratches on polished surfaces." },
        { heading: "Things to never do", text: "Don't use acidic cleaners (tile solvent, anything with pH <5). Don't use a steam generator — thermal shock can crack polished stone. Don't tape flowers or decorations with regular tape — the residue stays for years." },
      ],
      pl: [{ text: "Pełna wersja wkrótce." }],
      de: [{ text: "Vollständige Version folgt." }],
      lt: [{ text: "Pilna versija netrukus." }],
    },
  },
  {
    slug: "epitaph-writing",
    category: "design",
    cover: u("photo-1533167649158-6d508895b680"),
    readMinutes: 8,
    date: "2026-02-01",
    title: {
      uk: "Як написати епітафію: 12 підходів і 40 прикладів",
      en: "How to write an epitaph: 12 approaches and 40 examples",
      pl: "Jak napisać epitafium",
      de: "Wie man ein Epitaph schreibt",
      lt: "Kaip parašyti epitafiją",
    },
    excerpt: {
      uk: "Від класики до персональних історій. Як обрати слова, що залишаться.",
      en: "From classics to personal stories. Choosing words that will remain.",
      pl: "Od klasyki po osobiste historie.",
      de: "Von Klassikern bis zu persönlichen Geschichten.",
      lt: "Nuo klasikos iki asmeninių istorijų.",
    },
    body: {
      uk: [
        { heading: "Правило трьох рядків", text: "Більшість сильних епітафій вміщується у 3 рядки. Перший — ім'я і дати. Другий — коротка характеристика (хто був для рідних). Третій — слова прощання або уривок. Більше — перевантажує камінь і зменшує шрифт." },
        { heading: "Шлях 1: класика", text: "«Вічна пам'ять», «Любимо і пам'ятаємо», «Спи спокійно». Працює завжди, не ризикує. Добре підходить, коли родина велика і хочеться формулювання, яке не виглядатиме дивним для когось." },
        { heading: "Шлях 2: професія або життя", text: "«Вчителька. Мати. Бабуся.» або «Працював з деревом 40 років. Любив ліс». Це коротко розповідає, ким людина була. Через 50 років внуки і правнуки зрозуміють більше, ніж з дат." },
        { heading: "Шлях 3: улюблена фраза", text: "Якщо людина повторювала одну фразу — використайте її. «Все буде добре», «Головне — не сумуй», «Живи і радій». Це найтепліша форма: рідні впізнають голос." },
        { heading: "Шлях 4: цитата", text: "Шевченко, Франко, Ліна Костенко для українських пам'ятників. Рільке, Єйтс, Мілош — для інших контекстів. Уникайте довгих уривків: 6–10 слів максимум." },
        { heading: "Чого уникати", text: "Банальностей «ми всі колись зустрінемось». Невдалих рим. Слів, які людина сама ніколи б не написала про себе. Релігійних формул, якщо людина не була релігійною — це фальш." },
        { heading: "Технічна порада", text: "Перевірте, як епітафія читається вголос, а не просто з аркуша. На камені вона сприйматиметься як промова. Якщо слово незрозуміле — приберіть. Якщо не передає емоцію — перепишіть." },
      ],
      en: [
        { heading: "The three-line rule", text: "Most strong epitaphs fit on three lines. Line 1 — name and dates. Line 2 — a short characterisation (who they were to family). Line 3 — farewell words or a quote. More than that overloads the stone and shrinks the font." },
        { heading: "Path 1: classic", text: "'In loving memory', 'Forever remembered', 'Rest in peace'. Always works, low risk. Good for large families where an unusual phrase might feel out of place to someone." },
        { heading: "Path 2: profession or life", text: "'Teacher. Mother. Grandmother.' or 'Worked with wood for 40 years. Loved the forest.' This tells who the person was in a few words. In 50 years grandchildren will understand more than from dates alone." },
        { heading: "Path 3: a favourite phrase", text: "If the person often repeated a phrase — use it. 'Everything will be fine', 'Don't be sad', 'Live and enjoy'. The warmest form: family recognise the voice." },
        { heading: "Path 4: a quotation", text: "Shevchenko, Franko, Lina Kostenko for Ukrainian monuments. Rilke, Yeats, Miłosz for other contexts. Avoid long excerpts: 6–10 words max." },
        { heading: "What to avoid", text: "Banalities like 'we will all meet again'. Poor rhymes. Words the person would never have written about themselves. Religious formulas if the person wasn't religious — it rings false." },
        { heading: "A technical tip", text: "Read the epitaph out loud, not just on paper. On the stone it functions as a spoken line. If a word feels unclear, remove it. If it doesn't convey emotion, rewrite it." },
      ],
      pl: [{ text: "Pełna wersja wkrótce." }],
      de: [{ text: "Vollständige Version folgt." }],
      lt: [{ text: "Pilna versija netrukus." }],
    },
  },
  {
    slug: "black-granite-deep-dive",
    category: "stone",
    cover: u("photo-1604756277257-ce7bfdec8b89"),
    readMinutes: 6,
    date: "2026-01-21",
    title: {
      uk: "Чорний граніт України: Головинське, Добринське, Ємельянівське",
      en: "Ukrainian black granite: Holovyne, Dobrynske, Yemelianivske",
      pl: "Ukraiński czarny granit: Hołowyne, Dobrynske, Jemelianiwske",
      de: "Ukrainischer schwarzer Granit im Vergleich",
      lt: "Ukrainos juodasis granitas: palyginimas",
    },
    excerpt: {
      uk: "Три українські родовища чорного габро — три характери. Де кожен проявляє себе найкраще.",
      en: "Three Ukrainian black gabbro deposits — three characters. Where each performs best.",
      pl: "Trzy ukraińskie złoża czarnego gabra — trzy charaktery.",
      de: "Drei ukrainische Vorkommen schwarzen Gabbros — drei Charaktere.",
      lt: "Trys Ukrainos juodojo gabbro telkiniai — trys charakteriai.",
    },
    body: body(
      "Головинське габро — найглибший чорний після полірування, ідеальне для гравіювання портретів. Добринське — щільна однорідна структура, ресурс на століття. Ємельянівське — насичений антрацит з дрібним зерном, чудово тримає деталь.",
      "Holovyne gabbro delivers the deepest black after polishing and is ideal for portrait engraving. Dobrynske has a dense uniform structure that lasts a century. Yemelianivske is a saturated anthracite with fine grain that holds intricate detail."
    ),
  },
  {
    slug: "history-of-memorial-stone",
    category: "history",
    cover: u("photo-1503602642458-232111445657"),
    readMinutes: 10,
    date: "2026-01-07",
    title: {
      uk: "Коротка історія меморіального каменю: від дольменів до сьогодні",
      en: "A brief history of memorial stone: from dolmens to today",
      pl: "Krótka historia kamienia pamięci",
      de: "Kurze Geschichte des Gedenksteins",
      lt: "Trumpa paminklinio akmens istorija",
    },
    excerpt: {
      uk: "Як змінювалась форма, символіка і обробка — 5000 років у 10 хвилинах.",
      en: "How form, symbolism and craft have changed — 5,000 years in 10 minutes.",
      pl: "5000 lat w 10 minut.",
      de: "5.000 Jahre in 10 Minuten.",
      lt: "5 000 metų per 10 minučių.",
    },
    body: body(
      "Від дольменів — до стели античності; від середньовічних плит — до ренесансних саркофагів; від модерну — до архітектури пам'яті наших днів.",
      "From dolmens to antique stelae; from medieval slabs to Renaissance sarcophagi; from modernism to today's architecture of memory."
    ),
  },
  {
    slug: "garden-stone-composition",
    category: "design",
    cover: u("photo-1584967334362-26f31ae95b3f"),
    readMinutes: 5,
    date: "2026-04-05",
    title: {
      uk: "Композиція з каменю в саду: правило 3-5-7",
      en: "Stone composition in the garden: the 3-5-7 rule",
      pl: "Kompozycja z kamienia w ogrodzie",
      de: "Steinkomposition im Garten",
      lt: "Akmens kompozicija sode",
    },
    excerpt: {
      uk: "Чому непарна кількість каменів виглядає природно — і як це використати.",
      en: "Why an odd number of stones looks natural — and how to use it.",
      pl: "Dlaczego nieparzysta liczba kamieni wygląda naturalnie.",
      de: "Warum ungerade Steinzahlen natürlich wirken.",
      lt: "Kodėl nelyginis akmenų skaičius atrodo natūraliai.",
    },
    body: body(
      "Правило 3-5-7: непарна кількість, різні розміри, один «герой» і два-три акценти. Японські сади дотримуються його століттями.",
      "The 3-5-7 rule: odd count, varied sizes, one hero and two or three accents. Japanese gardens have followed it for centuries."
    ),
  },
  {
    slug: "granite-vs-marble-outdoors",
    category: "stone",
    cover: u("photo-1600121848594-d8644e57abab"),
    readMinutes: 4,
    date: "2026-03-22",
    title: {
      uk: "Граніт проти мармуру на відкритому повітрі",
      en: "Granite vs marble outdoors",
      pl: "Granit kontra marmur na zewnątrz",
      de: "Granit vs. Marmor im Freien",
      lt: "Granitas prieš marmurą lauke",
    },
    excerpt: {
      uk: "Коротко: граніт виграє. Але є винятки.",
      en: "Short answer: granite wins. With some exceptions.",
      pl: "Krótko: granit wygrywa, z wyjątkami.",
      de: "Kurz: Granit gewinnt. Mit Ausnahmen.",
      lt: "Trumpai: granitas laimi, su išimtimis.",
    },
    body: {
      uk: [
        { heading: "Коротко: граніт виграє", text: "Граніт твердіший (шкала Мооса 6–7 проти 3–4 у мармуру), менш пористий (абсорбція 0.1–0.3% проти 0.5–1% у мармуру) і хімічно стійкіший до кислотних дощів. Для пам'ятників, стільниць на зовнішній кухні, бруківки — завжди граніт." },
        { heading: "Коли мармур ОК", text: "Мармур чудовий у помірному або м'якому кліматі, під накриттям, або з регулярним доглядом (1–2 рази на рік полірування і гідрофобізація). В Карпатах, наприклад, столітні мармурові надгробки виглядають дивовижно. В Рівненській області — теж, якщо клієнт готовий доглядати." },
        { heading: "Прилузький виняток", text: "Український Прилузький мармур має одну з найнижчих абсорбцій серед мармурів (до 0.35%). Він дешевший за італійський Carrara в 3–4 рази і тримається краще, ніж більшість імпортних. Для стільниць на відкритій терасі — хороший компроміс." },
        { heading: "Кислотні дощі і сіль", text: "Великий мінус мармуру: будь-який кислий дощ (а в Європі середній рН дощу 5.0–5.6) поступово роз'їдає поверхню — через 20 років ви побачите матові плями. Граніту байдуже. Біля доріг, де сіль взимку, мармур деградує ще швидше." },
        { heading: "Як вибрати: перевірочний список", text: "Чи є прямий доступ дощу? Чи буде контакт з сіллю? Чи готові ви обслуговувати раз на рік? Чи важливий саме мармуровий вигляд? Якщо дві «ні» — беріть граніт. Якщо хочете мармур будь-якою ціною — беріть Carrara або Прилузький, але з розумінням, що догляд потрібен." },
      ],
      en: [
        { heading: "Short answer: granite wins", text: "Granite is harder (Mohs 6–7 vs 3–4 for marble), less porous (absorption 0.1–0.3% vs 0.5–1% for marble) and chemically more resistant to acid rain. For monuments, outdoor kitchen countertops, paving — always granite." },
        { heading: "When marble is OK", text: "Marble is beautiful in mild climates, under cover, or with regular care (polishing and hydrophobic treatment 1–2 times a year). In the Carpathians, hundred-year-old marble gravestones look stunning. In Rivne region too, if the client is ready to maintain." },
        { heading: "The Pryluzkyi exception", text: "Ukrainian Pryluzkyi marble has one of the lowest absorption rates among marbles (up to 0.35%). It costs 3–4× less than Italian Carrara and holds up better than most imports. A good compromise for an outdoor terrace countertop." },
        { heading: "Acid rain and salt", text: "The big marble minus: any acidic rain (average EU rain pH is 5.0–5.6) gradually etches the surface — in 20 years you'll see matte patches. Granite doesn't care. Near roads with winter salt, marble degrades even faster." },
        { heading: "How to choose: checklist", text: "Direct rain exposure? Salt contact? Willing to maintain annually? Is the marble look essential? Two 'no' answers → choose granite. Set on marble → choose Carrara or Pryluzkyi, but plan for care." },
      ],
      pl: [{ text: "Pełna wersja wkrótce." }],
      de: [{ text: "Vollständige Version folgt." }],
      lt: [{ text: "Pilna versija netrukus." }],
    },
  },
  {
    slug: "restoring-old-monuments",
    category: "care",
    cover: u("photo-1505843490578-27b2d6f0ff24"),
    readMinutes: 7,
    date: "2026-03-08",
    title: {
      uk: "Реставрація старих пам'ятників: що можна, а що — ні",
      en: "Restoring old monuments: what's possible and what isn't",
      pl: "Renowacja starych pomników",
      de: "Restaurierung alter Grabmale",
      lt: "Senų paminklų restauravimas",
    },
    excerpt: {
      uk: "Коли варто реставрувати, а коли краще встановити новий.",
      en: "When to restore, and when it's better to start anew.",
      pl: "Kiedy renowacja, a kiedy nowy pomnik.",
      de: "Wann restaurieren, wann neu errichten.",
      lt: "Kada restauruoti, kada kurti naują.",
    },
    body: body(
      "Глибокі тріщини й зміщення фундаменту часто важче і дорожче виправити, ніж замінити. Ми завжди робимо чесний діагноз перед пропозицією.",
      "Deep cracks and foundation shifts are often harder and pricier to fix than to replace. We always give an honest diagnosis first."
    ),
  },
]

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug)
}

export function getArticlesByCategory(cat: ArticleCategory) {
  return articles.filter((a) => a.category === cat)
}
