import type { Locale } from "@/lib/types"

/** Тексти сторінки каталогу пам'ятників (components/catalog-page.tsx, catalog-index.tsx). */
export type CatalogCopy = {
  crumb: string
  rootHeading: string
  rootIntro: string
  /** Коротший вступ під сіткою для інших мов: довгий SEO-текст лишається лише українською. */
  rootText: string
  facts: { models: string; singleFrom: string; singleLead: string; warranty: string; from: string }
  collections: { other: string; all: string; allMonuments: string }
  delivery: { heading: string; text: string; cityPill: (city: string) => string; terms: string; prices: string }
  notFound: { heading: string; text: string; button: string }
  index: string
}

const uk: CatalogCopy = {
  crumb: "Каталог",
  rootHeading: "Пам'ятники з граніту від виробника",
  rootIntro:
    "Одиночні стели, подвійні пам'ятники, хрести й меморіальні комплекси з граніту, габро й лабрадориту. Кожна модель виготовляється в нашому цеху в Костополі під розмір ділянки; ціна «від» — за базову комплектацію з фундаментом і монтажем.",
  rootText:
    "У каталозі сім типів виробів: одинарні й подвійні пам'ятники, європейські з низькою стелою на плиті, гранітні хрести, дитячі, військові та меморіальні комплекси з облицюванням усієї ділянки. Усе виготовляється в цеху в Костополі з українського каменю: чорне габро, лабрадорит із синіми переливами, сірий покостівський, червоні лезниківський і капустинський, зелений дідковицький граніт і білий мармур.\n\nЦіна «від» у картці — за базову комплектацію того, що на фото: стела, тумба, квітник або плита, портрет і напис, фундамент і монтаж. Розмір під вашу ділянку, інший камінь або додаткові елементи рахуємо окремо — у картці кожного виробу є перелік того, що входить у вартість і від чого вона змінюється.\n\nБудь-яку модель можна виконати в іншому камені з довідника: у картці є селектор, який одразу перераховує ціну. Якщо потрібне поєднання двох кольорів або форма, якої в каталозі немає, — опишіть її, майстер зробить ескіз.",
  facts: { models: "моделей у каталозі", singleFrom: "за одинарний пам'ятник", singleLead: "виготовлення одиночного", warranty: "гарантії на камінь і монтаж", from: "від" },
  collections: { other: "Інші підбірки", all: "Підбірки пам'ятників", allMonuments: "Усі пам'ятники" },
  delivery: {
    heading: "Доставка й монтаж",
    text: "Виїзд на замір і монтаж у Рівненській та Волинській областях безкоштовний. Інші регіони — за пробігом.",
    cityPill: (city) => `Пам'ятники ${city}`,
    terms: "Умови доставки й оплати",
    prices: "Ціни",
  },
  notFound: {
    heading: "Не знайшли свою модель?",
    text: "Надішліть фото ділянки або ескіз, який бачили деінде, — зробимо 3D-проєкт і порахуємо вартість у будь-якому з наших каменів.",
    button: "Надіслати фото або ескіз",
  },
  index: "Усі моделі",
}

const pl: CatalogCopy = {
  crumb: "Katalog",
  rootHeading: "Pomniki granitowe od producenta",
  rootIntro:
    "Stele pojedyncze, pomniki podwójne, krzyże i kompleksy nagrobne z granitu, gabro i labradorytu. Każdy model wykonujemy w naszym zakładzie w Kostopolu na wymiar miejsca; cena „od” obejmuje wersję podstawową z fundamentem i montażem.",
  rootText:
    "W katalogu jest siedem typów wyrobów: pomniki pojedyncze i podwójne, europejskie z niską stelą na płycie, krzyże granitowe, dziecięce, wojskowe i kompleksy z obłożeniem całego miejsca. Wszystko powstaje w zakładzie w Kostopolu z ukraińskiego kamienia: czarne gabro, labradoryt z niebieskimi refleksami, szary pokostiwski, czerwone leznykiwski i kapustyński, zielony didkowicki granit oraz biały marmur.\n\nCena „od” na karcie dotyczy wersji podstawowej tego, co na zdjęciu: stela, podstawa, kwietnik lub płyta, portret i napis, fundament i montaż. Wymiar pod Twoje miejsce, inny kamień lub dodatkowe elementy liczymy osobno.\n\nKażdy model można wykonać w innym kamieniu z katalogu: na karcie jest selektor, który od razu przelicza cenę. Jeśli potrzebne jest połączenie dwóch kolorów lub kształt, którego nie ma w katalogu — opisz go, mistrz przygotuje szkic.",
  facts: { models: "modeli w katalogu", singleFrom: "za pomnik pojedynczy", singleLead: "wykonanie pojedynczego", warranty: "gwarancji na kamień i montaż", from: "od" },
  collections: { other: "Inne kolekcje", all: "Kolekcje pomników", allMonuments: "Wszystkie pomniki" },
  delivery: {
    heading: "Dostawa i montaż",
    text: "Dojazd na pomiar i montaż w obwodach rówieńskim i wołyńskim jest bezpłatny. Inne regiony — według kilometrów.",
    cityPill: (city) => `Pomniki — ${city}`,
    terms: "Warunki dostawy i płatności",
    prices: "Ceny",
  },
  notFound: {
    heading: "Nie znalazłeś swojego modelu?",
    text: "Wyślij zdjęcie miejsca lub szkic, który widziałeś gdzie indziej — zrobimy projekt 3D i wyliczymy cenę w dowolnym z naszych kamieni.",
    button: "Wyślij zdjęcie lub szkic",
  },
  index: "Wszystkie modele",
}

