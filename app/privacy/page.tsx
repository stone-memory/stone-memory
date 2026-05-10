"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useTranslation } from "@/lib/i18n/context"
import type { Locale } from "@/lib/types"

const copy: Record<Locale, { title: string; updated: string; body: Array<{ h?: string; p: string }> }> = {
  uk: {
    title: "Політика конфіденційності",
    updated: "Оновлено",
    body: [
      { p: "Stone Memory (далі — «ми», «нас») поважає вашу приватність. Ця політика пояснює, як ми збираємо, використовуємо й зберігаємо персональні дані." },
      { h: "Які дані ми збираємо", p: "Ім'я, телефон, email (коли ви подаєте заявку або пишете в чат), інформацію про ваш пристрій (IP, User-Agent) і дії на сайті (якщо ви погодились на аналітику)." },
      { h: "Навіщо", p: "Для обробки замовлень, зв'язку з вами, покращення сайту. Ми НЕ продаємо ваші дані третім особам." },
      { h: "Файли cookie", p: "Необхідні cookie завжди активні. Аналітичні та маркетингові — лише з вашої згоди через банер згоди. Ви можете змінити вибір у будь-який момент, очистивши локальне сховище." },
      { h: "Ваші права (GDPR)", p: "Доступ до даних, виправлення, видалення, обмеження обробки, перенесення, відкликання згоди. Напишіть: sttonememory@gmail.com." },
      { h: "Зберігання", p: "Дані замовлень зберігаються до 3 років (податкові вимоги). Аналітичні — до 14 місяців. Маркетингові — до 12 місяців або до відкликання згоди." },
      { h: "Контакти", p: "Stone Memory, Костопіль, Рівненська область, Україна. Email: sttonememory@gmail.com. Тел.: +380 (67) 808 02 22." },
    ],
  },
  pl: {
    title: "Polityka prywatności",
    updated: "Aktualizacja",
    body: [
      { p: "Stone Memory szanuje Twoją prywatność. Niniejsza polityka wyjaśnia, jak zbieramy, wykorzystujemy i przechowujemy dane osobowe." },
      { h: "Jakie dane zbieramy", p: "Imię, telefon, e-mail (gdy składasz zamówienie lub piszesz na czacie), informacje o urządzeniu (IP, User-Agent) i działania na stronie (za zgodą)." },
      { h: "Cel", p: "Obsługa zamówień, kontakt, ulepszanie serwisu. NIE sprzedajemy danych osobom trzecim." },
      { h: "Cookies", p: "Niezbędne są zawsze aktywne. Analityczne i marketingowe — tylko za zgodą poprzez baner. Możesz zmienić wybór w dowolnym momencie." },
      { h: "Twoje prawa (RODO)", p: "Dostęp, sprostowanie, usunięcie, ograniczenie, przenoszenie, cofnięcie zgody. Kontakt: sttonememory@gmail.com." },
      { h: "Przechowywanie", p: "Dane zamówień — do 3 lat. Analityczne — do 14 miesięcy. Marketingowe — do 12 miesięcy lub do cofnięcia zgody." },
      { h: "Kontakt", p: "Stone Memory, Kostopol, obwód rówieński, Ukraina. E-mail: sttonememory@gmail.com. Tel.: +380 (67) 808 02 22." },
    ],
  },
  en: {
    title: "Privacy policy",
    updated: "Updated",
    body: [
      { p: "Stone Memory respects your privacy. This policy explains how we collect, use and store personal data." },
      { h: "What we collect", p: "Name, phone, email (when you submit a request or message the chat), device information (IP, User-Agent) and on-site actions (only with your consent to analytics)." },
      { h: "Why", p: "To process orders, get back to you, and improve the service. We do NOT sell your data to third parties." },
      { h: "Cookies", p: "Necessary cookies are always on. Analytics and marketing cookies only with your consent through the banner. You can change your choice anytime." },
      { h: "Your rights (GDPR)", p: "Access, rectification, erasure, restriction, portability, withdrawal of consent. Contact: sttonememory@gmail.com." },
      { h: "Retention", p: "Order data kept up to 3 years (tax). Analytics up to 14 months. Marketing up to 12 months or until consent withdrawn." },
      { h: "Contact", p: "Stone Memory, Kostopil, Rivne Oblast, Ukraine. Email: sttonememory@gmail.com. Phone: +380 67 808 02 22." },
    ],
  },
  de: {
    title: "Datenschutzerklärung",
    updated: "Aktualisiert",
    body: [
      { p: "Stone Memory respektiert Ihre Privatsphäre. Diese Richtlinie erklärt, wie wir personenbezogene Daten erheben, nutzen und speichern." },
      { h: "Was wir erheben", p: "Name, Telefon, E-Mail (bei Anfrage oder Chat-Nachricht), Geräteinformationen (IP, User-Agent) und Aktionen auf der Website (nur mit Zustimmung zur Analyse)." },
      { h: "Zweck", p: "Bearbeitung von Aufträgen, Kontakt, Verbesserung des Dienstes. Wir verkaufen KEINE Daten an Dritte." },
      { h: "Cookies", p: "Notwendige immer aktiv. Analyse und Marketing nur mit Ihrer Zustimmung. Wahl jederzeit änderbar." },
      { h: "Ihre Rechte (DSGVO)", p: "Auskunft, Berichtigung, Löschung, Einschränkung, Portabilität, Widerruf. Kontakt: sttonememory@gmail.com." },
      { h: "Speicherung", p: "Auftragsdaten bis 3 Jahre (Steuer). Analytics bis 14 Monate. Marketing bis 12 Monate oder Widerruf." },
      { h: "Kontakt", p: "Stone Memory, Kostopil, Oblast Riwne, Ukraine. E-Mail: sttonememory@gmail.com. Tel.: +380 67 808 02 22." },
    ],
  },
  lt: {
    title: "Privatumo politika",
    updated: "Atnaujinta",
    body: [
      { p: "Stone Memory gerbia jūsų privatumą. Ši politika paaiškina, kaip renkame, naudojame ir saugome asmens duomenis." },
      { h: "Ką renkame", p: "Vardas, telefonas, el. paštas (kai pateikiate užklausą arba rašote pokalbyje), įrenginio informacija (IP, User-Agent) ir veiksmai svetainėje (tik sutikus su analitika)." },
      { h: "Tikslas", p: "Užsakymų tvarkymas, kontaktas, paslaugos gerinimas. Neparduodame duomenų tretiesiems asmenims." },
      { h: "Slapukai", p: "Būtini visada aktyvūs. Analitiniai ir rinkodaros — tik jūsų sutikimu per baner. Pasirinkimą galite keisti bet kada." },
      { h: "Jūsų teisės (BDAR)", p: "Susipažinimas, ištaisymas, ištrynimas, apribojimas, perkeliamumas, sutikimo atšaukimas. Kontaktas: sttonememory@gmail.com." },
      { h: "Saugojimas", p: "Užsakymų duomenys iki 3 metų. Analitikos iki 14 mėn. Rinkodaros iki 12 mėn. arba atšaukus sutikimą." },
      { h: "Kontaktas", p: "Stone Memory, Kostopilis, Rivnės sritis, Ukraina. El. paštas: sttonememory@gmail.com. Tel.: +380 67 808 02 22." },
    ],
  },
}

export default function PrivacyPage() {
  const { locale } = useTranslation()
  const L = copy[locale] || copy.uk
  return (
    <>
      <Header />
      <main id="main-content">
        <article className="mx-auto max-w-3xl px-6 pt-12 pb-20 md:pt-16 md:pb-28">
          <h1 className="text-4xl font-semibold tracking-tight-custom md:text-5xl text-balance">{L.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {L.updated}: {new Date().toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <div className="mt-10 space-y-7">
            {L.body.map((block, i) => (
              <section key={i}>
                {block.h && <h2 className="text-xl font-semibold tracking-tight-custom md:text-2xl">{block.h}</h2>}
                <p className="mt-2 text-[16px] leading-relaxed text-foreground/85 md:text-[17px]">{block.p}</p>
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
