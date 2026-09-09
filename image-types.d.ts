// next-env.d.ts генерується збіркою і не потрапляє в git, тому на CI
// `tsc --noEmit` не бачить типів для статичних імпортів картинок
// (lib/stone-guide.ts імпортує свотчі з public/). Цей файл закриває прогалину.
/// <reference types="next/image-types/global" />
