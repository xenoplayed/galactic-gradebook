export interface Fach {
  id: string
  name: string
  ects: number
  dozent?: { name: string; email?: string }
}

export function mitEcts(fach: Fach, ects: number): Fach {
  // Spread kopiert alle Felder, die Angabe danach ueberschreibt eines davon.
  // Die Kopie ist FLACH: fach.dozent zeigt danach auf dasselbe Objekt.
  return { ...fach, ects }
}

export function dozentName(fach: Fach): string {
  // ?. bricht bei undefined/null ab, ?? liefert den Ersatzwert.
  // Wichtig: ?? greift NUR bei null/undefined - im Gegensatz zu ||, das auch
  // bei '' und 0 einspringen wuerde.
  return fach.dozent?.name ?? 'unbesetzt'
}

export function dozentEmail(fach: Fach): string | null {
  return fach.dozent?.email ?? null
}

export function nachId(faecher: readonly Fach[]): Record<string, Fach> {
  return Object.fromEntries(faecher.map((fach) => [fach.id, fach]))
}

export function ectsProDozent(faecher: readonly Fach[]): Record<string, number> {
  return faecher.reduce<Record<string, number>>((acc, fach) => {
    const schluessel = fach.dozent?.name ?? 'unbesetzt'
    acc[schluessel] = (acc[schluessel] ?? 0) + fach.ects
    return acc
  }, {})
}

export function kurzinfo(fach: Fach): { id: string; name: string } {
  const { id, name } = fach
  return { id, name }
}

export function gleichInhaltlich(a: Fach, b: Fach): boolean {
  return a.id === b.id && a.name === b.name && a.ects === b.ects
}
