import { describe, expect, it } from 'vitest'
import { ladeAlle, ladeAlleTolerant, mitWiederholung, spaeter, warte } from '@target/04-async'

describe('04 — async', () => {
  it('warte löst auf', async () => {
    const start = Date.now()
    await warte(20)

    expect(Date.now() - start).toBeGreaterThanOrEqual(15)
  })

  it('spaeter liefert den Wert', async () => {
    await expect(spaeter('fertig', 5)).resolves.toBe('fertig')
  })

  it('ladeAlle behält die Reihenfolge', async () => {
    // Absicht: 'a' braucht am längsten. Bei korrekt parallelem Laden steht es
    // trotzdem vorne, weil Promise.all nach Position sortiert, nicht nach Zeit.
    const dauer: Record<string, number> = { a: 30, b: 10, c: 1 }
    const ergebnis = await ladeAlle(['a', 'b', 'c'], (id) => spaeter(id.toUpperCase(), dauer[id]!))

    expect(ergebnis).toEqual(['A', 'B', 'C'])
  })

  it('ladeAlle lädt wirklich parallel', async () => {
    const start = Date.now()
    await ladeAlle(['a', 'b', 'c', 'd'], (id) => spaeter(id, 40))
    const dauer = Date.now() - start

    // Nacheinander wären es über 160 ms.
    expect(dauer).toBeLessThan(140)
  })

  it('ladeAlleTolerant überlebt einzelne Fehler', async () => {
    const ergebnis = await ladeAlleTolerant(['ok', 'kaputt', 'ok2'], async (id) => {
      if (id === 'kaputt') throw new Error('geht nicht')
      return id
    })

    expect(ergebnis).toEqual(['ok', null, 'ok2'])
  })

  it('mitWiederholung versucht es erneut', async () => {
    let versuche = 0
    const ergebnis = await mitWiederholung(
      async () => {
        versuche += 1
        if (versuche < 3) throw new Error('noch nicht')
        return 'endlich'
      },
      5,
      1,
    )

    expect(ergebnis).toBe('endlich')
    expect(versuche).toBe(3)
  })

  it('mitWiederholung gibt am Ende den Fehler weiter', async () => {
    await expect(
      mitWiederholung(
        async () => {
          throw new Error('dauerhaft kaputt')
        },
        2,
        1,
      ),
    ).rejects.toThrow('dauerhaft kaputt')
  })
})
