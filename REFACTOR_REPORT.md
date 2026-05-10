# Stone Memory — звіт про рефакторинг та QA

**Дата:** 2026-05-07
**Статус:** ✅ Усі зміни проходять `tsc --noEmit` (0 помилок) і `next build` (50+ роутів)

---

## 🎯 Що було зроблено

### 1. ✅ Виправлені помилки

| # | Файл | Проблема | Виправлення |
|---|------|----------|-------------|
| 1 | `app/about/layout.tsx` | Typo: `stonememory.com.ua.ua` (подвоєне `.ua`) | Замінено на `stonememory.com.ua` |
| 2 | `components/admin/command-palette.tsx` | 4 мертві посилання — `/admin/clients`, `/admin/backup`, `/admin/audit`, `/admin/settings` (404) | Видалено + додано існуючі: account, broadcast, chat, chat-settings, finances |
| 3 | `lib/store/about.ts` | PL/DE/LT/EN мали лише 1 параграф замість 3 (як в UK) | Заповнено повний контент усіма 5 мовами |
| 4 | `app/terms/page.tsx` | PL/DE/EN/LT мали 6 секцій замість 7, фрагментарні переклади | Усі мови розширені до повної версії з 7 пунктів |
| 5 | UI відсутність UAH | Адмін бачив `€` всюди — незручно для українського ФОП | Створено `lib/admin-format.ts` + замінено в 5 admin views |
| 6 | Sentry env-vars були оголошені, але не використовувались | Помилки в проді не відстежувались | Створено власну lightweight реалізацію `lib/sentry.ts` + `ErrorBoundaryClient` |

### 2. ✅ Покращена логіка related items на сторінці каменю

**Раніше:** `app/stones/[id]/page.tsx` показував лише позиції з тією ж категорією **і** тим же кольором (≤3 позиції). Якщо камінь рідкісного кольору — блок порожній.

**Тепер:** **Multi-criteria scoring** — кожен співпадаючий атрибут додає бали:

```ts
если color == stone.color           +4 балів
если materialType == stone.material +4 балів
если shape == stone.shape           +3 балів
если finish == stone.finish         +2 балів
если ціна в межах ±35%              +2 балів
если те саме походження             +1 бал
если isFeatured                     +1 бал
```

Сортуємо за score, беремо топ-6. Якщо нічого не співпало — fallback по близькій ціні з тієї ж категорії. Тепер «схоже» дійсно схоже, а не випадкове.

### 3. ✅ Авто-переклад: 3 провайдери з fallback chain

`lib/translate.ts` тепер має ланцюг:

1. **DeepL** (`DEEPL_API_KEY`) — найкраща якість для UK/PL/DE
2. **Google Translate** (`GOOGLE_TRANSLATE_API_KEY`) — резервний
3. **MyMemory** — **ДОДАНО** — безкоштовний public API без ключа (5000 слів/день per IP, 50000 з email через `MYMEMORY_EMAIL`)
4. **Mock** — копіює з префіксом `[LOCALE]` якщо все недоступно

Це означає: **навіть без жодного API-ключа** адмін отримає реальний переклад (через MyMemory), а не mock. Якщо за деякий час пакет вичерпається — система fallback до mock без падіння.

### 4. ✅ Auto-translate в admin/about

Раніше сторінка «Про нас» не мала кнопки перекладу — адмін мусив вручну вводити кожну з 5 мов. Додано кнопку **«Перекласти на 4 мови»** в header.

При натисканні:
- Збираються всі рядки сторінки (heading, photoAlt, всі параграфи, всі бейджі)
- Паралельно через `/api/translate` перекладаються на інші 4 локалі
- Авто-зберігаються в Supabase `site_content/about_overrides`
- Показується який провайдер спрацював (DeepL/Google/MyMemory/Mock)

### 5. ✅ Авто-переклад вже працює в інших admin формах

Перевірено — `MultilingualField` вже інтегрований у:
- `/admin/projects` (title, description, materials)
- `/admin/services` (title, shortDesc, longDesc, bullets)
- `/admin/faq` (q, a)

