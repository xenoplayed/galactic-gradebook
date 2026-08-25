# 04 — Vue: reactivity and templates

> **Time:** about 1.5–2 hours · lots of reading, little typing

## Goal

You understand how a single-file component is built, know the difference between `ref`,
`computed` and `watch`, and can write a template. The result is your first own screen running
in the app.

---

## The basic idea

Vue is **declarative**: you describe what the interface should look like for a given state.
When the state changes, Vue updates the affected parts of the DOM.

> **Not what you're used to**
> No `document.querySelector`, no `element.textContent = ...`. You don't touch the DOM. You
> change a variable and Vue takes care of the rest. If you write `querySelector` in a Vue app,
> something else is almost always wrong.

## The single-file component

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const counter = ref(0)
const doubled = computed(() => counter.value * 2)

function increment() {
  counter.value += 1
}
</script>

<template>
  <p>{{ counter }} × 2 = {{ doubled }}</p>
  <button @click="increment">More</button>
</template>

<style scoped>
p { font-weight: 600; }
</style>
```

Three blocks: logic, markup, style — for **one** component, in **one** file.

`<script setup>` is the short form of the Composition API. The code inside runs once, when the
component is created. Everything you declare at its top level is visible in the template — no
`return`, no `this`.

`<style scoped>` limits the styles to this component; Vue attaches a unique attribute to the
elements for that. (In this project we mostly use Tailwind instead of `scoped`, see
[chapter 12](12-styling-tailwind.md).)

## `ref` — mutable state

```ts
const counter = ref(0)
counter.value += 1          // in the script: .value
```

```vue
<p>{{ counter }}</p>        <!-- in the template: without .value -->
```

`ref` wraps a value in an object with a `.value` field. Only that way can Vue notice you
reading or writing it — a plain variable couldn't be observed.

> **Vue pitfall number one:** forgetting `.value` in the script. `counter += 1` is a type
> error, but `if (counter)` is always true (an object is truthy) and fails silently. In the
> **template** Vue unwraps automatically — there `counter.value` would be wrong.

### `ref` or `reactive`?

```ts
const a = ref({ name: 'Weber' })      // a.value.name
const b = reactive({ name: 'Weber' }) // b.name
```

**Use `ref`.** Always. `reactive` only works with objects, loses its reactivity when
destructured, and can't be replaced wholesale (`b = {...}` breaks the link). A `ref` can hold
anything and is replaceable as a whole. The single rule "everything is a `ref`, `.value` in the
script" spares you an entire class of bugs.

## `computed` — derived state

```ts
const grades = ref<Grade[]>([1, 2, 3])
const average = computed(() => grades.value.reduce((a, b) => a + b, 0) / grades.value.length)
```

A `computed` is **read-only**, **cached**, and recomputes only when one of its sources changes.

Rule of thumb: **if a value can be derived from other state, derive it.** Keeping it in a
separate `ref` as well and updating it by hand is the second big source of bugs in Vue apps.

```ts
// Wrong: two sources of truth
const grades = ref([1, 2])
const count = ref(2)     // has to be maintained everywhere

// Right
const count = computed(() => grades.value.length)
```

Arithmetic in the template? Only for trivia. `{{ a + b }}` is fine, anything larger belongs in
a `computed` — in the template it would run on **every** render.

## `watch` — reacting to changes

`computed` is for *values*. `watch` is for *side effects*: saving something, reloading
something, resetting something.

```ts
watch(searchText, (next, previous) => { ... })

// On a derived value: as a getter function
watch(() => props.subjectId, load, { immediate: true })

// Several sources
watch([a, b], ([nextA, nextB]) => { ... })

