# 05 — Components

> **Time:** about 2–3 hours · four components of your own

## Goal

You can write components that take data in (props), report events (emits) and accept foreign
markup (slots). At the end your reusable building blocks live in `src/components/base/`.

---

## Props: data in

```vue
<!-- StatTile.vue -->
<script setup lang="ts">
defineProps<{
  label: string
  value: string
  hint?: string        // optional
}>()
</script>

<template>
  <div>
    <p>{{ label }}</p>
    <p>{{ value }}</p>
    <p v-if="hint">{{ hint }}</p>
  </div>
</template>
```

```vue
<StatTile label="Average" :value="formatAverage(average)" />
```

Note the difference: `label="..."` passes a **string**, `:value="..."` evaluates an
**expression**. `:count="5"` is the number 5, `count="5"` is the string `'5'`.

`defineProps` and the other `define*` are compiler macros: no import needed, and they may only
appear directly inside `<script setup>`.

### Default values

```vue
<script setup lang="ts">
const { variant = 'primary', disabled = false } = defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  disabled?: boolean
}>()
</script>
```

Destructuring with defaults — since Vue 3.5 reactivity survives that. In older examples you'll
find `withDefaults(defineProps<...>(), {...})` instead; both work, the short form is the
current convention.

> **Props are read-only.** Changing a prop in the child is a mistake. Data flows one way: down
> through props, up through emits. If you need a prop as the starting value for local state,
> copy it into your own `ref`.

## Emits: events out

```vue
<script setup lang="ts">
const emit = defineEmits<{
  save: [subjectId: string]
  cancel: []
}>()

function save() {
  emit('save', 'f01')
}
</script>
```

```vue
<GradeForm @save="handleSave" @cancel="goBack" />
```

## `v-model` on your own components

`v-model` is just sugar for "prop in, event out":

```vue
<BaseInput v-model="name" />

<!-- is exactly this: -->
<BaseInput :model-value="name" @update:model-value="name = $event" />
```

With `defineModel()` you write that in the child in one line:

```vue
<script setup lang="ts">
const model = defineModel<string>({ required: true })
</script>

<template>
  <input v-model="model" />
</template>
```

`model` is an ordinary `ref`: read with `model.value`, write with `model.value = x` — Vue
raises the event upwards for you.

It's worth knowing the spelled-out form. You'll need it in [The instructor
view](10-instructor-view.md), because there you have to normalise the value on the way in.

## Slots: markup in

Props pass data. Slots pass **markup**.

```vue
<!-- BaseCard.vue -->
<template>
  <section>
    <header v-if="title || $slots.header">
      <h2 v-if="title">{{ title }}</h2>
      <slot name="header" />        <!-- named slot -->
    </header>
    <div class="p-5">
      <slot />                      <!-- default slot -->
    </div>
  </section>
</template>
```

```vue
<BaseCard title="Record assessments">
  <template #header>
    <BaseButton @click="save">Save</BaseButton>
  </template>

  <p>Any content.</p>
</BaseCard>
```

`$slots.header` checks whether the slot was filled at all — otherwise an empty header with a
separator line would remain. That check is the difference between a component people enjoy
using and one they route around.

## Fall-through attributes

```vue
<BaseButton variant="ghost" @click="signOut" class="ml-2" />
```

`variant` is a prop. `@click` and `class` are not — Vue attaches them automatically to the
component's root element. That's why `@click` works on `BaseButton` without the component
declaring a `click` emit.

This assumes **one** root element. With several you have to set `inheritAttrs: false` and place
`v-bind="$attrs"` yourself.

## A modal without a library: the native `<dialog>`

For "a window opens, the background dims" people reach for a library by reflex. You don't need
one — the browser has done this for years:

```vue
<script setup lang="ts">
const open = defineModel<boolean>({ required: true })
const dialog = useTemplateRef<HTMLDialogElement>('dialog')

watch(open, (isOpen) => {
  const element = dialog.value
  if (element === null) return

  if (isOpen) element.showModal()
  else if (element.open) element.close()
})
</script>

<template>
  <dialog ref="dialog" @close="open = false" @click.self="open = false">
    <slot />
  </dialog>
</template>
```

`showModal()` brings three things you'd otherwise rebuild laboriously:

- a **focus trap** — Tab stays inside the window
- **Escape** to close
- the **backdrop**, addressable via `::backdrop` (in Tailwind: `backdrop:bg-black/60`)

