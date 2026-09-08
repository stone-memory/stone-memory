import type { Field } from "@/components/admin/stilnytsi/schema-form"

/**
 * Схеми полів контенту сайту стільниць. Форма даних має збігатися з
 * lib/cms-types.ts у репозиторії memory-stone: сайт читає ці jsonb як є.
 */

export const FAMILIES = ["Граніт", "Мармур", "Кварц", "Керамограніт", "Кварцит", "Лабрадорит"]
export const MATERIAL_KEYS = ["granit", "marmur", "kvarcyt", "kvarc", "keramohranit"]
export const ARTICLE_CATEGORIES = ["Матеріали", "Догляд", "Проєктування", "Ціни"]

const faqFields: Field[] = [
  { type: "text", key: "question", label: "Питання", span: 2 },
  { type: "textarea", key: "answer", label: "Відповідь" },
]

export const materialFields: Field[] = [
  { type: "text", key: "slug", label: "Слаг (адреса /materialy/…)", required: true, help: "Латиниця, дефіси. Змінювати після публікації не варто." },
  { type: "text", key: "name", label: "Назва", required: true },
  { type: "select", key: "family", label: "Родина", options: FAMILIES },
  { type: "select", key: "material", label: "Ключ матеріалу (калькулятор, сляби)", options: MATERIAL_KEYS },
  { type: "text", key: "origin", label: "Походження / родовище" },
  { type: "text", key: "tone", label: "Тон", placeholder: "світло-сірий" },
  { type: "text", key: "brand", label: "Бренд (для кварцу й керамограніту)" },
  { type: "tags", key: "formats", label: "Формати плит", help: "Через кому, напр. 1620×3240" },
  { type: "tags", key: "finishes", label: "Фініші" },
  { type: "numbers", key: "thicknesses", label: "Товщини, мм" },
  { type: "tags", key: "applications", label: "Застосування", help: "Через кому: стільниці, сходи, фасади…" },
  { type: "boolean", key: "exteriorOnly", label: "Лише для вулиці", help: "не пропонується для стільниць" },
  { type: "group", key: "price", label: "Ціна «від»", fields: [
    { type: "number", key: "value", label: "Значення (0 = «ціна за запитом»)" },
    { type: "select", key: "unit", label: "Одиниця", options: ["м²", "пог.м"] },
    { type: "select", key: "currency", label: "Валюта", options: ["грн", "€"] },
  ] },
  { type: "textarea", key: "description", label: "Опис", required: true },
  { type: "textarea", key: "care", label: "Догляд" },
  { type: "image", key: "image", label: "Головне фото" },
  { type: "image", key: "cardImage", label: "Фото в картці каталогу" },
  { type: "tags", key: "relatedArticles", label: "Повʼязані статті (слаги)" },
  { type: "tags", key: "relatedCategories", label: "Повʼязані вироби (слаги категорій)", help: "stilnytsi, pidvikonnya, skhody, kaminy, fasady, brukivka, slyaby, dekoratyvnyi-kamin" },
]

export const projectFields: Field[] = [
  { type: "text", key: "slug", label: "Слаг (адреса /proekty/…)", required: true },
  { type: "text", key: "name", label: "Назва", required: true },
  { type: "text", key: "type", label: "Тип виробу", placeholder: "Стільниця, Сходи, Кухонний острів…" },
  { type: "text", key: "location", label: "Місто" },
  { type: "text", key: "material", label: "Матеріал (назва)" },
  { type: "text", key: "materialSlug", label: "Слаг матеріалу", help: "як у розділі «Матеріали»" },
  { type: "textarea", key: "story", label: "Історія / задача" },
  { type: "textarea", key: "solution", label: "Рішення" },
  { type: "image", key: "image", label: "Головне фото" },
  { type: "text", key: "alt", label: "Alt-текст фото", span: 2 },
  { type: "images", key: "gallery", label: "Галерея", help: "Перше фото — головне, далі 2–3 деталі" },
]

