import type { Locale } from "@/lib/types"

/** Тексти сторінки товару: селектор каменю та дрібні підписи (stone-detail-client, material-picker). */
export type ProductCopy = {
  copied: string
  linkCopied: string
  photoN: (n: number) => string
  stoneLabel: string
  picker: {
    heading: string
    compare: string
    keep: string
    choose: string
    inPhoto: string
    customLabel: string
    customPriceNote: string
    chooseOther: string
    inspect: string
    inspectAria: (name: string) => string
    surfaceAlt: (name: string) => string
    note: (defaultName: string, total: number) => string
    priceApprox: string
    customSummary: string
    customHint: string
    customPlaceholder: string
    dialogTitle: string
    dialogLead: (total: number) => string
    close: string
    thisModelInStone: string
    sameForHome: string
    gridAria: string
  }
}

const uk: ProductCopy = {
  copied: "Скопійовано",
  linkCopied: "Посилання скопійовано",
  photoN: (n) => `фото ${n}`,
  stoneLabel: "Камінь",
  picker: {
    heading: "Камінь",
    compare: "Чим відрізняються камені",
    keep: "Залишити",
    choose: "Обрати цей камінь",
    inPhoto: "на фото",
    customLabel: "Свій варіант",
    customPriceNote: "Ціну порахує майстер після заміру",
    chooseOther: "Обрати інший камінь",
    inspect: "Роздивитись",
    inspectAria: (name) => `Роздивитись камінь ${name}`,
    surfaceAlt: (name) => `Поверхня каменю: ${name}`,
    note: (name, total) => `Основний камінь на фотографії — ${name.toLowerCase()}. Модель виконуємо в будь-якому з ${total} каменів довідника; контрастні елементи майстер добирає під обраний.`,
    priceApprox: " Ціна орієнтовна: камінь — частина вартості, решта це обробка, фундамент і монтаж.",
    customSummary: "Свій варіант",
    customHint: "Інший камінь, поєднання двох кольорів або зразок, який ви бачили. Опишіть — майстер прорахує окремо.",
    customPlaceholder: "Напр.: чорна стела, основа з червоного лезниківського",
    dialogTitle: "Оберіть камінь",
    dialogLead: (total) => `${total} каменів. Натисніть на зразок, щоб роздивитись, і підтвердіть вибір.`,
    close: "Закрити",
    thisModelInStone: "ця модель у цьому камені",
    sameForHome: "Той самий камінь для дому",
    gridAria: "Камінь",
  },
}

const pl: ProductCopy = {
  copied: "Skopiowano",
  linkCopied: "Link skopiowany",
  photoN: (n) => `zdjęcie ${n}`,
  stoneLabel: "Kamień",
  picker: {
    heading: "Kamień",
    compare: "Czym różnią się kamienie",
    keep: "Zostaw",
    choose: "Wybierz ten kamień",
    inPhoto: "na zdjęciu",
    customLabel: "Własny wariant",
    customPriceNote: "Cenę wyliczy mistrz po pomiarze",
    chooseOther: "Wybierz inny kamień",
    inspect: "Przyjrzyj się",
    inspectAria: (name) => `Przyjrzyj się kamieniowi ${name}`,
    surfaceAlt: (name) => `Powierzchnia kamienia: ${name}`,
    note: (name, total) => `Główny kamień na zdjęciu — ${name}. Model wykonujemy w dowolnym z ${total} kamieni z katalogu; elementy kontrastowe mistrz dobiera do wybranego.`,
    priceApprox: " Cena orientacyjna: kamień to część kosztu, resztę stanowi obróbka, fundament i montaż.",
    customSummary: "Własny wariant",
    customHint: "Inny kamień, połączenie dwóch kolorów lub wzór, który widziałeś. Opisz — mistrz wyliczy osobno.",
    customPlaceholder: "Np.: czarna stela, podstawa z czerwonego granitu",
    dialogTitle: "Wybierz kamień",
    dialogLead: (total) => `${total} kamieni. Kliknij próbkę, aby się przyjrzeć, i potwierdź wybór.`,
    close: "Zamknij",
    thisModelInStone: "ten model w tym kamieniu",
    sameForHome: "Ten sam kamień do domu",
    gridAria: "Kamień",
  },
}

