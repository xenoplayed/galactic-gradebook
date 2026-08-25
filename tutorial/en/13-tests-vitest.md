# 13 — Tests with Vitest

> **Time:** about 2–3 hours

## Goal

You test the four layers of your app with one representative each: pure functions, a store, a
composable and a component.

---

## What's worth testing

Not everything. Prioritise by **effort per bug found**:

| | |
| --- | --- |
| **Always** | pure functions in `lib/` — cheap to test, used often |
| **Nearly always** | stores and composables — that's where the behaviour lives |
| **Selected** | components with real logic (`GradeInput`) |
| **Rarely** | pure display components — a test checking that `StatTile` shows its text is essentially testing Vue |

> **Not what you're used to**
> If you build CI pipelines you know "green means deployable". Here the benefit is a different
> one: tests are above all an **executable description** of what a function promises.
> `src/lib/__tests__/grades.spec.ts` explains the three return cases of `parseGrade` more
> precisely than any comment — and the explanation doesn't go stale.

## Vitest

Comes with `npm create vue@latest`. No extra setup.

```bash
npm run test:unit             # run once
npm run test:watch            # keeps running
npm run test:unit -- --coverage
npm run test:unit -- grades   # only matching files
```

Tests live next to the code in `__tests__/`. A short path between code and test means the test
is more likely to be maintained.

## Pure functions

```ts
import { describe, expect, it } from 'vitest'
import { average, parseGrade } from '@/lib/grades'

describe('parseGrade', () => {
  it('distinguishes empty from invalid', () => {
    expect(parseGrade('')).toBeNull()
    expect(parseGrade('7')).toBeUndefined()
    expect(parseGrade('3')).toBe(3)
  })
})

describe('average', () => {
  it('averages only the assessments given', () => {
    // null must not count as 0 - otherwise the result would be 1.5.
    expect(average([1, 2, null, 3])).toBe(2)
  })

  it('returns null instead of NaN', () => {
    expect(average([])).toBeNull()
  })
})
```

The comment in the test matters more than the test. It answers "why does it say 2 and not
1.5?", which nobody can answer six months from now otherwise.

**Write test names as statements**, not as labels. "distinguishes empty from invalid" says
something; "tests parseGrade" says nothing.

## Stores

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
  })

  it('signs in an instructor', () => {
    const auth = useAuthStore()

    expect(auth.login('yoda', 'yoda')).toBe(true)
    expect(auth.isLecturer).toBe(true)
    expect(auth.academy?.id).toBe('jedi')
  })

  it("doesn't reveal whether the user exists", () => {
    const auth = useAuthStore()

    auth.login('yoda', 'wrong')
    const knownUserError = auth.error
    auth.login('nobody', 'nobody')

    expect(auth.error).toBe(knownUserError)
  })
})
```

**The `beforeEach` is not a formality.** Without `setActivePinia` all tests share the same
store; without `localStorage.clear()` the same persisted state — and the second test depends on
the outcome of the first. Dependencies like that only show up when you run a single test in
isolation and it suddenly fails.

**On a store you access `auth.isLecturer` directly**, without `.value`. Pinia unwraps that for
you.

### The `watch` trap

```ts
it('persists only the ID', async () => {
  const auth = useAuthStore()
  auth.login('yoda', 'yoda')

  await nextTick()      // ← without this there's nothing in localStorage yet

  expect(window.localStorage.getItem('datapad.session')).toBe('"d01"')
})
```

`watch` doesn't fire immediately but batched on the next tick. In the browser you never notice;
in a test you do — and you go looking for the fault in the composable rather than in the test.

## Composables

```ts
it('reacts to changes on a ref', () => {
  const grades = ref<(Grade | null)[]>([5, 5])
  const stats = useGradeStats(grades)

  expect(stats.average.value).toBe(5)

  grades.value = [1, 1]

  expect(stats.average.value).toBe(1)   // without toValue it would stay 5
})
```

This test is what pins the reactivity down. If someone rebuilds the composable around a plain
array parameter, it goes red — and that's the only way it would be noticed.

`computed` is evaluated on read; you don't need `await nextTick()` here.

## Components

```ts
import { mount } from '@vue/test-utils'
import GradeInput from '@/components/GradeInput.vue'

function mountInput(modelValue: Grade | null = null) {
  return mount(GradeInput, { props: { modelValue, label: 'Assessment for test person' } })
}

it('does NOT report invalid input upwards', async () => {
  const wrapper = mountInput(2)

  await wrapper.get('input').setValue('9')

  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  expect(wrapper.text()).toContain('only 1–5')
  expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
})

