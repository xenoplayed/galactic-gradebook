import { computed } from 'vue'
import { defineStore } from 'pinia'
import { createGradeBook, students, subjects } from '@/data/seed'
import { isGrade } from '@/lib/grades'
import { useLocalStorage } from '@/composables/useLocalStorage'
import type { Grade, GradeBook, StudentId, Subject, SubjectId } from '@/types/domain'

const GRADES_KEY = 'datapad.grades'

/**
 * Eine Note pro Fach - die Ansicht, die eine Studentin von sich selbst hat.
 */
export interface StudentGradeRow {
  subject: Subject
  grade: Grade | null
}

export const useGradesStore = defineStore('grades', () => {
  /**
   * Die Notenmatrix, gespiegelt in den localStorage. Der dritte Parameter
   * fuehrt gespeicherte Daten mit dem aktuellen Seed zusammen: kommt spaeter
   * ein Fach dazu, fehlt es in alten localStorage-Staenden - ohne den Merge
   * waere `book.value['f11']` dann `undefined` und die View liefe auf einen
   * Fehler.
   */
  const book = useLocalStorage<GradeBook>(GRADES_KEY, createGradeBook(), mergeWithSeed)

  /** Alle Noten eines Fachs in der Reihenfolge der Studierendenliste. */
  function gradesForSubject(subjectId: SubjectId): (Grade | null)[] {
    const row = book.value[subjectId] ?? {}
    return students.map((student) => row[student.id] ?? null)
  }

  /** Rohform derselben Daten - fuer den Entwurf im Eingabeformular. */
  function gradeMapForSubject(subjectId: SubjectId): Record<StudentId, Grade | null> {
    const row = book.value[subjectId] ?? {}
    // Flache Kopie: der Aufrufer soll den Store nicht versehentlich mutieren.
    return Object.fromEntries(students.map((student) => [student.id, row[student.id] ?? null]))
  }

  /** Alle Faecher mit der Note der/des Studierenden. */
  function gradesForStudent(studentId: StudentId): StudentGradeRow[] {
    return subjects.map((subject) => ({
      subject,
      grade: book.value[subject.id]?.[studentId] ?? null,
    }))
  }

  function gradeOf(subjectId: SubjectId, studentId: StudentId): Grade | null {
    return book.value[subjectId]?.[studentId] ?? null
  }

  /**
   * Uebernimmt einen kompletten Entwurf fuer ein Fach.
   *
   * Bewusst als *ein* Aufruf statt vieler Einzel-Setter: das Formular arbeitet
   * auf einem lokalen Entwurf und committet erst beim Speichern. Genau ein
   * Schreibvorgang heisst auch genau ein localStorage-Write.
   */
  function saveSubject(subjectId: SubjectId, draft: Record<StudentId, Grade | null>): void {
    const row: Record<StudentId, Grade | null> = {}

    for (const student of students) {
      const value = draft[student.id]
      row[student.id] = isGrade(value) ? value : null
    }

    book.value = { ...book.value, [subjectId]: row }
  }

  /** Setzt alles auf den Auslieferungszustand zurueck. */
  function resetAll(): void {
    book.value = createGradeBook()
  }

  /** Fach-ID -> Anzahl bereits vergebener Noten. Fuer die Fortschrittsanzeige. */
  const gradedCountBySubject = computed<Record<SubjectId, number>>(() =>
    Object.fromEntries(
      subjects.map((subject) => [
        subject.id,
        gradesForSubject(subject.id).filter((grade) => grade !== null).length,
      ]),
    ),
  )

  const studentCount = computed(() => students.size)

  return {
    book,
    studentCount,
    gradedCountBySubject,
    gradesForSubject,
    gradeMapForSubject,
    gradesForStudent,
    gradeOf,
    saveSubject,
    resetAll,
  }
})

/**
 * Fuehrt gespeicherte Daten mit dem aktuellen Seed zusammen.
 * Der Seed gibt die Struktur vor (welche Faecher, welche Studierenden),
 * der gespeicherte Stand liefert die Werte - und nur, wenn sie gueltig sind.
 */
function mergeWithSeed(raw: unknown, fallback: GradeBook): GradeBook {
  if (typeof raw !== 'object' || raw === null) return fallback

  const stored = raw as Record<string, unknown>
  const merged: GradeBook = {}

  for (const [subjectId, seedRow] of Object.entries(fallback)) {
    const storedRow = stored[subjectId]
    if (typeof storedRow !== 'object' || storedRow === null) {
      merged[subjectId] = { ...seedRow }
      continue
    }

    const row: Record<StudentId, Grade | null> = {}
    for (const studentId of Object.keys(seedRow)) {
      // "Schluessel fehlt" und "Wert ist null" sind zwei verschiedene Dinge:
      // fehlt der Schluessel, ist die Person neu -> Seed-Wert. Steht dort null,
      // wurde die Note bewusst geleert -> null bleibt null.
      if (!Object.hasOwn(storedRow, studentId)) {
        row[studentId] = seedRow[studentId] ?? null
        continue
      }
      const value = (storedRow as Record<string, unknown>)[studentId]
      row[studentId] = isGrade(value) ? value : null
    }
    merged[subjectId] = row
  }

  return merged
}
