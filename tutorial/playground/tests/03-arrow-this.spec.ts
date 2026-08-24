import { describe, expect, it } from 'vitest'
import { Kurs, machVerdoppler, mapWenn, zaehler } from '@target/03-arrow-this'

describe('03 — Funktionen und this', () => {
  it('machVerdoppler gibt eine Funktion zurück', () => {
    expect(machVerdoppler()(21)).toBe(42)
  })

  it('zaehler merkt sich seinen Stand', () => {
    const next = zaehler(10)

    expect(next()).toBe(11)
    expect(next()).toBe(12)
  })

  it('zwei Zähler stören sich nicht', () => {
    const a = zaehler(0)
    const b = zaehler(100)
    a()

    expect(b()).toBe(101)
  })

  it('mapWenn wendet nur bedingt an', () => {
    expect(mapWenn([1, 2, 3, 4], (n) => n % 2 === 0, (n) => n * 10)).toEqual([1, 20, 3, 40])
  })

  it('Kurs.verspaetet findet sein this', () => {
    expect(new Kurs('Datenbanken').verspaetet()).toEqual(['Kurs: Datenbanken'])
  })
})
