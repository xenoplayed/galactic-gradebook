# 03 — TypeScript

> **Time:** about 2–3 hours · the generics exercise is the longest one in the playground

## Goal

You can read and write types, know union and literal types, understand narrowing, and can
build **generic functions and classes**. Exercise: `playground/uebungen/05-generics.ts`.

---

## What TypeScript is — and what it isn't

TypeScript is JavaScript plus type annotations. The compiler checks them and then **throws
them away**. At runtime plain JavaScript runs; there is no runtime type checking.

> **Not what you're used to**
> No runtime protection. If a JSON response arrives with the wrong shape, TypeScript notices
> nothing — your `as Subject` is only a promise to the compiler. Everything coming in from
> outside (HTTP, `localStorage`, forms) you have to check yourself. That's exactly what the
> type guards further down are for.

## Basic types

```ts
const name: string = 'Weber'
const age: number = 42            // one number type for everything
const active: boolean = true
const grades: number[] = [1, 2]
const pair: [string, number] = ['DB', 5]      // tuple: fixed length and position
let unclear: unknown                          // safe: check first, then use
let dangerous: any                            // turns checking off — avoid
function doesNothing(): void {}
```

Most of the time you don't need an annotation at all — TypeScript infers:

```ts
const name = 'Weber'        // string
const grades = [1, 2, 3]    // number[]
```

Put types where they are a **promise**: on function signatures and data structures. Not on
every local variable.

`any` turns off all checking and spreads. `unknown` is the honest type for "I don't know": you
have to narrow before you do anything with it.

## `interface` and `type`

```ts
interface Subject {
  id: string
  name: string
  ects: number
  lecturer?: string        // optional -> string | undefined
  readonly created: Date   // settable only at creation
}

type SubjectId = string                     // alias
type Identifier = string | number           // union — not possible with interface
type WithTime = Subject & { asOf: Date }    // intersection
```

Rule of thumb: `interface` for object shapes, `type` for everything else (unions, aliases,
function types). An `interface` can also be extended after the fact — which is exactly what
the router uses in [chapter 07](07-router.md) to type `meta`.

## Literal and union types — the most useful tool

```ts
type Grade = 1 | 2 | 3 | 4 | 5
type Role = 'lecturer' | 'student'

const grade: Grade = 3    // ok
const grade: Grade = 6    // compile error
```

That moves the range of valid values out of `if` cascades and into the type system. The
compiler then also knows that a `switch` over `Role` covers every case.

If you need the same list at runtime:

```ts
export const GRADES = [1, 2, 3, 4, 5] as const satisfies readonly Grade[]
```

- `as const` makes it `readonly [1,2,3,4,5]` instead of `number[]`.
- `satisfies` checks against `readonly Grade[]` **without** throwing the narrow type away.
  With `const GRADES: readonly Grade[] = [...]` it would be widened to `Grade[]`.

## `Record` and index types

```ts
type GradeBook = Record<string, Record<string, Grade | null>>
type Labels = Record<Grade, string>   // must have all five keys
```

`Record<K, V>` is an object with keys of type `K` and values of type `V`. If `K` is a union of
literals, the compiler demands **completeness** — forget the 4 and it complains.

## Narrowing: from wide to narrow

```ts
function display(value: string | number): string {
  if (typeof value === 'string') return value.toUpperCase()  // here: string
  return value.toFixed(1)                                    // here: number
}
```

The compiler follows your control flow. The tools: `typeof`, `instanceof`, `in`, truthiness
checks and comparison against a literal.

### Discriminated union

```ts
interface Student { role: 'student'; matriculation: string }
interface Lecturer { role: 'lecturer'; title: string }
type User = Student | Lecturer

if (user.role === 'student') {
  user.matriculation     // TypeScript knows: Student
}
```

A shared field with literal types is enough. That's the backbone of the domain model in
[chapter 06](06-domain-model.md).

### Type guards — the way from outside in

```ts
export function isGrade(value: unknown): value is Grade {
  return typeof value === 'number' && [1, 2, 3, 4, 5].includes(value as Grade)
}
```

`value is Grade` means: if this function returns `true`, the compiler may treat `value` as a
`Grade` from then on. That's the clean transition from runtime data (`localStorage`, form
input) into a narrow type.

The same trick inside `filter`:

```ts
const given = grades.filter((n): n is Grade => n !== null)
// -> Grade[], not (Grade | null)[]
```

Without the annotation the type would stay wide, even though the code already filters
correctly.

---

## Generics

