import type { Locale } from "@/lib/types"

/** Тексти модалки заявки (components/consult-modal.tsx) і футера. */
export type ConsultCopy = {
  defaultTitle: string
  lead: string
  close: string
  sentTitle: string
  sentEmail: string
  sentOther: string
  failed: string
  orCall: string
  honeypot: string
  name: string
  namePlaceholder: string
  phone: string
  channel: string
  channelCall: string
  email: string
  optional: string
  message: string
  messagePlaceholder: string
  preparing: string
  addMore: (n: number, max: number) => string
  attach: string
  remove: (name: string) => string
  filesHint: (max: number, mb: number, current: string) => string
  tooMany: (max: number) => string
  wrongType: string
  tooBig: (name: string, mb: number) => string
  totalTooBig: (name: string, mb: number) => string
  sending: string
  send: string
  consentBefore: string
  consentLink: string
  consentAfter: string
  mb: string
  kb: string
  footer: { subscribed: string; invalidEmail: string; subscribeFailed: string; network: string; stone: string }
}

const uk: ConsultCopy = {
  defaultTitle: "Отримати розрахунок",
  lead: "Фото ділянки чи ескіз можна прикріпити одразу.",
  close: "Закрити",
  sentTitle: "Запит надіслано",
  sentEmail: "Дякуємо. Відповімо на пошту протягом робочого дня.",
  sentOther: "Дякуємо. Ми отримали запит і зв'яжемося з вами в робочий час.",
  failed: "Не вдалося надіслати запит. Зателефонуйте нам або спробуйте ще раз.",
  orCall: "Або подзвоніть: ",
  honeypot: "Не заповнюйте це поле",
  name: "Ім'я",
  namePlaceholder: "Як до вас звертатись",
  phone: "Телефон",
  channel: "Як зручно зв'язатись",
  channelCall: "Дзвінок",
  email: "Email",
  optional: " (необов'язково)",
  message: "Повідомлення",
  messagePlaceholder: "Що потрібно: модель, камінь, місто, побажання",
  preparing: "Готуємо фото…",
  addMore: (n, max) => `Додати ще (${n} з ${max})`,
  attach: "Прикріпити фото ділянки, ескіз або PDF",
  remove: (name) => `Прибрати ${name}`,
  filesHint: (max, mb, current) => `До ${max} файлів, разом до ${mb} МБ. Фото зменшуємо автоматично${current ? ` · зараз ${current}` : ""}.`,
  tooMany: (max) => `Можна прикріпити до ${max} файлів.`,
  wrongType: "Підійдуть фото або PDF.",
  tooBig: (name, mb) => `«${name}» завеликий: разом файли мають бути до ${mb} МБ.`,
  totalTooBig: (name, mb) => `Разом файли мають бути до ${mb} МБ — «${name}» не додано.`,
  sending: "Надсилаємо…",
  send: "Надіслати",
  consentBefore: "Натискаючи «Надіслати», ви погоджуєтесь з ",
  consentLink: "політикою конфіденційності",
  consentAfter: ". Дані не передаємо третім особам.",
  mb: "МБ",
  kb: "КБ",
  footer: { subscribed: "Дякуємо — ви підписані!", invalidEmail: "Невірний email", subscribeFailed: "Не вдалось підписатися", network: "Помилка мережі", stone: "Архітектурний камінь" },
}

