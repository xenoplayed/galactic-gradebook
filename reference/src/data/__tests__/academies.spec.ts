import { describe, expect, it } from 'vitest'
import {
  academies,
  accessEntriesFor,
  createGradeBook,
  lecturers,
  students,
  studentsOf,
  subjects,
  subjectsOf,
  users,
} from '@/data/seed'
import { toUsername } from '@/lib/strings'
import type { AcademyId } from '@/types/domain'

const ACADEMY_IDS: AcademyId[] = ['jedi', 'sith', 'empire', 'rebels']

describe('Stammdaten', () => {
  it('hat vier Akademien mit je einer lehrenden Person', () => {
    expect(academies.size).toBe(4)

    for (const id of ACADEMY_IDS) {
      expect(lecturers.filter((person) => person.academyId === id).size).toBe(1)
    }
  })

  it('verteilt Lernende und Faecher gleichmaessig', () => {
    expect(students.size).toBe(40)
    expect(subjects.size).toBe(24)

    for (const id of ACADEMY_IDS) {
      expect(studentsOf(id)).toHaveLength(10)
      expect(subjectsOf(id)).toHaveLength(6)
    }
  })

  it('vergibt akademieuebergreifend eindeutige Login-Namen', () => {
    // Der Login sucht in EINER Sammlung - zwei gleiche Nachnamen waeren nicht
    // aufloesbar. Dieser Test schlaegt sofort an, wenn jemand eine Person mit
    // einem bereits vorhandenen Nachnamen ergaenzt.
    const logins = users.map((user) => toUsername(user.lastName))

    expect(new Set(logins).size).toBe(logins.length)
  })

  it('haelt in den Stammdaten nur noch die Struktur', () => {
    // Namen, Mottos und Bezeichnungen liegen in den Sprachdateien - hier
    // stehen nur die IDs. Der Test haelt genau das fest.
    for (const academy of academies) {
      expect(Object.keys(academy)).toEqual(['id'])
    }
  })
})

describe('createGradeBook', () => {
  it('traegt je Fach nur die eigene Akademie ein', () => {
    const book = createGradeBook()

    for (const subject of subjects) {
      const ownIds = studentsOf(subject.academyId).map((student) => student.id)
      const rowIds = Object.keys(book[subject.id] ?? {})

      // Genau die eigenen - keine fremden, keine fehlenden.
      expect(rowIds.sort()).toEqual([...ownIds].sort())
    }
  })

  it('hat pro Akademie zwei vorbewertete Faecher', () => {
    const book = createGradeBook()

    for (const id of ACADEMY_IDS) {
      const graded = subjectsOf(id).filter((subject) =>
        Object.values(book[subject.id] ?? {}).some((grade) => grade !== null),
      )
      expect(graded).toHaveLength(2)
    }
  })

  it('liefert jedes Mal ein frisches Objekt', () => {
    // Waere es eine Konstante, wuerde ein Test den naechsten beeinflussen.
    const first = createGradeBook()
    const second = createGradeBook()

    expect(first).not.toBe(second)
    expect(first).toEqual(second)
  })
})

describe('accessEntriesFor', () => {
  it('listet die lehrende Person zuerst, dann zehn Lernende', () => {
    const entries = accessEntriesFor('jedi')

    expect(entries).toHaveLength(11)
    expect(entries[0]?.isLecturer).toBe(true)
    expect(entries.slice(1).every((entry) => !entry.isLecturer)).toBe(true)
  })

  it('bleibt sprachfrei', () => {
    // Die Funktion liefert Rohdaten. Die Klammer mit der Bezeichnung
    // ("Yoda (Großmeister)") haengt an der Sprache und setzt die View -
    // deshalb darf hier nirgends ein uebersetzter Text auftauchen.
    const entries = accessEntriesFor('jedi')

    expect(entries[0]?.name).toBe('Yoda')
    expect(entries.some((entry) => entry.name.includes('('))).toBe(false)
  })

  it('uebernimmt NUR den Benutzernamen', () => {
    expect(accessEntriesFor('jedi')[0]?.login).toBe('yoda')
  })

  it('normalisiert Akzente im Benutzernamen', () => {
    const sabe = accessEntriesFor('rebels').find((entry) => entry.name.includes('Sabé'))

    expect(sabe?.login).toBe('sabe')
  })

  it('doppelt Mononyme nicht', () => {
    // Maul fuehrt denselben Vor- und Nachnamen - "Maul Maul" waere falsch.
    const maul = accessEntriesFor('sith').find((entry) => entry.login === 'maul')

    expect(maul?.name).toBe('Maul')
  })

  it('mischt keine Akademien', () => {
    const sithLogins = accessEntriesFor('sith').map((entry) => entry.login)

    expect(sithLogins).toContain('bane')
    expect(sithLogins).not.toContain('yoda')
  })
})
