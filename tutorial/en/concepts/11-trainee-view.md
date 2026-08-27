# 11 — The trainee view

> **Time:** about 3–4 hours · the chart costs more time than it looks

## Goal

Own assessments with an average, and per subject the **cohort comparison**: the anonymous
distribution as a bar chart, your own assessment highlighted. Without a chart library — and
strictly limited to your own academy.

---

## The dashboard

```ts
const rows = computed(() => {
  const user = currentUser.value
  if (user === null) return []
  // The academy comes from the user themselves - so a Padawan never sees an
  // Imperial subject, whatever the URL says.
  return gradesStore.gradesForStudent(user.id, user.academyId)
})

const ownGrades = computed(() => rows.value.map((row) => row.grade))
const stats = useGradeStats(ownGrades)
```

The `null` check isn't redundant even though the router guard practically rules it out. The
compiler knows nothing about your guard, and the alternative — a `!` — is an assertion that can
become false at the next refactor. Returning an empty list is cheaper than any argument about
it.

A detail when accessing role-specific fields:

```vue
{{ currentUser && 'matriculationNumber' in currentUser ? currentUser.matriculationNumber : '–' }}
```

`currentUser` is a `User`, i.e. `Student | Lecturer`. The `in` operator narrows it — that's
narrowing from [TypeScript](03-typescript.md) in a place where it genuinely helps.

## The cohort comparison

### Only assessments, no names

```ts
const classGrades = computed(() => gradesStore.gradesForSubject(props.subjectId))
const stats = useGradeStats(classGrades)
```

`gradesForSubject` returns **only the assessments of the own academy**, in list order, with no
link to people. That's deliberate: what the view never receives, it cannot accidentally
display. If it got the full records and filtered the names out in the template, anonymity would
be a matter of care — this way it's a property of the data structure.

The own assessment comes separately:

```ts
const ownGrade = computed(() => {
  const user = currentUser.value
  return user === null ? null : gradesStore.gradeOf(props.subjectId, user.id)
})
```

### Standing

```ts
const rank = computed(() => {
  const own = ownGrade.value
  if (own === null) return null

  const better = classGrades.value.filter((grade) => grade !== null && grade < own).length
  return { position: better + 1, of: stats.count.value }
})
```

Sharing a position on equal assessments is a domain decision — and it's the right one: sorting
ten people by assessment and numbering them creates a ranking that doesn't exist.

## The bar chart

Five bars whose height is a percentage. A chart library would be ~100 kB for something Flexbox
does in twenty lines.

```ts
const peak = computed(() => Math.max(...Object.values(distribution), 1))

const bars = computed(() =>
  GRADES.map((grade) => ({
    grade,
    count: distribution[grade],
    heightPercent: (distribution[grade] / peak.value) * 100,
    share: total.value === 0 ? 0 : Math.round((distribution[grade] / total.value) * 100),
    isOwn: grade === ownGrade,
  })),
)
```

Scaling is against the **tallest** bar, not the total: otherwise an even distribution would make
every bar a fifth high and the chart would look flat. The `, 1` at the end of `Math.max(...)`
guards against division by zero.

### The trap that will definitely catch you

```vue
<!-- THIS DOES NOT WORK -->
<div class="flex h-44 items-end">
  <div v-for="bar in bars" class="flex flex-1 flex-col items-center">
    <span>{{ bar.count }}</span>
    <div :style="{ height: `${bar.heightPercent}%` }" class="w-full bg-grade-1" />
    <span>{{ bar.grade }}</span>
  </div>
</div>
```

Result: **no visible bars.** No console error, no warning, all the numbers are right — the bars
are simply not there.

The reason is CSS, not Vue: **a percentage height refers to the height of the parent element.**
The parent here is the column, and it has no definite height (`auto`, it follows its content).
Without a reference the browser can't resolve the percentage and treats it like `auto` — i.e.
zero.

The right way is a dedicated "track" with a fixed height:

```vue
<div class="flex items-end gap-2">
  <div v-for="bar in bars" :key="bar.grade" class="flex flex-1 flex-col items-center gap-2">
    <span>{{ bar.count }}</span>

    <div class="flex h-36 w-full items-end">      <!-- fixed height = reference -->
      <div
        class="w-full rounded-t-md transition-[height] duration-300"
        :class="[BAR_CLASSES[bar.grade], bar.isOwn && 'ring-2 ring-ink']"
        :style="{ height: `${Math.max(bar.heightPercent, 2)}%` }"
      />
    </div>

    <span>{{ bar.grade }}</span>
    <span>{{ bar.share }} %</span>
  </div>
</div>
```

The labels sit **outside** the track. Inside it they'd count towards the reference height, and
100 % would overflow.

`Math.max(..., 2)` keeps even a very small bar visible as a line.

### Colours: no assembled class names

```ts
const BAR_CLASSES: Record<Grade, string> = {
  1: 'bg-grade-1', 2: 'bg-grade-2', 3: 'bg-grade-3', 4: 'bg-grade-4', 5: 'bg-grade-5',
}
```

`` `bg-grade-${bar.grade}` `` does **not** work. Tailwind scans your source for complete class
names; it never finds one assembled at runtime, and the class doesn't end up in the CSS. More
on that in [Styling and theming](12-styling-tailwind.md).

### Accessibility

```vue
<div
  role="img"
  :aria-label="`${bar.grade} — ${gradeLabels[bar.grade]}: ${bar.count} / ${total}`"
/>
```

A bar is an empty `<div>`. Without a label the chart doesn't exist for a screen reader. On top
of that, count and percentage are there as text — the own assessment is marked not **only** by
the outline but also by the "My assessment" stat above it. Never carry information by colour or
shape alone.

## Empty states

Four of six subjects are unassessed. That's the normal case, not the exception:

```vue
<EmptyState
  v-if="stats.isEmpty.value"
  :title="t('student.compareEmptyTitle')"
  :description="t('student.compareEmptyBody')"
/>
<GradeDistributionChart v-else :distribution="stats.distribution.value" :own-grade="ownGrade" />
```

A chart made of five zero-height bars is not a good answer to "there's nothing yet".

---

## Your task

**`views/student/DashboardView.vue`:**
1. A greeting with first name, role label and matriculation number.
2. Stats: average, assessed subjects, pass rate.
3. A table of all subjects with `GradeBadge`, the rating text and a link to the comparison.
4. An `EmptyState` while nothing is assessed.

**`components/GradeBadge.vue`:**
5. The grade as a coloured box, `null` as `–`, optional highlighting, `title` with the rating
   text.

**`components/GradeDistributionChart.vue`:**
6. Props `distribution` and `ownGrade`. Five bars with a fixed track, count and percentage, the
   own grade outlined, an `aria-label` per bar.

**`views/student/SubjectMirrorView.vue`:**
7. `subjectId` as a prop, catching an unknown subject.
8. Stats: own assessment, cohort average, assessed count, standing.
9. Chart or `EmptyState`.

## Pitfalls

- A percentage height without a parent that has a fixed height.
- Assembling class names at runtime.
- Scaling against the total instead of the tallest bar.
- Passing names into the comparison and filtering them out in the template.
- Division by zero on an empty distribution.

## Self-check

- [ ] Sign in as `tano`: assessments in the two pre-filled subjects, `–` in the rest
- [ ] **Only** the 6 Jedi subjects appear, none of the other 18
- [ ] The comparison shows **visible** bars over **10** assessments, not 40
- [ ] The bars sum to the number of assessments given
- [ ] The own assessment is outlined and also appears as a stat
- [ ] The percentages add up to roughly 100
- [ ] An unassessed subject shows the empty state, not a chart made of zeroes
- [ ] No foreign name appears anywhere
- [ ] `/student/grades/f99` doesn't crash
- [ ] Nor does a subject from a foreign academy — and it shows **no** foreign data
- [ ] Visiting `/lecturer/subjects` as a trainee → the guard sends you back

## In the reference

- `reference/src/views/student/DashboardView.vue`, `reference/src/views/student/SubjectMirrorView.vue`
- `reference/src/components/GradeDistributionChart.vue`, `reference/src/components/GradeBadge.vue`,
  `reference/src/components/StatTile.vue`
