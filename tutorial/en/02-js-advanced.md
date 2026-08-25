# 02 — Functions, modules, async

> **Time:** about 2–3 hours · a good half of it in the exercises

## Goal

You understand arrow functions and `this`, know ES modules, and can work with promises and
`async`/`await`. Exercises: `playground/uebungen/03-arrow-this.ts` and `04-async.ts`.

---

## Functions are values

```js
function named(x) { return x * 2 }             // declaration
const asValue = function (x) { return x * 2 }  // expression
const arrow = (x) => x * 2                     // arrow function
```

You can put functions in variables, pass them around and return them. You'll need that
constantly — every `map(...)` takes a function as its argument.

### Arrow functions in detail

```js
(x) => x * 2                    // one expression: implicit return
(x) => { return x * 2 }         // block: return required
() => 42                        // no parameters
(a, b) => a + b
(x) => ({ value: x })           // returning an object: wrap it in parentheses!
```

> **Pitfall:** `(x) => { value: x }` returns `undefined`. The brace is read as a function body,
> not as an object. Hence `({ ... })`.

### `this` — the difference that matters

In JavaScript a classic function gets its `this` **at call time**, not where it's written.
Whoever calls it decides what `this` is.

```js
class Course {
  constructor(name) { this.name = name }

  broken() {
    return [1].map(this.format)      // ← passing the METHOD as a value
  }
  correct() {
    return [1].map(() => this.format())
  }
  format() {
    return `Course: ${this.name}`
  }
}
```

In `broken()`, `format` is separated from its object. `map` calls it with no receiver, `this`
is `undefined`, and `this.name` throws.

**An arrow function has no `this` of its own.** It uses the `this` of the place where it is
*written*. That's why `correct()` works.

> **Not what you're used to**
> In Python `self` is a normal parameter and gets bound at `obj.method` — a method pulled out
> still works there. In JavaScript it doesn't. The alternative to an arrow function is
> `this.format.bind(this)`.

**Practical rule:** use arrow functions for callbacks. Use classic functions for top-level
declarations and for methods in classes. In Vue with `<script setup>` you'll hardly ever touch
`this` — which is exactly why it's recommended.

### Closures

```js
function counter(start) {
  let value = start
  return () => {
    value += 1
    return value
  }
}
const next = counter(10)
next()   // 11
next()   // 12
```

`value` lives on even though `counter` returned long ago. The returned function keeps the
variable alive. Every call to `counter(...)` creates its **own** value.

That isn't a curiosity — it's exactly the principle composables rest on in
[chapter 09](09-composables.md).

### Default values and rest

```js
function greet(name, greeting = 'Hello') { ... }
function sum(...numbers) { return numbers.reduce((a, b) => a + b, 0) }
```

The default applies for `undefined`, **not** for `null`.

---

## Modules

Every file is its own namespace. Nothing is global.

```js
// grades.js
export function average(grades) { ... }       // named export
export const MAX = 5
export default class Registry { ... }         // default export, at most one
```

```js
// elsewhere.js
import Registry, { average, MAX } from './grades.js'
import { average as mean } from './grades.js'
import * as grades from './grades.js'
import type { Grade } from './types.js'       // the type only, disappears at build time
```

Conventions in this project:

- **Prefer named exports.** With a default export every importing file may pick a different
  name — which makes searching harder. Exception: `.vue` files export the component as the
  default; Vue requires that.
- `@/` is an alias for `src/`, set up in `vite.config.ts` and `tsconfig.app.json`.
  `import { average } from '@/lib/grades'` then works the same from any depth.

> **Not what you're used to**
> Imports are **hoisted** and run before any code in the file executes. An import in the middle
> of your code is not conditional execution. If you really want conditional or deferred
> loading you need `await import('./module.js')` — which is exactly what the router does when
> lazy-loading views.

---

## Asynchronous

The most important sentence first: **JavaScript has one thread.** There is no blocking.
Anything that takes time (network, timers, files) is started; your code carries on, and when
the result is there you get a callback.

### Promise

A `Promise` is the pledge of a later result. Three states: *pending*, *fulfilled*, *rejected*.

```js
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
```

### `async` / `await`

```js
async function load(id) {
  const response = await fetch(`/api/items/${id}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return await response.json()
}
```

- `async` in front of a function means: it **always** returns a promise.
- `await` waits for a promise. It doesn't block the thread — it suspends the function at that
  point and continues later.
- A `throw` inside an `async` function becomes a rejected promise.

> **Not what you're used to**
> `await` is not `sleep`. While it waits, other things carry on — clicks, timers, other
> requests. So your application's state may have changed across an `await`. Re-check after an
> `await` what you read before it.

### Parallel instead of sequential

The most common performance mistake:

```js
// SLOW: every request waits for the previous one
for (const id of ids) {
  results.push(await load(id))
}

// FAST: all of them start at once
const results = await Promise.all(ids.map((id) => load(id)))
```

`ids.map(id => load(id))` starts all calls **immediately** and yields an array of promises.
`Promise.all` then waits for all of them at once and keeps the order of the input — not the
order of completion.

| | Behaviour |
| --- | --- |
| `Promise.all` | throws as soon as **one** rejects |
| `Promise.allSettled` | waits for all, never throws, reports `fulfilled`/`rejected` per entry |
| `Promise.race` | the first result wins — useful for timeouts |
| `Promise.any` | the first **successful** one wins |

### Error handling

```js
try {
  const data = await load(id)
} catch (error) {
  // error is `unknown` — in TypeScript you have to narrow it
  const text = error instanceof Error ? error.message : String(error)
} finally {
  isLoading.value = false
}
```

> **Pitfall:** a promise without `await` and without `.catch()` fails silently ("unhandled
> rejection"). If you call an `async` function without waiting for it, attach at least a
> `.catch()`.

---

## Your task

Work on `playground/uebungen/03-arrow-this.ts` and `04-async.ts`.

The test *"ladeAlle lädt wirklich parallel"* ("loads genuinely in parallel") measures time —
with `await` inside a loop it goes red. That's exactly the point of the exercise.

## Self-check

- [ ] Exercises 03 and 04 are green
- [ ] You can explain why `[1].map(this.format)` fails
- [ ] You can name the difference between `Promise.all` and `Promise.allSettled`
- [ ] You know why `await` inside a loop is usually a mistake

## In the reference

- `reference/src/composables/useLocalStorage.ts` — a closure over `key` and `fallback`
- There is no service layer for network access in the reference — the app fetches nothing over
  the network. You'll still need `async` as soon as you think about a real backend in
  [chapter 14](14-build-deployment.md).
