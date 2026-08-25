# 10 — The instructor view

> **Time:** about 3–4 hours · the longest chapter

## Goal

The subject list with a progress indicator and the assessment form: one row per trainee, a
button fills every field with random values, and only *Save* writes the data. All of it
restricted to the **instructor's own academy**.

This is the heart of the application — and the chapter where the concepts of the last six come
together.

---

## The subject list

```ts
const rows = computed(() =>
  ownSubjects.value.map((subject) => {
    const graded = gradedCountBySubject.value[subject.id] ?? 0

    return {
      subject,
      graded,
      isComplete: graded === studentCount.value,
      average: average(gradesStore.gradesForSubject(subject.id)),
    }
  }),
)
```

A row is more than a subject: it carries the progress and the average with it. That enrichment
belongs in a `computed`, not in the template — there it would run on every render.

`subjectsOf()` already sorts by term. The sort key it uses,
`semester * 1000 + number`, is a trick for sorting by two criteria without writing a two-stage
comparator: the first criterion dominates because its contribution is always larger than
anything the second can add.

Progress as a badge:

```vue
<BaseBadge :tone="row.isComplete ? 'success' : 'warning'">
  {{ row.graded }} / {{ studentCount }}
</BaseBadge>
```

## The assessment form

### Draft versus saved state

The central design decision of this chapter:

```ts
const draft = ref<Record<string, Grade | null>>({})

function loadDraft() {
  draft.value = gradesStore.gradeMapForSubject(props.subjectId)
  savedAt.value = null
}
```

The draft is a **local copy**, not store state. That's why *Fill at random* changes nothing in
the real data yet — which is exactly the point: the generator fills the fields, you see the
result and confirm it.

As a by-product you get *Discard* for free, and you can display "unsaved" at all:

```ts
const isDirty = computed(() =>
  roster.value.some(
    (student) => draft.value[student.id] !== gradesStore.gradeOf(props.subjectId, student.id),
  ),
)
```

### The watcher on the route parameter

```ts
watch(() => props.subjectId, loadDraft, { immediate: true })
```

Without this line the view is broken in a way that's easy to miss: when you switch from
`/dozent/faecher/f02` to `/f03`, **the component is reused**. Vue doesn't recreate it, because
it's the same route with different parameters. So `<script setup>` doesn't run again and the
old draft stays — and you record assessments for the wrong subject.

`immediate: true` makes the watcher run once on the first render too; otherwise you'd need an
`onMounted` as well.

> Alternative: `<RouterView :key="$route.fullPath" />` forces a new component per URL. That's
> the blunt instrument — it also throws away scroll position and every other piece of local
> state.

### Fill at random

```ts
function fillRandom() {
  draft.value = randomGradesFor(roster.value.map((student) => student.id))
}
```

A new object instead of ten individual assignments: **one** assignment, **one** render.

### Saving

```ts
function save() {
  gradesStore.saveSubject(props.subjectId, draft.value)
  savedAt.value = new Date()
}
```

Afterwards `isDirty` is `false` automatically — it compares against the store, after all. You
don't have to reset anything; the derived value is right by itself. That's the pay-off from the
rule in [chapter 04](04-vue-reactivity.md): derive instead of maintaining.

## `v-model` on an index access

Here you trip over `noUncheckedIndexedAccess` from [chapter 03](03-typescript.md):

```vue
<!-- Type error: draft[student.id] is Grade | null | undefined,
     but GradeInput wants Grade | null -->
<GradeInput v-model="draft[student.id]" />
```

The fix is to split `v-model` into its two halves:

```vue
<GradeInput
  :model-value="draft[student.id] ?? null"
  :label="`Assessment for ${student.firstName} ${student.lastName}`"
  @update:model-value="(value) => (draft[student.id] = value)"
/>
```

That's why it was worth knowing the spelled-out form back in [chapter 05](05-components.md):
as soon as the value has to be adjusted on the way in, the shorthand isn't enough.

The `:label` isn't decoration. Ten input fields without a visible label need an `aria-label`,
otherwise a screen reader says "text field" ten times.

## `GradeInput`: translating between text and grade

An `<input>` always yields a string, the model wants `Grade | null`. So the component keeps its
own text `ref` and translates in both directions.

