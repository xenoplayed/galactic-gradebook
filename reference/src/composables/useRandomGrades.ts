import { GRADES, type Grade, type StudentId } from '@/types/domain'

/**
 * Gewichtete Verteilung statt Gleichverteilung: eine echte Klausur produziert
 * selten gleich viele Einsen wie Fuenfen. Mit `Math.random()` * 5 saehe der
 * Klassenspiegel aus wie ein Balkendiagramm ohne Aussage.
 */
const WEIGHTS: Record<Grade, number> = {
  1: 0.15,
  2: 0.3,
  3: 0.3,
  4: 0.17,
  5: 0.08,
}

/**
 * Zieht eine Note gemaess WEIGHTS.
 *
 * Verfahren ("roulette wheel"): eine Zufallszahl in [0,1) laufen lassen und die
 * Gewichte davon abziehen, bis sie negativ wird - so ist die Trefferwahr-
 * scheinlichkeit jeder Note genau ihr Gewicht.
 */
export function randomGrade(): Grade {
  let threshold = Math.random()

  for (const grade of GRADES) {
    threshold -= WEIGHTS[grade]
    if (threshold <= 0) return grade
  }
  // Nur erreichbar, wenn die Gewichte in Summe unter 1 liegen (Rundung).
  return 3
}

export function useRandomGrades() {
  /** Erzeugt fuer jede uebergebene Studi-ID eine Zufallsnote. */
  function randomGradesFor(studentIds: readonly StudentId[]): Record<StudentId, Grade> {
    return Object.fromEntries(studentIds.map((id) => [id, randomGrade()]))
  }

  return { randomGrade, randomGradesFor }
}
