import { describe, expect, it } from 'vitest'
import { fullName, toUsername } from '@/lib/strings'

describe('toUsername', () => {
  it('schreibt klein', () => {
    expect(toUsername('Weber')).toBe('weber')
  })

  it('schreibt deutsche Umlaute aus', () => {
    // Der haeufigste Fehler waere 'muller' - ue, nicht u.
    expect(toUsername('Müller')).toBe('mueller')
    expect(toUsername('Dörner')).toBe('doerner')
    expect(toUsername('Groß')).toBe('gross')
  })

  it('entfernt Akzente und Sonderzeichen', () => {
    expect(toUsername('Ferreira-Gómez')).toBe('ferreiragomez')
    expect(toUsername("O'Brien")).toBe('obrien')
  })
})

describe('fullName', () => {
  it('setzt Vor- und Nachnamen zusammen', () => {
    expect(fullName({ firstName: 'Greta', lastName: 'Müller' })).toBe('Greta Müller')
  })
})
