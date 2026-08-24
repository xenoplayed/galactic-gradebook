import { GRADES, type Grade } from '@/types/domain'

/** Verteilung: wie oft kommt jede Note vor. */
export type GradeDistribution = Record<Grade, number>

/** Neutrale Bezeichnungen - gelten, solange keine Akademie im Spiel ist. */
const DEFAULT_GRADE_LABELS: Record<Grade, string> = {
  1: 'sehr gut',
  2: 'gut',
  3: 'befriedigend',
  4: 'ausreichend',
  5: 'nicht ausreichend',
}

/**
 * Type Guard von `unknown` nach `Grade`.
 *
 * Nach `if (isGrade(x))` behandelt TypeScript `x` im weiteren Verlauf als
 * `Grade` - das ist der einzige saubere Weg, von Laufzeitdaten (Formulareingabe,
 * localStorage, HTTP-Response) in einen engen Typ zu kommen.
 */
export function isGrade(value: unknown): value is Grade {
  return typeof value === 'number' && GRADES.includes(value as Grade)
}

/**
 * Parst eine Formulareingabe zu einer Note.
 * Leere Eingabe -> `null` (= nicht benotet). Ungueltige Eingabe -> `undefined`.
 *
 * Die Unterscheidung ist wichtig: "Feld geleert" ist eine gueltige Aktion,
 * "Feld enthaelt 7" ist ein Fehler, den die UI melden muss.
 */
export function parseGrade(input: string): Grade | null | undefined {
  const trimmed = input.trim()
  if (trimmed === '') return null

  // Number('') waere 0 - deshalb steht die Leerpruefung vorher.
  const value = Number(trimmed.replace(',', '.'))
  return isGrade(value) ? value : undefined
}

/**
 * Die Bezeichnung zu einer Note.
 *
 * Der zweite Parameter kommt aus der Akademie (`academy.gradeLabels`), damit
 * eine 5 bei den Jedi "Von der dunklen Seite versucht" heisst und im Imperium
 * "Nachschulung angeordnet". Die Funktion bleibt trotzdem rein: sie kennt
 * keine Akademie, sie bekommt nur eine Tabelle gereicht.
 */
export function gradeLabel(
  grade: Grade,
  labels: Record<Grade, string> = DEFAULT_GRADE_LABELS,
): string {
  return labels[grade]
}

/** Anzeige einer moeglicherweise fehlenden Note. */
export function formatGrade(grade: Grade | null): string {
  return grade === null ? '–' : String(grade)
}

/** Deutsche Notendarstellung mit einer Nachkommastelle: 2.3333 -> "2,3". */
export function formatAverage(value: number | null): string {
  return value === null ? '–' : value.toFixed(1).replace('.', ',')
}

/** Eine Note gilt ab 5 als nicht bestanden. */
export function isPassing(grade: Grade): boolean {
  return grade <= 4
}

/**
 * Durchschnitt ueber alle *vergebenen* Noten. `null`-Eintraege zaehlen nicht mit
 * (sie sind nicht 0, sondern schlicht nicht vorhanden).
 * Gibt `null` zurueck, wenn es nichts zu mitteln gibt - kein NaN nach aussen.
 */
export function average(grades: readonly (Grade | null)[]): number | null {
  const given = grades.filter((grade): grade is Grade => grade !== null)
  if (given.length === 0) return null

  const sum = given.reduce((total, grade) => total + grade, 0)
  return sum / given.length
}

/** Zaehlt je Note. Noten ohne Vorkommen stehen mit 0 drin, nicht als Luecke. */
export function distribution(grades: readonly (Grade | null)[]): GradeDistribution {
  const result = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } satisfies GradeDistribution

  for (const grade of grades) {
    if (grade !== null) result[grade] += 1
  }
  return result
}

/** Anzahl tatsaechlich vergebener Noten. */
export function gradedCount(grades: readonly (Grade | null)[]): number {
  return grades.reduce<number>((count, grade) => (grade === null ? count : count + 1), 0)
}

/** Bestehensquote in Prozent (0-100), `null` ohne vergebene Noten. */
export function passRate(grades: readonly (Grade | null)[]): number | null {
  const given = grades.filter((grade): grade is Grade => grade !== null)
  if (given.length === 0) return null

  return (given.filter(isPassing).length / given.length) * 100
}
