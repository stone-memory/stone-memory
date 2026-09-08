/**
 * Розділ «Архітектурний камінь» — стільниці, підвіконня, сходи, каміни,
 * фасади, бруківка, сляби, ландшафтний камінь. Живе на /kamin у тому самому
 * застосунку, що й памʼятники: спільний домен, спільна адмінка, спільна база.
 *
 * Контент в адмінці зберігає шляхи в межах розділу («/kalkulyator»,
 * «/materialy/granit»), тому перед рендером їх треба провести через
 * stoneHref(): так редактор не мусить памʼятати про префікс, а зміна
 * адреси розділу лишається зміною одного рядка.
 */
export const STONE_BASE = '/kamin'

/** Назва розділу для навігації, заголовків і хлібних крихт. */
export const STONE_SECTION_NAME = 'Архітектурний камінь'

/** Шлях у межах розділу → повна адреса на сайті. Зовнішні URL не чіпає. */
export function stoneHref(path: string): string {
  if (!path) return STONE_BASE
  if (/^(https?:)?\/\//.test(path) || path.startsWith('#') || path.startsWith('mailto:') || path.startsWith('tel:')) {
    return path
  }
  if (path === STONE_BASE || path.startsWith(`${STONE_BASE}/`)) return path
  return path.startsWith('/') ? `${STONE_BASE}${path}` : `${STONE_BASE}/${path}`
}
