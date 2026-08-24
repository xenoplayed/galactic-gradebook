/**
 * Übung 3 — Funktionen, Arrow-Funktionen und `this`
 */

/** Klassische Funktion als Wert. Gib eine Funktion zurück, die verdoppelt. */
export function machVerdoppler(): (x: number) => number {
  throw new Error('TODO: machVerdoppler')
}

/**
 * Closure: gib eine Funktion zurück, die bei jedem Aufruf um 1 hochzählt
 * und den neuen Wert liefert. Start bei `beginn`.
 *   const next = zaehler(10); next() === 11; next() === 12
 */
export function zaehler(beginn: number): () => number {
  throw new Error('TODO: zaehler')
}

/**
 * Higher-Order-Funktion: wende `fn` auf jedes Element an, aber nur wenn
 * `wenn` für das Element true liefert. Sonst bleibt das Element unverändert.
 */
export function mapWenn<T>(
  werte: readonly T[],
  wenn: (wert: T) => boolean,
  fn: (wert: T) => T,
): T[] {
  throw new Error('TODO: mapWenn')
}

/**
 * Diese Klasse ist kaputt: `verspaetet()` soll `["Kurs: <name>"]` liefern,
 * wirft aber zur Laufzeit "Cannot read properties of undefined".
 *
 * Der Compiler meckert nicht — das ist der Punkt. Lies den Abschnitt zu `this`
 * in Kapitel 02 und repariere `verspaetet()`. Die öffentliche Signatur und
 * `formatieren` bleiben, wie sie sind.
 */
export class Kurs {
  constructor(public name: string) {}

  verspaetet(): string[] {
    // Diese Zeile ist der Fehler: hier wird die METHODE als Wert übergeben.
    return [1].map(this.formatieren)
  }

  private formatieren(): string {
    return `Kurs: ${this.name}`
  }
}