```ts
const model = defineModel<Grade | null>({ required: true })
const text = ref(model.value === null ? '' : String(model.value))
const invalid = ref(false)

// From outside in: "Fill at random", switching subjects
watch(model, (value) => {
  const next = value === null ? '' : String(value)
  if (next !== text.value) {
    text.value = next
    invalid.value = false
  }
})

// From inside out: typing
watch(text, (value) => {
  const parsed = parseGrade(value)
  if (parsed === undefined) {
    invalid.value = true     // invalid: show it, but do NOT report it
    return
  }
  invalid.value = false
  model.value = parsed
})
```

**The central promise: invalid input is displayed but not reported upwards.** The model is
valid at every point in time. If someone types a 9, "only 1–5" appears at the field and the
previous grade is untouched.

The comparison `if (next !== text.value)` in the first watcher prevents an infinite loop:
without it every change to `model` writes to `text`, which writes to `model` again.

And the error message needs a unique ID:

```ts
const hintId = useId()
```

`aria-describedby` points at the message. Ten fields with the same hard-coded ID would all
point at the same one.

---

## Your task

**`views/lecturer/SubjectListView.vue`:**
1. A `computed` with subject, progress, `isComplete` and average.
2. Stats at the top: number of subjects, open subjects, overall average.
3. A table with a badge and a link to the assessment form.

**`views/lecturer/GradeEntryView.vue`:**
4. `subjectId` as a prop (`props: true` in the router).
5. A local `draft`, a watcher with `immediate: true`, `isDirty` as a `computed`.
6. Buttons: *Fill at random*, *Clear*, *Discard*, *Save*. The last two only active when
   `isDirty`.
7. A notice "Unsaved changes" or "Saved at HH:MM:SS".
8. A table with a `GradeInput` per row.
9. Stats from `useGradeStats(draftGrades)` — they should update **live while typing**, not only
   on save.
10. `onBeforeRouteLeave` with a confirmation when there are unsaved changes.

**`components/GradeInput.vue`:** as described above.

**Catch unknown *and foreign* subjects:** `/dozent/faecher/f99` must not crash — and
`/dozent/faecher/<a Sith subject>` must not work as a Jedi either:

```ts
const subject = computed(() => {
  const found = subjects.byId(props.subjectId)
  if (found === undefined || academy.value === null) return undefined
  // A foreign subject == a non-existent subject.
  return found.academyId === academy.value.id ? found : undefined
})
```

> **This is not hypothetical.** While building the reference I forgot exactly this check at
> first: `subjects.byId` finds *any* subject, and the ID comes from the URL. A Rebel recruit
> could inspect the Sith comparison through the address bar. Whenever an identifier comes from
> the URL, the question belongs with it: *is this person allowed to see that at all?*

## Pitfalls

| Symptom | Cause |
| --- | --- |
| Switching subjects shows the old assessments | watcher on `props.subjectId` missing |
| The watcher never fires | `watch(props.subjectId, …)` instead of `watch(() => props.subjectId, …)` |
| Everything is empty on first load | `immediate: true` missing |
| Type error on `v-model` | an index access can be `undefined` — spell it out |
| Infinite loop in `GradeInput` | the comparison before the assignment is missing |
| Random values are saved immediately | written into the store instead of the draft |
| The wrong row keeps a value | `:key` is the index instead of the ID |

## Self-check

- [ ] Open an empty subject, *Fill at random* → all **10** fields filled (not 40!), "unsaved"
      appears
- [ ] The store is still unchanged (check in the Vue devtools)
- [ ] *Discard* restores the previous state
- [ ] *Save* → the notice changes, reload → the assessments are still there
- [ ] Type a 9 → "only 1–5", the previous value is preserved
- [ ] Clear a field → saved as "not assessed"
- [ ] Navigating away with unsaved changes → confirmation
- [ ] Switching subjects through the list shows the right assessments
- [ ] `/dozent/faecher/f99` shows a friendly message
- [ ] A subject from a **foreign** academy via the address bar does too

## In the reference

- `reference/src/views/lecturer/SubjectListView.vue`, `reference/src/views/lecturer/GradeEntryView.vue`
- `reference/src/components/GradeInput.vue`
- `reference/src/components/__tests__/GradeInput.spec.ts` — checks exactly the promise "invalid
  input is not reported"
