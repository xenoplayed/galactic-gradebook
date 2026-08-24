import { describe, expect, it } from 'vitest'
import {
  average,
  distribution,
  formatAverage,
  formatGrade,
  gradedCount,
  isGrade,
  isPassing,
  parseGrade,
  passRate,
} from '@/lib/grades'

describe('isGrade', () => {
  it('akzeptiert genau 1 bis 5', () => {
    expect([1, 2, 3, 4, 5].every(isGrade)).toBe(true)
  })

  it('lehnt alles andere ab', () => {
    // '3' als String ist der Fall, der in der Praxis aus Formularen kommt.
    for (const value of [0, 6, -1, 2.5, '3', null, undefined, NaN]) {
      expect(isGrade(value)).toBe(false)
    }
  })
})

describe('parseGrade', () => {
  it('liest Ziffern', () => {
    expect(parseGrade('3')).toBe(3)
    expect(parseGrade(' 1 ')).toBe(1)
  })

  it('akzeptiert das Komma als Dezimaltrenner, nicht aber Zwischenwerte', () => {
    expect(parseGrade('2,0')).toBe(2)
    expect(parseGrade('2,5')).toBeUndefined()
  })

  it('unterscheidet leer von ungueltig', () => {
    // Das ist der Kern: geleertes Feld ist erlaubt, Unsinn nicht.
    expect(parseGrade('')).toBeNull()
    expect(parseGrade('   ')).toBeNull()
    expect(parseGrade('7')).toBeUndefined()
    expect(parseGrade('abc')).toBeUndefined()
  })
})

describe('average', () => {
  it('mittelt nur vergebene Noten', () => {
    // null darf nicht als 0 mitgerechnet werden - sonst waere das Ergebnis 1.5.
    expect(average([1, 2, null, 3])).toBe(2)
  })

  it('gibt null statt NaN zurueck, wenn nichts benotet ist', () => {
    expect(average([])).toBeNull()
    expect(average([null, null])).toBeNull()
  })
})

describe('distribution', () => {
  it('zaehlt je Note und laesst keine Luecken', () => {
    expect(distribution([1, 1, 3, null, 5])).toEqual({ 1: 2, 2: 0, 3: 1, 4: 0, 5: 1 })
  })
})

describe('passRate', () => {
  it('rechnet 5 als nicht bestanden', () => {
    expect(isPassing(4)).toBe(true)
    expect(isPassing(5)).toBe(false)
    expect(passRate([1, 2, 5, 5])).toBe(50)
  })

  it('ignoriert nicht benotete Plaetze', () => {
    expect(passRate([1, null, null])).toBe(100)
    expect(passRate([null])).toBeNull()
  })
})

describe('Formatierung', () => {
  it('zeigt fehlende Werte als Gedankenstrich', () => {
    expect(formatGrade(null)).toBe('–')
    expect(formatAverage(null)).toBe('–')
  })

  it('nutzt das deutsche Dezimalkomma', () => {
    expect(formatAverage(2.3456)).toBe('2,3')
  })

  it('zaehlt vergebene Noten', () => {
    expect(gradedCount([1, null, 3])).toBe(2)
  })
})
