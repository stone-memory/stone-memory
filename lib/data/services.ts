import type { Locale } from "@/lib/types"

export type Service = {
  slug: string
  icon: "drafting" | "chisel" | "truck" | "sparkles" | "shield" | "landscape" | "engrave" | "palette"
  title: Record<Locale, string>
  shortDesc: Record<Locale, string>
  longDesc: Record<Locale, string>
  bullets: Record<Locale, string[]>
  image: string
}

const u = (id: string) => `https://images.unsplash.com/${id}?w=1600&h=1000&fit=crop&q=80`

export const services: Service[] = [
  {
    slug: "design",
    icon: "drafting",
    image: u("photo-1503602642458-232111445657"),
    title: {
      uk: "Дизайн і 3D-візуалізація",
      en: "Design & 3D visualisation",
      pl: "Projektowanie i wizualizacja 3D",
      de: "Entwurf & 3D-Visualisierung",
      lt: "Dizainas ir 3D vizualizacija",
    },
    shortDesc: {
      uk: "Індивідуальний ескіз і точна візуалізація до початку робіт.",
      en: "Custom sketch and precise visualisation before production.",
      pl: "Indywidualny szkic i precyzyjna wizualizacja przed produkcją.",
      de: "Individueller Entwurf und präzise Visualisierung vor der Fertigung.",
      lt: "Individualus eskizas ir tiksli vizualizacija prieš gamybą.",
    },
    longDesc: {
      uk: "Працюємо з вашими фото, ідеями та символами. Три варіанти ескізу, до п'яти ітерацій, фотореалістичний рендер у середовищі.",
      en: "We work from your references, ideas and symbols. Three sketch directions, up to five iterations, and a photoreal render in context.",
      pl: "Pracujemy z Twoimi zdjęciami, pomysłami i symbolami. Trzy kierunki szkicu, do pięciu iteracji, fotorealistyczny render.",
      de: "Wir arbeiten mit Ihren Vorlagen, Ideen und Symbolen. Drei Skizzenrichtungen, bis zu fünf Iterationen, fotorealistisches Rendering.",
      lt: "Dirbame pagal jūsų idėjas ir simbolius. Trys eskizų kryptys, iki penkių iteracijų, fotorealistinis renderis.",
    },
    bullets: {
      uk: ["Безкоштовна перша консультація", "Ескіз з розмірами", "Підбір каменю та фактури", "Макет до фотореалізму"],
      en: ["Free first consultation", "Sketch with dimensions", "Stone and finish matching", "Photoreal mock-up"],
      pl: ["Darmowa konsultacja", "Szkic z wymiarami", "Dobór kamienia", "Fotorealistyczny mock-up"],
      de: ["Kostenlose Erstberatung", "Entwurf mit Maßen", "Stein- und Oberflächenauswahl", "Fotorealistischer Mock-up"],
      lt: ["Nemokama pirmoji konsultacija", "Eskizas su matmenimis", "Akmens parinkimas", "Fotorealistinis maketas"],
    },
  },
  {
    slug: "engraving",
    icon: "engrave",
    image: u("photo-1533167649158-6d508895b680"),
    title: {
      uk: "Гравіювання та портрети",
      en: "Engraving & portraits",
      pl: "Grawerowanie i portrety",
      de: "Gravur und Porträts",
      lt: "Graviravimas ir portretai",
    },
    shortDesc: {
      uk: "Ручний різець і лазер. Портрет, епітафія, орнамент — з архівною точністю.",
      en: "Hand chisel and laser. Portrait, epitaph, ornament — rendered with archival precision.",
      pl: "Ręczne dłuto i laser. Portret, epitafium, ornament z archiwalną precyzją.",
      de: "Handmeißel und Laser. Porträt, Epitaph, Ornament — mit archivalischer Präzision.",
      lt: "Rankinis kirstukas ir lazeris. Portretas, epitafija, ornamentas — archyvinio tikslumo.",
    },
    longDesc: {
      uk: "Гравіюємо на чорному, сірому та кольоровому граніті. Портрет відновлюємо навіть з маленького фото за допомогою ретуші.",
      en: "We engrave on black, grey and coloured granite. Portraits are restored even from small photos with AI-assisted retouch.",
      pl: "Grawerujemy na czarnym, szarym i kolorowym granicie. Portrety odtwarzamy nawet z małych zdjęć.",
      de: "Wir gravieren auf schwarzem, grauem und farbigem Granit. Porträts werden auch aus kleinen Fotos restauriert.",
      lt: "Graviruojame ant juodo, pilko ir spalvoto granito. Portretai atkuriami net iš mažų nuotraukų.",
    },
    bullets: {
      uk: ["Ретуш і відновлення старих фото", "Ручна і лазерна техніка", "Епітафії 5+ мовами", "Позолота та сріблення літер"],
      en: ["Retouch and restoration of old photos", "Hand and laser techniques", "Epitaphs in 5+ languages", "Gilding and silvering of letters"],
      pl: ["Retusz i renowacja zdjęć", "Ręczne i laserowe techniki", "Epitafia w 5+ językach", "Złocenie i srebrzenie liter"],
      de: ["Retusche und Restaurierung alter Fotos", "Hand- und Lasertechnik", "Epitaphe in 5+ Sprachen", "Vergoldung und Versilberung"],
      lt: ["Senų nuotraukų retušavimas", "Rankinė ir lazerinė technika", "Epitafijos 5+ kalbomis", "Raidžių auksavimas ir sidabravimas"],
    },
  },
  {
    slug: "production",
    icon: "chisel",
    image: u("photo-1581092795442-6d4147b3c3b5"),
    title: {
      uk: "Виробництво і обробка",
      en: "Production & finishing",
      pl: "Produkcja i obróbka",
      de: "Fertigung & Veredelung",
      lt: "Gamyba ir apdaila",
    },
    shortDesc: {
      uk: "Повнокомплектне виробництво: різання, шліфування, полірування, фігурна обробка.",
      en: "Full production cycle: cutting, grinding, polishing, shaped edge work.",
      pl: "Pełny cykl produkcji: cięcie, szlifowanie, polerowanie, obróbka krawędzi.",
      de: "Vollständiger Produktionszyklus: Schneiden, Schleifen, Polieren, Kantenbearbeitung.",
      lt: "Visas gamybos ciklas: pjovimas, šlifavimas, poliravimas, kraštų apdaila.",
    },
    longDesc: {
      uk: "Власний цех у Києві. Високоточний CNC для складних форм, ручна обробка для унікальних проектів.",
      en: "Our own workshop. High-precision CNC for complex shapes, hand-finishing for signature projects.",
      pl: "Własny zakład. Precyzyjny CNC dla złożonych form, ręczna obróbka dla unikalnych projektów.",
      de: "Eigene Werkstatt. Hochpräzises CNC für komplexe Formen, Handveredelung für Signature-Projekte.",
      lt: "Nuosava dirbtuvė. Tikslus CNC sudėtingoms formoms, rankinė apdaila unikaliems projektams.",
    },
    bullets: {
      uk: ["Точне різання і підгонка", "Кілька типів полірування", "Рельєф і об'ємна різьба", "Багатоетапний контроль якості"],
      en: ["Precise cutting and shaping", "Multiple polishing grades", "Relief and sculpted carving", "Multi-stage quality control"],
      pl: ["Precyzyjne cięcie i dopasowanie", "Kilka stopni polerowania", "Płaskorzeźba i rzeźba", "Wieloetapowa kontrola jakości"],
      de: ["Präzises Zuschnitt und Anpassung", "Mehrere Polierstufen", "Relief und plastische Schnitzerei", "Mehrstufige Qualitätskontrolle"],
      lt: ["Tikslus pjovimas ir apdaila", "Keli poliravimo lygiai", "Reljefas ir tūrinė drožyba", "Daugiapakopė kokybės kontrolė"],
    },
  },
  {
    slug: "delivery",
    icon: "truck",
    image: u("photo-1565043666747-69f6646db940"),
    title: {
      uk: "Доставка і монтаж",
      en: "Delivery & installation",
      pl: "Dostawa i montaż",
      de: "Lieferung und Montage",
      lt: "Pristatymas ir montavimas",
    },
    shortDesc: {
      uk: "Доставка по ЄС і Україні. Монтаж бригадою з геодезистом.",
      en: "EU-wide delivery. Installation by a crew with a land surveyor.",
      pl: "Dostawa po UE i Ukrainie. Montaż z geodetą.",
      de: "EU-weite Lieferung. Montage mit Vermesser.",
      lt: "Pristatymas ES. Montavimas su geodezininku.",
    },
    longDesc: {
      uk: "Пакуємо в дерев'яні ящики, страхуємо. Монтаж на залізобетонну основу, нівелір, герметизація швів.",
      en: "Wooden-crate packaging, insurance included. Installed on reinforced base, levelled, joints sealed.",
      pl: "Skrzynie drewniane, ubezpieczenie. Montaż na fundamencie żelbetowym.",
      de: "Holzkistenverpackung, versichert. Montage auf Stahlbetonbasis.",
      lt: "Medinė tara, apdrausta. Montavimas ant gelžbetoninio pagrindo.",
    },
    bullets: {
      uk: ["Страхування 100%", "Монтаж за 1 день", "Фундамент із мороз­стійкого бетону", "Акт приймання-передачі"],
      en: ["100% insured transport", "1-day installation", "Frost-resistant foundation", "Signed hand-over protocol"],
      pl: ["100% ubezpieczenie", "Montaż w 1 dzień", "Fundament mrozoodporny", "Protokół odbioru"],
      de: ["100% Transportversicherung", "1-Tag-Montage", "Frostsicheres Fundament", "Übergabeprotokoll"],
      lt: ["100% apdrausta gabenimo", "Montavimas per 1 dieną", "Šalčiui atsparus pamatas", "Perdavimo aktas"],
    },
  },
  {
    slug: "care",
    icon: "sparkles",
    image: u("photo-1606744837616-56c9a5c6a6eb"),
    title: {
      uk: "Догляд і реставрація",
      en: "Care & restoration",
      pl: "Pielęgnacja i renowacja",
      de: "Pflege und Restaurierung",
      lt: "Priežiūra ir restauravimas",
    },
    shortDesc: {
      uk: "Чистка, повторна полірування, відновлення гравіювання, заміна елементів.",
      en: "Cleaning, re-polishing, engraving restoration, element replacement.",
      pl: "Czyszczenie, ponowne polerowanie, renowacja grawerunku.",
      de: "Reinigung, Nachpolitur, Restaurierung der Gravur.",
      lt: "Valymas, pakartotinis poliravimas, graviravimo atstatymas.",
    },
    longDesc: {
      uk: "Річне обслуговування, разові виїзди, відновлення після пошкоджень або вандалізму.",
      en: "Annual maintenance plans, one-off visits, restoration after damage or vandalism.",
      pl: "Plany serwisowe, wizyty jednorazowe, renowacja po uszkodzeniach.",
      de: "Jährliche Wartungspläne, Einzelbesuche, Restaurierung nach Schäden.",
      lt: "Metiniai priežiūros planai, vienkartiniai vizitai, restauravimas po pažeidimų.",
    },
    bullets: {
      uk: ["Екоформула без кислоти", "Гідрофобізація", "Реставрація позолоти", "Річний контракт — знижка 20%"],
      en: ["Acid-free eco formula", "Hydrophobic treatment", "Gilding restoration", "Annual contract — 20% off"],
      pl: ["Eko formuła bez kwasu", "Hydrofobizacja", "Renowacja złoceń", "Kontrakt roczny — −20%"],
      de: ["Säurefreie Öko-Formel", "Hydrophobierung", "Vergoldungsrestaurierung", "Jahresvertrag — −20%"],
      lt: ["Be rūgšties eko formulė", "Hidrofobizavimas", "Auksavimo atstatymas", "Metinis kontraktas — −20%"],
    },
  },
  {
    slug: "warranty",
    icon: "shield",
    image: u("photo-1505843490578-27b2d6f0ff24"),
    title: {
      uk: "Гарантія 5 років",
      en: "5-year guarantee",
      pl: "5-letnia gwarancja",
      de: "5 Jahre Garantie",
      lt: "5 metų garantija",
    },
    shortDesc: {
      uk: "5 років гарантії на все: фундамент, монтаж і камінь. Будь-який дефект — безкоштовне усунення.",
      en: "5-year warranty on everything: foundation, installation, and stone. Any defect — fixed free of charge.",
      pl: "5 lat gwarancji na wszystko: fundament, montaż i kamień. Każdy defekt — naprawa gratis.",
      de: "5 Jahre Garantie auf alles: Fundament, Montage und Stein. Jeder Defekt — kostenlos behoben.",
      lt: "5 metų garantija visam: pamatas, montavimas ir akmuo. Bet koks defektas — nemokamai pašalintas.",
    },
    longDesc: {
      uk: "Юридичний гарантійний сертифікат: 5 років гарантії на все — фундамент, монтажні роботи та камінь. Паспорт родовища з українського кар'єру. Страхування транспортування та монтажу.",
      en: "Legal warranty certificate: 5-year warranty on everything — foundation, installation and stone. Quarry passport from Ukrainian deposit. Transport and installation insured.",
      pl: "Prawny certyfikat gwarancji: 5 lat gwarancji na wszystko — fundament, montaż i kamień. Paszport złoża z ukraińskiego kamieniołomu. Ubezpieczenie transportu i montażu.",
      de: "Rechtsgarantie-Zertifikat: 5 Jahre Garantie auf alles — Fundament, Montage und Stein. Steinbruch-Pass aus ukrainischem Vorkommen. Transport und Montage versichert.",
      lt: "Teisinis garantijos sertifikatas: 5 metų garantija viskam — pamatui, montavimui ir akmeniui. Karjero pasas iš Ukrainos telkinio. Gabenimas ir montavimas apdrausti.",
    },
    bullets: {
      uk: ["Сертифікат гарантії", "Сертифікат походження", "Страхування об'єкта", "Гаряча лінія 24/7"],
      en: ["Warranty certificate", "Origin certificate", "Object insurance", "24/7 hotline"],
      pl: ["Certyfikat gwarancji", "Certyfikat pochodzenia", "Ubezpieczenie", "Infolinia 24/7"],
      de: ["Garantiezertifikat", "Herkunftszertifikat", "Objektversicherung", "24/7-Hotline"],
      lt: ["Garantijos sertifikatas", "Kilmės sertifikatas", "Objekto draudimas", "24/7 pagalbos linija"],
    },
  },
  {
    slug: "landscape",
    icon: "landscape",
    image: u("photo-1584967334362-26f31ae95b3f"),
    title: {
      uk: "Ландшафт і благоустрій",
      en: "Landscape & surroundings",
      pl: "Krajobraz i otoczenie",
      de: "Landschaft und Umgebung",
      lt: "Kraštovaizdis ir aplinka",
    },
    shortDesc: {
      uk: "Огорожа, доріжки, лави, декоративна засипка. Цілісний простір.",
      en: "Borders, paths, benches, decorative gravel. A complete space.",
      pl: "Obramowania, ścieżki, ławki, dekoracyjny żwir.",
      de: "Einfassungen, Wege, Bänke, dekorativer Kies.",
      lt: "Apvadai, takai, suoleliai, dekoratyvinis žvyras.",
    },
    longDesc: {
      uk: "Проектуємо ділянку як єдиний архітектурний твір. Каміння, озеленення, освітлення.",
      en: "We design the plot as a single architectural piece. Stone, planting, lighting.",
      pl: "Projektujemy działkę jako jedną kompozycję. Kamień, zieleń, oświetlenie.",
      de: "Wir entwerfen das Grundstück als Gesamtwerk. Stein, Pflanzen, Licht.",
      lt: "Projektuojame sklypą kaip vientisą architektūrinį kūrinį.",
    },
    bullets: {
      uk: ["Огорожі з граніту", "LED-підсвічування", "Декоративний щебінь", "Догляд за рослинами"],
      en: ["Granite borders", "LED lighting", "Decorative gravel", "Plant maintenance"],
      pl: ["Obramowania granitowe", "Oświetlenie LED", "Żwir dekoracyjny", "Pielęgnacja roślin"],
      de: ["Granit-Einfassungen", "LED-Beleuchtung", "Dekorativer Kies", "Pflanzenpflege"],
      lt: ["Granitiniai apvadai", "LED apšvietimas", "Dekoratyvinis žvyras", "Augalų priežiūra"],
    },
  },
  {
    slug: "interiors",
    icon: "palette",
    image: u("photo-1600566753104-685f4f24cb4d"),
    title: {
      uk: "Камінь в інтер'єрі",
      en: "Stone interiors",
      pl: "Kamień we wnętrzach",
      de: "Stein im Interieur",
      lt: "Akmuo interjere",
    },
    shortDesc: {
      uk: "Стільниці, підвіконня, каміни, підлога. Натуральний камінь у вашому домі.",
      en: "Countertops, sills, fireplaces, flooring. Natural stone in your home.",
      pl: "Blaty, parapety, kominki, podłogi.",
      de: "Arbeitsplatten, Fensterbänke, Kamine, Böden.",
      lt: "Stalviršiai, palangės, židiniai, grindys.",
    },
    longDesc: {
      uk: "Робимо преміальні стільниці з українського мармуру та граніту: Прилузький, Слов'янський, Покостівський, Головинське габро. Повний цикл: замір, виготовлення, монтаж.",
      en: "Premium countertops in Ukrainian marble and granite — Pryluzkyi, Slovianskyi, Pokostivskyi, Holovyne gabbro. Full cycle: measure, fabricate, install.",
      pl: "Premium blaty z ukraińskiego marmuru i granitu — Pryłuzki, Słowiański, Pokostiwski, gabro z Hołowyna. Pomiar, produkcja, montaż.",
      de: "Premium-Arbeitsplatten aus ukrainischem Marmor und Granit — Pryluzkyi, Slovianskyi, Pokostivskyi, Holovyne-Gabbro. Messen, fertigen, montieren.",
      lt: "Premium stalviršiai iš ukrainietiško marmuro ir granito — Pryluzkyi, Slovianskyi, Pokostivskyi, Holovynės gabbras. Matavimas, gamyba, montavimas.",
    },
    bullets: {
      uk: ["Український камінь із власного цеху", "Замір за 24 години", "Інтеграція мийок/плит", "Догляд-гайд у подарунок"],
      en: ["Ukrainian stone from our own workshop", "On-site measure in 24h", "Sink / hob integration", "Care guide included"],
      pl: ["Ukraiński kamień z własnego zakładu", "Pomiar w 24h", "Integracja zlewów i płyt", "Poradnik pielęgnacji"],
      de: ["Ukrainischer Stein aus eigener Werkstatt", "Aufmaß in 24h", "Becken- & Kochfeld-Integration", "Pflegeanleitung inklusive"],
      lt: ["Ukrainietiškas akmuo iš mūsų dirbtuvės", "Matavimas per 24 val.", "Kriauklės ir kaitlenčių integracija", "Priežiūros gidas"],
    },
  },
]

export function getService(slug: string) {
  return services.find((s) => s.slug === slug)
}
