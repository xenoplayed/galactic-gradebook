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

/**
 * Der volle Name fuer Anzeigen: "Ahsoka Tano".
 *
 * Nicht jede Person hat zwei Namen. Yoda und Maul fuehren in den Stammdaten
 * denselben Vor- und Nachnamen, weil das Datenmodell beides verlangt - ohne
 * diese Pruefung stuende in der Oberflaeche "Yoda Yoda".
 *
 * Das ist kein Star-Wars-Sonderfall: Mononyme gibt es real genauso, und
 * Namensannahmen sind eine der haeufigsten Fehlerquellen in Software.
 */
export function fullName(person: { firstName: string; lastName: string }): string {
  if (person.firstName === person.lastName) return person.lastName
  return `${person.firstName} ${person.lastName}`
}
