/**
 * Übung 1 — Arrays
 *
 * Lies zuerst Kapitel 01. Ersetze dann jedes `throw` durch eine Lösung.
 * Prüfen mit:  npm test
 *
 * Regel für diese Datei: keine `for`-Schleife. Nutze map / filter / reduce /
 * find / some / every / sort. Nicht aus Prinzip, sondern weil du diese
 * Methoden in jedem Vue-Template und jedem `computed` wiedersehen wirst.
 */

export type Grade = 1 | 2 | 3 | 4 | 5

export interface Studi {
  name: string
  noten: Grade[]
}

/** Gib nur die Noten zurück, die 3 oder besser sind (kleiner ist besser). */
export function guteNoten(noten: readonly Grade[]): Grade[] {
  throw new Error('TODO: guteNoten')
}

/** Wandle jede Note in ihren Text um: 1 -> "sehr gut", ... 5 -> "nicht ausreichend". */
export function alsText(noten: readonly Grade[]): string[] {
  throw new Error('TODO: alsText')
}

/** Summe aller Noten. Bei leerem Array: 0. */
export function summe(noten: readonly Grade[]): number {
  throw new Error('TODO: summe')
}

/** Durchschnitt. Bei leerem Array: null (nicht NaN!). */
export function durchschnitt(noten: readonly Grade[]): number | null {
  throw new Error('TODO: durchschnitt')
}

/** Erste:r Studi mit dem gesuchten Namen, sonst undefined. */
export function findeStudi(alle: readonly Studi[], name: string): Studi | undefined {
  throw new Error('TODO: findeStudi')
}

/** Hat mindestens eine Person eine 5? */
export function hatDurchgefallene(alle: readonly Studi[]): boolean {
  throw new Error('TODO: hatDurchgefallene')
}

/**
 * Sortiere nach Durchschnitt, beste zuerst.
 * ACHTUNG: `sort` verändert das Array, auf dem es aufgerufen wird.
 * Das Eingabe-Array muss unverändert bleiben.
 */
export function nachDurchschnitt(alle: readonly Studi[]): Studi[] {
  throw new Error('TODO: nachDurchschnitt')
}

/**
 * Zähle, wie oft jede Note vorkommt.
 * Ergebnis: { 1: 2, 2: 0, 3: 1, 4: 0, 5: 0 } — alle fünf Schlüssel immer da.
 */
export function verteilung(noten: readonly Grade[]): Record<Grade, number> {
  throw new Error('TODO: verteilung')
}

/**
 * Alle Noten aller Studis in einem flachen Array.
 * Tipp: schau dir `flatMap` an.
 */
export function alleNoten(alle: readonly Studi[]): Grade[] {
  throw new Error('TODO: alleNoten')
}
