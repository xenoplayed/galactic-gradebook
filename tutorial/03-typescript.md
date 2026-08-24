# 03 — TypeScript

> **Zeitbedarf:** ca. 2–3 Stunden · die Generics-Übung ist die längste im Playground

## Ziel

Du kannst Typen lesen und schreiben, kennst Union- und Literal-Typen, verstehst Narrowing und
kannst **generische Funktionen und Klassen** bauen. Übung: `playground/uebungen/05-generics.ts`.

---

## Was TypeScript ist — und was nicht

TypeScript ist JavaScript plus Typannotationen. Der Compiler prüft sie und **wirft sie dann
weg**. Zur Laufzeit läuft reines JavaScript; es gibt keine Typprüfung zur Laufzeit.

> **Anders als du es kennst**
> Kein Laufzeitschutz. Kommt eine JSON-Antwort mit falscher Struktur an, merkt TypeScript
> nichts — dein `as Fach` ist nur ein Versprechen an den Compiler. Alles, was von außen
> hereinkommt (HTTP, `localStorage`, Formulare), musst du selbst prüfen. Genau dafür gibt es
> die Type Guards weiter unten.

## Grundtypen

```ts
const name: string = 'Weber'
const alter: number = 42          // eine Zahlenart für alles
const aktiv: boolean = true
const noten: number[] = [1, 2]
const paar: [string, number] = ['DB', 5]      // Tupel: feste Länge und Position
let egal: unknown                             // sicher: erst prüfen, dann benutzen
let gefaehrlich: any                          // schaltet die Prüfung ab — vermeiden
function tutNichts(): void {}
```

Meist brauchst du gar keine Annotation — TypeScript leitet ab:

```ts
const name = 'Weber'        // string
const noten = [1, 2, 3]     // number[]
```

Schreib Typen dort hin, wo sie eine **Zusage** sind: an Funktionssignaturen und
Datenstrukturen. Nicht an jede lokale Variable.

`any` schaltet jede Prüfung ab und breitet sich aus. `unknown` ist der ehrliche Typ für
„weiß ich nicht“: du musst erst eingrenzen, bevor du etwas damit tust.

## `interface` und `type`

```ts
interface Fach {
  id: string
  name: string
  ects: number
  dozent?: string          // optional -> string | undefined
  readonly erstellt: Date  // nur beim Anlegen setzbar
}

type FachId = string                    // Alias
type Kennung = string | number          // Union — das geht mit interface nicht
type MitZeit = Fach & { stand: Date }   // Schnittmenge
```

Faustregel: `interface` für Objektformen, `type` für alles andere (Unions, Aliase,
Funktionstypen). `interface` lässt sich zusätzlich nachträglich erweitern — genau das nutzt
der Router in [Kapitel 07](07-router.md), um `meta` zu typisieren.

## Literal- und Union-Typen — das nützlichste Werkzeug

```ts
type Grade = 1 | 2 | 3 | 4 | 5
type Role = 'lecturer' | 'student'

const note: Grade = 3    // ok
const note: Grade = 6    // Fehler beim Kompilieren
```

Damit wandert der Wertebereich aus den `if`-Kaskaden ins Typsystem. Der Compiler weiß dann
auch, dass ein `switch` über `Role` alle Fälle abdeckt.

Brauchst du dieselbe Liste auch zur Laufzeit:

```ts
export const GRADES = [1, 2, 3, 4, 5] as const satisfies readonly Grade[]
```

- `as const` macht daraus `readonly [1,2,3,4,5]` statt `number[]`.
- `satisfies` prüft gegen `readonly Grade[]`, **ohne** den engen Typ wegzuwerfen. Mit
  `const GRADES: readonly Grade[] = [...]` wäre er zu `Grade[]` verallgemeinert.

## `Record` und Index-Typen

```ts
type GradeBook = Record<string, Record<string, Grade | null>>
type Labels = Record<Grade, string>   // muss alle fünf Schlüssel haben
```

`Record<K, V>` ist ein Objekt mit Schlüsseln vom Typ `K` und Werten vom Typ `V`. Ist `K` eine
Union von Literalen, verlangt der Compiler **Vollständigkeit** — vergisst du die 4, meckert er.

## Narrowing: von breit zu eng

```ts
function anzeige(wert: string | number): string {
  if (typeof wert === 'string') return wert.toUpperCase()  // hier: string
  return wert.toFixed(1)                                   // hier: number
}
```

Der Compiler folgt deinem Kontrollfluss. Mittel dafür: `typeof`, `instanceof`, `in`,
Wahrheitsprüfungen und der Vergleich auf ein Literal.

### Discriminated Union

```ts
interface Student { role: 'student'; matrikel: string }
interface Lecturer { role: 'lecturer'; titel: string }
type User = Student | Lecturer

if (user.role === 'student') {
  user.matrikel     // TypeScript weiß: Student
}
```

Ein gemeinsames Feld mit Literaltypen genügt. Das ist das Rückgrat des Domänenmodells in
[Kapitel 06](06-domaenenmodell.md).

### Type Guards — der Weg von außen nach innen

```ts
export function isGrade(value: unknown): value is Grade {
  return typeof value === 'number' && [1, 2, 3, 4, 5].includes(value as Grade)
}
```

`value is Grade` heißt: gibt diese Funktion `true` zurück, darf der Compiler `value` ab da als
`Grade` behandeln. Das ist der saubere Übergang von Laufzeitdaten (`localStorage`,
Formulareingabe) in einen engen Typ.

Und in `filter` derselbe Trick:

```ts
const vergeben = noten.filter((n): n is Grade => n !== null)
// -> Grade[], nicht (Grade | null)[]
```

