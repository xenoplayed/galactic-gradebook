/**
 * Übung 2 — Objekte
 *
 * Thema: Referenzsemantik, Destructuring, Spread, optionales Verketten.
 * Das sind genau die Stellen, an denen JavaScript sich anders verhält, als
 * man es aus Python oder Go erwartet.
 */

export interface Fach {
  id: string
  name: string
  ects: number
  dozent?: { name: string; email?: string }
}

/**
 * Gib eine KOPIE mit geänderten ECTS zurück. Das Original darf sich nicht ändern.
 * (Genau so arbeiten Vue und Pinia mit Zustand.)
 */
export function mitEcts(fach: Fach, ects: number): Fach {
  throw new Error('TODO: mitEcts')
}

/** Name der/des Dozent:in, oder "unbesetzt", wenn keine:r hinterlegt ist. */
export function dozentName(fach: Fach): string {
  throw new Error('TODO: dozentName')
}

/** E-Mail, oder null. Achtung: dozent kann fehlen UND email kann fehlen. */
export function dozentEmail(fach: Fach): string | null {
  throw new Error('TODO: dozentEmail')
}

/**
 * Baue aus einer Liste ein Nachschlagewerk: { [id]: Fach }.
 * Tipp: Object.fromEntries.
 */
export function nachId(faecher: readonly Fach[]): Record<string, Fach> {
  throw new Error('TODO: nachId')
}

/**
 * Summiere die ECTS pro Dozent:in.
 * Fächer ohne Dozent:in werden unter "unbesetzt" gezählt.
 */
export function ectsProDozent(faecher: readonly Fach[]): Record<string, number> {
  throw new Error('TODO: ectsProDozent')
}

/**
 * Gib die Felder `id` und `name` als eigenes Objekt zurück — ohne die übrigen.
 * Tipp: Destructuring mit Rest.
 */
export function kurzinfo(fach: Fach): { id: string; name: string } {
  throw new Error('TODO: kurzinfo')
}

/**
 * true, wenn beide Objekte dieselben Werte in id/name/ects haben.
 * Merke: `objektA === objektB` vergleicht die Referenz, nicht den Inhalt.
 */
export function gleichInhaltlich(a: Fach, b: Fach): boolean {
  throw new Error('TODO: gleichInhaltlich')
}
