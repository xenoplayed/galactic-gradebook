/**
 * Das Domaenenmodell des Datapads.
 *
 * Bewusst frei von Vue: hier stehen nur Typen, keine Reaktivitaet. Dadurch
 * bleibt die Fachlichkeit ohne Framework testbar - und du kannst sie spaeter
 * gegen ein echtes Backend austauschen, ohne die Views anzufassen.
 */

/** Es gibt genau zwei Rollen. Kein string, sondern eine Union - Tippfehler faellt beim Compile auf. */
export type Role = 'lecturer' | 'student'

/** Alles mit stabiler ID kann in eine `Collection<T>` (siehe lib/collection.ts). */
export interface Identifiable {
  readonly id: string
}

export interface Person extends Identifiable {
  readonly firstName: string
  readonly lastName: string
  /**
   * Wie die Person bezeichnet wird ("Dozentin", "Student", ...).
   * Steht als Datenfeld hier und wird NICHT zur Laufzeit aus dem Namen
   * abgeleitet - aus einem Namen laesst sich so etwas nicht erschliessen.
   */
  readonly roleLabel: string
}

export interface Student extends Person {
  readonly role: 'student'
  readonly matriculationNumber: string
}

export interface Lecturer extends Person {
  readonly role: 'lecturer'
  readonly academicTitle: string
}

/**
 * Discriminated Union: das gemeinsame Feld `role` mit Literal-Typen erlaubt
 * TypeScript, nach `if (user.role === 'student')` automatisch auf `Student`
 * einzugrenzen (Narrowing).
 */
export type User = Student | Lecturer

export interface Subject extends Identifiable {
  readonly name: string
  readonly shortName: string
  readonly semester: number
  readonly ects: number
}

/**
 * Der komplette Wertebereich einer Note lebt im Typsystem, nicht in
 * if-Kaskaden. `const g: Grade = 6` ist ein Compile-Fehler.
 */
export type Grade = 1 | 2 | 3 | 4 | 5

/** Alle gueltigen Noten als Laufzeit-Wert - fuer Schleifen und Diagramme. */
export const GRADES = [1, 2, 3, 4, 5] as const satisfies readonly Grade[]

export type SubjectId = string
export type StudentId = string

/**
 * Die Notenmatrix: Fach -> Student -> Note.
 *
 * `null` heisst "noch nicht benotet". Bewusst nicht `undefined` (das waere von
 * "Schluessel fehlt" nicht unterscheidbar) und bewusst nicht `0` (das waere ein
 * Wert, mit dem man versehentlich rechnen kann).
 */
export type GradeBook = Record<SubjectId, Record<StudentId, Grade | null>>

/** Type Guard: grenzt `User` auf `Student` ein. */
export function isStudent(user: User): user is Student {
  return user.role === 'student'
}

/** Type Guard: grenzt `User` auf `Lecturer` ein. */
export function isLecturer(user: User): user is Lecturer {
  return user.role === 'lecturer'
}
