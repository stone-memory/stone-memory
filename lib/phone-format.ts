/**
 * Phone-number formatting helpers — used by admin inputs that should
 * accept only digits and display them in a familiar shape.
 *
 * Strategy:
 *   - Strip everything except digits and the leading "+".
 *   - If a digit prefix matches a known country (UA, PL, DE, LT, GB),
 *     reformat with that country's grouping.
 *   - Otherwise return "+<digits>" — universal fallback.
 *
 * `formatPhoneAsTyped` is forgiving: it normalizes Ukrainian local
 * 0-prefix (0671234567) to international (+380 67 123 45 67) so the
 * admin can type whichever way feels natural.
 */

export function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "")
}

/** Format Ukrainian local-style numbers as the user types. */
export function formatPhoneAsTyped(raw: string): string {
  let d = digitsOnly(raw)
  if (d.length === 0) return ""

  // Normalize various UA prefixes to canonical 380XXXXXXXXX.
  if (d.startsWith("00")) d = d.slice(2)                  // 0038067…
  if (d.startsWith("80") && d.length >= 11) d = "3" + d   // legacy 8067…
  if (d.startsWith("0") && d.length >= 9) d = "38" + d    // 067…
  if (d.length >= 10 && !d.startsWith("38") && !d.startsWith("48") && !d.startsWith("49") && !d.startsWith("370") && !d.startsWith("44")) {
    // unknown country code; keep as-is for international entry
  }

  // UA: +380 XX XXX XX XX
  if (d.startsWith("380")) {
    const rest = d.slice(3, 12) // up to 9 digits
    const parts: string[] = ["+380"]
    if (rest.length > 0) parts.push(" " + rest.slice(0, 2))
    if (rest.length > 2) parts.push(" " + rest.slice(2, 5))
    if (rest.length > 5) parts.push(" " + rest.slice(5, 7))
    if (rest.length > 7) parts.push(" " + rest.slice(7, 9))
    return parts.join("")
  }
  // PL: +48 XXX XXX XXX
  if (d.startsWith("48") && d.length >= 4) {
    const rest = d.slice(2, 11)
    const parts: string[] = ["+48"]
    if (rest.length > 0) parts.push(" " + rest.slice(0, 3))
    if (rest.length > 3) parts.push(" " + rest.slice(3, 6))
    if (rest.length > 6) parts.push(" " + rest.slice(6, 9))
    return parts.join("")
  }
  // DE: +49 XXX XXXXXXX (variable)
  if (d.startsWith("49")) return "+49 " + d.slice(2)
  // LT: +370 XXX XXXXX
  if (d.startsWith("370")) {
    const rest = d.slice(3, 11)
    const parts: string[] = ["+370"]
    if (rest.length > 0) parts.push(" " + rest.slice(0, 3))
    if (rest.length > 3) parts.push(" " + rest.slice(3))
    return parts.join("")
  }
  // GB: +44 XXXX XXXXXX
  if (d.startsWith("44")) return "+44 " + d.slice(2)

  // Unknown — just stick a + in front of whatever digits we have.
  return "+" + d
}

/** Strip formatting → bare international digits "380671234567". */
export function unformatPhone(formatted: string): string {
  return digitsOnly(formatted)
}

/**
 * Build an RFC 3966 `tel:` target — "+" plus digits only.
 *
 * Stripping just whitespace left display formatting inside the URI
 * (`tel:+380(67)8080222`); parentheses are not valid there and some Android
 * dialers refuse to parse it, so the tap silently did nothing.
 */
export function toTelHref(display: string): string {
  const digits = digitsOnly(display)
  return digits ? `tel:+${digits}` : "tel:"
}