A generic is a **parameter for types**. Instead of duplicating a function for every type, you
leave the type open.

```ts
function first<T>(values: readonly T[]): T | undefined {
  return values[0]
}

first(['a', 'b'])   // T = string, result string | undefined
first([1, 2])       // T = number
```

The type is inferred at the call site. `first<string>([...])` works too, but is rarely needed.

Without the generic you'd have used `any[]` — and the compiler could no longer help you with
`first(['a']).toUpperCase()`.

### Constraints

```ts
interface WithId { id: string }

function get<T extends WithId>(list: readonly T[], id: string): T | undefined {
  return list.find((entry) => entry.id === id)   // entry.id is allowed
}
```

`T extends WithId` means: T can be anything, **as long as** it has an `id: string`. That's
exactly what permits access to `entry.id`. Without the constraint the compiler wouldn't know
the field exists.

With two parameters that depend on each other:

```ts
function onlyFields<T extends object, K extends keyof T>(obj: T, fields: readonly K[]): Pick<T, K>
```

`keyof T` is the union of all field names of T. A typo in a field name is therefore a compile
error instead of a silent `undefined`.

### Generic classes

```ts
export class Registry<T extends WithId> {
  readonly #entries: readonly T[]
  readonly #index: ReadonlyMap<string, T>

  constructor(entries: readonly T[]) {
    this.#entries = entries
    this.#index = new Map(entries.map((e) => [e.id, e]))
  }

  get(id: string): T | undefined {
    return this.#index.get(id)
  }

  // A SECOND type parameter, on the method only. R has nothing to do with T.
  map<R>(fn: (entry: T) => R): R[] {
    return this.#entries.map(fn)
  }

  // Returns a new instance rather than mutating this one.
  filter(predicate: (e: T) => boolean): Registry<T> {
    return new Registry(this.#entries.filter(predicate))
  }
}

const subjects = new Registry<Subject>([...])
subjects.get('f01')?.name     // TypeScript knows a Subject comes out here
```

Two details worth having:

- **`#entries` is genuinely private.** The `#` is JavaScript syntax and holds at runtime. The
  TypeScript keyword `private`, by contrast, is known only to the compiler; after the build
  it's gone and anyone can reach the field.
- **`map` deliberately returns an array, not a `Registry`.** The result (strings, say) would no
  longer have an `id` field and would violate the constraint.

## Useful utility types

```ts
Partial<T>          // all fields optional
Required<T>
Readonly<T>
Pick<T, 'a' | 'b'>  // only these fields
Omit<T, 'a'>        // everything except these
Record<K, V>
ReturnType<typeof fn>
NonNullable<T>      // without null and undefined
```

## Two settings in this project

```jsonc
"strict": true,                  // without it TypeScript is barely worth it
"noUncheckedIndexedAccess": true // list[0] is T | undefined, not T
```

`noUncheckedIndexedAccess` is annoying at first and saves you later. It tells the truth: an
index access can miss.

```ts
const firstGrade = grades[0]   // Grade | undefined
if (firstGrade !== undefined) { ... }
const value = map[id] ?? null
```

You'll trip over exactly this in [chapter 10](10-instructor-view.md), when `v-model` on an
index access doesn't type-check.

## Dealing with `as`

`value as Subject` turns checking off. Sometimes necessary, often a warning sign. Two
alternatives that are almost always better: a **type guard** (see above) or `satisfies`.

---

## Your task

Work on `playground/uebungen/05-generics.ts`. The `Register<T>` part is exactly the class that
holds the master data in the reference project as `Collection<T>` — here you build it once
yourself.

## Pitfalls

- `any` as a quick fix. Use `unknown` and narrow.
- `as` instead of a type guard.
- Forgetting the `(n): n is Grade =>` annotation in `filter`.
- Creating an incomplete `Record<Grade, number>`.

## Self-check

- [ ] `playground` is fully green (`npm test`)
- [ ] You can explain what `T extends WithId` is needed for
- [ ] You can explain why `map<R>` has a second type parameter
- [ ] You can name the difference between `#field` and `private field`
- [ ] You know when `satisfies` beats `:`

## In the reference

- `reference/src/lib/collection.ts` — the generic class
- `reference/src/types/domain.ts` — `Grade`, `GRADES` with `as const satisfies`, `User` as a
  discriminated union, the type guards `isStudent`/`isLecturer`
- `reference/src/lib/grades.ts` — `isGrade` as a type guard, `filter((g): g is Grade => ...)`