const en: CatalogCopy = {
  crumb: "Catalogue",
  rootHeading: "Granite monuments from the manufacturer",
  rootIntro:
    "Single steles, double monuments, crosses and memorial complexes in granite, gabbro and labradorite. Every model is made in our workshop in Kostopil to the size of the plot; the “from” price covers the base configuration with foundation and installation.",
  rootText:
    "The catalogue has seven product types: single and double monuments, European-style with a low stele on a slab, granite crosses, children's and military monuments, and memorial complexes with full plot cladding. Everything is made in our Kostopil workshop from Ukrainian stone: black gabbro, labradorite with blue iridescence, grey Pokostivka, red Leznyky and Kapustyne, green Didkovychi granite and white marble.\n\nThe “from” price on a card covers the base configuration of what is pictured: stele, base, flower bed or slab, portrait and inscription, foundation and installation. Sizing to your plot, a different stone or extra elements are priced separately.\n\nAny model can be made in another stone from our guide: the product page has a selector that recalculates the price instantly. If you need a two-colour combination or a shape not in the catalogue, describe it and the craftsman will draw a sketch.",
  facts: { models: "models in the catalogue", singleFrom: "for a single monument", singleLead: "single monument lead time", warranty: "warranty on stone and installation", from: "from" },
  collections: { other: "Other collections", all: "Monument collections", allMonuments: "All monuments" },
  delivery: {
    heading: "Delivery and installation",
    text: "Travel for measurement and installation in the Rivne and Volyn regions is free. Other regions — by mileage.",
    cityPill: (city) => `Monuments in ${city}`,
    terms: "Delivery and payment terms",
    prices: "Prices",
  },
  notFound: {
    heading: "Can't find your model?",
    text: "Send a photo of the plot or a sketch you saw elsewhere — we'll make a 3D design and price it in any of our stones.",
    button: "Send a photo or sketch",
  },
  index: "All models",
}

