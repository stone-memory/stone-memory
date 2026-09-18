# Завдання для агента: фото 24 нових колекцій каменю

Ти працюєш із порожньою текою проєкту. Створи в ній `public/materials/` і
`public/collections/` і згенеруй рівно **96 файлів**: для кожного з 24
каменів у таблиці нижче 4 зображення. Нічого більше не генерувати.

## Імена файлів (для кожного `slug`)

| Файл | Що на зображенні |
|---|---|
| `public/materials/<slug>.png` | картка: полірована поверхня каменю, заповнює весь кадр, без країв плити, рівне м'яке світло |
| `public/collections/<slug>-macro.png` | макро: зерно чи жили зблизька, 10–15 см поверхні в кадрі, різкість по всьому кадру |
| `public/collections/<slug>-slab.png` | сляб: ціла прямокутна плита на металевій А-подібній стійці в світлому шоурумі, стійка позаду або під плитою, не перед нею, світло-сіра стіна, бетонна підлога |
| `public/collections/<slug>-application.png` | застосування: саме цей камінь у готовому виробі, сюжет із таблиці, камінь займає більшу частину кадру |

## Вимоги до кожного зображення

- Фотореалістична фотографія. Не рендер-мультик, не ілюстрація.
- Кадр 3:2 і від 2400×1600, якщо генератор уміє; інакше квадрат від 1024×1024.
- Без тексту, етикеток, підписів, водяних знаків, рамок, логотипів, людей, рук.
- Файл має містити реальне зображення понад 200 КБ. Заглушка, сірий квадрат
  чи порожній файл не приймаються.
- Один камінь = одна текстура на всіх чотирьох файлах. Спершу згенеруй картку
  `materials/<slug>.png`, потім три сцени з тією самою текстурою.
- Для штучного каменю (Caesarstone, Neolith, Laminam) плита на слябі
  великоформатна, 3200×1600 мм, рівномірний малюнок без природних дефектів.

## Шаблони промптів

Англійською, під генератор. `TEXTURE` і `SCENE` підставляй із таблиці.
Спільний хвіст для всіх: `photorealistic, natural daylight, sharp focus,
no text, no watermark, no people`.

- Картка: `Top-down photograph of a polished TEXTURE surface filling the entire frame edge to edge, no slab edges, no background, even soft light, ...`
- Макро: `Extreme close-up macro photograph of polished TEXTURE, 10–15 cm of stone filling the frame, crystals and veins in sharp detail, no edges, no background, ...`
- Сляб: `Product photograph of a whole rectangular polished slab of TEXTURE standing upright on a steel A-frame slab rack in a bright stone showroom, the rack stands behind and under the slab and does not cover the stone, neutral light-grey wall, polished concrete floor, full slab pattern visible, ...`
- Застосування: `SCENE made of TEXTURE, the stone occupies most of the frame, ...`

## 24 камені

| slug | Камінь | TEXTURE | SCENE |
|---|---|---|---|
| vratza-r1 | Вапняк Vratza R1 | light beige Bulgarian limestone, fine even grain, matte honed surface | exterior facade of a modern house clad in large honed limestone panels |
| vratza-r3 | Вапняк Vratza R3 | beige Bulgarian shelly limestone with visible fossil shells and small pores, honed | garden terrace floor and low wall of shelly limestone slabs |
| travertino-medium | Травертин Medium | medium beige travertine with small filled pores and soft horizontal banding, honed | bathroom with travertine wall cladding and floor, walk-in shower |
| travertino-alabastrino | Травертин Alabastrino | very light cream travertine with fine even layering and almost no large pores, polished | living room floor of large cream travertine tiles with a light sofa |
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
| neolith-classtone-whitesands | Neolith ClasStone WhiteSands | light sand-coloured sintered stone with fine natural grain, matte | outdoor kitchen countertop on a terrace in light sand stone |
| laminam-calce-nero | Laminam Calce Nero | black matte large-format porcelain with a lime plaster texture | kitchen countertop and tall cabinet fronts in matte black porcelain |

## Перевірка перед здачею

1. 24 файли в `public/materials/` і 72 у `public/collections/`, імена точно як у таблиці.
2. Кожен файл понад 200 КБ, на ньому видно камінь, а не заглушку.
3. У жодному кадрі немає тексту, людей, водяних знаків.
4. На слябах стійка не перекриває камінь, плита прямокутна.
5. Колір і рисунок трьох сцен кожного каменю збігаються з його карткою.

## Що далі на боці сайту

1. `node scripts/import-stone-photos.mjs <тека агента>` (обрізає до 3:2, 1200×800 WebP).
2. Перенести рядки з `importedPending`, `quartzPending`, `porcelainPending`
   в основні списки `data/stone/seed/collections.ts`.
3. `npm run build`, `npm run stone-audit`, деплой.
4. Після деплою: `npx tsx --env-file=.env.local scripts/apply-market-check.ts --unhide`.
