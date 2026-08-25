# 06 — Domain model and data

> **Time:** about 2–3 hours · roughly an hour of that is plain fixture typing

## Goal

You build the domain: types, fixed sample data and functions for working with assessments —
**without a single line of Vue**. Along the way you make the most important design decision in
the whole app: **how four academies are kept apart.**

---

## Why Vue has no business here

`lib/`, `types/` and `data/` import nothing from Vue. There are three solid reasons:

1. **Testable without a framework.** You check `average([1, 2, null])` in three lines, without
   mounting a component.
2. **Replaceable.** When a real backend comes along later, you replace `data/` and leave the
   views alone.
3. **Reusable.** The same function runs in the instructor and in the trainee view. If it lived
   in a component, you'd copy it.

> **Not what you're used to**
> If you've mostly written shell scripts, this is the difference between "everything in one
> file" and "functions in a library that the script sources". The separation pays off from the
> second use site onwards.

## The academy as a dimension

Four academies share one application. A Padawan must not see Imperial subjects, and the cohort
comparison only counts their own academy. The question is: **where does that separation live?**

The obvious answer would be to check it in the views — an `if` everywhere data is displayed.
That's the bad answer: you forget exactly one place, and foreign data leaks through there.
(That happened to me while building the reference — more on it below.)

The better answer: **put the separation into the data structure.**

```ts
export type AcademyId = 'jedi' | 'sith' | 'empire' | 'rebels'
```

This ID goes on two things: on every **person** and on every **subject**. Nothing else.

### Why the grade book stays as it is

You might be tempted to add a level to `GradeBook`:

```ts
// NOT like this
type GradeBook = Record<AcademyId, Record<SubjectId, Record<StudentId, Grade | null>>>
```

That would be **redundant**. A subject belongs to exactly one academy — the subject ID already
determines it. A third level would have to be kept consistent on every change, and it could
become contradictory: what holds if `book['jedi']['f13']` (an Imperial subject) had an entry?

So it stays:

```ts
export type GradeBook = Record<SubjectId, Record<StudentId, Grade | null>>
```

> **The rule behind it:** store a relationship exactly once. Everything that follows from it
> gets derived. That's the same reasoning as normalising a database.

### Filtering with what's already there

The actual separation is two functions in `src/data/seed.ts`:

```ts
export function studentsOf(academyId: AcademyId): readonly Student[] {
  return students
    .filter((student) => student.academyId === academyId)
    .sortBy((student) => student.lastName)
    .all()
}

export function subjectsOf(academyId: AcademyId): readonly Subject[] { … }
```

`filter` and `sortBy` are your own methods on `Collection<T>` — you built them in chapter 03
and need no new infrastructure code here. That's exactly what a small, well-cut class is for.

### Everything language-shaped in one place

At the Jedi temple, trainees are called "Padawan"; in the Empire, "Cadet". A 5 is "Tempted by
the dark side" for the Jedi and "Retraining ordered" for the Empire. Those are **data**, not
case distinctions:

```ts
export interface Academy extends Identifiable {
  readonly id: AcademyId
  readonly name: string
  readonly motto: string
  readonly lecturerLabel: string   // "Grand Master" | "Dark Lord" | …
  readonly studentLabel: string    // "Padawan" | "Acolyte" | "Cadet" | "Recruit"
  readonly studentPlural: string
  readonly subjectLabel: string    // "Path" | "Teaching" | "Course" | "Class"
  readonly gradeLabels: Record<Grade, string>
}
```

The test for it: **adding a fifth academy must not touch a single component.** One entry in
`academies.ts`, fixtures, a colour palette — done. If you find yourself writing
`if (academy === 'sith')` somewhere, that value belongs in the academy instead.

Once several languages arrive, exactly these fields move into the locale files
([chapter 15](15-i18n.md)) — the principle stays, the location gets more precise.

`Record<Grade, string>` is more than convenience here: because `Grade` is a union of five
literals, the compiler **demands** all five keys. A forgotten 4 is a compile error.

## The types

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
  readonly academyId: AcademyId    // binds the person to exactly one academy
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
  readonly academyId: AcademyId    // from this follows who may see the subject
}

export type Grade = 1 | 2 | 3 | 4 | 5
export const GRADES = [1, 2, 3, 4, 5] as const satisfies readonly Grade[]

