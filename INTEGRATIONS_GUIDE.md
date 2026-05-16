# Stone Memory — інтеграції каналів комунікації

**Що це:** покрокова інструкція як підключити кожен канал щоб клієнти могли писати у Telegram / WhatsApp / Instagram / Email / SMS / сайт-чат, а ти бачив усе в одному місці — `/admin/inbox`.

**Як це працює:**
1. Клієнт пише у будь-який канал
2. Webhook на нашому сайті приймає → знаходить/створює `customer` → пише у `communications`
3. У `/admin/inbox` усі канали зливаються в conversation-листи
4. Менеджер відповідає звідти — система маршрутизує реплай на правильний канал
5. Якщо є відкрита угода — повідомлення auto-link до неї

**Status check:** `/admin/integrations` — бачиш які канали налаштовано, які ENV-змінні задані.

---

## ⚙️ ENV-змінні — повний перелік

Додай у Vercel → Project → Settings → Environment Variables.

```bash
# ===== Site chat (вже працює) =====
# нічого не треба

# ===== Telegram (вже працює, 3 змінних встановлено) =====
TELEGRAM_BOT_TOKEN=8513991517:AAHpb...
TELEGRAM_ADMIN_CHAT_ID=486862648
TELEGRAM_WEBHOOK_SECRET=af5f6185...

# ===== WhatsApp Cloud API (Meta) =====
WHATSAPP_TOKEN=EAAGm...                        # System User Access Token
WHATSAPP_PHONE_NUMBER_ID=123456789012345        # Phone Number ID
WHATSAPP_VERIFY_TOKEN=stonememory-wa-verify-2026  # будь-який secret

# ===== Instagram Messaging (Meta) =====
INSTAGRAM_PAGE_ACCESS_TOKEN=EAAG...             # Long-lived Page Access Token
INSTAGRAM_PAGE_ID=10208012345                   # Facebook Page ID
INSTAGRAM_VERIFY_TOKEN=stonememory-ig-verify-2026

# ===== Email Inbound (опціональний secret) =====
INBOUND_EMAIL_SECRET=$(openssl rand -hex 32)

# ===== Twilio SMS =====
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+38000000000                 # купуєш у Twilio Console
```

---

## 1️⃣ Telegram (вже налаштовано)

### Що працює зараз
- ✅ Якщо клієнт **DM-ить бота напряму** → попадає в `/admin/inbox` як `telegram` канал
- ✅ Якщо клієнт пише на сайті → перекидаємо у груповий чат менеджерів
- ✅ Менеджер може відповісти у груповому чаті → відповідь приходить клієнту в site chat

### Як перевірити
1. Відкрий бота в Telegram (`@<твій_бот>`) → надішли `/start`
2. У `/admin/inbox` має зʼявитись повідомлення в каналі "Telegram"

### Якщо webhook не працює
```bash
# Перевір поточний стан webhook
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Перереєструй webhook
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://stonememory.com.ua/api/telegram&secret_token=<WEBHOOK_SECRET>"
```

---

## 2️⃣ WhatsApp Business (Meta Cloud API)

**Безкоштовно для тестового номера. Production — від $0.005/повідомлення.**

### Покрокова настройка

#### Крок 1: Створити Meta App
1. Зайди на https://developers.facebook.com/apps
2. Create App → Business → Next
3. Назва: `Stone Memory CRM`
4. Email: `info@stonememory.com.ua`

#### Крок 2: Додати продукт WhatsApp
1. На dashboard додай продукт **WhatsApp** → "Set up"
2. Створиться тестовий номер (можна використати свій після верифікації)
3. У вкладці "API Setup" знайди:
   - **Phone Number ID** (під полем From) → це `WHATSAPP_PHONE_NUMBER_ID`
   - **Temporary Access Token** (24 год) → для тестування
   - Для production: створити **System User** в Business Settings → Permanent Access Token → це `WHATSAPP_TOKEN`

