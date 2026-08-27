# 01 — JavaScript fundamentals

> **Time:** about 2–3 hours · a good half of it in the exercises

## Goal

You know the places where JavaScript behaves differently from what you expect, and you work
with arrays through methods rather than loops. Afterwards you solve the exercises in
`playground/uebungen/01-arrays.ts` and `02-objects.ts`.

This chapter does not explain programming basics. It explains **differences**.

---

## Variables: `const` as the default

```js
const name = 'Weber'     // the binding cannot be reassigned
let counter = 0          // can be reassigned
counter += 1
```

`var` still exists, but has a different scoping rule and isn't used any more. Write `const`
until the compiler complains.

> **Not what you're used to**
> `const` does **not** mean immutable. It means: the variable keeps pointing at the same
> object. The object itself may change.
> ```js
> const grades = [1, 2]
> grades.push(3)     // allowed, grades is now [1,2,3]
> grades = []        // error: Assignment to constant variable
> ```

## `undefined` and `null` are two different things

| Value | Meaning |
| --- | --- |
| `undefined` | "there was never anything here" — unset variable, missing field, missing argument |
| `null` | "there is deliberately nothing here" — *your* code sets this |

In this project that's a design decision: an ungraded assessment is `null` (deliberately
empty), not `undefined` (key missing) and certainly not `0` (you could accidentally do
arithmetic with that).

## Equality: always `===`

```js
1 == '1'            // true   — converts first
1 === '1'           // false  — compares the type as well
null == undefined   // true
null === undefined  // false
```

**Always use `===`.** The one common exception is `x == null`, which checks exactly "`null` or
`undefined`" — but even there `x === null || x === undefined` is clearer.

## Truthiness

`if (value)` treats these as false: `false`, `0`, `-0`, `''`, `null`, `undefined`, `NaN`.
Everything else is true — including `[]` and `{}`.

```js
if ([]) console.log('runs')   // it runs! An empty array is truthy.
```

> **Not what you're used to**
> In Python, empty lists and empty dicts are falsy. In JavaScript they are **not**. Check the
> length: `if (grades.length > 0)`.

From that follows the single most important operator difference:

```js
const display = value || 'unknown'   // also fires on 0 and ''  ← usually a bug
const display = value ?? 'unknown'   // fires ONLY on null/undefined  ← usually what you meant
```

`??` is nullish coalescing. With grades the difference is real damage: `grade || '–'` would
swallow a `0`, and even though 0 isn't a valid grade here — the habit will get you elsewhere.

## Objects and arrays are references

This is where most bugs come from.

```js
const a = { name: 'Weber' }
const b = a
b.name = 'Müller'
console.log(a.name)   // 'Müller' — a and b are the same object
```

You copy with **spread**:

```js
const copy = { ...a }                // shallow copy
const changed = { ...a, name: 'X' }  // copy with one field changed
const arrayCopy = [...grades]
```

> **Not what you're used to**
> `{ ...a }` is **shallow**. Nested objects are still shared:
> ```js
> const subject = { name: 'DB', lecturer: { name: 'Weber' } }
> const copy = { ...subject }
> copy.lecturer.name = 'X'
> subject.lecturer.name   // 'X' — same reference
> ```
> For deep copies: `structuredClone(subject)`.

You'll see the `{ ...old, field: new }` pattern constantly. Vue and Pinia detect changes more
reliably when you assign a new object instead of writing into an existing one.

## Destructuring

```js
const { name, ects } = subject              // pull out two fields
const { name, ...rest } = subject           // name on its own, the rest as an object
const { lecturer = 'vacant' } = subject     // default when undefined
const [first, second] = grades              // from arrays, by position
const { lecturer: responsible } = subject   // rename while pulling out
```

The same works in parameter lists:

```js
function display({ name, ects }) {
  return `${name} (${ects} ECTS)`
}
```

> **Remember this already:** you must **not** destructure a Pinia store like this — reactivity
> is lost. That's what `storeToRefs` is for, see [Pinia](08-pinia.md).

