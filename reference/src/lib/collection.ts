import type { Identifiable } from '@/types/domain'

/**
 * Eine generische, unveraenderliche Sammlung von Objekten mit ID.
 *
 * Das `<T extends Identifiable>` ist eine *Constraint*: T darf alles sein,
 * solange es ein `id: string` hat. Genau deshalb darf `byId()` unten auf
 * `item.id` zugreifen - ohne die Constraint wuesste der Compiler nicht,
 * dass es das Feld gibt.
 *
 * Die Klasse ist bewusst immutable: jede Filter-/Sortier-Operation liefert
 * eine *neue* Collection. Das erspart die Klasse ganzer Fehlerklassen, bei
 * denen sich geteilte Arrays gegenseitig unter den Fuessen wegziehen.
 */
export class Collection<T extends Identifiable> implements Iterable<T> {
  readonly #items: readonly T[]
  readonly #byId: ReadonlyMap<string, T>

  constructor(items: readonly T[]) {
    this.#items = items
    this.#byId = new Map(items.map((item) => [item.id, item]))
  }

  get size(): number {
    return this.#items.length
  }

  /** Alle Elemente als Array - z.B. fuer `v-for`. */
  all(): readonly T[] {
    return this.#items
  }

  /** Lookup in O(1) ueber die interne Map. `undefined`, wenn es die ID nicht gibt. */
  byId(id: string): T | undefined {
    return this.#byId.get(id)
  }

  /**
   * Wie `byId`, wirft aber statt `undefined` zurueckzugeben.
   * Nutze das, wo eine fehlende ID ein Programmierfehler waere - dann musst du
   * im aufrufenden Code nicht gegen `undefined` pruefen.
   */
  require(id: string): T {
    const item = this.#byId.get(id)
    if (item === undefined) {
      throw new Error(`Kein Eintrag mit der ID "${id}" gefunden.`)
    }
    return item
  }

  has(id: string): boolean {
    return this.#byId.has(id)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.#items.find(predicate)
  }

  filter(predicate: (item: T) => boolean): Collection<T> {
    return new Collection(this.#items.filter(predicate))
  }

  /**
   * `map` gibt bewusst KEINE Collection zurueck, sondern ein Array:
   * das Ergebnis (z.B. ein Array von Strings) hat im Allgemeinen kein `id`-Feld
   * mehr und wuerde die Constraint verletzen. `<R>` ist ein zweiter,
   * unabhaengiger Typparameter - diesmal nur auf der Methode, nicht auf der Klasse.
   */
  map<R>(fn: (item: T, index: number) => R): R[] {
    return this.#items.map(fn)
  }

  /** Stabil sortieren nach einem abgeleiteten Schluessel. */
  sortBy(select: (item: T) => string | number): Collection<T> {
    const sorted = [...this.#items].sort((a, b) => {
      const left = select(a)
      const right = select(b)
      if (typeof left === 'string' && typeof right === 'string') {
        return left.localeCompare(right, 'de')
      }
      return Number(left) - Number(right)
    })
    return new Collection(sorted)
  }

  /** Macht `for (const x of collection)` und `[...collection]` moeglich. */
  [Symbol.iterator](): Iterator<T> {
    return this.#items[Symbol.iterator]()
  }
}
