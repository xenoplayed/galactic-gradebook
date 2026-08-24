/**
 * Übung 4 — Promises und async/await
 *
 * Für dich als DevOps-Mensch die wichtigste Umstellung: JavaScript hat EINEN
 * Thread. "Warten" heißt hier nie blockieren, sondern immer: eine Zusage
 * entgegennehmen und weitermachen.
 */

/** Wartet die angegebene Zeit und löst dann auf. */
export function warte(ms: number): Promise<void> {
  throw new Error('TODO: warte')
}

/** Gibt `wert` zurück — aber erst nach `ms` Millisekunden. */
export async function spaeter<T>(wert: T, ms: number): Promise<T> {
  throw new Error('TODO: spaeter')
}

/**
 * Lade alle IDs PARALLEL und gib die Ergebnisse in derselben Reihenfolge
 * zurück. Nacheinander (await in der Schleife) wäre bei 10 IDs zehnmal so
 * langsam — das ist der Kern der Aufgabe.
 */
export async function ladeAlle<T>(
  ids: readonly string[],
  lade: (id: string) => Promise<T>,
): Promise<T[]> {
  throw new Error('TODO: ladeAlle')
}

/**
 * Wie ladeAlle, aber ein Fehler bei einer ID darf die anderen nicht
 * mitreißen. Fehlgeschlagene liefern `null`.
 */
export async function ladeAlleTolerant<T>(
  ids: readonly string[],
  lade: (id: string) => Promise<T>,
): Promise<(T | null)[]> {
  throw new Error('TODO: ladeAlleTolerant')
}

/**
 * Versuche `fn` bis zu `versuche` Mal. Wirft sie jedes Mal, gib den letzten
 * Fehler weiter. Zwischen zwei Versuchen `pauseMs` warten.
 */
export async function mitWiederholung<T>(
  fn: () => Promise<T>,
  versuche: number,
  pauseMs: number,
): Promise<T> {
  throw new Error('TODO: mitWiederholung')
}