export const articleFields: Field[] = [
  { type: "text", key: "slug", label: "Слаг (адреса /blog/…)", required: true },
  { type: "select", key: "category", label: "Рубрика", options: ARTICLE_CATEGORIES },
  { type: "text", key: "title", label: "Заголовок (title, до 60 символів)", required: true, span: 2 },
  { type: "text", key: "h1", label: "H1 на сторінці", span: 2 },
  { type: "textarea", key: "description", label: "Опис для пошуку (до 155 символів)" },
  { type: "textarea", key: "dek", label: "Короткий анонс у списку" },
  { type: "text", key: "readingTime", label: "Час читання", placeholder: "7 хв читання" },
  { type: "date", key: "datePublished", label: "Опубліковано" },
  { type: "date", key: "dateModified", label: "Оновлено" },
  { type: "textarea", key: "intro", label: "Вступ" },
  { type: "list", key: "sections", label: "Розділи", itemTitle: "Розділ", fields: [
    { type: "text", key: "heading", label: "Підзаголовок (H2)", span: 2 },
    { type: "textarea", key: "body", label: "Текст", help: "Абзаци розділяйте порожнім рядком" },
  ] },
  { type: "group", key: "table", label: "Таблиця", fields: [
    { type: "tags", key: "headers", label: "Заголовки колонок", span: 2 },
    { type: "rows", key: "rows", label: "Рядки" },
  ] },
  { type: "list", key: "faq", label: "Питання й відповіді", itemTitle: "Питання", fields: faqFields },
  { type: "tags", key: "related", label: "Читайте також (шляхи)", help: "/kalkulyator, /materialy/granit…" },
  { type: "tags", key: "materials", label: "Повʼязані матеріали (слаги)" },
  { type: "tags", key: "categories", label: "Повʼязані вироби (слаги)" },
  { type: "image", key: "image", label: "Обкладинка", help: "Порожньо = /blog/<слаг>.webp" },
  { type: "image", key: "detailImage", label: "Фото в тексті", help: "Порожньо = /blog/<слаг>-detail.webp" },
]

export const slabFields: Field[] = [
  { type: "text", key: "id", label: "Артикул", required: true, placeholder: "SM–013" },
  { type: "select", key: "status", label: "Статус", options: ["В наявності", "Резерв", "Під замовлення"] },
  { type: "text", key: "collection", label: "Колекція (назва)" },
  { type: "text", key: "collectionSlug", label: "Слаг матеріалу" },
  { type: "select", key: "material", label: "Ключ матеріалу", options: MATERIAL_KEYS },
  { type: "text", key: "tone", label: "Тон" },
  { type: "numbers", key: "dimensions", label: "Розмір, см (довжина, ширина)", help: "Два числа через кому" },
  { type: "number", key: "thickness", label: "Товщина, мм" },
  { type: "text", key: "finish", label: "Фініш" },
  { type: "text", key: "lot", label: "Партія" },
  { type: "text", key: "origin", label: "Походження" },
  { type: "number", key: "quantity", label: "Кількість" },
  { type: "number", key: "price", label: "Ціна, грн" },
  { type: "text", key: "availability", label: "Доступність (текст)" },
  { type: "textarea", key: "uniqueness", label: "Примітка про унікальність" },
  { type: "image", key: "image", label: "Фото" },
  { type: "text", key: "alt", label: "Alt-текст", span: 2 },
]

export const remnantFields: Field[] = [
  { type: "text", key: "id", label: "Артикул", required: true, placeholder: "R-105" },
  { type: "text", key: "name", label: "Назва каменю", required: true },
  { type: "text", key: "size", label: "Розмір", placeholder: "1380 × 620 мм" },
  { type: "text", key: "thickness", label: "Товщина", placeholder: "20 мм" },
  { type: "text", key: "finish", label: "Фініш" },
  { type: "text", key: "price", label: "Ціна (текст)", placeholder: "від 8 900 грн" },
  { type: "select", key: "status", label: "Статус", options: ["Доступний", "На уточненні", "Продано"] },
  { type: "image", key: "image", label: "Фото" },
]

