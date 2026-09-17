# Завдання для агента: догенерувати 8 фото українського каменю

Ти працюєш із текою проєкту `ukrainian-stone-visualization-task-main`. У ній
уже є 50 готових зображень у `public/materials/` і `public/collections/`.
Їх не чіпати й не перегенеровувати. Твоє завдання: створити рівно **8 файлів**
з іменами з таблиці нижче. Шість із них відсутні, два наявні треба замінити.
Нічого більше не генерувати.

## Куди класти

- Усі 8 файлів у `public/collections/`.
- Ім'я файлу точно як у таблиці, розширення `.png` (або `.webp`, якщо
  генератор так уміє). Два файли-заміни перезаписати поверх старих.

## Вимоги до кожного зображення

- Фотореалістична фотографія натурального каменю. Не рендер-мультик, не
  ілюстрація.
- Кадр 3:2 і від 2400×1600, якщо генератор уміє; інакше квадрат від 1024×1024.
- У кадрі немає тексту, етикеток, підписів, водяних знаків, рамок, логотипів,
  людей, рук.
- Файл має містити реальне зображення. Заглушка «немає зображення», сірий
  квадрат чи порожній файл не приймаються: перевір, що кожен файл важить понад
  200 КБ і на ньому видно камінь.
- Для кожного каменю текстура має збігатися з уже прийнятою карткою
  `public/materials/<slug>.png`. Спершу відкрий картку, потім генеруй сцену.

## Опис текстур, з якими працюєш

| slug | Камінь | Як виглядає (звірити з `materials/<slug>.png`) |
|---|---|---|
| rakhni-polivsky | Рахни-Полівський граніт | однорідний чорний дрібнозернистий полірований граніт, без плям і жил |
| silver-grey | Ковалівський лабрадорит (Silver Grey) | сіро-чорний камінь із великими кристалами, що дають сріблясті, а не сині спалахи |
| fantasy-azure | Слобідський лабрадорит (Fantasy Azure) | чорно-синій камінь із дрібними, рівномірно розсіяними синіми відблисками |
| lukovetskyi | Луковецький анортозит (Lukovetskiy) | сіро-зелений камінь із дрібними світлими кристалами, майже без іризації |
| ovrutskyi | Овруцький кварцит | рожево-червоний щільний кварцит, матова колота або пиляна поверхня |
| terebovlianskyi | Теребовлянський пісковик | сіро-зелений шаруватий пісковик із природним сколом, матовий |
| rosa-raveno | Жадьківський граніт (Rosa Raveno) | коричнево-рожевий граніт із великими кристалами й чорними вкрапленнями |

## 8 файлів і промпт до кожного

Промпти англійською, під генератор. У кожному вже вписано текстуру й сюжет.
Спільний хвіст для всіх: `photorealistic, natural daylight, sharp focus,
no text, no watermark, no people`.

### 1. `rakhni-polivsky-macro.png`

Extreme close-up macro photograph of polished black fine-grained granite
surface, uniform deep black with tiny grey mineral specks, 10–15 cm of stone
filling the entire frame edge to edge, no tile edges, no background, even soft
light, photorealistic, sharp focus, no text, no watermark, no people.

### 2. `silver-grey-application.png`

Interior photograph of a modern living room fireplace clad in polished
Ukrainian labradorite Silver Grey: dark grey-black stone with large crystals
flashing silver and pale grey (not blue), warm LED backlight grazing the stone
to show the shimmer, stone occupies most of the frame, dark sofa and wooden
floor around, photorealistic, sharp focus, no text, no watermark, no people.

### 3. `fantasy-azure-application.png`

Interior photograph of a feature wall with a fireplace clad in polished
Ukrainian labradorite Fantasy Azure: black stone with small evenly scattered
blue iridescent flashes, warm hidden lighting, stone fills most of the frame,
minimal modern living room, photorealistic, sharp focus, no text, no
watermark, no people.

### 4. `lukovetskyi-application.png`

Interior photograph of a staircase in a private house with steps made of
polished grey-green anorthosite stone with small light crystals and almost no
iridescence, wooden handrail, daylight from a large window, the stone steps
occupy most of the frame, photorealistic, sharp focus, no text, no watermark,
no people.

### 5. `ovrutskyi-application.png`

Exterior photograph of a private house courtyard paved with cobblestones of
Ovruch quartzite: pinkish-red dense stone with matte split surface, cobbles of
varied red-pink tones, low plinth of the house clad in the same stone in the
background, green shrubs, photorealistic, sharp focus, no text, no watermark,
no people.

### 6. `terebovlianskyi-application.png`

Exterior photograph of a private house facade and garden fence clad in
grey-green layered sandstone with natural split face, matte surface, irregular
horizontal courses, warm daylight, the stone cladding fills most of the frame,
photorealistic, sharp focus, no text, no watermark, no people.

### 7. `fantasy-azure-slab.png` (заміна: старий файл показує брилу, треба плиту)

Product photograph of a whole rectangular polished slab of Ukrainian
labradorite Fantasy Azure standing upright on a steel A-frame slab rack in a
bright stone showroom, black stone with small evenly scattered blue iridescent
flashes, the rack stands behind and under the slab and does not cover the
stone, neutral light-grey wall and polished concrete floor, full slab pattern
visible, photorealistic, sharp focus, no text, no watermark, no people.

### 8. `rosa-raveno-slab.png` (заміна: старий файл має раму стійки перед каменем)

Product photograph of a whole rectangular polished slab of Rosa Raveno
granite standing upright on a steel A-frame slab rack in a bright stone
showroom, brown-pink granite with large crystals and black speckles, the rack
stands behind and under the slab and does not cover the stone, neutral
light-grey wall and polished concrete floor, full slab pattern visible,
photorealistic, sharp focus, no text, no watermark, no people.

## Перевірка перед здачею

1. У `public/collections/` є всі 8 файлів із точними іменами.
2. Кожен файл понад 200 КБ, на ньому видно камінь, а не заглушку.
3. У жодному кадрі немає тексту, людей, водяних знаків.
4. На слябах стійка не перекриває камінь, плита прямокутна.
5. Колір і зерно кожної сцени збігаються з `public/materials/<slug>.png`.
6. Інші 50 файлів у теці не змінені.
