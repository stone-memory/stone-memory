# Генерація каталогу пам'ятників — 62 кадри, один прохід

Потрібно **62 фотореалістичні знімки** гранітних пам'ятників для каталогу
меморіальної майстерні. Усі кадри мають виглядати як зняті одного ранку на
одному кладовищі однією камерою — це головна вимога.

Кожен кадр показує **готовий, доглянутий пам'ятник**: із портретом,написом,
лампадкою та квітами. Не заготовку й не виставковий зразок.

---

## Що на виході

- **62 файли**: `N001.png` … `N062.png` — імена рівно як у списку
- **Формат 4:5 вертикальний**, від **1600×2000 px**
- PNG або JPEG якості 90+
- Один кадр = один пам'ятник. Без колажів, сіток і підписів

---

## Блок А — сцена. Однаковий для всіх 62 кадрів, не змінювати

```
A granite memorial monument photographed in a real Ukrainian village cemetery
on a still, overcast autumn morning. Thin ground mist hangs between tall pine
and birch trees in the background. Other gravestones are visible behind, softly
out of focus. Short mown green grass, damp from dew; a narrow grey concrete-tile
path runs along one side of the plot.

Framing: vertical 4:5 portrait format. The monument is centred and fills about
two thirds of the frame height, seen from slightly above eye level — close
enough that the carving, the engraved text and the stone grain are clearly
readable.

Lighting: soft, completely diffuse overcast daylight. No sun, no hard shadows,
no lens flare. Even, slightly cool daylight with warm neutral balance.

Camera: full-frame DSLR, 50mm lens, three-quarter view from the front-left.
Shallow depth of field — the monument is razor sharp, the background falls into
soft bokeh. Natural perspective, no wide-angle distortion.

Colour: muted greens and greys, desaturated, calm. Documentary product
photography, not a render. Photorealistic.
```

## Блок Б — виріб. Змінюється від кадру до кадру

```
The monument is: [ТИП] made of [КАМІНЬ], [СКЛАДНІСТЬ].
The stone is polished to a mirror finish.
```

### `[ТИП]`

| тип | опис англійською |
|---|---|
| Одинарний | `a single upright stela on a plinth, with a low flower-bed frame and a paved base slab, for one grave` |
| Подвійний | `a wide double stela on a shared plinth spanning two adjacent graves, with a common flower-bed frame` |
| Європейський | `a low, wide horizontal slab monument in the European style, restrained rectangular geometry, low profile` |
| Хрест | `a carved granite cross standing on a plinth, with a nameplate slab at its base` |
| Дитячий | `a small child-sized monument, softly rounded silhouette, low and gentle proportions` |

### `[КАМІНЬ]`

| камінь | опис англійською |
|---|---|
| Габро (Головинське) | `deep black gabbro, almost without inclusions, mirror-polished` |
| Габро (Букинське) | `deep black gabbro with a faint grey grain` |
| Лабрадорит (Добринський) | `dark labradorite with subtle blue iridescent flecks` |
| Лабрадорит (Горбулівський) | `near-black labradorite with blue-green iridescence catching the light` |
| Покостівський | `even light-grey granite with a fine, uniform speckle` |
| Танський | `medium-grey granite, fine even grain` |
| Софіївський | `light grey granite with a soft speckled texture` |
| Корнинський | `grey granite with a slightly warm tone` |
| Капустинський | `pinkish-red granite with grey flecks, medium grain` |
| Межиріченський | `red granite with a balanced medium grain` |
| Лезниківський | `saturated brick-red granite with a coarse grain and dark crystals` |
| Дідковицький | `dark green granite with a grey undertone` |
| Маславський | `deep green granite with dark mottling` |
| Токівський | `warm brown granite with a fine grain` |
| Берестовецький | `very dark charcoal stone with a dense fine grain` |
| Мармур білий | `white marble with soft grey veining` |

### `[СКЛАДНІСТЬ]`

| рівень | опис англійською |
|---|---|
| проста | `simple rectangular silhouette, no carving, plain edges` |
| базова | `slightly shaped top edge, a single engraved line border` |
| стандартна | `shaped silhouette with a gently curved top and a modest carved border` |
| складна | `elaborately carved silhouette with flowing curves and decorative relief edges` |
| елітна | `richly sculpted monument with deep relief carving, decorative columns and an ornate silhouette` |

## Блок В — оформлення. Однаковий для всіх 62, не змінювати