const pl: ConsultCopy = {
  defaultTitle: "Poproś o wycenę",
  lead: "Zdjęcie miejsca lub szkic można dołączyć od razu.",
  close: "Zamknij",
  sentTitle: "Zapytanie wysłane",
  sentEmail: "Dziękujemy. Odpowiemy mailem w ciągu dnia roboczego.",
  sentOther: "Dziękujemy. Otrzymaliśmy zapytanie i skontaktujemy się w godzinach pracy.",
  failed: "Nie udało się wysłać zapytania. Zadzwoń do nas lub spróbuj ponownie.",
  orCall: "Lub zadzwoń: ",
  honeypot: "Nie wypełniaj tego pola",
  name: "Imię",
  namePlaceholder: "Jak się do Ciebie zwracać",
  phone: "Telefon",
  channel: "Jak najlepiej się skontaktować",
  channelCall: "Telefon",
  email: "Email",
  optional: " (opcjonalnie)",
  message: "Wiadomość",
  messagePlaceholder: "Czego potrzebujesz: model, kamień, miasto, życzenia",
  preparing: "Przygotowujemy zdjęcia…",
  addMore: (n, max) => `Dodaj kolejne (${n} z ${max})`,
  attach: "Dołącz zdjęcie miejsca, szkic lub PDF",
  remove: (name) => `Usuń ${name}`,
  filesHint: (max, mb, current) => `Do ${max} plików, łącznie do ${mb} MB. Zdjęcia zmniejszamy automatycznie${current ? ` · teraz ${current}` : ""}.`,
  tooMany: (max) => `Można dołączyć do ${max} plików.`,
  wrongType: "Akceptujemy zdjęcia lub PDF.",
  tooBig: (name, mb) => `„${name}” jest za duży: pliki łącznie do ${mb} MB.`,
  totalTooBig: (name, mb) => `Pliki łącznie do ${mb} MB — „${name}” nie został dodany.`,
  sending: "Wysyłamy…",
  send: "Wyślij",
  consentBefore: "Klikając „Wyślij”, akceptujesz ",
  consentLink: "politykę prywatności",
  consentAfter: ". Danych nie przekazujemy osobom trzecim.",
  mb: "MB",
  kb: "KB",
  footer: { subscribed: "Dziękujemy — zapisano!", invalidEmail: "Nieprawidłowy email", subscribeFailed: "Nie udało się zapisać", network: "Błąd sieci", stone: "Kamień architektoniczny" },
}

const en: ConsultCopy = {
  defaultTitle: "Get a quote",
  lead: "You can attach a photo of the plot or a sketch right away.",
  close: "Close",
  sentTitle: "Request sent",
  sentEmail: "Thank you. We'll reply by email within one working day.",
  sentOther: "Thank you. We've received your request and will contact you during working hours.",
  failed: "The request could not be sent. Please call us or try again.",
  orCall: "Or call: ",
  honeypot: "Leave this field empty",
  name: "Name",
  namePlaceholder: "How should we address you",
  phone: "Phone",
  channel: "How to reach you",
  channelCall: "Call",
  email: "Email",
  optional: " (optional)",
  message: "Message",
  messagePlaceholder: "What you need: model, stone, city, wishes",
  preparing: "Preparing photos…",
  addMore: (n, max) => `Add more (${n} of ${max})`,
  attach: "Attach a photo of the plot, a sketch or a PDF",
  remove: (name) => `Remove ${name}`,
  filesHint: (max, mb, current) => `Up to ${max} files, ${mb} MB in total. Photos are resized automatically${current ? ` · now ${current}` : ""}.`,
  tooMany: (max) => `You can attach up to ${max} files.`,
  wrongType: "Photos or PDF only.",
  tooBig: (name, mb) => `“${name}” is too large: files must total under ${mb} MB.`,
  totalTooBig: (name, mb) => `Files must total under ${mb} MB — “${name}” was not added.`,
  sending: "Sending…",
  send: "Send",
  consentBefore: "By clicking “Send” you agree to the ",
  consentLink: "privacy policy",
  consentAfter: ". We do not share your data with third parties.",
  mb: "MB",
  kb: "KB",
  footer: { subscribed: "Thank you — you're subscribed!", invalidEmail: "Invalid email", subscribeFailed: "Could not subscribe", network: "Network error", stone: "Architectural stone" },
}

