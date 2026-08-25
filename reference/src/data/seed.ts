import { Collection } from '@/lib/collection'
import type {
  Academy,
  AcademyId,
  Grade,
  GradeBook,
  Lecturer,
  Student,
  Subject,
  User,
} from '@/types/domain'
import { fullName, toUsername } from '@/lib/strings'
import { ACADEMIES } from './academies'
import { LECTURERS } from './lecturers'
import { STUDENTS } from './students'
import { SUBJECTS } from './subjects'

export const academies = new Collection<Academy>(ACADEMIES)
export const students = new Collection<Student>(STUDENTS)
export const lecturers = new Collection<Lecturer>(LECTURERS)
export const subjects = new Collection<Subject>(SUBJECTS)

/** Alle Personen in einer Sammlung - der Login sucht hier, akademieuebergreifend. */
export const users = new Collection<User>([...LECTURERS, ...STUDENTS])

/**
 * Die Lernenden EINER Akademie, alphabetisch.
 *
 * Das ist die zentrale Trennlinie der App: sobald irgendwo "alle Lernenden"
 * gebraucht werden, ist fast immer diese Funktion gemeint. `Collection.filter`
 * gibt eine neue Collection zurueck, die Ausgangsdaten bleiben unberuehrt.
 */
export function studentsOf(academyId: AcademyId): readonly Student[] {
  return students
    .filter((student) => student.academyId === academyId)
    .sortBy((student) => student.lastName)
    .all()
}

/** Die Faecher EINER Akademie, nach Semester und ID. */
export function subjectsOf(academyId: AcademyId): readonly Subject[] {
  return subjects
    .filter((subject) => subject.academyId === academyId)
    .sortBy((subject) => subject.semester * 1000 + Number(subject.id.slice(1)))
    .all()
}

/** Ein waehlbarer Zugang auf dem Anmeldebildschirm. */
export interface AccessEntry {
  readonly id: string
  /** "Ahsoka Tano" - der Name, sonst nichts. */
  readonly name: string
  /** Der Benutzername, der uebernommen wird. NICHT identisch mit `name`. */
  readonly login: string
  readonly isLecturer: boolean
}

/**
 * Alle Zugaenge einer Akademie: lehrende Person zuerst, dann die Lernenden
 * alphabetisch (das sortiert `studentsOf` bereits).
 *
 * Gibt bewusst **Rohdaten** zurueck und keinen fertigen Anzeigetext. Die
 * Klammer mit der Bezeichnung ("Yoda (Grossmeister)") haengt an der Sprache und
 * gehoert deshalb in die View. So bleibt diese Funktion rein und laesst sich
 * ohne Uebersetzer, Komponente und Store testen.
 */
export function accessEntriesFor(academyId: AcademyId): AccessEntry[] {
  const lecturer = lecturers.find((person) => person.academyId === academyId)
  const people = [...(lecturer === undefined ? [] : [lecturer]), ...studentsOf(academyId)]

  return people.map((person) => ({
    id: person.id,
    name: fullName(person),
    login: toUsername(person.lastName),
    isLecturer: person.role === 'lecturer',
  }))
}

/**
 * Pro Akademie sind zwei Faecher bereits vollstaendig benotet, vier noch leer.
 * So sieht jede lehrende Person sofort offene Arbeit und jede lernende sofort
 * einen gefuellten Klassenspiegel.
 *
 * Die Reihenfolge entspricht `studentsOf(...)`, also alphabetisch nach Nachname.
 */
const PREFILLED: Partial<Record<string, readonly Grade[]>> = {
  // Jedi
  f01: [2, 3, 1, 2, 4, 2, 3, 1, 3, 2],
  f04: [3, 2, 2, 4, 3, 1, 2, 3, 5, 3],
  // Sith
  f07: [1, 4, 2, 3, 1, 5, 2, 3, 4, 2],
  f10: [3, 3, 5, 2, 4, 3, 1, 4, 3, 2],
  // Imperium
  f13: [2, 1, 3, 2, 3, 4, 2, 1, 3, 2],
  f16: [3, 4, 2, 3, 5, 3, 4, 2, 3, 3],
  // Rebellen
  f19: [1, 2, 3, 2, 1, 3, 2, 4, 2, 1],
  f22: [4, 3, 2, 3, 4, 2, 5, 3, 3, 4],
}

/**
 * Baut die Notenmatrix auf.
 *
 * Der entscheidende Punkt gegenueber der Fassung ohne Akademien: fuer ein Fach
 * werden **nur die Lernenden der eigenen Akademie** eingetragen. Ein Padawan
 * taucht damit gar nicht erst in einem imperialen Fach auf - die Trennung ist
 * eine Eigenschaft der Datenstruktur und keine Frage der Sorgfalt in den Views.
 *
 * Wichtig ausserdem: die Funktion gibt jedes Mal ein frisches Objekt zurueck.
 * Waere es eine exportierte Konstante, teilten sich Store und Tests dieselbe
 * Referenz, und ein Test wuerde den naechsten beeinflussen.
 */
export function createGradeBook(): GradeBook {
  const book: GradeBook = {}

  for (const subject of subjects) {
    const prefilled = PREFILLED[subject.id]
    const row: Record<string, Grade | null> = {}

    studentsOf(subject.academyId).forEach((student, index) => {
      row[student.id] = prefilled?.[index] ?? null
    })

    book[subject.id] = row
  }

  return book
}
