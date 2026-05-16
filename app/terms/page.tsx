"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useTranslation } from "@/lib/i18n/context"
import type { Locale } from "@/lib/types"

const copy: Record<Locale, { title: string; body: Array<{ h?: string; p: string }> }> = {
  uk: {
    title: "Умови використання",
    body: [
      { p: "Використовуючи сайт stonememory.com.ua, ви погоджуєтеся з цими умовами. Не погоджуєтеся — не користуйтеся сайтом." },
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
      { p: "Korzystając z witryny stonememory.com.ua, akceptujesz niniejsze warunki. Jeśli się nie zgadzasz — nie korzystaj z witryny." },
      { h: "Zamówienia", p: "Ceny podane na stronie są orientacyjne. Ostateczny koszt ustalany jest po potwierdzeniu materiałów, wymiarów i złożoności prac. Zastrzegamy sobie prawo do odmowy realizacji zamówienia." },
      { h: "Terminy i montaż", p: "Terminy mają charakter orientacyjny i mogą się zmieniać w zależności od sezonu, warunków pogodowych i kolejki w warsztacie. Montaż realizujemy na terenie Ukrainy i UE; warunki zewnętrzne (dostęp, pogoda) mogą wpłynąć na datę." },
      { h: "Gwarancja", p: "5 lat na fundament, montaż i kamień. Gwarancja nie obejmuje uszkodzeń mechanicznych, niedbałego użytkowania, klęsk żywiołowych i naturalnego zużycia." },
      { h: "Ograniczenie odpowiedzialności", p: "Nie odpowiadamy za szkody pośrednie, utratę zysków lub inne straty pośrednie. Maksymalna odpowiedzialność ograniczona jest do wartości zamówienia." },
      { h: "Własność intelektualna", p: "Wszystkie zdjęcia, teksty i logo są własnością Stone Memory. Kopiowanie bez zgody jest zabronione." },
      { h: "Zmiany", p: "Możemy aktualizować niniejsze warunki. Aktualna wersja zawsze dostępna na tej stronie." },
    ],
  },
  en: {
    title: "Terms of service",
    body: [
      { p: "By using stonememory.com.ua you agree to these terms. If you do not agree — please do not use the site." },
      { h: "Orders", p: "Prices on the site are indicative. The final cost is determined after confirming materials, dimensions and complexity. We reserve the right to refuse to fulfil an order." },
      { h: "Lead times & installation", p: "Lead times are indicative and may vary depending on season, weather and workshop queue. We install across Ukraine and the EU; external conditions (access, weather) may affect the date." },
      { h: "Warranty", p: "5 years on the foundation, installation and the stone itself. The warranty does not cover mechanical damage, careless handling, natural disasters or natural wear." },
      { h: "Limitation of liability", p: "We are not liable for indirect damages, lost profit or other consequential losses. Maximum liability is limited to the value of the order." },
      { h: "Intellectual property", p: "All images, texts and the logo are the property of Stone Memory. Copying without permission is prohibited." },
      { h: "Changes", p: "We may update these terms. The current version is always available on this page." },
    ],
  },
  de: {
    title: "Nutzungsbedingungen",
    body: [
      { p: "Mit der Nutzung der Website stonememory.com.ua akzeptieren Sie diese Bedingungen. Stimmen Sie nicht zu — bitte nutzen Sie die Website nicht." },
      { h: "Bestellungen", p: "Die auf der Website angegebenen Preise sind Richtwerte. Der Endpreis wird nach Klärung von Material, Maßen und Komplexität festgelegt. Wir behalten uns das Recht vor, einen Auftrag abzulehnen." },
      { h: "Lieferzeiten & Montage", p: "Lieferzeiten sind Richtwerte und können je nach Saison, Wetter und Werkstatt-Auslastung variieren. Montage erfolgt in der Ukraine und in der EU; äußere Bedingungen (Zugang, Wetter) können den Termin beeinflussen." },
      { h: "Gewährleistung", p: "5 Jahre auf Fundament, Montage und Stein. Die Gewährleistung deckt keine mechanischen Schäden, fahrlässige Handhabung, Naturkatastrophen oder natürlichen Verschleiß ab." },
      { h: "Haftungsbeschränkung", p: "Wir haften nicht für mittelbare Schäden, entgangenen Gewinn oder sonstige Folgeschäden. Die maximale Haftung ist auf den Auftragswert begrenzt." },
      { h: "Geistiges Eigentum", p: "Alle Bilder, Texte und das Logo sind Eigentum von Stone Memory. Kopieren ohne Zustimmung ist verboten." },
      { h: "Änderungen", p: "Wir können diese Bedingungen aktualisieren. Die aktuelle Fassung ist stets auf dieser Seite verfügbar." },
    ],
  },
  lt: {
    title: "Naudojimo sąlygos",
    body: [
      { p: "Naudodamiesi svetaine stonememory.com.ua, sutinkate su šiomis sąlygomis. Nesutinkate — nesinaudokite svetaine." },
      { h: "Užsakymai", p: "Svetainėje nurodytos kainos yra orientacinės. Galutinė kaina nustatoma patvirtinus medžiagas, matmenis ir darbų sudėtingumą. Pasiliekame teisę atsisakyti vykdyti užsakymą." },
      { h: "Terminai ir montavimas", p: "Terminai yra orientaciniai ir gali keistis priklausomai nuo sezono, oro sąlygų bei dirbtuvės eilės. Montuojame Ukrainoje ir ES; išorinės sąlygos (privažiavimas, oras) gali paveikti datą." },
      { h: "Garantija", p: "5 metai pamatui, montavimui ir akmeniui. Garantija neapima mechaninių pažeidimų, neatsargaus naudojimo, stichinių nelaimių ir natūralaus susidėvėjimo." },
      { h: "Atsakomybės ribojimas", p: "Neatsakome už netiesioginius nuostolius, prarastą pelną ar kitus netiesioginius praradimus. Maksimali atsakomybė — užsakymo vertė." },
      { h: "Intelektinė nuosavybė", p: "Visos nuotraukos, tekstai ir logotipas priklauso Stone Memory. Kopijuoti be leidimo draudžiama." },
      { h: "Pakeitimai", p: "Galime atnaujinti šias sąlygas. Aktuali versija visada prieinama šiame puslapyje." },
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
