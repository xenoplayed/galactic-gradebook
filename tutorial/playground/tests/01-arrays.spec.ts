import { describe, expect, it } from 'vitest'
import {
  alleNoten,
  alsText,
  durchschnitt,
  findeStudi,
  guteNoten,
  hatDurchgefallene,
  nachDurchschnitt,
  summe,
  verteilung,
  type Grade,
  type Studi,
} from '@target/01-arrays'

const alle: Studi[] = [
  { name: 'Berger', noten: [3, 4] },
  { name: 'Ackermann', noten: [1, 2] },
  { name: 'Conrad', noten: [5, 5] },
]

describe('01 — Arrays', () => {
  it('guteNoten filtert 3 und besser', () => {
    expect(guteNoten([1, 3, 4, 5, 2])).toEqual([1, 3, 2])
  })

  it('alsText übersetzt jede Note', () => {
    expect(alsText([1, 5])).toEqual(['sehr gut', 'nicht ausreichend'])
  })

  it('summe rechnet zusammen und kommt mit leer klar', () => {
    expect(summe([1, 2, 3])).toBe(6)
    expect(summe([])).toBe(0)
  })

  it('durchschnitt liefert null statt NaN', () => {
    expect(durchschnitt([2, 4])).toBe(3)
    expect(durchschnitt([])).toBeNull()
  })

  it('findeStudi findet oder gibt undefined', () => {
    expect(findeStudi(alle, 'Conrad')?.noten).toEqual([5, 5])
    expect(findeStudi(alle, 'Niemand')).toBeUndefined()
  })

  it('hatDurchgefallene erkennt eine 5', () => {
    expect(hatDurchgefallene(alle)).toBe(true)
    expect(hatDurchgefallene([{ name: 'X', noten: [1] }])).toBe(false)
  })

  it('nachDurchschnitt sortiert beste zuerst', () => {
    expect(nachDurchschnitt(alle).map((s) => s.name)).toEqual(['Ackermann', 'Berger', 'Conrad'])
  })

  it('nachDurchschnitt lässt die Eingabe in Ruhe', () => {
    const eingabe: Studi[] = [
      { name: 'B', noten: [4] },
      { name: 'A', noten: [1] },
    ]
    nachDurchschnitt(eingabe)

    // sort() sortiert an Ort und Stelle - ohne Kopie stünde hier A vorne.
    expect(eingabe.map((s) => s.name)).toEqual(['B', 'A'])
  })

  it('verteilung zählt und lässt keine Lücken', () => {
    expect(verteilung([1, 1, 4])).toEqual({ 1: 2, 2: 0, 3: 0, 4: 1, 5: 0 })
  })

  it('alleNoten flacht ab', () => {
    expect(alleNoten(alle)).toEqual<Grade[]>([3, 4, 1, 2, 5, 5])
  })
})