#### Крок 3: Налаштувати Webhook
1. WhatsApp → Configuration → Webhook
2. **Callback URL:** `https://stonememory.com.ua/api/whatsapp/webhook`
3. **Verify Token:** будь-який рядок, наприклад `stonememory-wa-verify-2026` → це `WHATSAPP_VERIFY_TOKEN`
4. Натисни "Verify and Save"
5. У "Webhook fields" subscribe до:
   - ✅ messages
   - ✅ message_status

#### Крок 4: Додати ENV у Vercel
```
WHATSAPP_TOKEN=EAAGm...
WHATSAPP_PHONE_NUMBER_ID=123456789...
WHATSAPP_VERIFY_TOKEN=stonememory-wa-verify-2026
```

#### Крок 5: Тест
1. У Meta App → API Setup → "To" вибери свій телефон → надішли тестове повідомлення
2. Відповідай на це повідомлення з мобільного — має зʼявитись у `/admin/inbox`

### Обмеження WhatsApp
- ⚠️ **24-hour rule**: outbound message можна слати тільки протягом 24 год після останнього inbound від клієнта
- Поза 24 год — потрібні **Template messages** (схвалені Meta заздалегідь)
- Для production треба верифікувати Business у Meta (1-3 дні)

---

## 3️⃣ Instagram Direct Messages

**Той самий Meta App що для WhatsApp.**

### Передумови
- Instagram має бути **Business Account** (не personal)
- Підключений до **Facebook Page** (Settings → Linked Accounts)

### Покрокова настройка

#### Крок 1: Додати продукт Instagram у Meta App
1. У Meta App dashboard → Add Product → "Instagram Graph API"
2. Connect your Instagram Business Account (через Facebook Page)

#### Крок 2: Налаштувати Webhook (через продукт "Webhooks")
1. Add Product → "Webhooks"
2. Page subscriptions → URL: `https://stonememory.com.ua/api/instagram/webhook`
3. Verify Token: `stonememory-ig-verify-2026` → це `INSTAGRAM_VERIFY_TOKEN`
4. Subscribe page до полів:
   - ✅ messages
   - ✅ messaging_postbacks
   - ✅ messaging_seen

#### Крок 3: Отримати Page Access Token
1. Graph API Explorer: https://developers.facebook.com/tools/explorer
2. Selected App = твій App
3. Selected Token = User Token
4. Permissions: `pages_messaging`, `instagram_basic`, `instagram_manage_messages`
5. Generate Token → Copy
6. Конвертуй у **Long-lived Page Access Token**:
   ```bash
   curl "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=<APP_ID>&client_secret=<APP_SECRET>&fb_exchange_token=<USER_TOKEN>"
   ```
7. Потім → Page-scoped token:
   ```bash
   curl "https://graph.facebook.com/v21.0/me/accounts?access_token=<LONG_LIVED_USER_TOKEN>"
   ```
   → беремо `data[].access_token` для потрібної сторінки → це `INSTAGRAM_PAGE_ACCESS_TOKEN`
   → `data[].id` → це `INSTAGRAM_PAGE_ID`

#### Крок 4: ENV у Vercel
```
INSTAGRAM_PAGE_ACCESS_TOKEN=EAAG...
INSTAGRAM_PAGE_ID=102080...
INSTAGRAM_VERIFY_TOKEN=stonememory-ig-verify-2026
```

#### Крок 5: Тест
DM сторінки в Instagram → має зʼявитись у `/admin/inbox`

### Обмеження Instagram
- ⚠️ Тільки 7-day messaging window (замість 24h як WhatsApp)
- Лише text + image на початку. Stories reply, reactions — окремі webhook events.

---

## 4️⃣ Email (вхідні листи)

**Outbound вже працює** через Resend (RESEND_API_KEY встановлено). Inbound — складніше, є 4 варіанти:

### Варіант A: Cloudflare Email Routing (НАЙПРОСТІШЕ і безкоштовно)

#### Крок 1: Налаштувати Email Routing
1. Cloudflare Dashboard → Domain → Email → Routing → Get Started
2. Cloudflare додасть MX records автоматично
3. Verify destination email (твій gmail) — клік підтвердження
4. Створити Catch-all rule: → "Send to a Worker"

