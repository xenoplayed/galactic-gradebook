# 06 — Domänenmodell und Daten

> **Zeitbedarf:** ca. 2–3 Stunden · davon rund eine Stunde reines Fixture-Tippen

## Ziel

Du legst die Fachlichkeit an: Typen, feste Testdaten und Funktionen zum Rechnen mit
Bewertungen — **ohne eine Zeile Vue**. Dabei entsteht die wichtigste Entwurfsentscheidung der
ganzen App: **wie vier Akademien voneinander getrennt werden.**

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

## Die Akademie als Dimension

Vier Akademien teilen sich eine Anwendung. Ein Padawan darf keine imperialen Fächer sehen, und
der Vergleich im Jahrgang zählt nur die eigene Akademie. Die Frage ist: **wo lebt diese
Trennung?**

Die naheliegende Antwort wäre, sie in den Views zu prüfen — überall dort ein `if`, wo Daten
angezeigt werden. Das ist die schlechte Antwort: Man vergisst genau eine Stelle, und dort
sickern fremde Daten durch. (Genau das ist mir beim Bauen der Referenz passiert — dazu unten
mehr.)

Die bessere Antwort: **die Trennung in die Datenstruktur legen.**

```ts
export type AcademyId = 'jedi' | 'sith' | 'empire' | 'rebels'
```

Diese ID kommt auf zwei Dinge: auf jede **Person** und auf jedes **Fach**. Mehr nicht.

### Warum die Notenmatrix unverändert bleibt

Man könnte auf die Idee kommen, `GradeBook` um eine Ebene zu erweitern:

```ts
// NICHT so
type GradeBook = Record<AcademyId, Record<SubjectId, Record<StudentId, Grade | null>>>
```

Das wäre **redundant**. Ein Fach gehört zu genau einer Akademie — die Fach-ID legt die
Akademie bereits fest. Eine dritte Ebene müsste man bei jeder Änderung konsistent halten, und
sie könnte widersprüchlich werden: Was gilt, wenn `book['jedi']['f13']` (ein imperiales Fach)
einen Eintrag hätte?

Es bleibt also bei:

```ts
export type GradeBook = Record<SubjectId, Record<StudentId, Grade | null>>
```

> **Die Regel dahinter:** Speichere eine Beziehung genau einmal. Alles, was daraus folgt,
> wird abgeleitet. Das ist dieselbe Überlegung wie beim Normalisieren einer Datenbank.

### Filtern mit dem, was schon da ist

Die eigentliche Trennung sind zwei Funktionen in `src/data/seed.ts`:

```ts
export function studentsOf(academyId: AcademyId): readonly Student[] {
  return students
    .filter((student) => student.academyId === academyId)
    .sortBy((student) => student.lastName)
    .all()
}

export function subjectsOf(academyId: AcademyId): readonly Subject[] { … }
```

`filter` und `sortBy` sind deine eigenen Methoden aus `Collection<T>` — du hast sie in
Kapitel 03 gebaut und brauchst hier keine Zeile neuen Infrastruktur-Code. Genau dafür lohnt
sich eine kleine, gut geschnittene Klasse.

### Alles Sprachliche an einem Ort

Bei den Jedi heißen Lernende „Padawan", im Imperium „Kadett". Eine 5 heißt bei den Jedi „Von
der dunklen Seite versucht", im Imperium „Nachschulung angeordnet". Das sind **Daten**, keine
Fallunterscheidungen:

```ts
export interface Academy extends Identifiable {
  readonly id: AcademyId
  readonly name: string
  readonly motto: string
  readonly lecturerLabel: string   // "Großmeister" | "Dunkler Lord" | …
  readonly studentLabel: string    // "Padawan" | "Akolyth" | "Kadett" | "Rekrut"
  readonly studentPlural: string
  readonly subjectLabel: string    // "Lehrpfad" | "Lehre" | "Ausbildungsfach" | "Kurs"
  readonly gradeLabels: Record<Grade, string>
}
```

