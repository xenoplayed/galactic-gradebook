/**
 * Das Domaenenmodell des Datapads.
 *
 * Bewusst frei von Vue: hier stehen nur Typen, keine Reaktivitaet. Dadurch
 * bleibt die Fachlichkeit ohne Framework testbar - und du kannst sie spaeter
 * gegen ein echtes Backend austauschen, ohne die Views anzufassen.
 */

/** Es gibt genau zwei Rollen. Kein string, sondern eine Union - Tippfehler faellt beim Compile auf. */
export type Role = 'lecturer' | 'student'

/**
 * Vier Ausbildungswege. Auch hier eine Union statt `string`: damit muss jede
 * Zuordnung (Farbpalette, Wappen, Bezeichnungen) vollstaendig sein, sonst
 * meckert der Compiler.
 */
export type AcademyId = 'jedi' | 'sith' | 'empire' | 'rebels'

/** Alles mit stabiler ID kann in eine `Collection<T>` (siehe lib/collection.ts). */
export interface Identifiable {
  readonly id: string
}

/**
 * Der komplette Wertebereich einer Note lebt im Typsystem, nicht in
 * if-Kaskaden. `const g: Grade = 6` ist ein Compile-Fehler.
 */
export type Grade = 1 | 2 | 3 | 4 | 5

/** Alle gueltigen Noten als Laufzeit-Wert - fuer Schleifen und Diagramme. */
export const GRADES = [1, 2, 3, 4, 5] as const satisfies readonly Grade[]

/**
 * Eine Akademie ist mehr als ein Etikett: sie bestimmt, wer wen sieht.
 *
 * Alles Sprachliche steht hier als Datenfeld, nicht als `if` in einer View.
 * Eine neue Akademie hinzuzufuegen heisst deshalb: einen Eintrag anlegen und
 * eine Farbpalette ergaenzen - keine Komponente anfassen.
 */
export interface Academy extends Identifiable {
  readonly id: AcademyId
  /** Vollstaendiger Name, z.B. "Sith-Akademie Korriban". */
  readonly name: string
  /** Kurzform fuer die Navigation. */
  readonly shortName: string
  readonly motto: string
  /** Wie Lehrende hier heissen: "Grossmeister", "Dunkler Lord", ... */
  readonly lecturerLabel: string
  /** Einzahl der Lernenden: "Padawan", "Akolyth", "Kadett", "Rekrut". */
  readonly studentLabel: string
  readonly studentPlural: string
  /** Wie ein Fach hier heisst: "Lehrpfad", "Lehre", "Ausbildungsfach", "Kurs". */
  readonly subjectLabel: string
  /** Notenbezeichnungen im Ton der Akademie. Vollstaendig, sonst Compile-Fehler. */
  readonly gradeLabels: Record<Grade, string>
}

export interface Person extends Identifiable {
  readonly firstName: string
  readonly lastName: string
  /**
   * Wie die Person bezeichnet wird ("Grossmeister", "Akolythin", ...).
   * Steht als Datenfeld hier und wird NICHT zur Laufzeit aus dem Namen
   * abgeleitet - aus einem Namen laesst sich so etwas nicht erschliessen.
   */
  readonly roleLabel: string
  /** Bindet die Person an genau einen Ausbildungsweg. */
  readonly academyId: AcademyId
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
  /** Ein Fach gehoert zu genau einer Akademie - daraus folgt der Rest. */
  readonly academyId: AcademyId
}

export type SubjectId = string
export type StudentId = string

/**
 * Die Notenmatrix: Fach -> Lernende:r -> Note.
 *
 * Bewusst OHNE Akademie-Ebene. Das Fach legt die Akademie bereits fest, und
 * eine Person gehoert zu genau einer - eine dritte Verschachtelung waere
 * redundant und muesste bei jeder Aenderung konsistent gehalten werden.
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
