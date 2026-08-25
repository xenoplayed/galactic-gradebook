import type { Subject } from '@/types/domain'

/**
 * Sechs Faecher je Akademie, verteilt ueber vier Semester.
 *
 * Der **Name** steht in den Sprachdateien unter `subjects.<id>` - er ist ein
 * beschreibender Titel und gehoert uebersetzt. Das Kuerzel bleibt hier: es ist
 * ein Kennzeichen wie eine Modulnummer, und die uebersetzt man auch an einer
 * echten Hochschule nicht.
 */
export const SUBJECTS = [
  // --- Jedi-Tempel Coruscant ---
  { id: 'f01', shortName: 'MK', semester: 1, ects: 6, academyId: 'jedi' },
  {
    id: 'f02',
    shortName: 'LSF1',
    semester: 1,
    ects: 6,
    academyId: 'jedi',
  },
  {
    id: 'f03',
    shortName: 'MED',
    semester: 2,
    ects: 4,
    academyId: 'jedi',
  },
  {
    id: 'f04',
    shortName: 'GDO',
    semester: 2,
    ects: 4,
    academyId: 'jedi',
  },
  {
    id: 'f05',
    shortName: 'DIP',
    semester: 3,
    ects: 5,
    academyId: 'jedi',
  },
  {
    id: 'f06',
    shortName: 'GED',
    semester: 4,
    ects: 5,
    academyId: 'jedi',
  },

  // --- Sith-Akademie Korriban ---
  {
    id: 'f07',
    shortName: 'BDZ',
    semester: 1,
    ects: 6,
    academyId: 'sith',
  },
  {
    id: 'f08',
    shortName: 'SPR',
    semester: 1,
    ects: 4,
    academyId: 'sith',
  },
  { id: 'f09', shortName: 'JUY', semester: 2, ects: 6, academyId: 'sith' },
  {
    id: 'f10',
    shortName: 'RDZ',
    semester: 2,
    ects: 4,
    academyId: 'sith',
  },
  { id: 'f11', shortName: 'ALC', semester: 3, ects: 6, academyId: 'sith' },
  {
    id: 'f12',
    shortName: 'EIN',
    semester: 4,
    ects: 5,
    academyId: 'sith',
  },

  // --- Imperiale Akademie Carida ---
  {
    id: 'f13',
    shortName: 'EXD',
    semester: 1,
    ects: 4,
    academyId: 'empire',
  },
  {
    id: 'f14',
    shortName: 'DOK',
    semester: 1,
    ects: 4,
    academyId: 'empire',
  },
  {
    id: 'f15',
    shortName: 'TIE',
    semester: 2,
    ects: 6,
    academyId: 'empire',
  },
  {
    id: 'f16',
    shortName: 'NAW',
    semester: 2,
    ects: 5,
    academyId: 'empire',
  },
  { id: 'f17', shortName: 'FLT', semester: 3, ects: 6, academyId: 'empire' },
  {
    id: 'f18',
    shortName: 'SZS',
    semester: 4,
    ects: 6,
    academyId: 'empire',
  },

  // --- Allianz-Basis Yavin IV ---
  {
    id: 'f19',
    shortName: 'AMW',
    semester: 1,
    ects: 5,
    academyId: 'rebels',
  },
  {
    id: 'f20',
    shortName: 'BVT',
    semester: 1,
    ects: 4,
    academyId: 'rebels',
  },
  {
    id: 'f21',
    shortName: 'XFK',
    semester: 2,
    ects: 6,
    academyId: 'rebels',
  },
  {
    id: 'f22',
    shortName: 'FFV',
    semester: 2,
    ects: 5,
    academyId: 'rebels',
  },
  {
    id: 'f23',
    shortName: 'NAV',
    semester: 3,
    ects: 5,
    academyId: 'rebels',
  },
  {
    id: 'f24',
    shortName: 'EHF',
    semester: 4,
    ects: 4,
    academyId: 'rebels',
  },
] as const satisfies readonly Subject[]
