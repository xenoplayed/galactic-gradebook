import type { Student } from '@/types/domain'

/**
 * 15 erfundene Studierende. Login ist jeweils der kleingeschriebene Nachname
 * (siehe `toUsername` in lib/strings.ts) - bei "Müller", "Groß" und "Dörner"
 * wird daraus mueller, gross und doerner.
 *
 * `roleLabel` ist ein Datenfeld und keine Ableitung aus dem Vornamen: aus einem
 * Namen laesst sich nicht erschliessen, wie jemand bezeichnet werden moechte.
 */
export const STUDENTS = [
  { id: 's01', firstName: 'Lena', lastName: 'Ackermann', roleLabel: 'Studentin' },
  { id: 's02', firstName: 'Jonas', lastName: 'Berger', roleLabel: 'Student' },
  { id: 's03', firstName: 'Mila', lastName: 'Conrad', roleLabel: 'Studentin' },
  { id: 's04', firstName: 'Elias', lastName: 'Dörner', roleLabel: 'Student' },
  { id: 's05', firstName: 'Sophie', lastName: 'Engel', roleLabel: 'Studentin' },
  { id: 's06', firstName: 'Noah', lastName: 'Fischer', roleLabel: 'Student' },
  { id: 's07', firstName: 'Amira', lastName: 'Groß', roleLabel: 'Studentin' },
  { id: 's08', firstName: 'Ben', lastName: 'Hartmann', roleLabel: 'Student' },
  { id: 's09', firstName: 'Clara', lastName: 'Ilgner', roleLabel: 'Studentin' },
  { id: 's10', firstName: 'David', lastName: 'Jahn', roleLabel: 'Student' },
  { id: 's11', firstName: 'Emma', lastName: 'Köhler', roleLabel: 'Studentin' },
  { id: 's12', firstName: 'Finn', lastName: 'Lorenz', roleLabel: 'Student' },
  { id: 's13', firstName: 'Greta', lastName: 'Müller', roleLabel: 'Studentin' },
  { id: 's14', firstName: 'Hakan', lastName: 'Nowak', roleLabel: 'Student' },
  { id: 's15', firstName: 'Ida', lastName: 'Petrov', roleLabel: 'Studentin' },
].map<Student>((person, index) => ({
  ...person,
  role: 'student',
  // 2400001, 2400002, ... - padStart fuellt links mit Nullen auf.
  matriculationNumber: `24${String(index + 1).padStart(5, '0')}`,
}))
