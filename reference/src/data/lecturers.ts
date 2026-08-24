import type { Lecturer } from '@/types/domain'

/**
 * Erfundene Person - jede Aehnlichkeit mit echten Menschen ist Zufall.
 *
 * `satisfies` statt `:` als Typannotation: der Compiler prueft die Struktur
 * gegen `Lecturer`, behaelt aber die *engen* Literaltypen bei. Dadurch weiss
 * TypeScript spaeter, dass `LECTURERS[0].id` genau 'd01' ist und nicht
 * irgendein `string`.
 */
export const LECTURERS = [
  {
    id: 'd01',
    firstName: 'Martina',
    lastName: 'Weber',
    academicTitle: 'Prof. Dr.',
    roleLabel: 'Dozentin',
    role: 'lecturer',
  },
] as const satisfies readonly Lecturer[]