const linkField = (key: string, label: string): Field => ({ type: "text", key, label })

export const settingsSchemas: Record<string, { title: string; help: string; fields: Field[] }> = {
  contacts: {
    title: "Контакти",
    help: "Телефон, email, адреса та графік у шапці, футері, на сторінці контактів і в розмітці для Google.",
    fields: [
      { type: "text", key: "brand", label: "Бренд" },
      { type: "text", key: "legalName", label: "Назва для розмітки" },
      { type: "text", key: "company", label: "Юридична назва", span: 2 },
      { type: "group", key: "phone", label: "Телефон", fields: [
        { type: "text", key: "display", label: "Як показувати", placeholder: "+380 (68) 808 02 22" },
        { type: "text", key: "href", label: "Посилання", placeholder: "tel:+380688080222" },
      ] },
      { type: "group", key: "email", label: "Email", fields: [
        { type: "text", key: "display", label: "Як показувати" },
        { type: "text", key: "href", label: "Посилання", placeholder: "mailto:…" },
      ] },
      { type: "group", key: "address", label: "Адреса", fields: [
        { type: "text", key: "street", label: "Вулиця, будинок" },
        { type: "text", key: "postalCode", label: "Індекс" },
        { type: "text", key: "city", label: "Місто" },
        { type: "text", key: "region", label: "Область" },
        { type: "text", key: "country", label: "Країна" },
        { type: "number", key: "lat", label: "Широта" },
        { type: "number", key: "lng", label: "Довгота" },
      ] },
      { type: "group", key: "hours", label: "Графік", fields: [
        { type: "text", key: "weekdays", label: "Будні" },
        { type: "text", key: "saturday", label: "Субота" },
        { type: "text", key: "sunday", label: "Неділя" },
      ] },
      { type: "group", key: "chat", label: "Месенджери", fields: [
        linkField("viber", "Viber"), linkField("telegram", "Telegram"), linkField("whatsapp", "WhatsApp"),
      ] },
      { type: "group", key: "social", label: "Соцмережі", fields: [linkField("instagram", "Instagram"), linkField("facebook", "Facebook")] },
    ],
  },
  calculator: {
    title: "Калькулятор",
    help: "Орієнтовні ставки для онлайн-розрахунку на /kalkulyator. Підсумок округлюється до 100 грн і не менший за мінімальне замовлення.",
    fields: [
      { type: "numberMap", key: "productRates", label: "Тип виробу → грн за м²" },
      { type: "numberMap", key: "materialRates", label: "Рівень матеріалу → множник", help: "Рівні: Базовий, Середній, Преміальний" },
      { type: "numberMap", key: "edgeRates", label: "Профіль кромки → доплата, грн" },
      { type: "number", key: "cutoutRate", label: "Виріз, грн за штуку" },
      { type: "number", key: "minimumOrder", label: "Мінімальне замовлення, грн" },
    ],
  },
  faq: {
    title: "FAQ",
    help: "Набори питань для сторінок виробів, калькулятора, B2B і міст. Сторінка /faq збирає їх усі без повторів.",
    fields: [
      { type: "list", key: "category", label: "Сторінки виробів і порівнянь", itemTitle: "Питання", fields: faqFields },
      { type: "list", key: "calculator", label: "Калькулятор", itemTitle: "Питання", fields: faqFields },
      { type: "list", key: "b2b", label: "B2B", itemTitle: "Питання", fields: faqFields },
      { type: "list", key: "geo", label: "Сторінки міст", itemTitle: "Питання", fields: faqFields },
    ],
  },
  support: {
    title: "Службові сторінки",
    help: "Гарантія (harantiya), доставка й монтаж (dostavka-i-montazh), догляд (dohliad). Ключ = адреса сторінки.",
    fields: [
      { type: "record", key: "__root", label: "Сторінки", keyLabel: "Адреса /", fields: [
        { type: "text", key: "eyebrow", label: "Надзаголовок" },
        { type: "text", key: "title", label: "Заголовок" },
        { type: "textarea", key: "copy", label: "Підзаголовок" },
        { type: "list", key: "sections", label: "Блоки", itemTitle: "Блок", fields: [
          { type: "text", key: "title", label: "Заголовок", span: 2 },
          { type: "textarea", key: "copy", label: "Текст" },
        ] },
        { type: "list", key: "faq", label: "Питання", itemTitle: "Питання", fields: faqFields },
      ] },
    ],
  },
  comparisons: {
    title: "Порівняння",
    help: "Сторінки /porivnyannya/<ключ>: висновок і таблиця «критерій | ліворуч | праворуч».",
    fields: [
      { type: "record", key: "__root", label: "Порівняння", keyLabel: "Ключ", fields: [
        { type: "text", key: "title", label: "Заголовок" },
        { type: "text", key: "seoTitle", label: "Заголовок для пошуку" },
        { type: "text", key: "left", label: "Ліворуч" },
        { type: "text", key: "right", label: "Праворуч" },
        { type: "textarea", key: "verdict", label: "Висновок" },
        { type: "rows", key: "rows", label: "Рядки таблиці", help: "критерій | ліворуч | праворуч" },
      ] },
    ],
  },
  geo: {
    title: "Міста",
    help: "Локальні сторінки /stilnytsi/<ключ>.",
    fields: [
      { type: "record", key: "__root", label: "Міста", keyLabel: "Ключ", fields: [
        { type: "text", key: "locative", label: "У місцевому відмінку", placeholder: "Рівному" },
        { type: "textarea", key: "context", label: "Контекст" },
        { type: "textarea", key: "distance", label: "Логістика" },
      ] },
    ],
  },
  professional: {
    title: "B2B",
    help: "Сегменти аудиторій (/b2b/<слаг>), тематичні сторінки, кроки специфікації, переваги trade-програми та FAQ.",
    fields: [
      { type: "list", key: "segments", label: "Сегменти", itemTitle: "Сегмент", fields: [
        { type: "text", key: "slug", label: "Слаг" },
        { type: "text", key: "name", label: "Назва" },
        { type: "textarea", key: "copy", label: "Опис" },
        { type: "tags", key: "deliverables", label: "Що отримує клієнт", span: 2 },
        { type: "image", key: "image", label: "Фото" },
        { type: "text", key: "alt", label: "Alt-текст" },
      ] },
      { type: "record", key: "specials", label: "Тематичні сторінки", keyLabel: "Слаг", fields: [
        { type: "text", key: "title", label: "Заголовок" },
        { type: "text", key: "seoTitle", label: "Заголовок для пошуку" },
        { type: "textarea", key: "copy", label: "Опис" },
        { type: "tags", key: "items", label: "Пункти", span: 2 },
      ] },
      { type: "tags", key: "specificationSteps", label: "Кроки специфікації", span: 2 },
      { type: "tags", key: "tradeBenefits", label: "Переваги trade-програми", span: 2 },
      { type: "list", key: "b2bFaq", label: "FAQ B2B", itemTitle: "Питання", fields: [
        { type: "text", key: "q", label: "Питання", span: 2 },
        { type: "textarea", key: "a", label: "Відповідь" },
      ] },
    ],
  },
  service: {
    title: "Сервісні обіцянки",
    help: "Коротка фраза про швидкість відповіді та кроки роботи на сторінках сайту.",
    fields: [
      { type: "group", key: "promises", label: "Обіцянки", fields: [
        { type: "text", key: "response", label: "Час відповіді", span: 2 },
        { type: "text", key: "turnaround", label: "Терміни", span: 2 },
        { type: "text", key: "warranty", label: "Гарантія", span: 2 },
      ] },
      { type: "rows", key: "workSteps", label: "Кроки роботи", help: "номер | назва | опис" },
    ],
  },
}