Der Test dafür: **eine fünfte Akademie hinzuzufügen darf keine Komponente berühren.** Ein
Eintrag in `academies.ts`, Fixtures, eine Farbpalette — fertig. Wenn du irgendwo ein
`if (academy === 'sith')` schreiben musst, gehört dieser Wert stattdessen in die Akademie.

Sobald mehrere Sprachen dazukommen, wandern genau diese Felder in die Sprachdateien
([Kapitel 15](15-mehrsprachigkeit.md)) — das Prinzip bleibt, der Ort wird präziser.

`Record<Grade, string>` ist dabei mehr als Bequemlichkeit: weil `Grade` eine Union von fünf
Literalen ist, **verlangt** der Compiler alle fünf Schlüssel. Eine vergessene 4 ist ein
Compile-Fehler.

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
  readonly academyId: AcademyId    // bindet die Person an genau einen Ausbildungsweg
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
  readonly academyId: AcademyId    // daraus folgt, wer das Fach sehen darf
}

export type Grade = 1 | 2 | 3 | 4 | 5
export const GRADES = [1, 2, 3, 4, 5] as const satisfies readonly Grade[]

export type GradeBook = Record<string, Record<string, Grade | null>>
```

Vier Entscheidungen, die den Rest der App prägen:

**`Grade` ist eine Literal-Union.** Der Wertebereich lebt im Typsystem. `const g: Grade = 6`
ist ein Compile-Fehler, und du brauchst nirgends eine Bereichsprüfung „von Hand“.

**Die Rollenbezeichnung ist keine Namensableitung.** Wie eine Person bezeichnet wird
(„Padawan", „Großmeister"), folgt aus Rolle plus Akademie — und niemals aus dem Vornamen. Aus
einem Namen lässt sich so etwas nicht erschließen, also wird es auch nicht versucht.

> **Vorgriff auf [Kapitel 15](15-mehrsprachigkeit.md):** In der fertigen Referenz stehen diese
> Bezeichnungen in den Sprachdateien, weil ein „Großmeister" auf Englisch „Grand Master" heißt.
> Bau sie fürs Erste als Feld — der Grundsatz bleibt derselbe, nur der Ort ändert sich später.

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
  { id: 'd01', firstName: 'Yoda', lastName: 'Yoda', academicTitle: 'Großmeister des Ordens',
    roleLabel: 'Großmeister', role: 'lecturer', academyId: 'jedi' },
  …
] as const satisfies readonly Lecturer[]
```

`as const satisfies` prüft die Struktur, behält aber die engen Literaltypen — `LECTURERS[0].id`
ist damit genau `'d01'` und nicht irgendein `string`.

**Zehn Lernende und sechs Fächer je Akademie**, also 40 und 24 insgesamt. Zehn Bewertungen
ergeben ein lesbares Balkendiagramm; bei vier oder fünf sähe jede Verteilung gleich aus.

Ein Detail, das dir Ärger erspart: **die Nachnamen müssen akademieübergreifend eindeutig
sein.** Der Login sucht in *einer* Sammlung über alle Personen — zwei Leute mit demselben
Nachnamen wären nicht auflösbar. In der Referenz gibt es dafür einen eigenen Test, der sofort
anschlägt, wenn jemand einen doppelten Namen ergänzt:

```ts
const logins = users.map((user) => toUsername(user.lastName))
expect(new Set(logins).size).toBe(logins.length)
```

### Die Notenmatrix als Funktion, nicht als Konstante

```ts
export function createGradeBook(): GradeBook {
  const book: GradeBook = {}

  for (const subject of subjects) {
    const prefilled = PREFILLED[subject.id]
    const row: Record<string, Grade | null> = {}

    // NUR die Lernenden der eigenen Akademie
    studentsOf(subject.academyId).forEach((student, index) => {
      row[student.id] = prefilled?.[index] ?? null
    })

    book[subject.id] = row
  }
  return book
}
```