## Optional chaining

```js
subject.lecturer?.email          // undefined instead of a crash when lecturer is missing
subject.lecturer?.email ?? null  // and a clean fallback
list?.[0]                        // works for indexes too
callback?.()                     // and for functions
```

## Arrays: methods instead of loops

This is the real adjustment. In Vue templates and in `computed` you write almost exclusively
like this:

```js
grades.map(n => n * 2)                 // transform      -> new array
grades.filter(n => n <= 3)             // sieve          -> new array
grades.find(n => n === 5)              // first match    -> element or undefined
grades.findIndex(n => n === 5)         // position       -> index or -1
grades.some(n => n === 5)              // is there one?  -> boolean
grades.every(n => n <= 4)              // true for all?  -> boolean
grades.includes(5)                     // contained?     -> boolean
grades.reduce((sum, n) => sum + n, 0)  // fold into a single value
students.flatMap(s => s.grades)        // map + flatten one level
grades.at(-1)                          // last element
```

About `reduce`: the second parameter is the **initial value**. Without it `reduce` throws on an
empty array. Always write it.

```js
// Counting a distribution — the initial value is a complete object
// so that no keys are missing afterwards.
grades.reduce((acc, grade) => {
  acc[grade] += 1
  return acc
}, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
```

### `sort` mutates the original

```js
const sorted = [...all].sort((a, b) => a.value - b.value)
```

> **Not what you're used to**
> `sort()` sorts **in place** and returns the same array. Without `[...all]` you've just
> reordered the input — inside a Vue `computed` that reorders the store, and the display starts
> to flicker.
>
> Also: `sort()` without a comparator sorts **as text**. `[10, 9, 100].sort()` gives
> `[10, 100, 9]`. For numbers use `(a, b) => a - b`, for German text
> `(a, b) => a.localeCompare(b, 'de')` — only that sorts umlauts correctly.

## Objects as lookup tables

```js
Object.keys(obj)      // ['id', 'name']
Object.values(obj)
Object.entries(obj)   // [['id','f01'], ['name','DB']]
Object.fromEntries(pairs)   // back to an object
Object.hasOwn(obj, 'id')
```

`Object.fromEntries(list.map(x => [x.id, x]))` is the standard pattern for building an index
from a list — you'll need it again in [Domain model](06-domain-model.md).

> **Not what you're used to**
> Object keys are **always strings** (or symbols). `obj[1]` and `obj['1']` are the same entry.
> If you need real keys of arbitrary type, use `Map`.

## Template literals

```js
`Hello ${firstName}, you have ${grades.length} assessments`
```

Backticks, multi-line allowed, `${...}` evaluates. Use them instead of string concatenation.

---

## Your task

```bash
cd playground
npm install
npm run test:watch
```

Work on `uebungen/01-arrays.ts` and `uebungen/02-objects.ts`. Every function starts with
`throw new Error('TODO: ...')` — replace that with a solution until the tests go green.

Rule for `01-arrays.ts`: **no `for` loop**. Not out of principle, but because in Vue templates
you can only use the methods anyway.

> The exercise files and their task descriptions are in German (`uebungen` = exercises). The
> function names and the tests are language-neutral, so you can follow along either way.

## Pitfalls

- `sort` without copying first — the first test for it checks exactly that.
- `reduce` without an initial value.
- `||` instead of `??`.
- `filter(...)` **always** returns an array, even for a single match. For one element: `find`.
- `map` over an array of arrays where `flatMap` was meant.

## Self-check

- [ ] `npm test` in `playground/` is green for 01 and 02
- [ ] You can explain why `nachDurchschnitt` needs a copy
- [ ] You can explain when `??` and when `||` is right
- [ ] You know why `{ ...subject }` doesn't protect the nested `lecturer` object

## In the reference

- `reference/src/lib/grades.ts` — `average`, `distribution`, `passRate` use exactly these methods
- `reference/src/lib/collection.ts` — `sortBy` with `[...this.#items].sort(...)` and `localeCompare`
