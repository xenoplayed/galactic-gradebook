# 06 — Domänenmodell und Daten

## Ziel

Du legst die Fachlichkeit an: Typen, feste Testdaten und Funktionen zum Rechnen mit Noten —
**ohne eine Zeile Vue**. Danach hat deine App ein Fundament, auf dem alles Weitere aufsetzt.

---

## Warum Vue hier nichts zu suchen hat

`lib/`, `types/` und `data/` importieren nichts aus Vue. Das hat drei handfeste Gründe:

1. **Testbar ohne Framework.** `average([1, 2, null])` prüfst du in drei Zeilen, ohne eine
   Komponente zu mounten.
2. **Austauschbar.** Kommt später ein echtes Backend, ersetzt du `data/` und lässt die Views
   in Ruhe.
3. **Wiederverwendbar.** Dieselbe Funktion läuft in der Dozenten- und in der
   Studierenden-Ansicht. Läge sie in einer Komponente, würdest du sie kopieren.

> **Anders als du es kennst**
> Wenn du bisher Shell-Skripte geschrieben hast, ist das der Unterschied zwischen „alles in
> einer Datei“ und „Funktionen in einer Bibliothek, die das Skript einbindet“. Die Trennung
> zahlt sich ab dem zweiten Verwendungsort aus.

## Die Typen

`src/types/domain.ts`:

```ts
export type Role = 'lecturer' | 'student'

export interface Identifiable {
  readonly id: string
}

export interface Person extends Identifiable {
  readonly firstName: string
  readonly lastName: string
  readonly roleLabel: string
}

export interface Student extends Person {
  readonly role: 'student'
  readonly matriculationNumber: string
}

export interface Lecturer extends Person {
  readonly role: 'lecturer'
  readonly academicTitle: string
}

export type User = Student | Lecturer

export interface Subject extends Identifiable {
  readonly name: string
  readonly shortName: string
  readonly semester: number
  readonly ects: number
}

export type Grade = 1 | 2 | 3 | 4 | 5
export const GRADES = [1, 2, 3, 4, 5] as const satisfies readonly Grade[]

export type GradeBook = Record<string, Record<string, Grade | null>>
```

Vier Entscheidungen, die den Rest der App prägen:

**`Grade` ist eine Literal-Union.** Der Wertebereich lebt im Typsystem. `const g: Grade = 6`
ist ein Compile-Fehler, und du brauchst nirgends eine Bereichsprüfung „von Hand“.

**`roleLabel` ist ein Datenfeld.** Wie eine Person bezeichnet werden möchte, steht in den
Daten. Aus einem Vornamen lässt sich das nicht erschließen, also wird es auch nicht versucht.

**`User` ist eine Discriminated Union.** Nach `if (user.role === 'student')` weiß der
Compiler, dass `matriculationNumber` existiert.

**`null` heißt „nicht benotet“.** Nicht `undefined` (das wäre von „Schlüssel fehlt“ nicht zu
unterscheiden) und nicht `0` (damit könnte man rechnen).

Dazu zwei Type Guards:

```ts
export function isStudent(user: User): user is Student {
  return user.role === 'student'
}
```

## Die generische Sammlung

`src/lib/collection.ts` — das ist die `Register<T>`-Klasse aus
[Kapitel 03](03-typescript.md), nur unter ihrem richtigen Namen. Sie hält die Stammdaten und
bietet `byId`, `require`, `filter`, `sortBy`, `map` und `all`.

Zwei Punkte, die den Unterschied machen:

```ts
require(id: string): T {
  const item = this.#byId.get(id)
  if (item === undefined) throw new Error(`Kein Eintrag mit der ID "${id}" gefunden.`)
  return item
}
```

`byId` gibt `T | undefined` zurück und zwingt jeden Aufrufer zur Prüfung. `require` wirft.
Nimm `require`, wo eine fehlende ID ein Programmierfehler wäre, und `byId`, wo sie aus einer
URL kommt und tatsächlich falsch sein kann.

```ts
sortBy(select: (item: T) => string | number): Collection<T> {
  const sorted = [...this.#items].sort(...)
  return new Collection(sorted)
}
```

Die Kopie ist keine Kosmetik. Ohne sie sortierst du die Stammdaten global um — und die
nächste Ansicht zeigt eine andere Reihenfolge, ohne dass jemand etwas geändert hat.

## Das Rechnen mit Noten

`src/lib/grades.ts` — reine Funktionen, jede in ein paar Zeilen:

| Funktion | Zusage |
| --- | --- |
| `isGrade(v: unknown): v is Grade` | Type Guard von außen nach innen |
| `parseGrade(text: string)` | `Grade`, `null` (leer) oder `undefined` (ungültig) |
| `average(noten)` | `number \| null` — nie `NaN` |
| `distribution(noten)` | `Record<Grade, number>`, immer alle fünf Schlüssel |
| `gradedCount`, `passRate`, `isPassing` | |
| `formatGrade`, `formatAverage`, `gradeLabel` | Darstellung, deutsches Dezimalkomma |

**Die drei Rückgabefälle von `parseGrade` sind der Kern des Ganzen.** Ein geleertes Feld ist
eine erlaubte Aktion; eine 7 ist ein Fehler. Wären beide `null`, könnte das Formular sie nicht
auseinanderhalten und würde bei jedem Tippfehler still die Note löschen.

