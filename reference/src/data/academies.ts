import type { Academy } from '@/types/domain'

/**
 * Die vier Ausbildungswege.
 *
 * Alles Sprachliche steht hier - Bezeichnungen, Motto, Notenlabels. Die Views
 * lesen aus diesem Objekt, statt Fallunterscheidungen zu treffen. Eine fuenfte
 * Akademie waere ein Eintrag hier plus eine Farbpalette in `assets/main.css`.
 *
 * Fan-Projekt zu Lernzwecken. Die Namen sind Marken ihrer Inhaber; verwendet
 * werden ausschliesslich Namen als Testdaten.
 */
export const ACADEMIES = [
  {
    id: 'jedi',
    name: 'Jedi-Tempel Coruscant',
    shortName: 'Jedi-Tempel',
    motto: 'Tue es. Oder tue es nicht. Es gibt kein Versuchen.',
    lecturerLabel: 'Großmeister',
    studentLabel: 'Padawan',
    studentPlural: 'Padawane',
    subjectLabel: 'Lehrpfad',
    gradeLabels: {
      1: 'Eins mit der Macht',
      2: 'Erleuchtet',
      3: 'Im Gleichgewicht',
      4: 'Unstet',
      5: 'Von der dunklen Seite versucht',
    },
  },
  {
    id: 'sith',
    name: 'Sith-Akademie Korriban',
    shortName: 'Korriban',
    motto: 'Durch Leidenschaft erlange ich Stärke.',
    lecturerLabel: 'Dunkler Lord',
    studentLabel: 'Akolyth',
    studentPlural: 'Akolythen',
    subjectLabel: 'Lehre',
    gradeLabels: {
      1: 'Furchteinflößend',
      2: 'Erbarmungslos',
      3: 'Brauchbar',
      4: 'Enttäuschend',
      5: 'Ersetzbar',
    },
  },
  {
    id: 'empire',
    name: 'Imperiale Akademie Carida',
    shortName: 'Carida',
    motto: 'Ordnung durch Stärke.',
    lecturerLabel: 'Großadmiral',
    studentLabel: 'Kadett',
    studentPlural: 'Kadetten',
    subjectLabel: 'Ausbildungsfach',
    gradeLabels: {
      1: 'Vorbildlich',
      2: 'Zufriedenstellend',
      3: 'Ausreichend',
      4: 'Mangelhaft',
      5: 'Nachschulung angeordnet',
    },
  },
  {
    id: 'rebels',
    name: 'Allianz-Basis Yavin IV',
    shortName: 'Yavin IV',
    motto: 'Rebellionen bauen auf Hoffnung.',
    lecturerLabel: 'Generalin',
    studentLabel: 'Rekrut',
    studentPlural: 'Rekruten',
    subjectLabel: 'Kurs',
    gradeLabels: {
      1: 'Heldenhaft',
      2: 'Stark',
      3: 'Solide',
      4: 'Wackelig',
      5: 'Zurück in die Ausbildung',
    },
  },
] as const satisfies readonly Academy[]