Усі ці компоненти мають кнопку «Автопереклад з UK» — натискається один раз і поле з UK заливається на 4 інші мови.

### 6. ✅ CRM повністю в українському — ціни в UAH

Створено `lib/admin-format.ts`:

```ts
formatUAH(eur)         // "54 000 ₴"      — конвертує з EUR за курсом
formatUAHWithEUR(eur)  // "54 000 ₴ (€1 200)"  — для рахунків
formatDateTime(d)      // "07.05.2026, 14:32"
formatDate(d)          // "07.05.2026"
formatRelative(d)      // "5 хв тому" / "2 год тому"
eurHint(eur)           // "≈ €1 200"     — підказка під UAH
```

Замінено `€` → UAH у:
- `app/admin/page.tsx` (KPI картка pipeline)
- `app/admin/analytics/page.tsx` (всі цифри: дохід, середній чек, графіки)
- `app/admin/stones/page.tsx` (таблиця товарів)
- `app/admin/finances/page.tsx` (₴ напряму, без конвертації — фінанси адмін вводить як є)
- `components/admin/orders-table.tsx`
- `components/admin/order-detail-sheet.tsx` (з `eurHint` підказкою)

### 7. 🔥 Розширений analytics dashboard (observability)

Повністю переписано `app/admin/analytics/page.tsx`. Тепер це справжній observability dashboard:

**Real-time alerts**
- 🔔 Якщо є чат-сесії, які чекають на відповідь >5 хв — банер вгорі з кнопкою "Відкрити чат"

**Top-level KPIs (4 картки):**
- Дохід (pipeline + виконано)
- Замовлення (нових / в роботі / завершено)
- Клієнтів (з % повторних)
- Середній чек

**Real-time KPIs (4 картки):**
- Активних чат-сесій (живий поліинг кожні 60с)
- Підписників (active / total)
- Сер. час відповіді у чаті (з 🟢/🟡/🔴 індикатором)
- Пік активності (година коли найбільше заявок)

**Воронка конверсії (за 30 днів):**
- Чат-сесії → Заявки → Виконані з % на кожному етапі

**Графіки:**
- Дохід за днями (bar chart)
- Розподіл за статусами + за категоріями
- Розподіл за годинами доби (24-bar з підсвіткою піку)
- Розподіл за днями тижня
- Підписники за мовами (з прапорцями)
- Чат-сесії за мовами

**ТОП-10 товарів** — по кількості замовлень + дохід
**Лояльність** — % повторних клієнтів з контекстом
**Останні чат-сесії** — топ 5 з статусом "чекає відповіді"

**Періоди:** Сьогодні / 7 днів / 30 днів / 90 днів / З початку року / Увесь час

### 8. ✅ Sentry-сумісне error tracking

Створено `lib/sentry.ts` — власна реалізація без важкого `@sentry/nextjs` SDK (~120KB). Підтримує:
- `captureException(err, context)`
- `captureMessage(msg, level)`
- `addBreadcrumb({...})`
- Глобальні handlers: `window.onerror`, `unhandledrejection`

Підключено через `<ErrorBoundaryClient />` у `app/layout.tsx`. Активується тільки в проді при заданому `NEXT_PUBLIC_SENTRY_DSN`. У dev — `console.error`.

---

## 🧪 Чек-лист ручного тестування