Four details people miss the first time:

**`@close` is mandatory.** Escape closes the window *natively* — Vue hears nothing about it.
Without this handler the model would stay `true`, and the button that opens it would then
apparently do nothing. A bug that's terribly hard to explain if you haven't met it.

**`else if (element.open)`.** Without that check it goes round in circles: `close()` fires
`close`, the handler sets the model to `false`, the watcher runs again.

**`@click.self` closes on a click beside it.** The `<dialog>` fills the whole area; `.self`
distinguishes the surround from the content, which lives in child elements.

**Don't forget `m-auto`.** Browsers centre a modal `<dialog>` via `margin: auto` with
`inset: 0`. But Tailwind's preflight sets `margin: 0` on everything — without `m-auto` your
window sticks to the top-left corner. That happened to me while building the reference.

> **And a note for [Tests](13-tests-vitest.md):** jsdom, the test environment, doesn't know
> `showModal()`. The test therefore needs a small stand-in — described there.

## Why base components at all

Instead of repeating

```vue
<button class="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm ...">
```

forty times across the project:

```vue
<BaseButton>Save</BaseButton>
```

The gain isn't brevity, it's that the decision lives in **one place**. If the focus ring should
look different, you change one file instead of forty — and none gets forgotten.

Where the line runs:

- **`components/base/`** — knows nothing about assessments. `BaseButton`, `BaseInput`,
  `BaseCard`, `BaseTable`, `BaseBadge`, `BaseSelect`, `EmptyState`. Reusable in any project.
- **`components/`** — knows the domain. `GradeInput`, `GradeBadge`,
  `GradeDistributionChart`, `StatTile`, `AppNav`.
- **`views/`** — a whole page, attached to a route.

## A generic component

```vue
<script setup lang="ts" generic="T extends string">
defineProps<{
  label: string
  options: readonly { value: T; label: string }[]
}>()

const model = defineModel<T>({ required: true })
</script>
```

`generic="..."` on the `<script setup>` makes the component generic. Pass options of type
`{ value: SubjectId }` and the `v-model` target is a `SubjectId` too — not a `string` that any
value fits into.

## Unique IDs

```ts
import { useId } from 'vue'
const inputId = useId()
```

`<label for>` needs the field's ID. A hard-coded ID collides as soon as the component appears
twice on the page — then the label points at the wrong field. In the assessment table
`GradeInput` appears ten times. `useId()` gives a unique ID per instance.

---

## Your task

Create `src/components/base/` and build:

1. **`BaseButton.vue`** — props `variant`, `type`, `disabled`, `block`; default slot. Put the
   per-variant classes in a `Record<Variant, string>` in the script, not an `if` chain in the
   template.
2. **`BaseInput.vue`** — `defineModel<string>()`, props `label`, `type`, `placeholder`,
   `error`; `useId()` for the label association; error message underneath.
3. **`BaseCard.vue`** — props `title`, `subtitle`; default slot plus a named `header` slot.
4. **`EmptyState.vue`** — props `title`, `description`, slot for an action.
5. **`BaseDialog.vue`** — `defineModel<boolean>()` for open/closed, prop `title`, default slot.
   Then check by hand: Escape closes, a click beside it closes, Tab stays inside.

Use them in your screen from [Vue reactivity](04-vue-reactivity.md) and check that `@click` works
on `BaseButton` even though the component declares no `click` emit.

## Pitfalls

- Changing a prop in the child — read-only, copy it into a `ref`.
- Writing `modelValue` in the template instead of `model-value`. Templates use kebab-case, the
  script camelCase.
- Forgetting to check the slot (`$slots.header`) and producing an empty frame.
- Assembling class names at runtime (`bg-grade-${grade}`). Tailwind never finds those — more on
  that in [Styling and theming](12-styling-tailwind.md).

## Self-check

- [ ] `BaseButton` looks different in three variants
- [ ] `v-model` on `BaseInput` works both ways
- [ ] `BaseCard` without a `header` slot shows no empty card header
- [ ] Two `BaseInput`s on one page: clicking the label focuses the *right* field
- [ ] `BaseDialog` opens centred, Escape closes it, and it can be opened again afterwards

## In the reference

- `reference/src/components/base/` — all base components
- `reference/src/components/base/BaseDialog.vue` — the native `<dialog>`
- `reference/src/components/base/BaseSelect.vue` — the generic variant
- `reference/src/components/base/BaseCard.vue` — `$slots.header`
