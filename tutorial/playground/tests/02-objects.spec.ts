import { describe, expect, it } from 'vitest'
import {
  dozentEmail,
  dozentName,
  ectsProDozent,
  gleichInhaltlich,
  kurzinfo,
  mitEcts,
  nachId,
  type Fach,
} from '@target/02-objects'

const mathe: Fach = {
  id: 'f01',
  name: 'Mathematik I',
  ects: 6,
  dozent: { name: 'Weber', email: 'weber@example.org' },
}
const bs: Fach = { id: 'f04', name: 'Betriebssysteme', ects: 5 }

describe('02 — Objekte', () => {
  it('mitEcts liefert eine Kopie', () => {
    const neu = mitEcts(mathe, 9)

    expect(neu.ects).toBe(9)
    expect(mathe.ects).toBe(6)
    // Es muss wirklich ein anderes Objekt sein, nicht dasselbe.
    expect(neu).not.toBe(mathe)
  })

  it('dozentName fällt auf "unbesetzt" zurück', () => {
    expect(dozentName(mathe)).toBe('Weber')
    expect(dozentName(bs)).toBe('unbesetzt')
  })

  it('dozentEmail kommt mit zwei Ebenen fehlender Daten klar', () => {
    expect(dozentEmail(mathe)).toBe('weber@example.org')
    expect(dozentEmail(bs)).toBeNull()
    expect(dozentEmail({ ...mathe, dozent: { name: 'X' } })).toBeNull()
  })

  it('nachId baut ein Nachschlagewerk', () => {
    expect(nachId([mathe, bs])['f04']?.name).toBe('Betriebssysteme')
  })

  it('ectsProDozent summiert', () => {
    expect(ectsProDozent([mathe, bs, { ...mathe, id: 'f02', ects: 4 }])).toEqual({
      Weber: 10,
      unbesetzt: 5,
    })
  })

  it('kurzinfo enthält nur zwei Felder', () => {
    expect(kurzinfo(mathe)).toEqual({ id: 'f01', name: 'Mathematik I' })
    expect(Object.keys(kurzinfo(mathe))).toHaveLength(2)
  })

  it('gleichInhaltlich vergleicht Werte, nicht Referenzen', () => {
    const kopie = { ...mathe }

    expect(kopie === mathe).toBe(false)
    expect(gleichInhaltlich(kopie, mathe)).toBe(true)
    expect(gleichInhaltlich(mathe, bs)).toBe(false)
  })
})
