import type { AcademyId, Student } from '@/types/domain'
import { ACADEMIES } from './academies'

/**
 * Zehn Lernende je Akademie. Login ist jeweils der kleingeschriebene Nachname
 * (siehe `toUsername` in lib/strings.ts) - bei `Sabé` wird daraus `sabe`.
 *
 * Die Nachnamen sind **akademieuebergreifend eindeutig**: der Login sucht in
 * einer einzigen Sammlung, zwei gleiche Nachnamen waeren nicht aufloesbar.
 */
const ROSTER = [
  // --- Jedi-Tempel Coruscant ---
  { id: 's01', firstName: 'Ahsoka', lastName: 'Tano', academyId: 'jedi' },
  { id: 's02', firstName: 'Kanan', lastName: 'Jarrus', academyId: 'jedi' },
  { id: 's03', firstName: 'Barriss', lastName: 'Offee', academyId: 'jedi' },
  { id: 's04', firstName: 'Ezra', lastName: 'Bridger', academyId: 'jedi' },
  { id: 's05', firstName: 'Cal', lastName: 'Kestis', academyId: 'jedi' },
  { id: 's06', firstName: 'Quinlan', lastName: 'Vos', academyId: 'jedi' },
  { id: 's07', firstName: 'Depa', lastName: 'Billaba', academyId: 'jedi' },
  { id: 's08', firstName: 'Luminara', lastName: 'Unduli', academyId: 'jedi' },
  { id: 's09', firstName: 'Bastila', lastName: 'Shan', academyId: 'jedi' },
  { id: 's10', firstName: 'Reva', lastName: 'Sevander', academyId: 'jedi' },

  // --- Sith-Akademie Korriban ---
  { id: 's11', firstName: 'Maul', lastName: 'Maul', academyId: 'sith' },
  { id: 's12', firstName: 'Asajj', lastName: 'Ventress', academyId: 'sith' },
  { id: 's13', firstName: 'Savage', lastName: 'Opress', academyId: 'sith' },
  { id: 's14', firstName: 'Darth', lastName: 'Zannah', academyId: 'sith' },
  { id: 's15', firstName: 'Darth', lastName: 'Talon', academyId: 'sith' },
  { id: 's16', firstName: 'Darth', lastName: 'Nihilus', academyId: 'sith' },
  { id: 's17', firstName: 'Darth', lastName: 'Malgus', academyId: 'sith' },
  { id: 's18', firstName: 'Naga', lastName: 'Sadow', academyId: 'sith' },
  { id: 's19', firstName: 'Exar', lastName: 'Kun', academyId: 'sith' },
  { id: 's20', firstName: 'Trilla', lastName: 'Suduri', academyId: 'sith' },

  // --- Imperiale Akademie Carida ---
  { id: 's21', firstName: 'Ciena', lastName: 'Ree', academyId: 'empire' },
  { id: 's22', firstName: 'Thane', lastName: 'Kyrell', academyId: 'empire' },
  { id: 's23', firstName: 'Iden', lastName: 'Versio', academyId: 'empire' },
  { id: 's24', firstName: 'Gideon', lastName: 'Hask', academyId: 'empire' },
  { id: 's25', firstName: 'Del', lastName: 'Meeko', academyId: 'empire' },
  { id: 's26', firstName: 'Alexsandr', lastName: 'Kallus', academyId: 'empire' },
  { id: 's27', firstName: 'Firmus', lastName: 'Piett', academyId: 'empire' },
  { id: 's28', firstName: 'Maximilian', lastName: 'Veers', academyId: 'empire' },
  { id: 's29', firstName: 'Juno', lastName: 'Eclipse', academyId: 'empire' },
  { id: 's30', firstName: 'Rae', lastName: 'Sloane', academyId: 'empire' },

  // --- Allianz-Basis Yavin IV ---
  { id: 's31', firstName: 'Wedge', lastName: 'Antilles', academyId: 'rebels' },
  { id: 's32', firstName: 'Hera', lastName: 'Syndulla', academyId: 'rebels' },
  { id: 's33', firstName: 'Sabine', lastName: 'Wren', academyId: 'rebels' },
  { id: 's34', firstName: 'Jyn', lastName: 'Erso', academyId: 'rebels' },
  { id: 's35', firstName: 'Cassian', lastName: 'Andor', academyId: 'rebels' },
  { id: 's36', firstName: 'Bodhi', lastName: 'Rook', academyId: 'rebels' },
  { id: 's37', firstName: 'Biggs', lastName: 'Darklighter', academyId: 'rebels' },
  { id: 's38', firstName: 'Garazeb', lastName: 'Orrelios', academyId: 'rebels' },
  { id: 's39', firstName: 'Kes', lastName: 'Dameron', academyId: 'rebels' },
  // Akzent im Nachnamen: `toUsername` macht daraus `sabe`.
  { id: 's40', firstName: 'Elana', lastName: 'Sabé', academyId: 'rebels' },
] as const satisfies readonly {
  id: string
  firstName: string
  lastName: string
  academyId: AcademyId
}[]

/**
 * Die Bezeichnung kommt aus der Akademie statt vierzigmal abgeschrieben zu
 * werden. Kein `!` und kein Cast: das `??` faengt den theoretischen Fall ab,
 * dass eine ID nicht gefunden wird.
 */
function studentLabelFor(academyId: AcademyId): string {
  return ACADEMIES.find((academy) => academy.id === academyId)?.studentLabel ?? 'Lernende:r'
}

export const STUDENTS = ROSTER.map<Student>((person, index) => ({
  ...person,
  role: 'student',
  roleLabel: studentLabelFor(person.academyId),
  // 2400001, 2400002, ... - padStart fuellt links mit Nullen auf.
  matriculationNumber: `24${String(index + 1).padStart(5, '0')}`,
}))
