# Перегенерувати 34 кадри — форма виробу

Із 62 кадрів **28 залишаються без змін**, **34 треба перезняти**.

Причина: подвійні, європейські та дитячі пам'ятники вийшли однаковими —
звичайна вертикальна стела, як в одинарних. Відрізняється тільки камінь.
У каталозі це три розділи, заповнені візуально ідентичним товаром.

**Змінюємо ТІЛЬКИ форму виробу. Все інше лишається як є.**

---

## Що НЕ чіпати — залишається точно як зараз

| | |
|---|---|
| Сцена | те саме кладовище, туман, сосни й берези, розмиті пам'ятники позаду |
| Освітлення | розсіяне похмуре, без сонця й тіней |
| Камера | 50 мм, три чверті зліва, мала глибина різкості |
| Кольори | приглушені зелені й сірі, ненасичені |
| Портрет | мальована ікона Богородиці в синьому покривалі |
| Напис | `Прізвище` / `Ім'я` / `По-батькові`, дати `00.00.0000 — 00.00.0000` |
| Хрест | тонкий золотий, збоку від портрета |
| Оздоба | гранітна лампадка, дві-три квітки, темний ґрунт, доріжка з плитки |
| **Формат** | **1024×1024, квадрат** — як у 28 кадрів, що лишаються |
| Камінь | той, що вказаний у списку для кожного файлу |

Формат саме квадратний, не вертикальний: 28 наявних кадрів квадратні, і
34 нових мають бути такими самими, інакше каталог розпадеться на дві групи.

## Що ЗМІНИТИ — тільки силует виробу

Три типи, які зараз не читаються. Опис кожного — нижче.

---

## Файли, які ЗАЛИШАЮТЬСЯ (не чіпати)

`N001`–`N016` — одинарні пам'ятники, вийшли правильно
`N041`–`N052` — гранітні хрести, вийшли правильно

Разом 28 файлів. Їх не перегенеровувати.

---

## Блок А — сцена. Однаковий для всіх, не змінювати

```
A granite memorial monument photographed in a real Ukrainian village cemetery
on a still, overcast autumn morning. Thin ground mist hangs between tall pine
and birch trees in the background. Other gravestones are visible behind, softly
out of focus. Short mown green grass, damp from dew; a narrow grey concrete-tile
path runs along one side of the plot.

Lighting: soft, completely diffuse overcast daylight. No sun, no hard shadows,
no lens flare. Even, slightly cool daylight with warm neutral balance.

Camera: full-frame DSLR, 50mm lens, three-quarter view from the front-left.
Shallow depth of field — the monument is razor sharp, the background falls into
soft bokeh. Natural perspective, no wide-angle distortion.

Colour: muted greens and greys, desaturated, calm. Documentary product
photography, not a render. Photorealistic.
```

## Блок Б-1 — форма виробу. ГОЛОВНЕ, що змінюється

### Подвійний — `N017`–`N028`

```
IMPORTANT — this is a DOUBLE monument for two graves, not a single one:
A wide horizontal monument spanning two adjacent graves side by side. The stela
is roughly twice as wide as it is tall, standing on one long shared plinth.
TWO separate portrait plaques are set side by side on the face, each with its
own three lines of engraved gold text below it. Two flower-bed frames lie in
front, divided by a narrow stone rib down the middle. One continuous base slab
underneath.
```

Найважливіше — **дві таблички з портретами поруч**. Саме вони роблять
подвійний пам'ятник упізнаваним, а не ширина каменю.

### Європейський — `N029`–`N040`

```
IMPORTANT — there is NO upright stela at all:
A low horizontal slab monument lying almost flat over the grave, no taller than
knee height, tilted slightly upwards towards the viewer. Restrained rectangular
geometry, clean straight edges, no carved silhouette. The portrait plaque and
the engraved gold text are set into the sloping upper surface of the slab, read
from above. European cemetery style — minimal, low and wide.
```

Найважливіше — **вертикальної стели немає взагалі**. Це плита на землі, і
напис читається згори, а не спереду.

### Дитячий — `N053`–`N062`

```
IMPORTANT — this is a CHILD's monument, noticeably small:
A small monument about half the height of an adult gravestone, with a soft
rounded top and gentle curved edges. The plot itself is short and narrow — about
half the length of an adult grave. Delicate, modest proportions throughout.
A neighbouring adult-sized gravestone is visible nearby, blurred, so that the
difference in size is obvious.
```

Найважливіше — **сусідній дорослий пам'ятник у розфокусі поруч**. Без нього
розмір нема з чим порівняти, і дитячий виглядає як звичайний.

## Блок Б-2 — камінь. Підставити за списком

У списку внизу вказано українську назву. Ось що писати в промпті:

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

## Блок Б-3 — складність. Підставити за списком

Наскільки багато різьблення на камені.

| рівень | опис англійською |
|---|---|
| проста | `simple silhouette, no carving, plain edges` |
| базова | `slightly shaped edges, a single engraved line border` |
| стандартна | `gently shaped silhouette with a modest carved border` |
| складна | `elaborately carved silhouette with flowing curves and decorative relief edges` |
| елітна | `richly sculpted, deep relief carving, decorative columns, ornate silhouette` |

Складність описує **оздоблення поверхні**, а не форму виробу. Форму задає
блок Б-1 вище, і вона важливіша: європейська плита з «елітною» складністю
лишається низькою плитою, просто з багатшим різьбленням по краях.

## Блок В — оздоблення. Однаковий для всіх, не змінювати