Ohne die Annotation bliebe der Typ breit, obwohl der Code schon richtig filtert.

---

## Generics

Ein Generic ist ein **Parameter für Typen**. Statt eine Funktion für jeden Typ zu
verdoppeln, lässt du den Typ offen.

```ts
function erstes<T>(werte: readonly T[]): T | undefined {
  return werte[0]
}

erstes(['a', 'b'])   // T = string, Ergebnis string | undefined
erstes([1, 2])       // T = number
```

Der Typ wird beim Aufruf abgeleitet. `erstes<string>([...])` geht auch, ist aber selten nötig.

Ohne Generic hättest du `any[]` genommen — und der Compiler könnte dir bei
`erstes(['a']).toUpperCase()` nicht mehr helfen.

### Constraints

```ts
interface MitId { id: string }

function holen<T extends MitId>(liste: readonly T[], id: string): T | undefined {
  return liste.find((eintrag) => eintrag.id === id)   // eintrag.id ist erlaubt
}
```

`T extends MitId` heißt: T darf alles sein, **solange** es ein `id: string` hat. Genau das
erlaubt den Zugriff auf `eintrag.id`. Ohne die Constraint wüsste der Compiler nicht, dass es
das Feld gibt.

Mit zwei Parametern, die voneinander abhängen:

```ts
function nurFelder<T extends object, K extends keyof T>(obj: T, felder: readonly K[]): Pick<T, K>
```

`keyof T` ist die Union aller Feldnamen von T. Ein Tippfehler im Feldnamen ist damit ein
Compile-Fehler statt eines stillen `undefined`.

### Generische Klassen

```ts
export class Register<T extends MitId> {
  readonly #eintraege: readonly T[]
  readonly #index: ReadonlyMap<string, T>

  constructor(eintraege: readonly T[]) {
    this.#eintraege = eintraege
    this.#index = new Map(eintraege.map((e) => [e.id, e]))
  }

  hole(id: string): T | undefined {
    return this.#index.get(id)
  }

  // Ein ZWEITER Typparameter, nur auf der Methode. R hat mit T nichts zu tun.
  map<R>(fn: (eintrag: T) => R): R[] {
    return this.#eintraege.map(fn)
  }

  // Gibt eine neue Instanz zurück, nicht dieselbe verändert.
  filtern(pruefung: (e: T) => boolean): Register<T> {
    return new Register(this.#eintraege.filter(pruefung))
  }
}

const faecher = new Register<Fach>([...])
faecher.hole('f01')?.name     // TypeScript weiß, dass hier ein Fach herauskommt
```

Zwei Details, die es wert sind:

- **`#eintraege` ist echt privat.** Das `#` ist JavaScript-Syntax und gilt auch zur Laufzeit.
  Das TypeScript-Schlüsselwort `private` kennt dagegen nur der Compiler; nach dem Bauen ist es
  weg und jeder kommt an das Feld.
- **`map` gibt bewusst ein Array zurück, kein `Register`.** Das Ergebnis (z. B. Strings) hätte
  kein `id`-Feld mehr und würde die Constraint verletzen.

## Nützliche Utility-Typen

```ts
Partial<T>          // alle Felder optional
Required<T>
Readonly<T>
Pick<T, 'a' | 'b'>  // nur diese Felder
Omit<T, 'a'>        // alle außer diesen
Record<K, V>
ReturnType<typeof fn>
NonNullable<T>      // ohne null und undefined
```

## Zwei Einstellungen in diesem Projekt

```jsonc
"strict": true,                  // ohne das lohnt sich TypeScript kaum
"noUncheckedIndexedAccess": true // liste[0] ist T | undefined, nicht T
```

`noUncheckedIndexedAccess` nervt anfangs und rettet dich später. Es sagt die Wahrheit: ein
Index-Zugriff kann daneben greifen.

```ts
const erste = noten[0]       // Grade | undefined
if (erste !== undefined) { ... }
const wert = map[id] ?? null
```

Genau daran wirst du in [Kapitel 10](10-dozenten-view.md) noch stolpern, wenn `v-model` auf
einem Index-Zugriff nicht typprüft.

## Umgang mit `as`

`wert as Fach` schaltet die Prüfung aus. Manchmal nötig, oft ein Warnzeichen. Zwei
Alternativen, die fast immer besser sind: ein **Type Guard** (siehe oben) oder `satisfies`.

---

## Deine Aufgabe

Bearbeite `playground/uebungen/05-generics.ts`. Der `Register<T>`-Teil ist genau die Klasse,
die im Referenzprojekt als `Collection<T>` die Stammdaten hält — du baust sie hier einmal
selbst.

## Stolperfallen

- `any` als schnelle Lösung. Nimm `unknown` und grenze ein.
- `as` statt eines Type Guards.
- Bei `filter` die Annotation `(n): n is Grade =>` vergessen.
- `Record<Grade, number>` unvollständig anlegen.

## Selbstcheck

- [ ] `playground` ist komplett grün (`npm test`)
- [ ] Du kannst erklären, wofür `T extends MitId` gebraucht wird
- [ ] Du kannst erklären, warum `map<R>` einen zweiten Typparameter hat
- [ ] Du kannst den Unterschied zwischen `#feld` und `private feld` benennen
- [ ] Du weißt, wann `satisfies` besser ist als `:`

## In der Referenz

- `reference/src/lib/collection.ts` — die generische Klasse
- `reference/src/types/domain.ts` — `Grade`, `GRADES` mit `as const satisfies`, `User` als
  Discriminated Union, die Type Guards `isStudent`/`isLecturer`
- `reference/src/lib/grades.ts` — `isGrade` als Type Guard, `filter((g): g is Grade => ...)`
