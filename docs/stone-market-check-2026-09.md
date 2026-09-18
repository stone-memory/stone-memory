# Звірка архітектурного каменю з ринком слябів, 18 вересня 2026

Питання замовника: що з нашого каталогу реально є в Україні, чого немає
взагалі й чим замінити. Попередня звірка (docs/stone-photo-ukrainian-2026-09.md)
дивилась лише на ukr.granite.ua та 8 меморіальних сайтів, де імпорту немає
в товарах. Тут узято продавців слябів і штучного каменю.

## Джерела

| Сайт | Що зібрано | Ціна | Наявність |
|---|---|---|---|
| goodstone.com.ua | 325 слябів природного каменю, 14 сторінок каталогу | € за м² для 78 позицій, решта «дізнатись ціну» | нема; країна лише в картці |
| viyar.ua | 424 позиції Caesarstone, Neolith, Laminam, Inalco | ₴ за сляб | «в наявності», «під замовлення», «скоро у продажу» |
| antik.ua | 46 українських слябів | ₴ за м² | «в наявності» |
| amonitt.com.ua | 141 сляб мармуру, кварциту, доломіту | ₴ за сляб | нема |
| mramor-granit.com (Metalstone) | 198 позицій граніту, мармуру, оніксу, травертину, кварциту | нема | нема |

Дилери без публічних списків декорів (перевірені вручну): Plastics (Silestone),
UA Quartz (Vicostone, Neolith), NewStone (Dekton), MAS (Caesarstone; є 5151
Empira White). Klinker Stone і Roof-Stone продають турецький травертин без
назв сортів. Збирач і звірка: `stone-scraper` не змінювався, разовий скрипт
лежав у тимчасовій теці сесії; повторити можна за таблицею вище.

## Результат по 124 колекціях

| Статус | Кількість |
|---|---|
| Є сляби з ціною або статусом наявності | 61 |
| У каталозі без ціни, або дилер без публічного списку | 26 |
| Не знайдено в жодного продавця | 29 |
| Іранське походження, лишаємо як «Імпорт» | 6 |
| Лише фасадний і колотий камінь (Овруцький кварцит, Теребовлянський пісковик) | 2 |

Довідник пам'ятників (44) не чіпаємо: 36 зі слябами й ціною, 6 без ціни,
2 мармури не знайдено (Calacatta Oro, Marmara White); у них прибрано лише
посилання на архітектурну колекцію.

## Рішення замовника 18.09.2026

1. Не знайдені на ринку ховаються в базі, не видаляються (28: 29 мінус
   Travertino Classico, який є в Metalstone як Travertine Classic).
2. Іранські 6 лишаються з походженням «Імпорт», як уже зроблено.
3. Заміни додаються прихованими до появи фото, потім відкриваються.

## Приховано (28)

- Вапняк: Jerusalem, Jerusalem Grey, Jerusalem Yellow, Nero Belgio, Atlantic Blue, Borriol.
- Травертин: Light Dorato, Scabas, Striato Silver, Ararat Classic.
- Кварцит: Mont Blanc, Blue Roma, Fusion Blue, Cristal Tempest, Titanium, Black Java.
- Мармур: Calacatta Oro, Marmara White. Онікс: Tiger, Himalayan.
- Caesarstone 4001 Fresh Concrete, 5171 Arabetto, Calacatta Nuvo; Neolith Arctic White, Calacatta, Iron Corten, Estatuario; Laminam Nero Marquina.

## Додано прихованими (24)

| Замість | Поставлено | Де і за скільки |
|---|---|---|
| вапняки | Vratza R1, Vratza R3 | Goodstone, 95 і 52 €/м² |
| травертини | Medium, Alabastrino, Safari Brown | Goodstone, 95, 270, 160 €/м² |
| кварцити | Le Blanc, Kalahari Blue, Macaubas Fantasy, White Pearl, Negresco, London Grey | Amonitt, 13–20 тис. ₴ за сляб |
| Calacatta Oro, Marmara White | Calacatta Oriental, Volakas | Amonitt 13 131 ₴; Goodstone 140 €/м² |
| Tiger, Himalayan | Honey, Bianco A | Goodstone, 700 і 685 €/м², країна не вказана |
| Caesarstone | 4011 Cloudburst Concrete, 5143 White Attica, 5100 Vanilla Noir, 5810 Black Tempal | Viyar, два під замовлення, два в наявності |
| Neolith | Fusion Beton, Mont Blanc, Steel Sofia Cuprum, ClasStone WhiteSands | Viyar, в наявності |
| Laminam Nero Marquina | Calce Nero | Viyar, в наявності |

Фото прийняті 18.09.2026, у сіді 120 колекцій; 24 нові відкриваються в базі після деплою (`scripts/apply-market-check.ts --unhide`).

## Що зроблено в коді

- `data/stone/seed/collections.ts`: списки `importedUnavailable`, `quartzUnavailable`,
  `porcelainUnavailable` (експорт `unavailableCollections`) і `importedPending`,
  `quartzPending`, `porcelainPending` (входять у `pendingCollections`). У
  `collections` їх немає, тож сід-fallback і `--unhide` їх не покажуть.
- Описи, характеристики й ціни для 24 нових у seed/descriptions, specs, prices.
- `scripts/apply-market-check.ts` і `supabase/stilnytsi-cms-7-market-check-2026-09.sql`:
  ховають 28, вставляють 24 прихованими; `--unhide` відкриває після деплою фото.
- Сторінка проєкту й стаття не показують посилання на приховану колекцію;
  довідник пам'ятників без `interiorSlug` для Calacatta Oro і Marmara White.
- Фото для 24 нових: [stone-photo-import-2026-09.md](stone-photo-import-2026-09.md).

## Відкриті питання

- Goodstone не вказує країну для оніксів: Honey і Bianco A можуть бути іранськими. Уточнити дзвінком до заміни на сайті.
- Silestone 4, Vicostone 4, Dekton 3 лишаються видимими як «під замовлення» без підтвердження декорів дилерами.
- П'ять проєктів і три статті посилаються на приховані декори (сторінки посилання не показують, `npm run stone-audit` перелічує їх як примітки). Після фото перевести: windowsill-for-years і сляб SM–007 → Caesarstone 4011 Cloudburst Concrete; rivne-utility-counter → Neolith ClasStone WhiteSands; lviv-hall-wall і стаття про керамограніт → Neolith Mont Blanc; lutsk-tv-console → Caesarstone 5143 White Attica; kyiv-family-kitchen і стаття про кухню → Caesarstone 5143 White Attica; стаття про фасади → Neolith Steel Sofia Cuprum.
