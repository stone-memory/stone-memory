"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useTranslation } from "@/lib/i18n/context"
import { useFaqItems } from "@/lib/store/faq"
import type { Locale } from "@/lib/types"

const faqs: Record<Locale, { eyebrow: string; heading: string; items: { q: string; a: string }[] }> = {
  uk: {
    eyebrow: "FAQ",
    heading: "Часті запитання",
    items: [
      {
        q: "Який реальний термін виготовлення меморіального комплексу?",
        a: "Стандартний меморіальний комплекс готується 6-10 тижнів: 1 тиждень на ескіз та узгодження, 4-6 тижнів на виготовлення, 1-2 тижні на монтаж. Ексклюзивні проекти зі скульптурою можуть займати до 3-5 місяців.",
      },
      {
        q: "Чи надаєте ви офіційну юридичну гарантію?",
        a: "Так, кожен проект супроводжується юридично оформленим гарантійним сертифікатом. Ми надаємо 5 років гарантії на все — фундамент, монтаж і камінь. Усі матеріали мають сертифікати походження.",
      },
      {
        q: "Як правильно доглядати за полірованим гранітом?",
        a: "Поліроване каміння потребує мінімального догляду: достатньо раз на півроку протирати м'якою тканиною з теплою водою без абразивних засобів. Ми надаємо гайд з догляду та пропонуємо щорічне сервісне обслуговування.",
      },
      {
        q: "Чи можу я замовити пам'ятник дистанційно?",
        a: "Так. Працюємо з клієнтами по всьому світу. Після відеоконсультації надсилаємо детальний ескіз з розмірами і матеріалами, узгоджуємо онлайн і підписуємо договір дистанційно. Монтаж виконуємо по всій Україні та ЄС.",
      },
      {
        q: "Як формується вартість проекту?",
        a: "Ціна залежить від породи каменю, габаритів, складності різьблення та додаткових елементів (огорожа, плитка, лави). Базовий розрахунок надаємо безкоштовно протягом 24 годин після отримання технічного завдання.",
      },
    ],
  },
  pl: {
    eyebrow: "FAQ",
    heading: "Najczęściej zadawane pytania",
    items: [
      {
        q: "Jaki jest rzeczywisty czas realizacji kompleksu memorialnego?",
        a: "Standardowy kompleks memorialny powstaje w 6-10 tygodni: 1 tydzień na szkic i uzgodnienia, 4-6 tygodni produkcji, 1-2 tygodnie na montaż. Projekty ekskluzywne z rzeźbą mogą trwać 3-5 miesięcy.",
      },
      {
        q: "Czy udzielacie oficjalnej gwarancji prawnej?",
        a: "Tak, każdy projekt ma certyfikat gwarancji prawnej. Udzielamy 5 lat gwarancji na wszystko — fundament, montaż i kamień. Wszystkie materiały mają certyfikaty pochodzenia.",
      },
      {
        q: "Jak prawidłowo pielęgnować polerowany granit?",
        a: "Polerowany kamień wymaga minimalnej pielęgnacji: wystarczy co pół roku przetrzeć miękką szmatką z ciepłą wodą bez środków ściernych. Zapewniamy poradnik pielęgnacji i coroczny serwis.",
      },
      {
        q: "Czy mogę zamówić pomnik zdalnie?",
        a: "Tak. Pracujemy z klientami na całym świecie. Po konsultacji wideo wysyłamy szczegółowy szkic z wymiarami i materiałami, uzgadniamy online i podpisujemy umowę zdalnie.",
      },
      {
        q: "Jak ustalana jest cena projektu?",
        a: "Cena zależy od gatunku kamienia, wymiarów, złożoności rzeźbienia i elementów dodatkowych. Kalkulacja bazowa w ciągu 24 godzin — bezpłatnie.",
      },
    ],
  },
  en: {
    eyebrow: "FAQ",
    heading: "Frequently asked questions",
    items: [
      {
        q: "What's the realistic lead time for a memorial complex?",
        a: "A standard complex takes 6-10 weeks: 1 week for a sketch and approval, 4-6 weeks of production, 1-2 weeks for installation. Signature pieces with sculpture can run 3-5 months.",
      },
      {
        q: "Do you provide a legally binding warranty?",
        a: "Yes. Every project comes with a signed warranty certificate — 5 years on everything: foundation, installation and the stone itself. All materials ship with certificates of origin.",
      },
      {
        q: "How should I care for polished granite?",
        a: "Polished stone needs minimal care — a twice-yearly wipe with a soft cloth and warm water, no abrasives. We include a care guide and offer an annual maintenance plan.",
      },
      {
        q: "Can I order a monument remotely?",
        a: "Yes. We work with clients worldwide. After a video consultation we send a detailed sketch with dimensions and materials, confirm online, and sign the contract remotely. Installation is offered across Ukraine and the EU.",
      },
      {
        q: "How is the project price formed?",
        a: "Price depends on stone type, dimensions, carving complexity and extras (fencing, tiling, benches). We provide a free base estimate within 24 hours of receiving your brief.",
      },
    ],
  },
  de: {
    eyebrow: "FAQ",
    heading: "Häufig gestellte Fragen",
    items: [
      {
        q: "Wie lange dauert ein Grabmal-Projekt realistisch?",
        a: "Ein Standardkomplex braucht 6-10 Wochen: 1 Woche für Entwurf und Abstimmung, 4-6 Wochen Fertigung, 1-2 Wochen Montage. Signature-Projekte mit Skulptur können 3-5 Monate dauern.",
      },
      {
        q: "Gibt es eine rechtsverbindliche Garantie?",
        a: "Ja. Jedes Projekt wird mit einem Garantiezertifikat ausgeliefert — 5 Jahre auf alles: Fundament, Montage und den Stein. Alle Materialien mit Herkunftszertifikat.",
      },
      {
        q: "Wie pflege ich polierten Granit richtig?",
        a: "Polierter Stein braucht wenig Pflege — zweimal jährlich mit weichem Tuch und warmem Wasser abwischen, keine Scheuermittel. Pflegeanleitung und Jahresservice inklusive.",
      },
      {
        q: "Kann ich ein Denkmal aus der Ferne bestellen?",
        a: "Ja. Wir arbeiten mit Kunden weltweit. Nach einer Videoberatung senden wir einen detaillierten Entwurf mit Maßen und Materialien, stimmen online ab und unterzeichnen den Vertrag remote.",
      },
      {
        q: "Wie setzt sich der Preis zusammen?",
        a: "Der Preis hängt ab von Steinsorte, Maßen, Gravur-Aufwand und Extras (Einfassung, Platten, Bänke). Kostenloses Basisangebot innerhalb von 24 Stunden.",
      },
    ],
  },
  lt: {
    eyebrow: "DUK",
    heading: "Dažniausiai užduodami klausimai",
    items: [
      {
        q: "Koks realus memorialinio komplekso gamybos terminas?",
        a: "Standartinis kompleksas gaminamas 6-10 savaičių: 1 savaitė eskizui ir derinimui, 4-6 savaitės gamybai, 1-2 savaitės montavimui. Išskirtiniai projektai su skulptūra — iki 3-5 mėnesių.",
      },
      {
        q: "Ar suteikiate oficialią teisinę garantiją?",
        a: "Taip. Kiekvienas projektas lydimas teisiškai įforminto garantijos sertifikato — 5 metų garantija viskam: pamatui, montavimui ir pačiam akmeniui. Visos medžiagos su kilmės sertifikatais.",
      },
      {
        q: "Kaip prižiūrėti poliruotą granitą?",
        a: "Poliruotas akmuo reikalauja minimalios priežiūros — du kartus per metus nuvalyti minkšta šluoste su šiltu vandeniu, be abrazyvų. Pridedame priežiūros gidą ir metinę aptarnavimo paslaugą.",
      },
      {
        q: "Ar galiu užsisakyti paminklą nuotoliniu būdu?",
        a: "Taip. Dirbame su klientais visame pasaulyje. Po vaizdo konsultacijos siunčiame detalų eskizą su matmenimis ir medžiagomis, derinamės internetu ir pasirašome sutartį nuotoliniu būdu.",
      },
      {
        q: "Kaip formuojama projekto kaina?",
        a: "Kaina priklauso nuo akmens rūšies, matmenų, drožybos sudėtingumo ir papildomų elementų. Bazinis skaičiavimas — per 24 valandas, nemokamai.",
      },
    ],
  },
}

export function FaqSection() {
  const { locale } = useTranslation()
  const L = faqs[locale]
  const storeItems = useFaqItems()

  return (
    <section id="faq" className="bg-secondary/50 py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-8 text-center md:mb-10">
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            {L.eyebrow}
          </span>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
            {L.heading}
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {storeItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="rounded-2xl bg-card px-6 ring-1 ring-black/[0.06] shadow-soft border-b-0"
              >
                <AccordionTrigger className="py-5 text-base font-semibold tracking-tight-custom hover:no-underline md:text-lg">
                  {item.q[locale] || item.q.uk}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground md:text-base">
                  {item.a[locale] || item.a.uk}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
