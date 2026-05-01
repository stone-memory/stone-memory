# Stone Memory — Deployment Guide

## Швидкий старт локально

```bash
npm install
cp .env.example .env.local    # заповни потрібні ключі (див. нижче)
npm run dev                    # http://localhost:3030
npm run build && npm start     # продакшн-білд локально
```

Зараз сайт працює на **http://localhost:3030** (Next.js dev) і **http://localhost:3040** (preview proxy).

---

## Production deploy — Vercel (найпростіше, 5 хвилин)

1. Запуш у Git (GitHub/GitLab/Bitbucket)
2. Vercel → New Project → Import repo
3. Framework preset: **Next.js** (виявляється автоматично)
4. Build command: `npm run build` (за замовчуванням)
5. Add Environment Variables (див. список нижче) — спочатку додай лише **обов'язкові**, решту — коли буде готово
6. Deploy
7. Підключи кастомний домен (`stonememory.com.ua`) → Vercel налаштує HTTPS + HSTS автоматично

Альтернативи: **Netlify**, **Railway**, **Fly.io**, **DigitalOcean App Platform** — всі підтримують Next.js 16.

---

## Змінні середовища — повний список

Файл: `.env.local` (локально) / Vercel Environment Variables (prod). НЕ коміть `.env.local` — вже в `.gitignore`.

### Обов'язкові (мінімум щоб запустити)

| Змінна | Призначення | Де взяти |
|--------|-------------|----------|
| `NEXT_PUBLIC_SITE_URL` | Публічний URL (використовується для sitemap, canonical, metadata, JSON-LD) | Напр. `https://stonememory.com.ua.ua` |

Сайт запуститься і без інших ключів — просто chat/reviews/translate будуть у mock-режимі.

### Telegram чат-міст (коли готовий телеграм-бот)

