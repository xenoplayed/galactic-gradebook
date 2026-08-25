# 09 — Composables

> **Time:** about 2–3 hours · the generic `useLocalStorage` needs a calm head

## Goal

You write your own composables: bundled statistics for a list of assessments, a generic
`useLocalStorage<T>` and a random generator. Afterwards sign-in and assessments survive a
reload.

---

## What a composable is

A function that starts with `use` and returns **reactive state**. That's all — no framework
construct, no registration, no base class.

```ts
export function useCounter(start = 0) {
  const value = ref(start)
  const doubled = computed(() => value.value * 2)

  function increment() { value.value += 1 }

  return { value, doubled, increment }
}
```

Remember the closures from [chapter 02](02-js-advanced.md)? This is exactly the same
principle: `value` lives on because the returned things hold on to it. Every call to
`useCounter()` creates its own, independent value.

> **Not what you're used to**
> A composable is not a class and not inheritance. It's reuse through **composition**: you call
> several and combine what they give you. Where you'd have built a base class in an OO
> language, here you call two functions.

### The rules

1. The name starts with `use`.
2. Call it at the **top level** of `<script setup>` or inside another composable — not in a
   callback, not inside an `if`. Otherwise Vue can't associate lifecycle hooks and `watch` with
   the right component.
3. Return an object of `ref`s and `computed`s, not unwrapped values — those would be frozen.

## Flexible inputs: `MaybeRefOrGetter`

The most important trick for keeping a composable reactive:

```ts
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export function useGradeStats(source: MaybeRefOrGetter<readonly (Grade | null)[]>) {
  const grades = computed(() => toValue(source))

  return {
    count: computed(() => gradedCount(grades.value)),
    average: computed(() => average(grades.value)),
    distribution: computed(() => distribution(grades.value)),
    isEmpty: computed(() => gradedCount(grades.value) === 0),
    peak: computed(() => Math.max(...Object.values(distribution(grades.value)), 1)),
  }
}
```

`MaybeRefOrGetter<T>` means: you may pass a plain value, a `ref` **or a function**. `toValue()`
unwraps all three cases.

```ts
useGradeStats([1, 2, 3])               // plain value
useGradeStats(gradesRef)               // ref
useGradeStats(() => draftGrades.value) // getter
```

**Why this matters:** had you used `(grades: Grade[])` as the parameter instead, the value
would be frozen at call time. The statistics would show the state from the first render
forever. That's the most common mistake in a first composable — and it looks like a Vue
problem while being an ordinary value-passing mistake.

The test for it puts it plainly:

```ts
const grades = ref<(Grade | null)[]>([5, 5])
const stats = useGradeStats(grades)
expect(stats.average.value).toBe(5)

grades.value = [1, 1]
expect(stats.average.value).toBe(1)   // without toValue it would stay 5
```

## Own state or shared state?

This is the distinction people get stuck on with their second composable — and it hangs on
exactly one line: **where the `ref` sits.**

```ts
// A) INSIDE the function -> every call gets its own
export function useGradeStats(source) {
  const grades = computed(() => toValue(source))
  return { … }
}

// B) OUTSIDE the function -> all callers share the same one
const previewAcademyId = ref<AcademyId>('jedi')

export function useAcademyPreview() {
  return { previewAcademyId }
}
```

**A is the normal case.** Two charts on one page need two independent statistics.

**B is a deliberate decision.** The academy pre-selected on the sign-in screen has to be the
same everywhere: the cards show the selection, the theme composable reads it, the button for
the account list is labelled from it. Three places, one value.

In JavaScript a module is evaluated **once**, no matter how often it's imported — which is why
there is exactly one `ref`. That's essentially a store, just without Pinia.

> **So when Pinia after all?** As soon as there's more than one value: several related fields,
> derived values, actions — or when you want devtools time-travel. For a single `ref` a store
> would be ceremony without gain.

The trap: **shared state survives the component unmounting.** If you use B where A was meant,
you'll see the values from the first time when opening a page again. For every `ref` outside a
function, ask yourself whether that is exactly what you want.

## A generic composable

```ts
export function useLocalStorage<T>(
  key: string,
  fallback: T,
  parse: (raw: unknown, fallback: T) => T = (raw) => raw as T,
): Ref<T> {
  const initial = readFromStorage(key)
  const state = ref(initial === undefined ? fallback : parse(initial, fallback)) as Ref<T>

  watch(
    state,
    (value) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // Private mode or quota exceeded: persistence is a comfort, not a must.
      }
    },
    { deep: true },
  )

  return state
}

function readFromStorage(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? undefined : JSON.parse(raw)
  } catch {
    return undefined
  }
}
```

Five details:

