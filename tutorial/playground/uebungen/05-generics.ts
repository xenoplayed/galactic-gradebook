/**
 * Übung 5 — Generics
 *
 * Generics sind Parameter für Typen. Wo du in Bash `$1` schreibst, schreibst
 * du hier `<T>` — nur wird es zur Compile-Zeit eingesetzt, nicht zur Laufzeit.
 */

export interface MitId {
  id: string
}

/**
 * Gib das erste Element zurück, oder undefined.
 * Der Rückgabetyp muss zum Elementtyp passen: erstes(['a']) ist string|undefined.
 */
export function erstes<T>(werte: readonly T[]): T | undefined {
  throw new Error('TODO: erstes')
}

/**
 * Gruppiere nach einem berechneten Schlüssel.
 *   gruppiere(faecher, f => f.semester)
 */
export function gruppiere<T, K extends string | number>(
  werte: readonly T[],
  schluessel: (wert: T) => K,
): Record<K, T[]> {
  throw new Error('TODO: gruppiere')
}

/**
 * Gib ein neues Objekt zurück, das nur die angegebenen Felder enthält.
 *   nurFelder({a:1,b:2,c:3}, ['a','c']) === {a:1, c:3}
 *
 * `K extends keyof T` heißt: die Feldnamen müssen wirklich in T existieren.
 * Ein Tippfehler ist damit ein Compile-Fehler.
 */
export function nurFelder<T extends object, K extends keyof T>(
  objekt: T,
  felder: readonly K[],
): Pick<T, K> {
  throw new Error('TODO: nurFelder')
}

/**
 * Eine generische Klasse: ein Register für alles mit `id`.
 * Die Constraint `T extends MitId` ist der Grund, warum du unten `eintrag.id`
 * überhaupt lesen darfst.
 */
export class Register<T extends MitId> {
  constructor(eintraege: readonly T[]) {
    throw new Error('TODO: Register.constructor')
  }

  get anzahl(): number {
    throw new Error('TODO: Register.anzahl')
  }

  /** Eintrag zur ID, sonst undefined. */
  hole(id: string): T | undefined {
    throw new Error('TODO: Register.hole')
  }

  /** Wie hole, wirft aber bei unbekannter ID (Fehlermeldung muss die ID enthalten). */
  holeSicher(id: string): T {
    throw new Error('TODO: Register.holeSicher')
  }

  /** Neues Register mit den passenden Einträgen. Dieses hier bleibt unverändert. */
  filtern(pruefung: (eintrag: T) => boolean): Register<T> {
    throw new Error('TODO: Register.filtern')
  }

  /** Alle Einträge als Array. */
  alle(): readonly T[] {
    throw new Error('TODO: Register.alle')
  }
}
