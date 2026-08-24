import { Collection } from '@/lib/collection'
import type { Grade, GradeBook, Lecturer, Student, Subject, User } from '@/types/domain'
import { LECTURERS } from './lecturers'
import { STUDENTS } from './students'
import { SUBJECTS } from './subjects'

export const students = new Collection<Student>(STUDENTS)
export const lecturers = new Collection<Lecturer>(LECTURERS)
export const subjects = new Collection<Subject>(SUBJECTS)

/** Alle Personen in einer Sammlung - der Login sucht hier. */
export const users = new Collection<User>([...LECTURERS, ...STUDENTS])

/**
 * Vier Faecher sind bereits vollstaendig benotet, sechs noch leer.
 * So sieht die Dozentin sofort offene Arbeit und die Studierenden sofort
 * einen gefuellten Klassenspiegel.
 *
 * Die Reihenfolge entspricht s01..s15.
 */
const PREFILLED: Partial<Record<string, readonly Grade[]>> = {
  f01: [3, 2, 4, 1, 3, 5, 2, 3, 4, 2, 1, 3, 4, 3, 2],
  f03: [2, 1, 3, 2, 2, 3, 1, 4, 2, 3, 2, 1, 3, 2, 3],
  f06: [1, 2, 2, 3, 1, 2, 3, 2, 1, 4, 2, 2, 1, 3, 2],
  f09: [4, 3, 5, 3, 4, 2, 3, 5, 4, 3, 2, 4, 5, 3, 4],
}

/**
 * Baut die Notenmatrix auf: fuer *jedes* Fach existiert ein Eintrag fuer
 * *jede* Studentin und jeden Studenten - noch nicht benotet ist `null`.
 *
 * Wichtig: die Funktion gibt jedes Mal ein frisches Objekt zurueck. Wuerde man
 * stattdessen eine Konstante exportieren, teilten sich Store und Tests dieselbe
 * Referenz, und ein Test wuerde den naechsten beeinflussen.
 */
export function createGradeBook(): GradeBook {
  const book: GradeBook = {}

  for (const subject of subjects) {
    const prefilled = PREFILLED[subject.id]
    const row: Record<string, Grade | null> = {}

    students.all().forEach((student, index) => {
      row[student.id] = prefilled?.[index] ?? null
    })

    book[subject.id] = row
  }

  return book
}