**`<T>` makes it universal.** The return type follows the fallback:
`useLocalStorage<string | null>('session', null)` gives `Ref<string | null>`,
`useLocalStorage('grades', createGradeBook())` gives `Ref<GradeBook>`.

**`as Ref<T>` is necessary here.** `ref(x)` returns `Ref<UnwrapRef<T>>` — Vue unwraps nested
`ref`s automatically and the type reflects that. With a generic `T`, TypeScript can't follow.
One of the few cases where an `as` is the right answer.

**`deep: true`.** Without it the watcher only fires when the whole reference is replaced —
changes *inside* the grade book would never be saved.

**Two `try`/`catch`es.** On read: a hand-edited or half-written entry makes `JSON.parse` throw
and would otherwise kill the whole app at startup. On write: `setItem` throws in private mode.

**The `parse` parameter.** `localStorage` is permanent, your data model changes. Without
merging, `book.value['f11']` would be `undefined` after adding a subject, and the view would
run into an error.

### The merge in the grades store

```ts
const book = useLocalStorage<GradeBook>(GRADES_KEY, createGradeBook(), mergeWithSeed)
```

`mergeWithSeed` takes the **structure** from the seed (which subjects, which people) and the
**values** from the stored state — but only valid ones. The crucial part:

```ts
if (!Object.hasOwn(storedRow, studentId)) {
  row[studentId] = seedRow[studentId] ?? null   // person is new -> seed
  continue
}
const value = storedRow[studentId]
row[studentId] = isGrade(value) ? value : null  // deliberately cleared -> stays cleared
```

"Key missing" and "value is `null`" are two different things. Treating them the same would
bring a deleted assessment back from the seed on the next load — a bug you notice days later.

## A small composable without state

```ts
const WEIGHTS: Record<Grade, number> = { 1: 0.15, 2: 0.3, 3: 0.3, 4: 0.17, 5: 0.08 }

export function randomGrade(): Grade {
  let threshold = Math.random()
  for (const grade of GRADES) {
    threshold -= WEIGHTS[grade]
    if (threshold <= 0) return grade
  }
  return 3
}

export function useRandomGrades() {
  function randomGradesFor(studentIds: readonly string[]): Record<string, Grade> {
    return Object.fromEntries(studentIds.map((id) => [id, randomGrade()]))
  }
  return { randomGrade, randomGradesFor }
}
```

Weighted rather than uniform: a real exam rarely produces as many top marks as failures. With
`Math.floor(Math.random() * 5) + 1` the comparison chart would look like a bar chart with
nothing to say — and you couldn't tell whether your distribution maths is right.

The technique: take a random number in [0,1) and subtract the weights until it goes negative.
Each grade's probability is then exactly its weight.

---

## Your task

1. `src/composables/useLocalStorage.ts` — generic, with a `parse` parameter.
2. `src/composables/useGradeStats.ts` — with `MaybeRefOrGetter` and `toValue`.
3. `src/composables/useRandomGrades.ts`.
4. `src/composables/useAcademyTheme.ts` — with a **module-level** `previewAcademyId` and the
   switching via `data-academy`. More on that in [chapter 12](12-styling-tailwind.md).
5. Switch both stores to `useLocalStorage`: `auth` stores only the ID, `grades` the book with
   `mergeWithSeed`.
6. Check in the browser: sign in, reload the page — you're still signed in.

## Pitfalls

- A composable without `MaybeRefOrGetter` — then the value freezes.
- Forgetting `deep: true` — the book is never saved.
- No `try`/`catch` on read. Try it: run
  `localStorage.setItem('datapad.grades', 'broken')` in the devtools and reload. With the
  `catch` the app carries on; without it the page stays white.
- Calling a composable in a callback instead of at the top level.
- In tests: `watch` fires only on the next tick. Without `await nextTick()` there's nothing in
  `localStorage` yet.

## Self-check

- [ ] Sign in, reload — still signed in
- [ ] Record assessments, save, reload — they're still there
- [ ] `localStorage` holds only the user **ID**, not name and role
- [ ] Fill `localStorage` with junk and reload: the app still starts
- [ ] `useGradeStats` fed with a `ref`: the numbers update
- [ ] You can explain why `previewAcademyId` sits outside the function while `useGradeStats`
      creates its state inside

## In the reference

- `reference/src/composables/useLocalStorage.ts`, `useGradeStats.ts`, `useRandomGrades.ts`
- `reference/src/composables/useAcademyTheme.ts` — shared state
- `reference/src/composables/__tests__/useAcademyTheme.spec.ts`
- `reference/src/stores/grades.ts` — `mergeWithSeed` at the end of the file
- `reference/src/composables/__tests__/useGradeStats.spec.ts` — the reactivity test
