import type { Collection } from '@/lib/stone/cms-types'
import { knownPrices } from '@/data/stone/seed/prices'
import { descriptions } from '@/data/stone/seed/descriptions'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
const make = (
  slug: string,
  name: string,
  family: string,
  origin: string,
  tone: string,
  applications: string[],
  extra: Partial<Collection> = {}
): Collection => {
  const description =
    descriptions[slug] ??
    `${name}: ${tone} тон, походження — ${origin}. Застосування: ${applications.slice(0, 2).join(', ')}.`
  return {
    slug,
    name,
    material:
      family === 'Граніт' || family === 'Лабрадорит'
        ? 'granit'
        : family === 'Мармур'
          ? 'marmur'
          : family === 'Кварцит'
            ? 'kvarcyt'
            : family === 'Кварц'
              ? 'kvarc'
              : 'keramohranit',
    family,
    origin,
    tone,
    finishes:
      family === 'Кварц'
        ? ['полірований', 'матовий']
        : family === 'Керамограніт'
          ? ['матовий', 'полірований']
          : ['полірований', 'шліфований'],
    thicknesses: family === 'Керамограніт' ? [6, 12] : [20, 30],
    applications,
    description,
    image: `/materials/${slug}.webp`,
    cardImage: `/materials/${slug}.webp`,
    care:
      family === 'Мармур'
        ? 'Нейтральний pH, просочення та негайне видалення кислот.'
        : 'Нейтральний засіб; для природного каменю перевіряти просочення.',
    relatedArticles: ['yak-vybraty-kamin-dlya-kukhni', 'yak-doglyadaty-za-granitnoyu-stilnytseyu'],
    relatedCategories: ['stilnytsi', 'fasady'],
    price: knownPrices[slug] ?? { value: 0, unit: 'м²', currency: 'грн' },
    ...extra,
  }
}
const ukrainian: [string, string, string, string, string, string[]][] = [
  [
    'grey-ukraine',
    'Покостівський граніт (Grey Ukraine)',
    'Граніт',
    'Покостівське родовище, Україна',
    'світло-сірий',
    ['стільниці', 'сходи', 'фасади', 'бруківка'],
  ],
  [
    'kometa-black',
    'Габро (Kometa Black)',
    'Граніт',
    'Житомирська область, Україна',
    'чорний',
    ['стільниці', 'каміни', 'фасади'],
  ],
  [
    'volga-blue',
    'Лабрадорит Volga Blue',
    'Лабрадорит',
    'Житомирська область, Україна',
    'чорно-синій',
    ['стільниці', 'каміни', 'фасади'],
  ],
  [
    'irina-blue',
    'Лабрадорит Irina Blue',
    'Лабрадорит',
    'Житомирська область, Україна',
    'темно-синій',
    ['стільниці', 'фасади'],
  ],
  [
    'carpazi',
    'Токівський граніт Carpazi',
    'Граніт',
    'Дніпропетровська область, Україна',
    'червоно-коричневий',
    ['фасади', 'бруківка'],
  ],
  [
    'rosso-santiago',
    'Капустинський граніт Rosso Santiago',
    'Граніт',
    'Кіровоградська область, Україна',
    'малиново-червоний',
    ['стільниці', 'сходи', 'фасади'],
  ],
  [
    'maple-red',
    'Лезниківський граніт Maple Red',
    'Граніт',
    'Житомирська область, Україна',
    'яскраво-червоний',
    ['стільниці', 'сходи', 'фасади'],
  ],
  [
    'star-of-ukraine',
    'Дідковицький граніт Star of Ukraine',
    'Граніт',
    'Житомирська область, Україна',
    'рожево-коричневий',
    ['стільниці', 'фасади'],
  ],
  [
    'flower-of-ukraine',
    'Межиріцький граніт Flower of Ukraine',
    'Граніт',
    'Житомирська область, Україна',
    'червоно-рожевий',
    ['фасади', 'сходи', 'бруківка'],
  ],
  [
    'leopard',
    'Корнинський граніт Leopard',
    'Граніт',
    'Житомирська область, Україна',
    'рожевий',
    ['фасади', 'сходи', 'підвіконня'],
  ],
  [
    'tansky',
    'Танський граніт (Tansky)',
    'Граніт',
    'Кіровоградська область, Україна',
    'сірий',
    ['стільниці', 'сходи', 'фасади', 'бруківка'],
  ],
  [
    'greenish-tansky',
    'Північно-Танський граніт (Greenish Tansky)',
    'Граніт',
    'Кіровоградська область, Україна',
    'сіро-зелений',
    ['сходи', 'фасади', 'бруківка'],
  ],
  [
    'evening-warsaw',
    'Західно-Танський граніт (Evening Warsaw)',
    'Граніт',
    'Кіровоградська область, Україна',
    'темно-сірий',
    ['стільниці', 'сходи', 'фасади'],
  ],
  [
    'sophiyvsky',
    'Софіївський граніт (Sophiyvsky)',
    'Граніт',
    'Житомирська область, Україна',
    'світло-сірий',
    ['стільниці', 'сходи', 'фасади', 'бруківка'],
  ],
  [
    'verde-oliva',
    'Маславський граніт (Verde Oliva)',
    'Граніт',
    'Житомирська область, Україна',
    'темно-зелений',
    ['стільниці', 'сходи', 'фасади'],
  ],
  [
    'real-grey',
    'Янцівський граніт (Real Grey)',
    'Граніт',
    'Запорізька область, Україна',
    'світло-сірий',
    ['стільниці', 'сходи', 'фасади', 'бруківка'],
  ],
  [
    'cardinal-grey',
    'Жежелівський граніт (Cardinal Grey)',
    'Граніт',
    'Вінницька область, Україна',
    'сірий із блакитним відтінком',
    ['стільниці', 'сходи', 'фасади'],
  ],
  [
    'grey-quoin',
    'Старобабанський граніт (Grey Quoin)',
    'Граніт',
    'Черкаська область, Україна',
    'сіро-рожевий',
    ['сходи', 'фасади', 'бруківка'],
  ],
  [
    'kostyantynivsky',
    'Костянтинівський граніт',
    'Граніт',
    'Житомирська область, Україна',
    'сірий',
    ['стільниці', 'сходи', 'фасади', 'бруківка'],
  ],
  [
    'boguslavsky',
    'Богуславський граніт',
    'Граніт',
    'Київська область, Україна',
    'сіро-рожевий',
    ['сходи', 'фасади', 'бруківка'],
  ],
  [
    'holovynske',
    'Головинське габро',
    'Граніт',
    'Житомирська область, Україна',
    'глибокий чорний',
    ['стільниці', 'каміни', 'фасади'],
  ],
  [
    'bukynske',
    'Букинське габро',
    'Граніт',
    'Житомирська область, Україна',
    'чорний',
    ['стільниці', 'каміни', 'сходи'],
  ],
  [
    'antik-nero',
    'Лугове габро (Antik Nero)',
    'Граніт',
    'Житомирська область, Україна',
    'чорний із сіро-зеленим відтінком',
    ['сходи', 'фасади', 'бруківка'],
  ],
  [
    'extra-blue-ukraine',
    'Добринський лабрадорит (Extra Blue Ukraine)',
    'Лабрадорит',
    'Житомирська область, Україна',
    'чорний із синім переливом',
    ['стільниці', 'каміни', 'фасади'],
  ],
  [
    'volga-blue-extra',
    'Горбулівський лабрадорит (Volga Blue Extra)',
    'Лабрадорит',
    'Житомирська область, Україна',
    'чорно-сірий із синьо-зеленим переливом',
    ['стільниці', 'каміни', 'фасади'],
  ],
  [
    'black-ice',
    'Невирівський лабрадорит (Black Ice)',
    'Лабрадорит',
    'Житомирська область, Україна',
    'графітово-чорний',
    ['стільниці', 'сходи', 'фасади'],
  ],
  [
    'berestovetskyi',
    'Берестовецький базальт',
    'Граніт',
    'Рівненська область, Україна',
    'темно-сірий',
    ['бруківка', 'сходи', 'фасади'],
  ],
  [
    'kostopilskyi',
    'Костопільський базальт',
    'Граніт',
    'Рівненська область, Україна',
    'темно-сірий',
    ['бруківка', 'фасади', 'сходи'],
  ],
  [
    'khustovskyi',
    'Хустовський базальт',
    'Граніт',
    'Закарпатська область, Україна',
    'сіро-чорний',
    ['бруківка', 'фасади'],
  ],
]
const imported: [string, string, string, string, string, string[]][] = [
  [
    'bianco-carrara',
    'Мармур Bianco Carrara',
    'Мармур',
    'Італія',
    'білий із сірими прожилками',
    ['ванна', 'каміни', 'підвіконня'],
  ],
  [
    'crema-marfil',
    'Мармур Crema Marfil',
    'Мармур',
    'Іспанія',
    'кремово-бежевий',
    ['ванна', 'підлога', 'підвіконня'],
  ],
  [
    'emperador-dark',
    'Мармур Emperador Dark',
    'Мармур',
    'Іспанія',
    'темно-коричневий',
    ['ванна', 'каміни'],
  ],
  [
    'nero-marquina',
    'Мармур Nero Marquina',
    'Мармур',
    'Іспанія',
    'чорний із білими прожилками',
    ['ванна', 'каміни'],
  ],
  [
    'taj-mahal',
    'Кварцит Taj Mahal',
    'Кварцит',
    'Бразилія',
    'кремово-бежевий',
    ['стільниці', 'острови', 'ванна'],
  ],
]
const quartz = [
  'Caesarstone|4001 Fresh Concrete|сірий бетон',
  'Caesarstone|5171 Arabetto|білий мармуроподібний',
  'Caesarstone|5151 Empira White|білий із прожилками',
  'Caesarstone|Calacatta Nuvo|білий Calacatta',
  'Vicostone|BQ8270 Calacatta|білий Calacatta',
  'Vicostone|BQ8220 Carrara|білий із сірим',
  'Vicostone|BQ8740 Nero Marquina|чорний із білим',
  'Vicostone|Vivalioro|кремовий із золотим',
  'Silestone|Eternal Calacatta Gold|білий із золотим',
  'Silestone|Ethereal Glow|світлий теплий',
  'Silestone|Blanco Zeus|чистий білий',
  'Silestone|Eternal Marquina|чорний',
]
const porcelain = [
  'Laminam|Calacatta|білий мармуроподібний',
  'Laminam|Nero Marquina|чорний із білими прожилками',
  'Laminam|Pietra Grey|темно-сірий',
  'Laminam|Travertino|бежевий',
  'Neolith|Arctic White|білий',
  'Neolith|Calacatta|білий мармуроподібний',
  'Neolith|Iron Corten|іржаво-коричневий',
  'Neolith|Estatuario|білий із сірими прожилками',
  'Dekton|Kreta|цементно-сірий',
  'Dekton|Laurent|чорний із золотим',
  'Dekton|Rem|білий із прожилками',
]
export const collections: Collection[] = [
  ...ukrainian.map((x) =>
    make(x[0], x[1], x[2], x[3], x[4], x[5], x[0] === 'carpazi' ? { exteriorOnly: true } : {})
  ),
  ...imported.map((x) => make(x[0], x[1], x[2], x[3], x[4], x[5])),
  ...quartz.map((value) => {
    const [brand, decor, tone] = value.split('|'),
      slug = slugify(`${brand}-${decor}`)
    return make(
      slug,
      `${brand} ${decor}`,
      'Кварц',
      brand,
      tone,
      ['стільниці', 'острови', 'підвіконня'],
      { brand }
    )
  }),
  ...porcelain.map((value) => {
    const [brand, decor, tone] = value.split('|'),
      slug = slugify(`${brand}-${decor}`)
    return make(
      slug,
      `${brand} ${decor}`,
      'Керамограніт',
      brand === 'Laminam' ? 'Італія' : 'Іспанія',
      tone,
      ['стільниці', 'фасади', 'облицювання'],
      { brand, formats: ['1620×3240'] }
    )
  }),
]
