export interface MitId {
  id: string
}

export function erstes<T>(werte: readonly T[]): T | undefined {
  return werte[0]
}

export function gruppiere<T, K extends string | number>(
  werte: readonly T[],
  schluessel: (wert: T) => K,
): Record<K, T[]> {
  return werte.reduce(
    (acc, wert) => {
      const k = schluessel(wert)
      // ??= setzt nur, wenn der Wert null/undefined ist.
      acc[k] ??= []
      acc[k].push(wert)
      return acc
    },
    {} as Record<K, T[]>,
  )
}

export function nurFelder<T extends object, K extends keyof T>(
  objekt: T,
  felder: readonly K[],
): Pick<T, K> {
  return Object.fromEntries(felder.map((feld) => [feld, objekt[feld]])) as Pick<T, K>
}

export class Register<T extends MitId> {
  // `#` macht das Feld wirklich privat - anders als das TypeScript-`private`,
  // das nur der Compiler kennt und zur Laufzeit weg ist.
  readonly #eintraege: readonly T[]
  readonly #index: ReadonlyMap<string, T>

  constructor(eintraege: readonly T[]) {
    this.#eintraege = eintraege
    this.#index = new Map(eintraege.map((eintrag) => [eintrag.id, eintrag]))
  }

  get anzahl(): number {
    return this.#eintraege.length
  }

  hole(id: string): T | undefined {
    return this.#index.get(id)
  }

  holeSicher(id: string): T {
    const treffer = this.#index.get(id)
    if (treffer === undefined) {
      throw new Error(`Kein Eintrag mit der ID "${id}".`)
    }
    return treffer
  }

  filtern(pruefung: (eintrag: T) => boolean): Register<T> {
    return new Register(this.#eintraege.filter(pruefung))
  }

  alle(): readonly T[] {
    return this.#eintraege
  }
}