const de: ConsultCopy = {
  defaultTitle: "Angebot anfordern",
  lead: "Ein Foto der Grabstelle oder eine Skizze können Sie gleich anhängen.",
  close: "Schließen",
  sentTitle: "Anfrage gesendet",
  sentEmail: "Vielen Dank. Wir antworten per E-Mail innerhalb eines Arbeitstages.",
  sentOther: "Vielen Dank. Wir haben Ihre Anfrage erhalten und melden uns während der Arbeitszeit.",
  failed: "Die Anfrage konnte nicht gesendet werden. Rufen Sie uns an oder versuchen Sie es erneut.",
  orCall: "Oder anrufen: ",
  honeypot: "Dieses Feld leer lassen",
  name: "Name",
  namePlaceholder: "Wie dürfen wir Sie ansprechen",
  phone: "Telefon",
  channel: "Wie erreichen wir Sie am besten",
  channelCall: "Anruf",
  email: "E-Mail",
  optional: " (optional)",
  message: "Nachricht",
  messagePlaceholder: "Was Sie brauchen: Modell, Stein, Stadt, Wünsche",
  preparing: "Fotos werden vorbereitet…",
  addMore: (n, max) => `Weitere hinzufügen (${n} von ${max})`,
  attach: "Foto der Grabstelle, Skizze oder PDF anhängen",
  remove: (name) => `${name} entfernen`,
  filesHint: (max, mb, current) => `Bis zu ${max} Dateien, insgesamt bis ${mb} MB. Fotos werden automatisch verkleinert${current ? ` · aktuell ${current}` : ""}.`,
  tooMany: (max) => `Sie können bis zu ${max} Dateien anhängen.`,
  wrongType: "Nur Fotos oder PDF.",
  tooBig: (name, mb) => `„${name}“ ist zu groß: Dateien dürfen insgesamt ${mb} MB nicht überschreiten.`,
  totalTooBig: (name, mb) => `Dateien dürfen insgesamt ${mb} MB nicht überschreiten — „${name}“ wurde nicht hinzugefügt.`,
  sending: "Wird gesendet…",
  send: "Senden",
  consentBefore: "Mit Klick auf „Senden“ stimmen Sie der ",
  consentLink: "Datenschutzerklärung",
  consentAfter: " zu. Wir geben Ihre Daten nicht an Dritte weiter.",
  mb: "MB",
  kb: "KB",
  footer: { subscribed: "Vielen Dank — Sie sind angemeldet!", invalidEmail: "Ungültige E-Mail", subscribeFailed: "Anmeldung fehlgeschlagen", network: "Netzwerkfehler", stone: "Architekturstein" },
}

const lt: ConsultCopy = {
  defaultTitle: "Gauti skaičiavimą",
  lead: "Kapavietės nuotrauką ar eskizą galite pridėti iš karto.",
  close: "Uždaryti",
  sentTitle: "Užklausa išsiųsta",
  sentEmail: "Ačiū. Atsakysime el. paštu per darbo dieną.",
  sentOther: "Ačiū. Gavome užklausą ir susisieksime darbo valandomis.",
  failed: "Nepavyko išsiųsti užklausos. Paskambinkite mums arba bandykite dar kartą.",
  orCall: "Arba skambinkite: ",
  honeypot: "Šio lauko nepildykite",
  name: "Vardas",
  namePlaceholder: "Kaip į jus kreiptis",
  phone: "Telefonas",
  channel: "Kaip patogiau susisiekti",
  channelCall: "Skambutis",
  email: "El. paštas",
  optional: " (neprivaloma)",
  message: "Žinutė",
  messagePlaceholder: "Ko reikia: modelis, akmuo, miestas, pageidavimai",
  preparing: "Ruošiame nuotraukas…",
  addMore: (n, max) => `Pridėti dar (${n} iš ${max})`,
  attach: "Pridėti kapavietės nuotrauką, eskizą ar PDF",
  remove: (name) => `Pašalinti ${name}`,
  filesHint: (max, mb, current) => `Iki ${max} failų, iš viso iki ${mb} MB. Nuotraukas sumažiname automatiškai${current ? ` · dabar ${current}` : ""}.`,
  tooMany: (max) => `Galima pridėti iki ${max} failų.`,
  wrongType: "Tinka nuotraukos arba PDF.",
  tooBig: (name, mb) => `„${name}“ per didelis: failai kartu turi būti iki ${mb} MB.`,
  totalTooBig: (name, mb) => `Failai kartu turi būti iki ${mb} MB — „${name}“ nepridėtas.`,
  sending: "Siunčiame…",
  send: "Siųsti",
  consentBefore: "Spausdami „Siųsti“ sutinkate su ",
  consentLink: "privatumo politika",
  consentAfter: ". Duomenų tretiesiems asmenims neperduodame.",
  mb: "MB",
  kb: "KB",
  footer: { subscribed: "Ačiū — jūs užsiprenumeravote!", invalidEmail: "Neteisingas el. paštas", subscribeFailed: "Nepavyko užsiprenumeruoti", network: "Tinklo klaida", stone: "Architektūrinis akmuo" },
}

export const CONSULT_COPY: Record<Locale, ConsultCopy> = { uk, pl, en, de, lt }
