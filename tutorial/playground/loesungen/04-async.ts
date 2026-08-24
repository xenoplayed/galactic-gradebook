export function warte(ms: number): Promise<void> {
  // `new Promise` bekommt eine Funktion, die `resolve` erhaelt. Sobald
  // resolve() laeuft, gilt das Promise als erfuellt.
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function spaeter<T>(wert: T, ms: number): Promise<T> {
  await warte(ms)
  return wert
}

export async function ladeAlle<T>(
  ids: readonly string[],
  lade: (id: string) => Promise<T>,
): Promise<T[]> {
  // ids.map(lade) startet ALLE Ladevorgaenge sofort und liefert ein Array von
  // Promises. Promise.all wartet dann auf alle gleichzeitig.
  // Mit `for (const id of ids) { await lade(id) }` liefe alles nacheinander.
  return Promise.all(ids.map((id) => lade(id)))
}

export async function ladeAlleTolerant<T>(
  ids: readonly string[],
  lade: (id: string) => Promise<T>,
): Promise<(T | null)[]> {
  // allSettled wartet auf alle und wirft nie - es meldet je Eintrag
  // fulfilled oder rejected.
  const ergebnisse = await Promise.allSettled(ids.map((id) => lade(id)))
  return ergebnisse.map((e) => (e.status === 'fulfilled' ? e.value : null))
}

export async function mitWiederholung<T>(
  fn: () => Promise<T>,
  versuche: number,
  pauseMs: number,
): Promise<T> {
  let letzterFehler: unknown

  for (let i = 0; i < versuche; i += 1) {
    try {
      return await fn()
    } catch (fehler) {
      letzterFehler = fehler
      // Nach dem letzten Versuch nicht mehr warten.
      if (i < versuche - 1) await warte(pauseMs)
    }
  }

  throw letzterFehler
}
