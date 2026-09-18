# Завдання для агента: 80 фото каменю для каталогу

> Виконано 18.09.2026: обидві партії прийняті, усі 24 колекції з повним
> комплектом у `public/` і в основному сіді. Текст лишається як шаблон для
> наступних додавань.

Ти генеруєш фотореалістичні зображення натурального і штучного каменю для
сайту-каталогу. Працюєш із порожньою текою: створи в ній `public/materials/`
і `public/collections/`. Для кожного з 20 каменів у таблиці нижче зроби
4 файли, разом рівно **80 файлів** з іменами з розділу «Список файлів».
Нічого поза списком не генерувати.

## Чотири типи файлів

| Тип | Ім'я | Що на зображенні |
|---|---|---|
| Картка | `public/materials/<slug>.png` | полірована поверхня каменю, заповнює весь кадр, без країв плити, без фону, рівне м'яке світло |
| Макро | `public/collections/<slug>-macro.png` | зерно чи жили зблизька, 10–15 см поверхні в кадрі, різкість по всьому кадру, без країв плити |
| Сляб | `public/collections/<slug>-slab.png` | ціла прямокутна полірована плита стоїть на металевій А-подібній стійці в світлому шоурумі; стійка позаду або під плитою, не перед нею; світло-сіра стіна, бетонна підлога; видно весь малюнок плити |
| Застосування | `public/collections/<slug>-application.png` | саме цей камінь у готовому виробі, сюжет із таблиці; камінь займає більшу частину кадру |

## Вимоги до кожного зображення

- Фотореалістична фотографія. Не рендер-мультик, не ілюстрація, не колаж із двох кадрів.
- Кадр 3:2 і від 2400×1600, якщо генератор уміє; інакше квадрат від 1024×1024.
- У кадрі немає тексту, етикеток, підписів, водяних знаків, рамок, логотипів, людей, рук.
- Файл має містити реальне зображення й важити понад 200 КБ. Заглушка «немає
  зображення», сірий квадрат, іконка чи порожній файл не приймаються.
- Один камінь = одна текстура на всіх чотирьох його файлах. Порядок: спершу
  згенеруй картку `public/materials/<slug>.png` за описом TEXTURE, потім три
  сцени, у яких повторюєш колір, зерно й малюнок саме цієї картки, а не
  вигадуєш новий варіант каменю.
- Штучний камінь (Caesarstone, Neolith, Laminam): плита на слябі
  великоформатна, 3200×1600 мм, рівномірний малюнок без природних дефектів.

## Шаблони промптів

Англійською. `TEXTURE` і `SCENE` підставляй із таблиці каменів. Спільний
хвіст для всіх: `photorealistic, natural daylight, sharp focus, no text, no
watermark, no people`.

- Картка: `Top-down photograph of a polished TEXTURE surface filling the entire frame edge to edge, no slab edges, no background, even soft light, …`
- Макро: `Extreme close-up macro photograph of polished TEXTURE, 10–15 cm of stone filling the frame, crystals and veins in sharp detail, no edges, no background, …`
- Сляб: `Product photograph of a whole rectangular polished slab of TEXTURE standing upright on a steel A-frame slab rack in a bright stone showroom, the rack stands behind and under the slab and does not cover the stone, neutral light-grey wall, polished concrete floor, full slab pattern visible, …`
- Застосування: `SCENE made of TEXTURE, the stone occupies most of the frame, …`

## Камені

