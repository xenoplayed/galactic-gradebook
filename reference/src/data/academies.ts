import type { Academy } from '@/types/domain'

/**
 * Die vier Ausbildungswege - nur die Struktur.
 *
 * Namen, Mottos, Bezeichnungen und Notenlabels stehen in
 * `src/i18n/locales/*.json`, weil sie je Sprache anders lauten. Die Reihenfolge
 * hier bestimmt die Reihenfolge in der Oberflaeche.
 *
 * Fan-Projekt zu Lernzwecken. Die Namen sind Marken ihrer Inhaber; verwendet
 * werden ausschliesslich Namen als Testdaten.
 */
export const ACADEMIES = [
  { id: 'jedi' },
  { id: 'sith' },
  { id: 'empire' },
  { id: 'rebels' },
] as const satisfies readonly Academy[]
