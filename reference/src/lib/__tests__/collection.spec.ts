import { describe, expect, it } from 'vitest'
import { Collection } from '@/lib/collection'

interface Animal {
  id: string
  name: string
  legs: number
}

const animals = new Collection<Animal>([
  { id: 'a', name: 'Zebra', legs: 4 },
  { id: 'b', name: 'Ameise', legs: 6 },
  { id: 'c', name: 'Mensch', legs: 2 },
])

describe('Collection', () => {
  it('findet ueber die ID', () => {
    expect(animals.byId('b')?.name).toBe('Ameise')
    expect(animals.byId('gibtsnicht')).toBeUndefined()
  })

  it('wirft bei require mit unbekannter ID', () => {
    expect(() => animals.require('gibtsnicht')).toThrow(/gibtsnicht/)
  })

  it('bleibt beim Filtern unveraendert', () => {
    const few = animals.filter((animal) => animal.legs <= 4)

    expect(few.size).toBe(2)
    // Die Ausgangs-Collection darf sich nicht geaendert haben.
    expect(animals.size).toBe(3)
  })

  it('sortiert Strings nach deutschen Regeln', () => {
    expect(animals.sortBy((animal) => animal.name).map((animal) => animal.name)).toEqual([
      'Ameise',
      'Mensch',
      'Zebra',
    ])
  })

  it('sortiert Zahlen numerisch', () => {
    expect(animals.sortBy((animal) => animal.legs).map((animal) => animal.legs)).toEqual([2, 4, 6])
  })

  it('ist iterierbar', () => {
    expect([...animals]).toHaveLength(3)
  })
})
