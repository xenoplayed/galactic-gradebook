import type { Subject } from '@/types/domain'

/** 10 Faecher ueber fuenf Semester. */
export const SUBJECTS = [
  { id: 'f01', name: 'Mathematik I', shortName: 'MAT1', semester: 1, ects: 6 },
  { id: 'f02', name: 'Einführung in die Programmierung', shortName: 'PRG1', semester: 1, ects: 6 },
  { id: 'f03', name: 'Datenbanken', shortName: 'DB', semester: 2, ects: 5 },
  { id: 'f04', name: 'Betriebssysteme', shortName: 'BS', semester: 2, ects: 5 },
  { id: 'f05', name: 'Rechnernetze', shortName: 'NET', semester: 3, ects: 5 },
  { id: 'f06', name: 'Webentwicklung', shortName: 'WEB', semester: 3, ects: 6 },
  { id: 'f07', name: 'Software Engineering', shortName: 'SE', semester: 4, ects: 6 },
  { id: 'f08', name: 'IT-Sicherheit', shortName: 'SEC', semester: 4, ects: 5 },
  { id: 'f09', name: 'Statistik', shortName: 'STAT', semester: 5, ects: 5 },
  { id: 'f10', name: 'Projektmanagement', shortName: 'PM', semester: 5, ects: 4 },
] as const satisfies readonly Subject[]