#### Крок 2: Створити Worker
1. Cloudflare → Workers & Pages → Create → Worker
2. Назва: `email-to-crm`
3. Code:

```javascript
// Cloudflare Email Worker → POST на CRM webhook
import { ParsedMessage } from 'postal-mime'

export default {
  async email(message, env, ctx) {
    const PostalMime = (await import('postal-mime')).default
    const parser = new PostalMime()
    const raw = await new Response(message.raw).arrayBuffer()
    const parsed = await parser.parse(raw)

    const payload = {
      from: parsed.from?.address,
      sender_name: parsed.from?.name,
      to: parsed.to?.[0]?.address,
      subject: parsed.subject,
      text: parsed.text,
      "Message-Id": parsed.messageId,
    }

    await fetch('https://stonememory.com.ua/api/email/inbound', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': env.INBOUND_EMAIL_SECRET,
      },
      body: JSON.stringify(payload),
    })
  }
}
```

4. Settings → Variables → Add `INBOUND_EMAIL_SECRET` (той самий що в Vercel)

#### Крок 3: Тест
Надіслати email на `info@stonememory.com.ua` → перевірити `/admin/inbox`

### Варіант B: Mailgun routes
Документація: https://documentation.mailgun.com/docs/mailgun/user-manual/receive-forward-store/

1. Mailgun → Receiving → Routes → Add new route
2. Match recipient: `.*@stonememory.com.ua`
3. Action: `forward("https://stonememory.com.ua/api/email/inbound")`
4. Webhook автоматично POSTить у наш формат

### Варіант C: SendGrid Inbound Parse
1. SendGrid → Settings → Inbound Parse
2. Receiving Domain: `stonememory.com.ua`, MX → `mx.sendgrid.net`
3. Destination URL: `https://stonememory.com.ua/api/email/inbound`

### Варіант D: Postmark
1. Server → Inbound Streams → URL: `https://stonememory.com.ua/api/email/inbound`

### ENV у Vercel
```
INBOUND_EMAIL_SECRET=$(openssl rand -hex 32)
```
(копіюй його у Cloudflare Worker variables / Mailgun custom headers)

---

## 5️⃣ SMS через Twilio

**Платний:** від $1/міс за номер + $0.0075 за SMS у US, ~$0.05 у UA.

### Крок 1: Зареєструватись
1. https://console.twilio.com → Sign up
2. Phone Numbers → Buy a number → купи номер для UA (~$10/міс)

### Крок 2: Webhook
1. Console → Phone Numbers → твій номер
2. Messaging Configuration:
   - "A message comes in" → Webhook
   - URL: `https://stonememory.com.ua/api/sms/inbound`
   - HTTP POST

### Крок 3: ENV у Vercel
```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+380000000000
```
(SID + Token знайдеш на Console Dashboard)

### Тест
Надіслати SMS на купляний номер → має зʼявитись у `/admin/inbox` як канал "SMS"

---

## 🎯 Чек-лист готовності

| Канал | Налаштовано | Може приймати | Може надсилати |
|-------|-------------|---------------|----------------|
| Сайт-чат | ✅ | ✅ | ✅ |
| Telegram | ✅ | ✅ | ✅ |
| WhatsApp | ⚠️ Потрібен Meta App | — | — |
| Instagram | ⚠️ Потрібен Meta App + Page | — | — |
| Email outbound (Resend) | ✅ | n/a | ✅ |
| Email inbound | ⚠️ Потрібен Cloudflare/Mailgun | — | n/a |
| SMS | ⚠️ Потрібен Twilio | — | — |

Поточний статус — у `/admin/integrations`.

---

## 🛠 Як працює маршрутизація reply

Коли менеджер відповідає в `/admin/inbox`:

1. Frontend POST на `/api/crm/reply` з `{ customerId, channel, body }`
2. Backend → `lib/crm/send.ts:sendToChannel()`
3. Залежно від `channel`:
   - **email** → `Resend` (`lib/email.ts`)
   - **telegram** → бот пише напряму юзеру (тільки якщо у customer.channels є telegram_user_id — тобто юзер сам перший написав)
   - **whatsapp** → Meta Cloud API
   - **instagram** → Meta Graph API з PSID
   - **sms** → Twilio API
   - **site_chat** → у chat_messages (віджет на сайті polls і покаже)
   - **phone / manual** → лише запис у communications (адмін розмовляв офлайн)