| slug | Камінь | TEXTURE | SCENE |
|---|---|---|---|
| neolith-classtone-whitesands | Neolith ClasStone WhiteSands | light sand-coloured sintered stone with fine natural grain, matte | outdoor kitchen countertop on a terrace in light sand stone |
| travertino-safari-brown | Травертин Safari Brown | brown travertine with warm walnut-to-sand stripes and open pores, honed | fireplace wall clad in brown travertine in a warm living room |
| le-blanc | Кварцит Le Blanc | pure white Brazilian quartzite with faint soft grey clouds, polished | white kitchen island countertop with waterfall edge |
| kalahari-blue | Кварцит Kalahari Blue | grey-blue Brazilian quartzite with soft waves and light veins, polished | kitchen countertop and backsplash in one grey-blue stone |
| macaubas-fantasy | Кварцит Macaubas Fantasy | grey and white quartzite with bold wavy parallel bands, polished | bathroom vanity top and feature wall with book-matched wavy stone |
| white-pearl | Кварцит White Pearl | pearl white quartzite with fine sparkling crystals and delicate grey lines, polished | bright kitchen countertop with a large window |
| negresco | Кварцит Negresco | black Brazilian quartzite with tiny light speckles and subtle silver shimmer, polished | dark kitchen island countertop with brass fittings |
| london-grey | Кварцит London Grey | even mid-grey quartzite with thin light veins, polished | kitchen countertop in a grey and oak kitchen |
| calacatta-oriental | Мармур Calacatta Oriental | white marble with medium grey veins on a bright white ground, polished | bathroom with marble vanity top and shower wall |
| volakas | Мармур Volakas | white Greek marble with grey and faint lilac streaks, polished | hallway floor of large white marble slabs with a staircase |
| honey-onyx | Онікс Honey | honey-yellow translucent onyx with layers from gold to light brown, polished | backlit bar counter front glowing warm amber in a lounge |
| bianco-a-onyx | Онікс Bianco A | white translucent onyx with soft grey and cream clouds, polished | backlit bathroom wall panel behind a freestanding bathtub |
| caesarstone-4011-cloudburst-concrete | Caesarstone 4011 Cloudburst Concrete | light grey engineered quartz with a concrete look and faint clouds, matte | minimalist kitchen countertop in a light grey concrete-look surface |
| caesarstone-5143-white-attica | Caesarstone 5143 White Attica | white engineered quartz with grey Calacatta-style veins, polished | white kitchen island with veined quartz countertop |
| caesarstone-5100-vanilla-noir | Caesarstone 5100 Vanilla Noir | white engineered quartz with thin black veins, polished | black and white kitchen with white veined countertop and backsplash |
| caesarstone-5810-black-tempal | Caesarstone 5810 Black Tempal | black engineered quartz with light grey soft veining, matte | dark kitchen countertop with matte black veined surface |
| neolith-fusion-beton | Neolith Fusion Beton | grey sintered stone with a raw concrete texture, matte | kitchen countertop and cabinet fronts in concrete-look sintered stone |
| neolith-mont-blanc | Neolith Mont Blanc | white sintered stone with soft grey marble-like veins, silk finish | kitchen island with a large seamless white marble-look slab |
| neolith-steel-sofia-cuprum | Neolith Steel Sofia Cuprum | sintered stone with oxidized copper and rust metal texture, matte | bar counter front clad in oxidized copper-look panels in a loft |
| laminam-calce-nero | Laminam Calce Nero | black matte large-format porcelain with a lime plaster texture | kitchen countertop and tall cabinet fronts in matte black porcelain |

## Список файлів

Для кожного `slug` із таблиці (20 каменів):

- `public/materials/<slug>.png`
- `public/collections/<slug>-macro.png`
- `public/collections/<slug>-slab.png`
- `public/collections/<slug>-application.png`

Слаги: `neolith-classtone-whitesands`, `travertino-safari-brown`, `le-blanc`,
`kalahari-blue`, `macaubas-fantasy`, `white-pearl`, `negresco`, `london-grey`,
`calacatta-oriental`, `volakas`, `honey-onyx`, `bianco-a-onyx`,
`caesarstone-4011-cloudburst-concrete`, `caesarstone-5143-white-attica`,
`caesarstone-5100-vanilla-noir`, `caesarstone-5810-black-tempal`,
`neolith-fusion-beton`, `neolith-mont-blanc`, `neolith-steel-sofia-cuprum`,
`laminam-calce-nero`.

Разом: 20 × 4 = 80 файлів.

## Перевірка перед здачею

1. У `public/materials/` 20 файлів, у `public/collections/` 60. Імена точно як у списку, розширення `.png`.
2. Кожен файл понад 200 КБ, на ньому видно камінь, а не заглушку.
3. У жодному кадрі немає тексту, людей, рук, водяних знаків.
4. На слябах плита прямокутна, стійка не перекриває камінь.
5. Колір і малюнок макро, сляба й застосування збігаються з карткою того самого каменю.

---

## Для команди сайту (агенту не потрібно)

Звірка з ринком: docs/stone-market-check-2026-09.md. Партія 1 (18.09.2026):
37 файлів імпортовано, vratza-r1, vratza-r3, travertino-medium,
travertino-alabastrino перенесені в основний сід і відкриваються після деплою.
Партія 2 (18.09.2026): 58 нових файлів, агент працював у копії теки партії 1,
картки не перегенеровував; дві заглушки (vratza-r1, neolith-classtone-whitesands)
замінені картками, вирізаними з макро. Разом 96 файлів, 24 колекції відкриваються
після деплою. Для наступних партій той самий порядок:

1. `node scripts/import-stone-photos.mjs <тека агента>` (3:2, 1200×800 WebP; заглушки до 50 КБ пропускає).
2. Перенести рядки з `importedPending`, `quartzPending`, `porcelainPending` в основні списки `data/stone/seed/collections.ts`.
3. `npm run build`, `npm run stone-audit`, деплой.
4. Після деплою: `npx tsx --env-file=.env.local scripts/apply-market-check.ts --unhide`.