**Das `studentsOf(subject.academyId)` ist die zentrale Zeile des ganzen Kapitels.** Ein Padawan
taucht dadurch in einem imperialen Fach gar nicht erst auf. Nicht „wird ausgeblendet" — er ist
schlicht nicht da. Was die Datenstruktur nie enthält, kann keine View versehentlich anzeigen.

**Warum eine Funktion:** Sie gibt jedes Mal ein frisches Objekt zurück. Wäre es eine
exportierte Konstante, teilten sich Store und Tests dieselbe Referenz — und ein Test würde den
nächsten beeinflussen. Genau diese Sorte Fehler ist später schwer zu finden.

**Zwei Fächer je Akademie sind vorbelegt, vier leer.** Damit hat jede lehrende Person sofort
offene Arbeit, und jede lernende sieht sofort einen gefüllten Vergleich. Eine App, die nach dem
ersten Start nur leere Zustände zeigt, kann man nicht beurteilen.

**Für jedes Fach steht ein Eintrag für jede zugehörige Person drin** — auch für die noch nicht
bewerteten, dann eben `null`. Fehlende Schlüssel wären eine zweite Bedeutung von „nicht
bewertet", und du müsstest überall doppelt prüfen.

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

> **In dieser Galaxis gibt es keine Umlaute.** Den Fall deckt der Test in `strings.spec.ts`
> trotzdem ab — die Funktion soll ihn ja können. In den Fixtures übernimmt eine Rebellin
> namens `Sabé` den Akzent-Fall: aus ihr wird `sabe`. Testdaten und Tests decken hier
> unterschiedliche Dinge ab, und das ist in Ordnung.

---

## Deine Aufgabe

1. `src/types/domain.ts` mit den Typen, `AcademyId`, `Academy` und den Type Guards.
2. `src/lib/collection.ts` — deine `Collection<T>` (nutze deine Lösung aus dem Playground).
3. `src/lib/strings.ts` mit `toUsername` und `fullName`.
4. `src/lib/grades.ts` mit den Funktionen aus der Tabelle oben.
5. `src/data/academies.ts` mit vier Akademien inklusive Bezeichnungen und Notenlabels.
6. `src/data/` mit vier Lehrenden, 40 Lernenden, 24 Fächern, `studentsOf`, `subjectsOf` und
   `createGradeBook()`.
7. Prüfe im Browser: gib in `App.vue` testweise `subjectsOf('sith').map(f => f.name)` und
   `studentsOf('jedi').length` aus.

Erfinde ruhig eigene Figuren und Fächer — vier Fraktionen deiner Wahl tun es auch. Wichtig
sind nur: eindeutige Nachnamen und mindestens einer mit Akzent oder Umlaut.

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
- [ ] `toUsername('Sabé')` ergibt `'sabe'`, `toUsername('Müller')` ergibt `'mueller'`
- [ ] `createGradeBook()` zweimal aufgerufen liefert zwei unabhängige Objekte
- [ ] `studentsOf('jedi')` liefert 10 Personen, `subjectsOf('sith')` 6 Fächer
- [ ] In `createGradeBook()['f13']` (imperiales Fach) steht **kein** Jedi-Schlüssel
- [ ] Alle Nachnamen sind eindeutig
- [ ] Nichts in `lib/`, `types/`, `data/` importiert aus `vue`

## In der Referenz

- `reference/src/types/domain.ts`, `reference/src/lib/collection.ts`, `reference/src/lib/grades.ts`, `reference/src/lib/strings.ts`
- `reference/src/data/academies.ts`, `lecturers.ts`, `students.ts`, `subjects.ts`, `seed.ts`
- `reference/src/data/__tests__/academies.spec.ts` — prüft Trennung und Eindeutigkeit
- Tests dazu: `reference/src/lib/__tests__/` — die sind auch eine gute Beschreibung dessen, was die
  Funktionen zusagen