| Змінна | Призначення | Як отримати |
|--------|-------------|-------------|
| `TELEGRAM_BOT_TOKEN` | Токен бота для перекидання повідомлень | Створи бота через [@BotFather](https://t.me/BotFather): `/newbot` → скопіюй токен `123456:AAAA…` |
| `TELEGRAM_ADMIN_CHAT_ID` | ID групи/чату куди приходитимуть повідомлення | 1) Додай бота в свою групу менеджерів. 2) Напиши в групу будь-що. 3) Відкрий `https://api.telegram.org/bot<ТОКЕН>/getUpdates` — знайди `chat.id` (від'ємне число для груп) |
| `TELEGRAM_WEBHOOK_SECRET` | Секрет для верифікації вхідних вебхуків (щоб сторонні не могли відправляти на твій endpoint) | Згенеруй: `openssl rand -hex 32` |

Після додавання всіх 3 змінних — зареєструй webhook один раз:
```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://stonememory.com.ua/api/telegram&secret_token=<WEBHOOK_SECRET>"
```

### Google Reviews (автопідтяг відгуків з Google Maps)

| Змінна | Призначення | Як отримати |
|--------|-------------|-------------|
| `GOOGLE_PLACES_API_KEY` | API ключ для Google Places | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Library → **Places API (New)** → Enable → Credentials → Create API key |
| `GOOGLE_PLACE_ID` | Унікальний ID твого бізнесу на Google Maps | [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder) — знайди "Stone Memory Костопіль" |

Без цих ключів відгуки беруться з seed-даних (12 зразків).

### Автопереклад контенту (щоб нові записи автоматично перекладались на 5 мов)

Обирай **ОДИН** з двох провайдерів:

| Провайдер | Змінна | Як отримати | Рекомендація |
|-----------|--------|-------------|--------------|
| **DeepL** (рекомендовано) | `DEEPL_API_KEY` | [DeepL API](https://www.deepl.com/pro-api) → Free plan → зареєструйся → API Key в dashboard | Найкраща якість для UK/PL/DE. Free: 500k символів/міс (~500 проектів) |
| Google Translate | `GOOGLE_TRANSLATE_API_KEY` | Google Cloud Console → **Cloud Translation API** → Enable → Credentials | $20/1M символів, без free tier для нових акаунтів |

Без ключа — переклади в mock-режимі (префікс `[EN] текст`), адмін побачить що треба замінити вручну.

### SEO / Search Console (опціонально, для індексації)

| Змінна | Призначення | Як отримати |
|--------|-------------|-------------|
| `GOOGLE_VERIFICATION` | Мета-тег для Google Search Console | [Search Console](https://search.google.com/search-console) → Add property → HTML tag → скопіюй `content="…"` |
| `BING_VERIFICATION` | Для Bing Webmaster | [Bing Webmaster](https://www.bing.com/webmasters) → аналогічно |
| `YANDEX_VERIFICATION` | Для Yandex Webmaster | [Yandex Webmaster](https://webmaster.yandex.com) — потрібно лише якщо цільовий ринок включає Yandex-юзерів |

### Аналітика (опціонально, активується ПІСЛЯ згоди на cookie)

| Змінна | Призначення |
|--------|-------------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics (формат `G-XXXXXXXXXX`) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Facebook/Meta Pixel |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | TikTok Pixel |

Ці скрипти завантажуються ТІЛЬКИ якщо користувач прийняв "Analytics" / "Marketing" в cookie banner — GDPR-сумісно.

### Помилки / моніторинг (опціонально)

| Змінна | Призначення |
|--------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Client + server error tracking. [Sentry](https://sentry.io) free tier: 5k events/міс |
| `SENTRY_AUTH_TOKEN` | Для source maps upload |
| `SENTRY_ORG` / `SENTRY_PROJECT` | Назва org/проекту в Sentry |

### Адмін пароль (поточна реалізація)

**ОБОВ'ЯЗКОВО поміняти перед продакшном:** Відкрий файл, заміни на складний пароль (min 16 символів з цифрами + спецсимволами), або краще — мігруй на NextAuth (див. "Наступні кроки").

---

## Наступні кроки для повноцінного продакшну

Поточна реалізація має обмеження: **всі дані (замовлення, відгуки, задачі, CRM-зміни) живуть у localStorage браузера адміна**. Це означає:
- ❌ Якщо адмін увійде з іншого пристрою — дані НЕ будуть синхронізовані
- ❌ Замовлення від клієнтів НЕ зберігаються на сервері (заявка лише приходить у Telegram)
- ❌ Кілька менеджерів не можуть працювати одночасно

### Для реального бізнесу треба додати backend:

**Рекомендований стек:**
1. **Supabase** (найшвидше) — Postgres + auth + realtime, free tier щедрий
2. **Drizzle ORM** + **NextAuth.js v5** — для type-safe CRUD і логіну через Google Workspace
3. Замінити всі `localStorage`-stores на Supabase таблиці

**Час на міграцію:** 2-3 дні роботи. Після цього:
- Всі менеджери бачать ті самі замовлення в real-time
- Один логін Google, без паролів
- Дані persist назавжди
- Можна підключити кілька філій/магазинів

---

## Чеклист перед продакшном

- [ ] `NEXT_PUBLIC_SITE_URL` виставлено на продакшн-домен
- [ ] Admin пароль у `password-gate.tsx` змінено на складний (або замінено на NextAuth)
- [ ] Telegram bot налаштовано + webhook зареєстровано
- [ ] Google Verification токен доданий → Search Console підтверджено
- [ ] Sitemap `stonememory.com/sitemap.xml` відправлено в Search Console
- [ ] DeepL/Google Translate ключ активовано (або mock — OK для старту)
- [ ] Favicon і OG image `stonememory.com/opengraph-image` перевірено (в [Metatags.io](https://metatags.io/))
- [ ] Тест 5-спроб lockout: ввести неправильний пароль 5 раз → має заблокувати на 15 хв
- [ ] Тест cookie banner: очистити localStorage → перезавантажити → має з'явитися
- [ ] Тест reduced-motion: увімкнути в системі → анімації на сайті мають зникнути
- [ ] Тест keyboard navigation: Tab через весь сайт, всі елементи мають visible focus ring
- [ ] Тест Lighthouse: Performance >90 Mobile, SEO = 100, Accessibility ≥95
- [ ] DNS: A-запис на Vercel, AAAA для IPv6 (Vercel дасть інструкції)
- [ ] SSL активний — Vercel налаштує за замовчуванням

---

## Як отримати найдешевший сетап

**Vercel Hobby (безкоштовно):** хостинг + HTTPS + CDN + preview deployments для PR. Ліміт: 100 GB bandwidth/міс (вистачить сотням тисяч відвідувачів).

**DeepL Free:** 500k символів автоперекладу/міс.

**Google Cloud:** Places API — $0.017 за запит, але з [безкоштовним $200/міс credit](https://cloud.google.com/maps-platform/pricing), тож ~11 700 запитів безкоштовно.

**Sentry Free:** 5k events/міс, 1 user.

**Разом: $0/міс** для сайту з помірним трафіком (до 100k відвідувачів).