4. Запис у `communications` як outbound + `replied_at = now()`

---

## 🔒 Безпека

### Telegram
✅ Webhook secret token у заголовку `x-telegram-bot-api-secret-token`

### WhatsApp / Instagram
✅ Verify token при handshake. **TODO для production:** додати валідацію X-Hub-Signature-256 від Meta (підпис body через app_secret).

### Email inbound
✅ `x-webhook-secret` header (опціонально, але рекомендовано в production)

### Twilio
⚠️ **TODO для production:** валідація Twilio signature через X-Twilio-Signature header

### Reply API
✅ Захищено `requireAdmin()` — тільки авторизовані admin/manager

---

## 🧪 Тестування інтеграцій

### Локально
```bash
# 1. Запустити dev
npm run dev

# 2. Зробити URL публічним через ngrok
ngrok http 3000
# → отримаєш https://xxx.ngrok-free.app

# 3. Налаштувати webhook у Telegram/Meta з ngrok URL
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://xxx.ngrok-free.app/api/telegram&secret_token=<SECRET>"
```

### Production
1. Push → Vercel deploy
2. Webhook URL = `https://stonememory.com.ua/api/<channel>/webhook`
3. Тест з реального профіля

---

## ❓ Поширені проблеми

### "Verify and Save" Meta Webhook fails
- Перевір що `WHATSAPP_VERIFY_TOKEN` в Vercel **точно** збігається з тим що ти ввів у Meta
- Перевір що redeploy відбувся після додавання ENV
- Перевір логи Vercel: чи приходить GET запит з `hub.verify_token`

### Telegram webhook повертає 401
- `TELEGRAM_WEBHOOK_SECRET` не співпадає з тим що ти передав у `setWebhook?secret_token=...`

### WhatsApp/Instagram outbound не приходить
- WhatsApp: ти за межами 24-hour window, потрібен template
- Instagram: за межами 7-day window
- Token expired (для не-System User token живе 60 днів)

### Email inbound не приходить
- Cloudflare MX records ще пропагуються (до 24 год)
- INBOUND_EMAIL_SECRET відрізняється у Worker і Vercel
- Worker не задеплоєний (Cloudflare → перевір deploys)

### SMS Twilio не доставляється
- В UA потрібна верифікація бренда (sender ID) — Twilio Console → Trust Hub
- Номер заблоковано оператором — змінити на toll-free або 10DLC

---

## 📞 Куди пишуть клієнти у нас зараз

Чат на сайті `stonememory.com.ua` ✅
Telegram бот `@<твій_бот>` ✅
Telefono `+380 67 808 02 22` (manual entry в CRM) ✅
WhatsApp `+380 67 808 02 22` 🟡 (треба зробити Business + WA Cloud)
Instagram `@sttonememory` 🟡 (треба Business + Meta App)
Email `info@stonememory.com.ua` ✅ (outbound) / 🟡 (inbound треба Cloudflare)

---

## 🚀 Що робити після підключення кожного каналу

1. **Створи тестовий контакт** — повідомлення від тебе самого
2. **Перевір auto-link до угоди** — створи угоду для свого тестового контакту, надішли повідомлення → має прив'язатись
3. **Тест reply** — відповідь з `/admin/inbox` → має дойти на канал
4. **Підпиши команду** — додай менеджерів через `/admin/team`, дай їм роль `manager`. Вони побачать ті ж самі inbox/deals

---

## 🎁 Бонус: пошук дублів клієнтів

Система автоматично шукає дублі по 3 ключах (у порядку):
1. Нормалізований телефон (`phone_norm` — без знаків)
2. Email (lowercase)
3. Канальний ID (telegram_user_id, instagram_psid, facebook_psid)

Якщо клієнт пише з WhatsApp і Instagram — **система зіллє у одного клієнта** через `phone` або через те що ми вже бачили цей IG PSID.