export type GradeBook = Record<string, Record<string, Grade | null>>
```

Four decisions that shape the rest of the app:

**`Grade` is a literal union.** The range of valid values lives in the type system.
`const g: Grade = 6` is a compile error, and you need no hand-written range check anywhere.

**The role label is not derived from the name.** How a person is addressed ("Padawan", "Grand
Master") follows from role plus academy — never from the first name. You can't infer that from
a name, so it isn't attempted.

> **Looking ahead to [chapter 15](15-i18n.md):** in the finished reference these labels live in
> the locale files, because a "Großmeister" is a "Grand Master" in English. Build them as a
> field for now — the principle stays the same, only the location changes later.

**`User` is a discriminated union.** After `if (user.role === 'student')` the compiler knows
`matriculationNumber` exists.

**`null` means "not assessed".** Not `undefined` (indistinguishable from "key missing") and not
`0` (you could do arithmetic with that).

Plus two type guards:

```ts
export function isStudent(user: User): user is Student {
  return user.role === 'student'
}
```

## The generic collection

`src/lib/collection.ts` — this is the `Register<T>` class from
[chapter 03](03-typescript.md), just under its proper name. It holds the master data and offers
`byId`, `require`, `filter`, `sortBy`, `map` and `all`.

Two points that make the difference:

```ts
require(id: string): T {
  const item = this.#byId.get(id)
  if (item === undefined) throw new Error(`No entry with the ID "${id}".`)
  return item
}
```

`byId` returns `T | undefined` and forces every caller to check. `require` throws. Use
`require` where a missing ID would be a programming error, and `byId` where it comes from a URL
and can genuinely be wrong.

```ts
sortBy(select: (item: T) => string | number): Collection<T> {
  const sorted = [...this.#items].sort(...)
  return new Collection(sorted)
}
```

The copy isn't cosmetic. Without it you reorder the master data globally — and the next view
shows a different order without anyone having changed anything.

## Working with assessments

`src/lib/grades.ts` — pure functions, each a few lines:

| Function | Promise |
| --- | --- |
| `isGrade(v: unknown): v is Grade` | type guard from outside in |
| `parseGrade(text: string)` | `Grade`, `null` (empty) or `undefined` (invalid) |
| `average(grades)` | `number \| null` — never `NaN` |
| `distribution(grades)` | `Record<Grade, number>`, always all five keys |
| `gradedCount`, `passRate`, `isPassing` | |
| `formatGrade`, `formatAverage`, `gradeLabel` | presentation, German decimal comma |

**The three return cases of `parseGrade` are the heart of it.** An emptied field is a permitted
action; a 7 is an error. If both were `null`, the form couldn't tell them apart and would
silently delete the grade on every typo.

```ts
export function parseGrade(input: string): Grade | null | undefined {
  const trimmed = input.trim()
  if (trimmed === '') return null           // must come BEFORE Number(): Number('') is 0

  const value = Number(trimmed.replace(',', '.'))
  return isGrade(value) ? value : undefined
}
```

And how `null` is handled in arithmetic:

```ts
export function average(grades: readonly (Grade | null)[]): number | null {
  const given = grades.filter((grade): grade is Grade => grade !== null)
  if (given.length === 0) return null       // don't let NaN escape

  return given.reduce((total, grade) => total + grade, 0) / given.length
}
```

## The sample data

`src/data/` — one file per kind, plus `seed.ts` that assembles everything.

```ts
export const LECTURERS = [
  { id: 'd01', firstName: 'Yoda', lastName: 'Yoda', academicTitle: 'Grand Master of the Order',
    roleLabel: 'Grand Master', role: 'lecturer', academyId: 'jedi' },
  …
] as const satisfies readonly Lecturer[]
```

`as const satisfies` checks the shape but keeps the narrow literal types — `LECTURERS[0].id` is
exactly `'d01'`, not some `string`.

**Ten trainees and six subjects per academy**, so 40 and 24 in total. Ten assessments make a
readable bar chart; with four or five every distribution would look the same.

One detail that saves you trouble: **last names have to be unique across all academies.**
Sign-in searches *one* collection over all people — two people with the same last name couldn't
be resolved. The reference has a dedicated test that fires immediately if someone adds a
duplicate:

```ts
const logins = users.map((user) => toUsername(user.lastName))
expect(new Set(logins).size).toBe(logins.length)
```

### The grade book as a function, not a constant

```ts
export function createGradeBook(): GradeBook {
  const book: GradeBook = {}

  for (const subject of subjects) {
    const prefilled = PREFILLED[subject.id]
    const row: Record<string, Grade | null> = {}

    // ONLY the trainees of this academy
    studentsOf(subject.academyId).forEach((student, index) => {
      row[student.id] = prefilled?.[index] ?? null
    })

    book[subject.id] = row
  }
  return book
}
```

**That `studentsOf(subject.academyId)` is the central line of the whole chapter.** A Padawan
never even appears in an Imperial subject. Not "is hidden" — simply isn't there. What the data
structure never contains, no view can accidentally display.

**Why a function:** it returns a fresh object every time. If it were an exported constant,
store and tests would share the same reference — and one test would influence the next.
Precisely the kind of bug that's hard to find later.

**Two subjects per academy come pre-assessed, four are empty.** That way every instructor has
real work waiting and every trainee immediately sees a filled comparison. An app that shows
nothing but empty states after first start can't be judged.

**Every subject has an entry for every person in it** — including the unassessed ones, as
`null`. Missing keys would be a second meaning of "not assessed", and you'd have to check twice
everywhere.

## The login name

```ts
const GERMAN_REPLACEMENTS: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }

