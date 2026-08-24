export type Grade = 1 | 2 | 3 | 4 | 5

export interface Studi {
  name: string
  noten: Grade[]
}

const TEXTE: Record<Grade, string> = {
  1: 'sehr gut',
  2: 'gut',
  3: 'befriedigend',
  4: 'ausreichend',
  5: 'nicht ausreichend',
}

export function guteNoten(noten: readonly Grade[]): Grade[] {
  return noten.filter((note) => note <= 3)
}

export function alsText(noten: readonly Grade[]): string[] {
  return noten.map((note) => TEXTE[note])
}

export function summe(noten: readonly Grade[]): number {
  // Der zweite Parameter (0) ist der Startwert. Ohne ihn wirft reduce
  // bei einem leeren Array einen TypeError.
  return noten.reduce((total, note) => total + note, 0)
}

export function durchschnitt(noten: readonly Grade[]): number | null {
  if (noten.length === 0) return null
  return summe(noten) / noten.length
}

export function findeStudi(alle: readonly Studi[], name: string): Studi | undefined {
  return alle.find((studi) => studi.name === name)
}

export function hatDurchgefallene(alle: readonly Studi[]): boolean {
  return alle.some((studi) => studi.noten.includes(5))
}

export function nachDurchschnitt(alle: readonly Studi[]): Studi[] {
  // [...alle] erzeugt eine flache Kopie - sort wuerde sonst das Original
  // umsortieren. Das ist der haeufigste Anfaengerfehler mit sort.
  return [...alle].sort((a, b) => (durchschnitt(a.noten) ?? 99) - (durchschnitt(b.noten) ?? 99))
}

export function verteilung(noten: readonly Grade[]): Record<Grade, number> {
  const start: Record<Grade, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  return noten.reduce((acc, note) => {
    acc[note] += 1
    return acc
  }, start)
}

export function alleNoten(alle: readonly Studi[]): Grade[] {
  return alle.flatMap((studi) => studi.noten)
}