```ts
export function parseGrade(input: string): Grade | null | undefined {
  const trimmed = input.trim()
  if (trimmed === '') return null           // muss VOR Number() stehen: Number('') ist 0

  const value = Number(trimmed.replace(',', '.'))
  return isGrade(value) ? value : undefined
}
```

Und der Umgang mit `null` beim Rechnen:

```ts
export function average(grades: readonly (Grade | null)[]): number | null {
  const given = grades.filter((grade): grade is Grade => grade !== null)
  if (given.length === 0) return null       // nicht NaN nach außen lassen

  return given.reduce((total, grade) => total + grade, 0) / given.length
}
```

## Die Testdaten

`src/data/` — eine Datei je Sorte, plus `seed.ts`, das alles zusammensetzt.

```ts
export const LECTURERS = [
  { id: 'd01', firstName: 'Martina', lastName: 'Weber',
    academicTitle: 'Prof. Dr.', roleLabel: 'Dozentin', role: 'lecturer' },
] as const satisfies readonly Lecturer[]
```

`as const satisfies` prüft die Struktur, behält aber die engen Literaltypen — `LECTURERS[0].id`
ist damit genau `'d01'` und nicht irgendein `string`.

Fünfzehn Studierende, davon bewusst welche mit Umlaut im Nachnamen (`Müller`, `Groß`,
`Dörner`) — der Login in [Kapitel 08](08-pinia.md) muss damit umgehen. Zehn Fächer über fünf
Semester.

### Die Notenmatrix als Funktion, nicht als Konstante

```ts
export function createGradeBook(): GradeBook {
  const book: GradeBook = {}

  for (const subject of subjects) {
    const prefilled = PREFILLED[subject.id]
    const row: Record<string, Grade | null> = {}

    students.all().forEach((student, index) => {
      row[student.id] = prefilled?.[index] ?? null
    })
    book[subject.id] = row
  }
  return book
}
```

**Warum eine Funktion:** Sie gibt jedes Mal ein frisches Objekt zurück. Wäre es eine
exportierte Konstante, teilten sich Store und Tests dieselbe Referenz — und ein Test würde den
nächsten beeinflussen. Genau diese Sorte Fehler ist später schwer zu finden.

**Vier Fächer sind vorbelegt, sechs leer.** Damit hat die Dozentin sofort offene Arbeit, und
die Studierenden sehen sofort einen gefüllten Klassenspiegel. Eine App, die nach dem ersten
Start nur leere Zustände zeigt, kann man nicht beurteilen.

**Für jedes Fach steht ein Eintrag für jede Person drin** — auch für die nicht benoteten, dann
eben `null`. Fehlende Schlüssel wären eine zweite Bedeutung von „nicht benotet“, und du
müsstest überall doppelt prüfen.

## Der Login-Name

```ts
const GERMAN_REPLACEMENTS: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }

export function toUsername(lastName: string): string {
  return lastName
    .toLowerCase()
    .replace(/[äöüß]/g, (char) => GERMAN_REPLACEMENTS[char] ?? char)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '')
}
```

Die Reihenfolge ist entscheidend. `normalize('NFD')` zerlegt Buchstaben mit Zeichen darüber in
Grundbuchstabe plus kombinierendes Zeichen (`é` → `e` + `´`); das Wegwerfen der Range
U+0300–U+036F entfernt dann die Akzente. Stünde das **vor** der Umlaut-Ersetzung, würde aus
`ü` ein `u` statt `ue` — und `Müller` meldete sich als `muller` an.

---

## Deine Aufgabe

1. `src/types/domain.ts` mit den Typen und Type Guards.
2. `src/lib/collection.ts` — deine `Collection<T>` (nutze deine Lösung aus dem Playground).
3. `src/lib/strings.ts` mit `toUsername` und `fullName`.
4. `src/lib/grades.ts` mit den Funktionen aus der Tabelle oben.
5. `src/data/` mit Dozentin, 15 Studierenden, 10 Fächern und `createGradeBook()`.
6. Prüfe im Browser: gib in `App.vue` testweise
   `subjects.all().map(f => f.name)` und `average(gradesForSubject('f01'))` aus.

Erfinde eigene Namen und Fächer — Hauptsache, mindestens ein Nachname hat einen Umlaut.

## Stolperfallen

- `Number('')` ist `0`. Die Leerprüfung muss davor stehen.
- `normalize` vor der Umlaut-Ersetzung.
- Notenmatrix als exportierte Konstante statt als Funktion.
- `distribution` als leeres Objekt starten — dann fehlen Schlüssel, und das Diagramm hat
  Lücken.
- `sortBy` ohne Kopie.

## Selbstcheck

- [ ] `average([1, 2, null])` ergibt `1.5`, nicht `1`
- [ ] `average([])` ergibt `null`, nicht `NaN`
- [ ] `parseGrade('')`, `parseGrade('7')` und `parseGrade('3')` liefern drei verschiedene Dinge
- [ ] `toUsername('Müller')` ergibt `'mueller'`
- [ ] `createGradeBook()` zweimal aufgerufen liefert zwei unabhängige Objekte
- [ ] Nichts in `lib/`, `types/`, `data/` importiert aus `vue`

## In der Referenz

- `src/types/domain.ts`, `src/lib/collection.ts`, `src/lib/grades.ts`, `src/lib/strings.ts`
- `src/data/lecturers.ts`, `students.ts`, `subjects.ts`, `seed.ts`
- Tests dazu: `src/lib/__tests__/` — die sind auch eine gute Beschreibung dessen, was die
  Funktionen zusagen
