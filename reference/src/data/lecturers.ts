import type { Lecturer } from '@/types/domain'

/**
 * Je eine lehrende Person pro Akademie. Login ist der kleingeschriebene
 * Nachname - siehe `toUsername` in lib/strings.ts.
 *
 * `satisfies` statt `:` als Typannotation: der Compiler prueft die Struktur
 * gegen `Lecturer`, behaelt aber die *engen* Literaltypen bei. Dadurch weiss
 * TypeScript spaeter, dass `LECTURERS[0].id` genau 'd01' ist und nicht
 * irgendein `string`.
 */
export const LECTURERS = [
  {
    id: 'd01',
    firstName: 'Yoda',
    lastName: 'Yoda',
    academicTitle: 'Großmeister des Ordens',
    role: 'lecturer',
    academyId: 'jedi',
  },
  {
    id: 'd02',
    firstName: 'Darth',
    lastName: 'Bane',
    academicTitle: 'Dunkler Lord der Sith',
    role: 'lecturer',
    academyId: 'sith',
  },
  {
    id: 'd03',
    firstName: 'Mitth’raw’nuruodo',
    lastName: 'Thrawn',
    academicTitle: 'Großadmiral',
    role: 'lecturer',
    academyId: 'empire',
  },
  {
    id: 'd04',
    firstName: 'Leia',
    lastName: 'Organa',
    academicTitle: 'Generalin der Allianz',
    role: 'lecturer',
    academyId: 'rebels',
  },
] as const satisfies readonly Lecturer[]