const de: CatalogCopy = {
  crumb: "Katalog",
  rootHeading: "Grabmale aus Granit vom Hersteller",
  rootIntro:
    "Einzelstelen, Doppelgrabmale, Kreuze und Grabanlagen aus Granit, Gabbro und Labradorit. Jedes Modell wird in unserer Werkstatt in Kostopil auf die Maße der Grabstelle gefertigt; der „ab“-Preis gilt für die Grundausführung mit Fundament und Montage.",
  rootText:
    "Der Katalog umfasst sieben Produkttypen: Einzel- und Doppelgrabmale, europäische mit niedriger Stele auf Platte, Granitkreuze, Kinder- und Soldatengrabmale sowie Grabanlagen mit vollständiger Verkleidung der Grabstelle. Alles wird in der Werkstatt in Kostopil aus ukrainischem Stein gefertigt: schwarzer Gabbro, Labradorit mit blauem Schimmer, grauer Pokostivka-, roter Leznyky- und Kapustyne-, grüner Didkovychi-Granit und weißer Marmor.\n\nDer „ab“-Preis auf der Karte gilt für die Grundausführung des Abgebildeten: Stele, Sockel, Blumenbeet oder Platte, Porträt und Inschrift, Fundament und Montage. Maßanpassung, ein anderer Stein oder Zusatzelemente werden separat berechnet.\n\nJedes Modell kann in einem anderen Stein aus unserem Verzeichnis gefertigt werden: Auf der Produktseite gibt es einen Selektor, der den Preis sofort neu berechnet. Wünschen Sie eine Kombination zweier Farben oder eine Form, die nicht im Katalog ist, beschreiben Sie sie — der Meister fertigt eine Skizze.",
  facts: { models: "Modelle im Katalog", singleFrom: "für ein Einzelgrabmal", singleLead: "Fertigung Einzelgrabmal", warranty: "Garantie auf Stein und Montage", from: "ab" },
  collections: { other: "Weitere Kollektionen", all: "Grabmal-Kollektionen", allMonuments: "Alle Grabmale" },
  delivery: {
    heading: "Lieferung und Montage",
    text: "Anfahrt für Aufmaß und Montage in den Regionen Riwne und Wolhynien ist kostenlos. Andere Regionen — nach Kilometern.",
    cityPill: (city) => `Grabmale in ${city}`,
    terms: "Liefer- und Zahlungsbedingungen",
    prices: "Preise",
  },
  notFound: {
    heading: "Ihr Modell nicht gefunden?",
    text: "Senden Sie ein Foto der Grabstelle oder eine Skizze, die Sie anderswo gesehen haben — wir erstellen einen 3D-Entwurf und kalkulieren den Preis in jedem unserer Steine.",
    button: "Foto oder Skizze senden",
  },
  index: "Alle Modelle",
}

const lt: CatalogCopy = {
  crumb: "Katalogas",
  rootHeading: "Granito paminklai iš gamintojo",
  rootIntro:
    "Vienvietės stelos, dviviečiai paminklai, kryžiai ir memorialiniai kompleksai iš granito, gabro ir labradorito. Kiekvienas modelis gaminamas mūsų ceche Kostopilyje pagal kapavietės matmenis; kaina „nuo“ — už bazinę komplektaciją su pamatu ir montavimu.",
  rootText:
    "Kataloge — septyni gaminių tipai: vienviečiai ir dviviečiai paminklai, europietiški su žema stela ant plokštės, granito kryžiai, vaikų, kariniai ir memorialiniai kompleksai su visos kapavietės apdaila. Viskas gaminama ceche Kostopilyje iš ukrainietiško akmens: juodas gabras, labradoritas su mėlynais atspindžiais, pilkas Pokostivkos, raudoni Leznykų ir Kapustynės, žalias Didkovyčių granitas ir baltas marmuras.\n\nKaina „nuo“ kortelėje — už bazinę komplektaciją to, kas nuotraukoje: stela, postamentas, gėlynas arba plokštė, portretas ir užrašas, pamatas ir montavimas. Matmenys pagal jūsų kapavietę, kitas akmuo ar papildomi elementai skaičiuojami atskirai.\n\nBet kurį modelį galima pagaminti iš kito akmens iš mūsų žinyno: gaminio puslapyje yra pasirinkimas, kuris iš karto perskaičiuoja kainą. Jei reikia dviejų spalvų derinio ar formos, kurios kataloge nėra — aprašykite, meistras padarys eskizą.",
  facts: { models: "modelių kataloge", singleFrom: "už vienvietį paminklą", singleLead: "vienviečio gamyba", warranty: "garantija akmeniui ir montavimui", from: "nuo" },
  collections: { other: "Kitos kolekcijos", all: "Paminklų kolekcijos", allMonuments: "Visi paminklai" },
  delivery: {
    heading: "Pristatymas ir montavimas",
    text: "Atvykimas išmatuoti ir montuoti Rivnės ir Voluinės srityse nemokamas. Kiti regionai — pagal kilometražą.",
    cityPill: (city) => `Paminklai — ${city}`,
    terms: "Pristatymo ir apmokėjimo sąlygos",
    prices: "Kainos",
  },
  notFound: {
    heading: "Neradote savo modelio?",
    text: "Atsiųskite kapavietės nuotrauką arba kitur matytą eskizą — padarysime 3D projektą ir apskaičiuosime kainą iš bet kurio mūsų akmens.",
    button: "Atsiųsti nuotrauką ar eskizą",
  },
  index: "Visi modeliai",
}

export const CATALOG_COPY: Record<Locale, CatalogCopy> = { uk, pl, en, de, lt }