export function toUsername(lastName: string): string {
  return lastName
    .toLowerCase()
    .replace(/[äöüß]/g, (char) => GERMAN_REPLACEMENTS[char] ?? char)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}
```

The order is what matters. `normalize('NFD')` decomposes letters carrying marks into base
letter plus combining character (`é` → `e` + `´`); dropping the U+0300–U+036F range then
removes the accents. If that ran **before** the umlaut replacement, `ü` would become `u`
instead of `ue` — and `Müller` would sign in as `muller`.

> **There are no umlauts in this galaxy.** The test in `strings.spec.ts` covers the case
> anyway — the function should be able to do it. In the fixtures a rebel called `Sabé` takes
> the accent case: she becomes `sabe`. Sample data and tests cover different things here, and
> that's fine.

---

## Your task

1. `src/types/domain.ts` with the types, `AcademyId`, `Academy` and the type guards.
2. `src/lib/collection.ts` — your `Collection<T>` (use your solution from the playground).
3. `src/lib/strings.ts` with `toUsername` and `fullName`.
4. `src/lib/grades.ts` with the functions from the table above.
5. `src/data/academies.ts` with four academies including labels and grade labels.
6. `src/data/` with four instructors, 40 trainees, 24 subjects, `studentsOf`, `subjectsOf` and
   `createGradeBook()`.
7. Check in the browser: print `subjectsOf('sith').map(s => s.name)` and
   `studentsOf('jedi').length` from `App.vue` for a moment.

Feel free to invent your own characters and subjects — four factions of your choosing work just
as well. All that matters: unique last names, and at least one with an accent or umlaut.

## Pitfalls

- `Number('')` is `0`. The empty check has to come first.
- `normalize` before the umlaut replacement.
- The grade book as an exported constant instead of a function.
- Starting `distribution` from an empty object — then keys are missing and the chart has gaps.
- `sortBy` without a copy.

## Self-check

- [ ] `average([1, 2, null])` gives `1.5`, not `1`
- [ ] `average([])` gives `null`, not `NaN`
- [ ] `parseGrade('')`, `parseGrade('7')` and `parseGrade('3')` return three different things
- [ ] `toUsername('Sabé')` gives `'sabe'`, `toUsername('Müller')` gives `'mueller'`
- [ ] Calling `createGradeBook()` twice gives two independent objects
- [ ] `studentsOf('jedi')` gives 10 people, `subjectsOf('sith')` 6 subjects
- [ ] `createGradeBook()['f13']` (an Imperial subject) contains **no** Jedi key
- [ ] All last names are unique
- [ ] Nothing in `lib/`, `types/`, `data/` imports from `vue`

## In the reference

- `reference/src/types/domain.ts`, `reference/src/lib/collection.ts`, `reference/src/lib/grades.ts`, `reference/src/lib/strings.ts`
- `reference/src/data/academies.ts`, `lecturers.ts`, `students.ts`, `subjects.ts`, `seed.ts`
- `reference/src/data/__tests__/academies.spec.ts` — checks separation and uniqueness
- Tests for the rest: `reference/src/lib/__tests__/` — they're also a good description of what
  the functions promise