### Підготовка
1. `cd /Users/gruttyx/Desktop/stonememory2/stone-memory-main`
2. `cp .env.example .env.local` → заповнити з `ex.rtf` **(після ротації ключів!)**
3. `npm run dev`
4. Відкрити [http://localhost:3000](http://localhost:3000)

### A. Публічний сайт — переклади (5 мов)

| Тест | Очікуваний результат |
|------|---------------------|
| Зайти з `?lang=uk` | Усе на українській: header, hero, footer, FAQ, privacy, terms, about |
| Перемкнути на `?lang=pl` | Усе на польській — НЕ змішане з UK |
| `?lang=en` | Усе англ. |
| `?lang=de` | Усе нім. |
| `?lang=lt` | Усе литовський |
| Сторінка `/privacy` | 7 повних секцій усіма 5 мовами |
| Сторінка `/terms` | 7 повних секцій усіма 5 мовами |
| Сторінка `/about` | 3 параграфа усіма 5 мовами |

### B. Каталог і related items

| Тест | Очікуваний результат |
|------|---------------------|
| `/catalog` → клік на камінь | Відкриває `/stones/<id>` |
| Скрол вниз на сторінці каменю | Блок «Схоже» з 6 позиціями |
| Подивитись на похожі | Той самий **матеріал**, **колір**, **форма**, **обробка**, **ціновий діапазон ±35%** — а не випадкові |
| Камінь з рідкісним кольором | Все одно показує 6 — fallback за категорією і ціною |
| Натиснути «Купити зараз» | Sidebar відкривається з цим каменем |
| Натиснути «Додати у вибір» | Лічильник у header збільшується |

### C. Чат-віджет

| Тест | Очікуваний результат |
|------|---------------------|
| Відкрити чат | Бот пише "Як до вас звертатися?" мовою сайту |
| Ввести ім'я | Запитує телефон |
| Ввести телефон | Зберігає, з'являються FAQ-quick-replies |
| Натиснути quick-reply "Скільки коштує?" | Відповідь FAQ вашою мовою |
| Написати "Чи зробите хрест з мармуру?" | Telegram-уведомлення приходить менеджеру |
| Менеджер відповів у Telegram з `[SM:<id>]` | Відповідь з'являється у віджеті за 10с |

### D. Заявка з форми

| Тест | Очікуваний результат |
|------|---------------------|
| Додати камінь у вибір | Sidebar показує №, ціна |
| Заповнити Name + Phone | Кнопка активна |
| Натиснути «Відправити заявку» | Success екран + reference |
| Перевірити пошту admin | Email "Нове замовлення" від Resend |
| Перевірити Telegram | Повідомлення з номером телефону |
| Перевірити Supabase orders | Рядок з name, phone, items |

### E. CRM — українізація і UAH

| Тест | Очікуваний результат |
|------|---------------------|
| Зайти у `/admin` | Усі написи українською |
| KPI картка "Загальна сума pipeline" | "X XXX ₴", не €X.XK |
| Відкрити замовлення | "Орієнтовна сума" в ₴ + "≈ €Y" поряд |
| Таблиця товарів `/admin/stones` | Колонка "Ціна (₴)", всі цифри в гривнях |
| Фінанси `/admin/finances` | Картки в ₴, не € |
| Аналітика `/admin/analytics` | Дохід в ₴, графіки в ₴ |

### F. Auto-translate в admin

| Тест | Очікуваний результат |
|------|---------------------|
| `/admin/about` → ввести текст у UK | Поля пусті в інших локалях |
| Клацнути «Перекласти на 4 мови» | Кнопка показує "Перекладаю…" |
| Дочекатись завершення | "Готово (DeepL)" або (Google) або (MyMemory) |
| Перейти на PL вкладку | Текст вже там — польською |
| Те саме на DE/LT/EN | Усі заповнено |
| `/admin/services` → новий → ввести title українською | Кнопка "Автопереклад з UK" |
| Натиснути | DeepL ✓ або MyMemory ✓ — поля заповнені |
| `/admin/projects` створити новий | Ті ж кнопки на title, description, materials |
| `/admin/faq` додати питання | Кнопка для q і для a |

### G. Observability dashboard

| Тест | Очікуваний результат |
|------|---------------------|
| `/admin/analytics` період "Сьогодні" | Якщо немає заявок — порожні графіки, але KPIs показують 0 |
| Період "30 днів" | Воронка конверсії з % |
| Real-time блок чат-сесій | Дані оновлюються кожні 60с |
| Якщо є непрочитана чат-сесія | Жовтий банер вгорі "Сесій чекають" |
| Натиснути "Відкрити чат" | Перенаправлення на `/admin/chat` |
| Bar chart "Дохід за днями" | Hover показує "X XXX ₴ (Y)" |
| "Розподіл за годинами доби" | Пік підсвічений синім |
| "Підписники за мовами" | З прапорцями 🇺🇦🇵🇱 |

### H. Воронка конверсії

| Тест | Очікуваний результат |
|------|---------------------|
| З 0 чат-сесій | Воронка показує 100% / 0% / 0% |
| Чат-сесій 10 + 3 заявки + 1 виконана | Конверсія 30%, виконання 33% |

### I. Build / type check

```bash
cd /Users/gruttyx/Desktop/stonememory2/stone-memory-main
npx tsc --noEmit              # → 0 errors ✅
npx next build                # → 50+ routes built ✅
```

---

## 📊 Що ще варто зробити (поза цим раундом)

Це список з мого первинного аудиту що **не** вирішено цим патчем — додати у наступних спринтах:

1. 🔴 **Видалити `ex.rtf` з робочого столу** і ротувати ВСІ ключі (Supabase service_role, Resend, Telegram, Cron secret, Webhook secret).
2. 🟡 **Додати тести**: Vitest для `lib/translate.ts`, `lib/rate-limit.ts`, `lib/chat-bot.ts` + Playwright e2e на критичний шлях замовлення.
3. 🟡 **localStorage admin role**: переміститись на server-side per-user roles (Supabase user metadata + перевірка в `requireAdmin`).
4. 🟡 **`/api/fx` ендпоінт**: курси з ECB API раз на день, кеш в Supabase.
5. 🟡 **Cloudflare Turnstile** на `/api/orders` і `/api/chat` — захист від ботів.
6. 🟡 **Vercel Cron** замість GitHub Actions (надійніше, інтегровано).
7. 🟢 **MyMemory `MYMEMORY_EMAIL` змінна** — підвищить квоту до 50000 слів/день.
8. 🟢 **Hero video** — додати `<source>` з webm + `prefers-reduced-data`.
9. 🟢 **Telegram session map** перенести з `globalThis` у Redis (бо губиться при cold start).

---

## 📂 Список змінених/створених файлів

### Створено
- `lib/admin-format.ts` — UAH і дата форматери для CRM
- `lib/sentry.ts` — lightweight error tracking
- `components/error-boundary-client.tsx` — клієнтський error handler
- `REFACTOR_REPORT.md` — цей звіт

### Змінено
- `app/about/layout.tsx` — typo fix
- `app/admin/about/page.tsx` — кнопка auto-translate
- `app/admin/analytics/page.tsx` — переписано як observability dashboard
- `app/admin/finances/page.tsx` — UAH замість EUR
- `app/admin/page.tsx` — UAH у KPI
- `app/admin/stones/page.tsx` — UAH у таблиці
- `app/layout.tsx` — підключення ErrorBoundaryClient
- `app/stones/[id]/page.tsx` — multi-criteria related items
- `app/terms/page.tsx` — повні переклади всіма мовами
- `components/admin/command-palette.tsx` — прибрано мертві посилання
- `components/admin/multilingual-field.tsx` — підтримка mymemory provider
- `components/admin/order-detail-sheet.tsx` — UAH + EUR hint
- `components/admin/orders-table.tsx` — UAH через formatUAH
- `lib/store/about.ts` — повні переклади defaultAbout
- `lib/translate.ts` — додано MyMemory як 3-й провайдер

---

## 🚀 Як запустити

```bash
cd /Users/gruttyx/Desktop/stonememory2/stone-memory-main
cp .env.example .env.local
# заповнити в .env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL, RESEND_API_KEY,
# TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID — після ротації ключів!

npm install              # 259 пакетів
npx tsc --noEmit         # 0 errors ✅
npm run dev              # http://localhost:3000
npm run build && npm start  # production
```

Опціонально:
- `MYMEMORY_EMAIL=admin@stonememory.com.ua` — підвищує квоту MyMemory до 50K слів/день
- `DEEPL_API_KEY=…` — найкраща якість перекладу
- `NEXT_PUBLIC_SENTRY_DSN=https://…@sentry.io/…` — error tracking у проді
