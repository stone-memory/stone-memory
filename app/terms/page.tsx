"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useTranslation } from "@/lib/i18n/context"
import type { Locale } from "@/lib/types"

const copy: Record<Locale, { title: string; body: Array<{ h?: string; p: string }> }> = {
  uk: {
    title: "Умови використання",
    body: [
      { p: "Використовуючи сайт stonememory.com, ви погоджуєтеся з цими умовами. Не погоджуєтеся — не користуйтеся сайтом." },
      { h: "Замовлення", p: "Ціни, вказані на сайті, є попередніми. Остаточна вартість визначається після уточнення матеріалів, габаритів і складності робіт. Ми лишаємо за собою право відмовити у виконанні замовлення." },
      { h: "Терміни та монтаж", p: "Терміни вказуються орієнтовно і можуть змінюватися залежно від сезону, погодних умов та черги в цеху. Монтаж виконуємо територією України та ЄС; зовнішні умови (доступ, погода) можуть вплинути на дату." },
      { h: "Гарантія", p: "5 років на фундамент, монтаж і камінь. Гарантія не покриває механічні пошкодження, недбале поводження, стихійні лиха і природний знос." },
      { h: "Обмеження відповідальності", p: "Ми не несемо відповідальності за непрямі збитки, втрату прибутку чи інші непрямі втрати. Максимальна відповідальність обмежена сумою замовлення." },
      { h: "Інтелектуальна власність", p: "Усі зображення, тексти, логотип — власність Stone Memory. Копіювання без дозволу заборонено." },
      { h: "Зміни", p: "Ми можемо оновлювати ці умови. Актуальна версія завжди доступна на цій сторінці." },
    ],
  },
  pl: {
    title: "Warunki korzystania",
    body: [
      { p: "Korzystając z witryny, akceptujesz niniejsze warunki." },
      { h: "Zamówienia", p: "Ceny na stronie są orientacyjne. Ostateczna cena po uzgodnieniu materiałów i wymiarów." },
      { h: "Terminy i montaż", p: "Terminy orientacyjne. Montaż na terenie Ukrainy i UE." },
      { h: "Gwarancja", p: "5 lat na fundament, montaż i kamień." },
      { h: "Odpowiedzialność", p: "Nie odpowiadamy za szkody pośrednie. Maksymalna odpowiedzialność — wartość zamówienia." },
      { h: "Własność intelektualna", p: "Wszystkie materiały należą do Stone Memory." },
    ],
  },
  en: {
    title: "Terms of service",
    body: [
      { p: "By using this site you agree to these terms." },
      { h: "Orders", p: "Prices on the site are indicative. Final cost after confirming materials, size and complexity." },
      { h: "Lead times", p: "Indicative only. Installation across Ukraine and EU." },
      { h: "Warranty", p: "5 years on foundation, installation and the stone itself." },
      { h: "Liability", p: "We are not liable for indirect damages. Maximum liability limited to the order value." },
      { h: "IP", p: "All images, texts and the logo belong to Stone Memory." },
    ],
  },
  de: {
    title: "Nutzungsbedingungen",
    body: [
      { p: "Mit der Nutzung dieser Website akzeptieren Sie diese Bedingungen." },
      { h: "Bestellungen", p: "Preise sind Richtwerte. Endpreis nach Klärung von Material, Maßen und Komplexität." },
      { h: "Lieferzeiten", p: "Nur Richtwerte. Montage in der Ukraine und EU." },
      { h: "Gewährleistung", p: "5 Jahre auf Fundament, Montage und Stein." },
      { h: "Haftung", p: "Keine Haftung für mittelbare Schäden. Maximale Haftung auf Auftragswert begrenzt." },
      { h: "Geistiges Eigentum", p: "Alle Bilder, Texte und das Logo gehören Stone Memory." },
    ],
  },
  lt: {
    title: "Naudojimo sąlygos",
    body: [
      { p: "Naudodamiesi šia svetaine sutinkate su sąlygomis." },
      { h: "Užsakymai", p: "Kainos orientacinės. Galutinė kaina po medžiagų ir matmenų patvirtinimo." },
      { h: "Terminai", p: "Orientaciniai. Montavimas Ukrainoje ir ES." },
      { h: "Garantija", p: "5 metai pamatui, montavimui ir akmeniui." },
      { h: "Atsakomybė", p: "Neatsakome už netiesioginius nuostolius. Maksimali atsakomybė — užsakymo vertė." },
      { h: "Intelektinė nuosavybė", p: "Visos medžiagos priklauso Stone Memory." },
    ],
  },
}

export default function TermsPage() {
  const { locale } = useTranslation()
  const L = copy[locale] || copy.uk
  return (
    <>
      <Header />
      <main id="main-content">
        <article className="mx-auto max-w-3xl px-6 pt-12 pb-20 md:pt-16 md:pb-28">
          <h1 className="text-4xl font-semibold tracking-tight-custom md:text-5xl text-balance">{L.title}</h1>
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
