/** Umlaute muessen vor der Akzent-Normalisierung ersetzt werden - "ü" wird sonst zu "u". */
const GERMAN_REPLACEMENTS: Record<string, string> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  ß: 'ss',
}

/**
 * Erzeugt aus einem Nachnamen den Login-Namen.
 *
 *   toUsername('Müller')  -> 'mueller'
 *   toUsername('Groß')    -> 'gross'
 *   toUsername("O'Brien") -> 'obrien'
 *
 * Warum die zwei Schritte:
 * 1. Deutsche Sonderfaelle explizit ersetzen (ü -> ue, nicht u).
 * 2. `normalize('NFD')` zerlegt verbleibende Buchstaben mit Akzent in
 *    Grundbuchstabe + kombinierendes Zeichen (é -> e + ´), danach wird die
 *    Akzent-Range U+0300..U+036F weggeworfen.
 */
export function toUsername(lastName: string): string {
  return lastName
    .toLowerCase()
    .replace(/[äöüß]/g, (char) => GERMAN_REPLACEMENTS[char] ?? char)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

/** "Greta Müller" - fuer Anzeigen, in denen der volle Name gebraucht wird. */
export function fullName(person: { firstName: string; lastName: string }): string {
  return `${person.firstName} ${person.lastName}`
}