it('takes changes from outside', async () => {
  const wrapper = mountInput(1)

  await wrapper.setProps({ modelValue: 5 })     // like "Fill at random"

  expect(wrapper.get('input').element.value).toBe('5')
})
```

The tools:

```ts
wrapper.get('input')                  // throws when nothing is found
wrapper.find('.class')                // returns an empty wrapper
wrapper.text()
wrapper.emitted('update:modelValue')  // array of all calls
await wrapper.get('button').trigger('click')
await wrapper.setProps({ ... })
```

The `await` is necessary: Vue updates the DOM asynchronously. Without it you check the previous
state — the most common reason for a component test that fails "for no reason".

**Test what the component promises, not how it does it.** "Reports a valid grade upwards"
survives a refactor; "has a `<div>` with class `wrapper`" doesn't.

## When the test environment doesn't play along

jsdom is not a browser. It reproduces the DOM very thoroughly — but not completely. The native
`<dialog>` is one of the gaps:

```ts
const d = document.createElement('dialog')
typeof d.showModal   // 'undefined'  (jsdom 29)
```

The component test for `BaseDialog` therefore runs straight into a `TypeError`. The temptation
to make the component "defensive" is strong (`if (typeof el.showModal === 'function')`).
**Don't** — then the production code permanently carries ballast for a problem that only exists
in tests, and every later reader wonders which browser it's about.

Fix it where the fault comes from: in the test environment.

```ts
// vitest.setup.ts
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function () {
    this.open = false
    // The real <dialog> fires `close` - without that event you couldn't test
    // that the component reports the state back.
    this.dispatchEvent(new Event('close'))
  }
}
```

Register the file in `vitest.config.ts`:

```ts
test: {
  environment: 'jsdom',
  setupFiles: ['./vitest.setup.ts'],
}
```

The `!HTMLDialogElement.prototype.showModal` check is deliberate: as soon as jsdom ships it,
the stand-in disappears by itself.

> **The general lesson:** when a test fails because of the environment rather than your code,
> fix the environment. And check that **early** — I deliberately measured the jsdom gap before
> building the component, rather than standing in front of a red suite at the end wondering
> why.

## What you can skip

- Testing the framework (`v-if` works).
- Checking CSS classes, unless the class *is* the statement.
- Working towards a coverage number. 100 % across display components is worth less than five
  good tests on `parseGrade`.

---

## Your task

Write at least one test per layer:

1. **`src/lib/__tests__/grades.spec.ts`** — `parseGrade` (all three cases), `average` (with
   `null` and empty), `distribution` (no missing keys), `passRate`.
2. **`src/lib/__tests__/strings.spec.ts`** — `toUsername` with `Müller`, `Groß`, a name with an
   accent and one with an apostrophe.
3. **`src/lib/__tests__/collection.spec.ts`** — `byId`, `require` throws, `filter` leaves the
   original alone, `sortBy` sorts umlauts the German way.
4. **`src/stores/__tests__/auth.spec.ts`** — sign-in right and wrong, accent spellings, signing
   out, persistence (with `await nextTick()`), and the right academy per user. For the four
   academies `it.each` pays off:

   ```ts
   it.each([['yoda','jedi'], ['bane','sith'], ['thrawn','empire'], ['organa','rebels']])(
     'maps %s to academy %s',
     (login, academyId) => { … },
   )
   ```
5. **`src/composables/__tests__/useGradeStats.spec.ts`** — the reactivity test above.
6. **`src/components/__tests__/GradeInput.spec.ts`** — valid, empty, invalid, change from
   outside.
7. **`src/components/__tests__/BaseDialog.spec.ts`** — opening, closing, and above all: that a
   native `close` event resets the model.
8. **`src/composables/__tests__/useAcademyTheme.spec.ts`** — default, selection, the signed-in
   academy beating the preview, and the preview staying put after signing out.
9. **`src/data/__tests__/academies.spec.ts`** — the most important new test: that
   `createGradeBook()` contains **exactly** the trainees of the subject's own academy per
   subject, none foreign and none missing. Plus the uniqueness of the login names.

   ```ts
   for (const subject of subjects) {
     const ownIds = studentsOf(subject.academyId).map((s) => s.id)
     const rowIds = Object.keys(book[subject.id] ?? {})
     expect(rowIds.sort()).toEqual([...ownIds].sort())
   }
   ```

   Tests like that are worth their weight: they check a **promise of the data structure**, not
   the behaviour of a function. Anyone who later softens the separation by accident goes red
   here.

Then: `npm run test:unit` has to be green, and `npm run build` (which runs `type-check`) too.

## Pitfalls

| Symptom | Cause |
| --- | --- |
| "no active Pinia" | `setActivePinia(createPinia())` missing in `beforeEach` |
| A test depends on the previous one | store or `localStorage` not reset |
| `localStorage` empty although it was saved | `await nextTick()` missing |
| The DOM shows the old state | `await` before `trigger`/`setValue`/`setProps` missing |
| `Property 'at' does not exist` | `tsconfig.vitest.json` has `"lib": []` — set it to `["ESNext"]` |
| `showModal is not a function` | jsdom gap — stand-in in `vitest.setup.ts`, not in the component |
| "no active effect scope" in a composable test | composable with watchers called outside a component — wrap it in `effectScope()` |
| Mounting throws as soon as a component uses `useI18n()` | i18n plugin missing — provide it globally once in `vitest.setup.ts` via `config.global.plugins` |

## Self-check

- [ ] `npm run test:unit` is green
- [ ] A test run on its own is green on its own
- [ ] A test goes red when you deliberately break `average`
- [ ] `npm run build` completes

## In the reference

- `reference/src/lib/__tests__/`, `reference/src/stores/__tests__/`, `reference/src/composables/__tests__/`,
  `reference/src/components/__tests__/`, `reference/src/i18n/__tests__/` — 85 tests
- `reference/tsconfig.vitest.json` — including the `lib` fix
- `reference/vitest.setup.ts` — the jsdom stand-in for `<dialog>`
