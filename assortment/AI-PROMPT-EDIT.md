# Доопрацювання згенерованих фото — промпт для редагування

Вхід: 62 готові файли `N001.png` … `N062.png`, кожен 1024×1024, з порожньою
табличкою. Треба привести їх до формату сайту й дописати елементи, яких бракує.

Це промпт для **редагування наявного зображення** (image-to-image), а не для
генерації нового. Пам'ятник, камінь і фон мають лишитись ті самі.

---

## Що саме треба зробити

| | було | треба |
|---|---|---|
| формат | 1024×1024 квадрат | **4:5 вертикальний** |
| розмір | 1024 px | **1600×2000 px** |
| табличка | порожня | портрет + напис золотом |
| сцена | голий камінь на траві | лампадка, квіти, доріжка |

Квадрат розширюємо **вгору й вниз** (outpainting), а не обрізаємо з боків:
обрізка з'їла б ширину, якої й так бракує.

---

## Промпт для редагування

```
Edit this photograph of a granite memorial monument. Keep the monument itself
completely unchanged — same shape, same carving, same stone colour and texture,
same position in the frame, same lighting and same cemetery background.

1. FORMAT
Extend the image vertically to a 4:5 portrait aspect ratio by outpainting:
add more misty forest and overcast sky above, and more mown grass with a grey
concrete-tile path below. The new areas must match the existing scene exactly —
same fog density, same colour grading, same depth of field. Output at
1600x2000 pixels.

2. PORTRAIT PLAQUE
Add a rectangular colour portrait plaque with a thin metallic frame to the upper
part of the polished nameplate. The plaque shows a painted religious icon of the
Virgin Mary in a light blue veil and a soft rose robe against a dark background,
in the style of Ukrainian memorial ceramic photographs. Slightly glossy surface.

3. ENGRAVED TEXT
Below the portrait, engrave two lines of text in gold, centred, in a classical
serif typeface:
   Прізвище
   Ім'я
Below them, smaller, in gold italic serif:
   00.00.0000 – 00.00.0000
The gold must look like real gilded engraving cut into polished stone — slightly
recessed, with a soft metallic sheen, not a flat overlay or a sticker.

4. SCENE DETAILS
Add, keeping them modest and realistic:
- a small dark granite lantern with a glass window, standing on the base slab
- two or three fresh flowers laid on the slab
- a narrow grey concrete-tile path along one side of the plot
Do not add people, wreaths, plastic decorations or bright colours.

Preserve photorealism throughout. The result must look like a photograph of a
finished, cared-for grave, not a render or a collage.
```

## Negative prompt

```
changing the monument shape, changing the stone colour, different carving,
different background, different cemetery, people, faces of real persons,
plastic flowers, wreaths, ribbons, bright saturated colours, sunlight, blue sky,
snow, watermark, logo, signature, collage, frame, border, 3D render, CGI,
illustration, cartoon, distorted text, misspelled letters, latin letters
```

---

## ⚠️ Кирилиця — головний ризик

Більшість моделей пише кирилицею з помилками: замість «Прізвище» виходить
«Пpiзвищe» або зовсім нечитабельне. Тому:

1. Спершу спробуйте на **одному** кадрі й **прочитайте кожну літеру**.
2. Якщо текст виходить кривий — приберіть із промпта весь пункт 3 і лишіть
   табличку порожньою. Модель тоді зробить формат, портрет і сцену, а текст
   накладете в графічному редакторі одним шаблоном на всі 62.

Другий шлях надійніший. Портрет і лампадку модель робить добре, текст — ні.

---

## Що НЕ можна змінювати

Це найважливіше: 62 кадри вже однорідні між собою, і редагування має цю
однорідність зберегти, а не перемішати.

- **Форма пам'ятника.** Різьблення, силует, пропорції — недоторканні.
- **Колір і фактура каменю.** Якщо на вході чорне габро — на виході теж.
  Не «покращувати» відтінок.
- **Фон.** Той самий ліс, той самий туман, та сама глибина різкості.
- **Освітлення.** Розсіяне, похмуре, без сонця й тіней.

Якщо після редагування пам'ятник змінив форму або камінь став іншого кольору —
кадр треба переробити, а не лишати.

---

## Порядок роботи

1. Візьміть **один** кадр — раджу `N005` (чорне габро, виразна різьба) — і
   доведіть промпт до потрібного результату.
2. Порівняйте з наявним фото сайту, щоб звірити настрій і щільність деталей.
3. Далі проганяйте решту 61 **тим самим промптом без змін**.
4. Імена файлів зберігайте: `N005.png` лишається `N005.png`.

## Перевірка кожного кадру

1. Формат **4:5**, розмір **1600×2000**.
2. Пам'ятник **той самий**, що на вході.
3. Камінь **того самого кольору**.
4. Текст читається без помилок — або таблички порожні, якщо пішли другим шляхом.
5. Портрет не спотворений, обличчя не «попливло».
6. Лампадка й квіти виглядають природно, не наліплені.