```
The monument is fully finished and cared for:

A rectangular colour portrait plaque with a thin metallic frame is set into the
upper part of the polished face. The plaque shows a painted religious icon of
the Virgin Mary in a light blue veil and a soft rose robe against a dark
background, in the style of Ukrainian memorial ceramic plaques. Slightly glossy.

Below the portrait, three lines of text are engraved in gold, centred, in a
classical serif typeface:
Прізвище
Ім'я
По-батькові
Below them, smaller, in gold italic serif:
00.00.0000 — 00.00.0000

A slim gold cross is inlaid beside the portrait. The gold looks like real gilded
engraving cut into polished stone — slightly recessed, with a soft metallic
sheen, never a flat sticker or overlay.

On the base slab stand a small dark granite lantern with a glass window and two
or three fresh cut flowers laid beside it. The flower bed is filled with dark
soil. Everything is modest and restrained.
```

---

## Текст на пам'ятнику — тільки заглушки

На камені мають бути **рівно ці слова**, як службові підписи, а не як чиєсь ім'я:

| рядок | текст |
|---|---|
| 1 | `Прізвище` |
| 2 | `Ім'я` |
| 3 | `По-батькові` |
| дати | `00.00.0000 — 00.00.0000` |

**Категорично не можна:**

- вигадувати справжні прізвища та імена — жодних «Іваненко Іван Петрович»
- ставити реальні дати замість нулів
- писати будь-що латиницею
- лишати табличку зовсім порожньою

Це шаблон каталогу. Покупець має побачити, як виглядатиме напис, а не чиєсь
конкретне поховання.

---

## Що МОЖНА показувати

- пам'ятник, тумбу, квітник, плиту основи, доріжку з сірої плитки
- портрет-ікону Богородиці на табличці
- золоте гравіювання: три рядки заглушки, дати нулями, хрест
- гранітну лампадку зі склом
- дві-три живі квітки на плиті
- темний ґрунт у квітнику
- скошену траву, опале листя, ранковий туман
- інші пам'ятники **позаду, розмито** — як фон кладовища

## Що НЕ МОЖНА показувати

- **обличчя реальних людей** і фотопортрети живих осіб; на табличці лише
  мальована ікона
- **справжні імена, прізвища, по батькові, реальні дати**
- людей у кадрі: відвідувачів, робітників, священників
- пластикові квіти, вінки, стрічки, іграшки
- сонце, блакитне небо, різкі тіні, відблиски, промені
- сніг, дощ, калюжі
- державну символіку, шеврони, військові знаки *(окрема серія, не тут)*
- будь-який текст латиницею, водяні знаки, логотипи, підписи автора
- рамки, віньєтки, колажі, кілька пам'ятників в одному кадрі
- вигляд 3D-рендера, ілюстрації, мальюнка

## Negative prompt

```
real person face, photograph of a real person, human portrait photo, invented
names, real surnames, latin letters, misspelled cyrillic, blank empty nameplate,
people, visitors, workers, priest, plastic flowers, wreaths, ribbons, toys,
sunshine, sunbeams, blue sky, harsh shadows, lens flare, snow, rain, puddles,
national flag, military insignia, chevron, watermark, logo, signature, text
overlay, frame, border, collage, multiple monuments in focus, 3D render, CGI,
illustration, painting, cartoon, oversaturated colours, HDR
```

---

## Список — 62 кадри

### Пам'ятник одинарний — 16
| код | камінь | складність |
|---|---|---|
| N001 | Капустинський | проста |
| N002 | Межиріченський | базова |
| N003 | Лезниківський | стандартна |
| N004 | Покостівський | складна |
| N005 | Габро (Головинське) | елітна |
| N006 | Габро (Букинське) | проста |
| N007 | Лабрадорит (Добринський) | базова |
| N008 | Лабрадорит (Горбулівський) | стандартна |
| N009 | Берестовецький | складна |
| N010 | Капустинський | елітна |
| N011 | Межиріченський | проста |
| N012 | Лезниківський | базова |
| N013 | Покостівський | стандартна |
| N014 | Танський | складна |
| N015 | Софіївський | елітна |
| N016 | Корнинський | проста |

### Пам'ятник подвійний — 12
| код | камінь | складність |
|---|---|---|
| N017 | Габро (Головинське) | проста |
| N018 | Габро (Букинське) | базова |
| N019 | Лабрадорит (Добринський) | стандартна |
| N020 | Лабрадорит (Горбулівський) | складна |
| N021 | Берестовецький | елітна |
| N022 | Дідковицький | проста |
| N023 | Маславський | базова |
| N024 | Капустинський | стандартна |
| N025 | Межиріченський | складна |
| N026 | Лезниківський | елітна |
| N027 | Покостівський | проста |
| N028 | Танський | базова |

### Пам'ятник європейський — 12
| код | камінь | складність |
|---|---|---|
| N029 | Софіївський | проста |
| N030 | Корнинський | базова |
| N031 | Мармур білий | стандартна |
| N032 | Дідковицький | складна |
| N033 | Маславський | елітна |
| N034 | Габро (Головинське) | проста |
| N035 | Габро (Букинське) | базова |
| N036 | Лабрадорит (Добринський) | стандартна |
| N037 | Лабрадорит (Горбулівський) | складна |
| N038 | Берестовецький | елітна |
| N039 | Мармур білий | проста |
| N040 | Токівський | базова |

