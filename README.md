# Stone Memory

Сайт майстерні: пам'ятники та архітектурний камінь. Next.js 16, Supabase, Vercel.
Увесь контент і контакти живуть у базі й редагуються в адмінці `/admin`; код
тримає лише сід-fallback і правила.

## Команди

```bash
npm run dev            # локально, http://localhost:3000
npm run build          # збірка (перед нею asset-manifest для ?v= у фото)
npx tsc --noEmit       # типи
npx eslint .           # лінт
npm run stone-audit    # фото й посилання розділу каменю проти бази
```

Деплой: гілка → PR у `main` → Vercel збирає `main`. Змінні середовища й
перший запуск: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Документи

| Файл | Про що |
|---|---|
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | запуск, змінні середовища, чеклист продакшну |
| [docs/INTEGRATIONS_GUIDE.md](docs/INTEGRATIONS_GUIDE.md) | Telegram, WhatsApp, Instagram, пошта, SMS: як підключити канал |
| [docs/ADMIN_AUDIT_2026-09.md](docs/ADMIN_AUDIT_2026-09.md) | аудит адмінки й потоку даних, чекліст ручної перевірки |
| [docs/stone-market-check-2026-09.md](docs/stone-market-check-2026-09.md) | звірка каталогу каменю з продавцями слябів, що приховано і чим замінено |
| [docs/stone-photo-brief.md](docs/stone-photo-brief.md) | правила фото каменю і як додавати нові колекції |
| [docs/stone-photo-import-2026-09.md](docs/stone-photo-import-2026-09.md) | шаблон брифу для агента-генератора фото |

## Скрипти

| Скрипт | Коли потрібен |
|---|---|
| `scripts/asset-manifest.mjs` | автоматично перед dev і build |
| `scripts/stone-audit.mjs` | перед кожним деплоєм розділу каменю |
| `scripts/import-stone-photos.mjs <тека>` | фото з генератора → `public/` (3:2, 1200×800 WebP) |
| `scripts/apply-market-check.ts [--unhide]` | приховати недоступні колекції, додати нові прихованими, відкрити після деплою фото |
| `scripts/apply-collection-specs.ts` | дописати характеристики колекцій у базу з сіду |
| `scripts/cms-seed-sql.mjs` | SQL первинного імпорту розділу каменю |
| `scripts/upsert-articles.ts` | опублікувати статті з коду в базу |
| `scripts/compress-stone-images.mjs` | перестиснути важкі фото товарів у Storage |

Скрипти з базою запускати як `npx tsx --env-file=.env.local scripts/<назва>.ts`.
Міграції бази в `supabase/` у порядку імен; повторний запуск безпечний.
