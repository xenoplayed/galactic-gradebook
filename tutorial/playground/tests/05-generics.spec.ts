import { describe, expect, it } from 'vitest'
import { erstes, gruppiere, nurFelder, Register } from '@target/05-generics'

interface Fach {
  id: string
  name: string
  semester: number
}

const faecher: Fach[] = [
  { id: 'f01', name: 'Mathematik I', semester: 1 },
  { id: 'f03', name: 'Datenbanken', semester: 2 },
  { id: 'f04', name: 'Betriebssysteme', semester: 2 },
]

describe('05 — Generics', () => {
  it('erstes behält den Elementtyp', () => {
    const wert = erstes(['a', 'b'])

    // Wenn der Typ stimmt, ist das hier ohne Cast erlaubt.
    expect(wert?.toUpperCase()).toBe('A')
    expect(erstes([])).toBeUndefined()
  })

  it('gruppiere schlägt nach Schlüssel auf', () => {
    const nachSemester = gruppiere(faecher, (fach) => fach.semester)

    expect(Object.keys(nachSemester)).toEqual(['1', '2'])
    expect(nachSemester[2]?.map((f) => f.id)).toEqual(['f03', 'f04'])
  })

  it('nurFelder nimmt eine Teilmenge', () => {
    expect(nurFelder(faecher[0]!, ['id', 'name'])).toEqual({ id: 'f01', name: 'Mathematik I' })
  })

  describe('Register', () => {
    // Bewusst eine Funktion statt einer Konstante: solange der Konstruktor
    // noch `throw new Error('TODO')` enthaelt, soll jeder Test einzeln
    // fehlschlagen. Stuende hier `const register = new Register(...)`, wuerde
    // schon das Einsammeln der Tests platzen und du saehest nur einen
    // einzigen, nichtssagenden Fehler.
    const neu = () => new Register(faecher)

    it('kennt seine Größe', () => {
      expect(neu().anzahl).toBe(3)
    })

    it('holt über die ID', () => {
      expect(neu().hole('f03')?.name).toBe('Datenbanken')
      expect(neu().hole('gibtsnicht')).toBeUndefined()
    })

    it('wirft bei holeSicher mit unbekannter ID', () => {
      expect(() => neu().holeSicher('gibtsnicht')).toThrow(/gibtsnicht/)
    })

    it('filtern lässt das Original in Ruhe', () => {
      const register = neu()
      const zweites = register.filtern((fach) => fach.semester === 2)

      expect(zweites.anzahl).toBe(2)
      expect(register.anzahl).toBe(3)
    })

    it('gibt alle Einträge heraus', () => {
      expect(neu().alle()).toHaveLength(3)
    })
  })
})