### Хрест гранітний — 12
| код | камінь | складність |
|---|---|---|
| N041 | Капустинський | проста |
| N042 | Межиріченський | базова |
| N043 | Лезниківський | стандартна |
| N044 | Покостівський | складна |
| N045 | Танський | елітна |
| N046 | Софіївський | проста |
| N047 | Корнинський | базова |
| N048 | Мармур білий | стандартна |
| N049 | Дідковицький | складна |
| N050 | Маславський | елітна |
| N051 | Токівський | проста |
| N052 | Габро (Головинське) | базова |

### Дитячий пам'ятник — 10
| код | камінь | складність |
|---|---|---|
| N053 | Мармур білий | проста |
| N054 | Мармур білий | базова |
| N055 | Покостівський | стандартна |
| N056 | Танський | складна |
| N057 | Софіївський | елітна |
| N058 | Корнинський | проста |
| N059 | Капустинський | базова |
| N060 | Межиріченський | стандартна |
| N061 | Лезниківський | складна |
| N062 | Дідковицький | елітна |


---

## Приклад повністю зібраного промпта — `N005`

Одинарний, габро (Головинське), елітна складність.

```
A granite memorial monument photographed in a real Ukrainian village cemetery
on a still, overcast autumn morning. Thin ground mist hangs between tall pine
and birch trees in the background. Other gravestones are visible behind, softly
out of focus. Short mown green grass, damp from dew; a narrow grey concrete-tile
path runs along one side of the plot.

Framing: vertical 4:5 portrait format. The monument is centred and fills about
two thirds of the frame height, seen from slightly above eye level — close
enough that the carving, the engraved text and the stone grain are clearly
readable.

Lighting: soft, completely diffuse overcast daylight. No sun, no hard shadows,
no lens flare. Even, slightly cool daylight with warm neutral balance.

Camera: full-frame DSLR, 50mm lens, three-quarter view from the front-left.
Shallow depth of field — the monument is razor sharp, the background falls into
soft bokeh. Natural perspective, no wide-angle distortion.

Colour: muted greens and greys, desaturated, calm. Documentary product
photography, not a render. Photorealistic.

The monument is: a single upright stela on a plinth, with a low flower-bed frame
and a paved base slab, for one grave made of deep black gabbro, almost without
inclusions, mirror-polished, richly sculpted monument with deep relief carving,
decorative columns and an ornate silhouette.
The stone is polished to a mirror finish.

The monument is fully finished and cared for:

A rectangular colour portrait plaque with a thin metallic frame is set into the
upper part of the polished face. The plaque shows a painted religious icon of
the Virgin Mary in a light blue veil and a soft rose robe against a dark
background, in the style of Ukrainian memorial ceramic plaques. Slightly glossy.

Below the portrait, three lines of text are engraved in gold, centred, in a
classical serif typeface:
Прізвище
Ім'я
По-батькові
Below them, smaller, in gold italic serif:
00.00.0000 — 00.00.0000

A slim gold cross is inlaid beside the portrait. The gold looks like real gilded
engraving cut into polished stone — slightly recessed, with a soft metallic
sheen, never a flat sticker or overlay.

On the base slab stand a small dark granite lantern with a glass window and two
or three fresh cut flowers laid beside it. The flower bed is filled with dark
soil. Everything is modest and restrained.
```

Negative prompt — з розділу вище, без змін.

---

## Порядок роботи

1. Візьміть **один** кадр — раджу `N005` — і доведіть до потрібного результату.
2. Далі міняйте **тільки блок Б**. Блоки А і В та negative prompt лишайте
   символ у символ: саме вони тримають 62 кадри в одному стилі.
3. Якщо генератор дозволяє зафіксувати **seed** — зафіксуйте.

## Перевірка кожного кадру

1. Формат **4:5**, розмір від **1600×2000**.
2. Напис читається **без помилок**: `Прізвище`, `Ім'я`, `По-батькові`,
   дати нулями. Жодної вигаданої людини.
3. На табличці **мальована ікона**, а не фото реальної особи.
4. Камінь того кольору, що замовлений.
5. Виріб заповнює ≈ дві третини висоти кадру.
6. У кадрі немає людей, сонця, пластикових квітів і латиниці.

## Якщо кирилиця не вдається

Це найімовірніша проблема: багато моделей пишуть кирилицю з помилками.
Перевірте на першому ж кадрі, **читаючи кожну літеру**.

Якщо текст стабільно кривий — приберіть із блоку В абзац про напис, лишивши
портрет, хрест, лампадку й квіти. Табличка вийде чистою, а три рядки й дати
накладете в графічному редакторі одним шаблоном на всі 62 кадри. Портрет і
решту оформлення модель робить надійно, підводить саме текст.