```
The monument is fully finished and cared for:

A rectangular colour portrait plaque with a thin metallic frame is set into the
polished face. The plaque shows a painted religious icon of the Virgin Mary in a
light blue veil and a soft rose robe against a dark background, in the style of
Ukrainian memorial ceramic plaques. Slightly glossy.

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

Ніяких вигаданих прізвищ та імен — тільки ці три слова-заглушки й нулі в датах.

## Negative prompt

```
single upright stela, tall vertical headstone, adult-sized monument, real person
face, photograph of a real person, invented names, real surnames, latin letters,
misspelled cyrillic, blank empty nameplate, people, visitors, workers, plastic
flowers, wreaths, ribbons, sunshine, blue sky, harsh shadows, lens flare, snow,
rain, national flag, military insignia, watermark, logo, signature, frame,
border, collage, 3D render, CGI, illustration, painting, cartoon, HDR
```

Перші три позиції — `single upright stela`, `tall vertical headstone`,
`adult-sized monument` — додані навмисно: саме в них зривалась генерація.

---

## Список — 34 кадри

### Пам'ятник подвійний — 12
| файл | камінь | складність |
|---|---|---|
| `N017` | Габро (Головинське) | проста |
| `N018` | Габро (Букинське) | базова |
| `N019` | Лабрадорит (Добринський) | стандартна |
| `N020` | Лабрадорит (Горбулівський) | складна |
| `N021` | Берестовецький | елітна |
| `N022` | Дідковицький | проста |
| `N023` | Маславський | базова |
| `N024` | Капустинський | стандартна |
| `N025` | Межиріченський | складна |
| `N026` | Лезниківський | елітна |
| `N027` | Покостівський | проста |
| `N028` | Танський | базова |

### Пам'ятник європейський — 12
| файл | камінь | складність |
|---|---|---|
| `N029` | Софіївський | проста |
| `N030` | Корнинський | базова |
| `N031` | Мармур білий | стандартна |
| `N032` | Дідковицький | складна |
| `N033` | Маславський | елітна |
| `N034` | Габро (Головинське) | проста |
| `N035` | Габро (Букинське) | базова |
| `N036` | Лабрадорит (Добринський) | стандартна |
| `N037` | Лабрадорит (Горбулівський) | складна |
| `N038` | Берестовецький | елітна |
| `N039` | Мармур білий | проста |
| `N040` | Токівський | базова |

### Дитячий пам'ятник — 10
| файл | камінь | складність |
|---|---|---|
| `N053` | Мармур білий | проста |
| `N054` | Мармур білий | базова |
| `N055` | Покостівський | стандартна |
| `N056` | Танський | складна |
| `N057` | Софіївський | елітна |
| `N058` | Корнинський | проста |
| `N059` | Капустинський | базова |
| `N060` | Межиріченський | стандартна |
| `N061` | Лезниківський | складна |
| `N062` | Дідковицький | елітна |
---

## Приклад повністю зібраного промпта — `N029`

Європейський, софіївський граніт, проста складність. Показую саме його, бо
європейський тип зривався найсильніше.

```
A granite memorial monument photographed in a real Ukrainian village cemetery
on a still, overcast autumn morning. Thin ground mist hangs between tall pine
and birch trees in the background. Other gravestones are visible behind, softly
out of focus. Short mown green grass, damp from dew; a narrow grey concrete-tile
path runs along one side of the plot.

Lighting: soft, completely diffuse overcast daylight. No sun, no hard shadows,
no lens flare. Even, slightly cool daylight with warm neutral balance.

Camera: full-frame DSLR, 50mm lens, three-quarter view from the front-left.
Shallow depth of field — the monument is razor sharp, the background falls into
soft bokeh. Natural perspective, no wide-angle distortion.

Colour: muted greens and greys, desaturated, calm. Documentary product
photography, not a render. Photorealistic.

IMPORTANT — there is NO upright stela at all:
A low horizontal slab monument lying almost flat over the grave, no taller than
knee height, tilted slightly upwards towards the viewer. Restrained rectangular
geometry, clean straight edges, no carved silhouette. The portrait plaque and
the engraved gold text are set into the sloping upper surface of the slab, read
from above. European cemetery style — minimal, low and wide.

The stone is light grey granite with a soft speckled texture, simple silhouette,
no carving, plain edges. Polished to a mirror finish.

The monument is fully finished and cared for:

A rectangular colour portrait plaque with a thin metallic frame is set into the
polished face. The plaque shows a painted religious icon of the Virgin Mary in a
light blue veil and a soft rose robe against a dark background, in the style of
Ukrainian memorial ceramic plaques. Slightly glossy.

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

Порядок склеювання: **блок А** → **блок Б-1** (форма) → **Б-2 + Б-3** одним
реченням про камінь → **блок В** → negative prompt.

Блок Б-1 стоїть одразу після сцени й починається з `IMPORTANT` навмисно:
у попередніх спробах опис типу губився в середині довгого промпта, і модель
його ігнорувала.

## Порядок роботи

1. Зробіть по **одному** кадру кожного типу: `N017`, `N029`, `N053`.
2. Переконайтесь, що всі три **явно відрізняються** один від одного і від
   одинарного пам'ятника. Якщо ні — підсилюйте блок Б далі.
3. Аж тоді проганяйте решту 31 кадр.

## Перевірка

| тип | ознака, за якою впізнається |
|---|---|
| Подвійний | **дві таблички з портретами поруч**, спільна плита |
| Європейський | **немає вертикальної стели**, низька похила плита |
| Дитячий | **удвічі нижчий** за сусідній дорослий пам'ятник у кадрі |

Плюс, як і раніше: напис без помилок, ікона замість фото людини, формат
1024×1024, камінь того кольору, що в списку.
