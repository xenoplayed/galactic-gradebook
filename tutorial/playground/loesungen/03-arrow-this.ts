export function machVerdoppler(): (x: number) => number {
  return (x) => x * 2
}

export function zaehler(beginn: number): () => number {
  // `stand` lebt weiter, obwohl zaehler() laengst zurueckgekehrt ist:
  // die zurueckgegebene Funktion haelt die Variable am Leben (Closure).
  let stand = beginn
  return () => {
    stand += 1
    return stand
  }
}

export function mapWenn<T>(
  werte: readonly T[],
  wenn: (wert: T) => boolean,
  fn: (wert: T) => T,
): T[] {
  return werte.map((wert) => (wenn(wert) ? fn(wert) : wert))
}

export class Kurs {
  constructor(public name: string) {}

  verspaetet(): string[] {
    // `this.formatieren` als Wert zu uebergeben trennt die Funktion von ihrem
    // Objekt: eine klassische Methode bekommt ihr `this` erst beim AUFRUF, und
    // map ruft sie ohne Empfaenger auf - `this` ist dann undefined.
    //
    // Die Arrow-Funktion loest das, weil sie kein eigenes `this` hat: sie
    // benutzt das der Stelle, an der sie geschrieben steht. Der Aufruf
    // this.formatieren() passiert also wieder am Objekt.
    //
    // Alternative mit demselben Effekt: [1].map(this.formatieren.bind(this))
    return [1].map(() => this.formatieren())
  }

  private formatieren(): string {
    return `Kurs: ${this.name}`
  }
}