// Noticing nested changes
watch(gradeBook, save, { deep: true })
```

The options you'll need:

- **`immediate: true`** — run once right away, not only on the next change.
- **`deep: true`** — report changes *inside* an object too. Without it the watcher fires only
  when the whole reference is replaced.

> **Pitfall:** `watch(props.subjectId, ...)` does not work. You're passing the current *value*,
> not the source. It has to be `watch(() => props.subjectId, ...)` — a getter Vue can evaluate
> again.

`watchEffect(fn)` collects its dependencies automatically from whatever `fn` reads. Convenient,
but less explicit; to begin with, `watch` is the better choice.

## Template syntax

```vue
{{ expression }}                          <!-- text -->
<img :src="path" :alt="description">      <!-- bind an attribute (v-bind) -->
<button @click="increment">               <!-- event (v-on) -->
<input v-model="text">                    <!-- two-way binding -->
```

`:` is shorthand for `v-bind:`, `@` for `v-on:`.

### Conditions

```vue
<p v-if="isLoading">Loading …</p>
<p v-else-if="error">{{ error }}</p>
<p v-else>Done</p>

<p v-show="visible">always in the DOM, only hidden via CSS</p>
```

`v-if` really creates and removes elements. `v-show` only toggles `display`. If something
changes often, `v-show` is cheaper; otherwise `v-if`.

### Lists

```vue
<li v-for="subject in subjects" :key="subject.id">{{ subject.name }}</li>
<li v-for="(subject, index) in subjects" :key="subject.id">{{ index }}: {{ subject.name }}</li>
<li v-for="(value, key) in object" :key="key">…</li>
```

**`:key` is mandatory** and must be stable and unique. Use the ID, not the index — otherwise
Vue matches the wrong DOM nodes when inserting or deleting, and input fields keep values from
the wrong row. You'd notice exactly that in the assessment table immediately.

Never put `v-if` and `v-for` on the same element. Filter in a `computed` instead:

```ts
const open = computed(() => subjects.value.filter((s) => !s.done))
```

### Classes and styles

```vue
<div :class="['always', active && 'active', error ? 'red' : 'grey']">
<div :class="{ active: isActive, error: hasError }">
<div :style="{ height: `${percent}%` }">
```

An inline `:style` is right when the value is **computed** (a bar height). For everything else:
classes.

### Event modifiers

```vue
<form @submit.prevent="submit">   <!-- no event.preventDefault() needed -->
<div @click.stop="…">             <!-- stopPropagation -->
<input @keyup.enter="…">
```

## Lifecycle

```ts
import { onMounted, onUnmounted } from 'vue'

onMounted(() => { /* the DOM is there */ })
onUnmounted(() => { /* clean up */ })
```

Whatever you register yourself (timers, `addEventListener` on `window`) you have to unregister
in `onUnmounted`. `watch` and `computed` clean up after themselves.

---

## Your task

Build a first screen — still without router, store or sign-in. Replace the contents of
`src/App.vue`:

1. A `ref` with a few hard-coded grades (`[1, 3, 2, 5]`).
2. A `computed` for the average that returns `null` for an empty list.
3. A `computed` for the distribution (how often each grade occurs).
4. An input with `v-model` and a button that adds the grade.
5. A `v-for` list of the grades with `:key`, each with a button to remove it.
6. A `watch` that logs the count to the console on every change.

Once that runs you have the building blocks the rest of the app is made of.

## Pitfalls

| Symptom | Cause |
| --- | --- |
| Value doesn't change | forgot `.value` in the script |
| `[object Object]` in the template | *added* `.value` in the template |
| Wrong row keeps the input | `:key="index"` instead of `:key="subject.id"` |
| `watch` never fires | passed a value instead of a getter |
| `watch` doesn't fire on nested changes | `deep: true` missing |
| List doesn't update | mutated the array where an assignment was needed |

## Self-check

- [ ] Adding a grade updates list, average and distribution at once
- [ ] An empty list shows `–` instead of `NaN`
- [ ] You can explain when `computed` and when `watch` is right
- [ ] The browser updates without a reload (otherwise see chapter 00, `usePolling`)

## In the reference

- `reference/src/components/GradeInput.vue` — a `ref` plus two `watch`es in both directions
- `reference/src/composables/useGradeStats.ts` — several `computed`s bundled together
- `reference/src/views/lecturer/GradeEntryView.vue` — `watch` with `immediate` on a route param