const en: ProductCopy = {
  copied: "Copied",
  linkCopied: "Link copied",
  photoN: (n) => `photo ${n}`,
  stoneLabel: "Stone",
  picker: {
    heading: "Stone",
    compare: "How the stones differ",
    keep: "Keep",
    choose: "Choose this stone",
    inPhoto: "in photo",
    customLabel: "Custom option",
    customPriceNote: "The craftsman will price it after measurement",
    chooseOther: "Choose another stone",
    inspect: "Inspect",
    inspectAria: (name) => `Inspect the stone ${name}`,
    surfaceAlt: (name) => `Stone surface: ${name}`,
    note: (name, total) => `The main stone in the photo is ${name}. The model can be made in any of the ${total} stones in our guide; contrasting elements are matched by the craftsman.`,
    priceApprox: " Approximate price: the stone is only part of the cost, the rest is work, foundation and installation.",
    customSummary: "Custom option",
    customHint: "A different stone, a two-colour combination or a sample you have seen. Describe it and the craftsman will price it separately.",
    customPlaceholder: "E.g.: black stele, base in red granite",
    dialogTitle: "Choose a stone",
    dialogLead: (total) => `${total} stones. Tap a sample to inspect it, then confirm your choice.`,
    close: "Close",
    thisModelInStone: "this model in this stone",
    sameForHome: "The same stone for the home",
    gridAria: "Stone",
  },
}

const de: ProductCopy = {
  copied: "Kopiert",
  linkCopied: "Link kopiert",
  photoN: (n) => `Foto ${n}`,
  stoneLabel: "Stein",
  picker: {
    heading: "Stein",
    compare: "Worin sich die Steine unterscheiden",
    keep: "Behalten",
    choose: "Diesen Stein wählen",
    inPhoto: "im Foto",
    customLabel: "Eigene Variante",
    customPriceNote: "Den Preis kalkuliert der Meister nach dem Aufmaß",
    chooseOther: "Anderen Stein wählen",
    inspect: "Ansehen",
    inspectAria: (name) => `Stein ${name} ansehen`,
    surfaceAlt: (name) => `Steinoberfläche: ${name}`,
    note: (name, total) => `Der Hauptstein im Foto ist ${name}. Das Modell fertigen wir in jedem der ${total} Steine aus unserem Verzeichnis; Kontrastelemente stimmt der Meister auf den gewählten Stein ab.`,
    priceApprox: " Richtpreis: Der Stein ist nur ein Teil der Kosten, der Rest sind Bearbeitung, Fundament und Montage.",
    customSummary: "Eigene Variante",
    customHint: "Ein anderer Stein, eine Kombination zweier Farben oder ein Muster, das Sie gesehen haben. Beschreiben Sie es — der Meister kalkuliert separat.",
    customPlaceholder: "Z. B.: schwarze Stele, Sockel aus rotem Granit",
    dialogTitle: "Stein wählen",
    dialogLead: (total) => `${total} Steine. Tippen Sie auf ein Muster, um es anzusehen, und bestätigen Sie die Wahl.`,
    close: "Schließen",
    thisModelInStone: "dieses Modell in diesem Stein",
    sameForHome: "Derselbe Stein fürs Haus",
    gridAria: "Stein",
  },
}

const lt: ProductCopy = {
  copied: "Nukopijuota",
  linkCopied: "Nuoroda nukopijuota",
  photoN: (n) => `nuotrauka ${n}`,
  stoneLabel: "Akmuo",
  picker: {
    heading: "Akmuo",
    compare: "Kuo skiriasi akmenys",
    keep: "Palikti",
    choose: "Pasirinkti šį akmenį",
    inPhoto: "nuotraukoje",
    customLabel: "Savas variantas",
    customPriceNote: "Kainą apskaičiuos meistras po išmatavimo",
    chooseOther: "Pasirinkti kitą akmenį",
    inspect: "Apžiūrėti",
    inspectAria: (name) => `Apžiūrėti akmenį ${name}`,
    surfaceAlt: (name) => `Akmens paviršius: ${name}`,
    note: (name, total) => `Pagrindinis akmuo nuotraukoje — ${name}. Modelį gaminame iš bet kurio iš ${total} žinyno akmenų; kontrastinius elementus meistras parenka pagal pasirinktą.`,
    priceApprox: " Kaina orientacinė: akmuo — tik dalis kainos, likusi dalis — apdirbimas, pamatas ir montavimas.",
    customSummary: "Savas variantas",
    customHint: "Kitas akmuo, dviejų spalvų derinys ar matytas pavyzdys. Aprašykite — meistras apskaičiuos atskirai.",
    customPlaceholder: "Pvz.: juoda stela, pagrindas iš raudono granito",
    dialogTitle: "Pasirinkite akmenį",
    dialogLead: (total) => `${total} akmenys. Spustelėkite pavyzdį, kad apžiūrėtumėte, ir patvirtinkite pasirinkimą.`,
    close: "Uždaryti",
    thisModelInStone: "šis modelis iš šio akmens",
    sameForHome: "Tas pats akmuo namams",
    gridAria: "Akmuo",
  },
}

export const PRODUCT_COPY: Record<Locale, ProductCopy> = { uk, pl, en, de, lt }
