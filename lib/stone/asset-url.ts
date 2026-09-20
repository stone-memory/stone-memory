import manifest from "./asset-manifest.json"

const versions = manifest as Record<string, string>

/**
 * Адреса статичного фото з версією за вмістом: `/materials/carpazi.webp`
 * → `/materials/carpazi.webp?v=ddab81db`.
 *
 * Файли в public/ кешуються браузером і CDN на 7 днів (next.config headers),
 * а оптимізовані копії з /_next/image — стільки ж. Поки адреса не змінюється,
 * заміна файлу лишається невидимою для тих, хто вже бачив стару версію: так
 * після заміни сірих заглушок на справжні фото каталог у відвідувачів ще
 * тиждень показував один і той самий сірий граніт. Хеш у query рве кеш рівно
 * тоді, коли змінився вміст. Manifest генерує scripts/asset-manifest.mjs
 * перед dev і build.
 *
 * Адреси поза манифестом (Supabase, зовнішні, невідомі файли) повертаються
 * як є.
 */
export function versioned(path: string): string {
  if (!path || !path.startsWith("/") || path.includes("?")) return path
  const v = versions[path]
  return v ? `${path}?v=${v}` : path
}

/**
 * Чи є таке фото в public/ (materials, collections, blog, stone). Замість
 * existsSync: звернення до диска за динамічним шляхом змушує Next пакувати всю
 * теку public/ у серверну функцію сторінки, а разом із копіями з public/_img
 * це понад ліміт Vercel у 250 МБ.
 */
export function hasAsset(path: string): boolean {
  return path.split("?")[0] in versions
}

export function versionedAll(paths: string[]): string[] {
  return paths.map(versioned)
}
