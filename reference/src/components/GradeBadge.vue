<script setup lang="ts">
import { computed } from 'vue'
import { formatGrade, gradeLabel } from '@/lib/grades'
import type { Grade } from '@/types/domain'

const { grade, highlight = false } = defineProps<{
  grade: Grade | null
  highlight?: boolean
}>()

// Tailwind kann keine zur Laufzeit zusammengebauten Klassennamen finden
// (`bg-grade-${grade}` waere im fertigen CSS schlicht nicht enthalten).
// Deshalb steht hier eine ausgeschriebene Zuordnung.
const GRADE_CLASSES: Record<Grade, string> = {
  1: 'bg-grade-1 text-white',
  2: 'bg-grade-2 text-white',
  3: 'bg-grade-3 text-slate-900',
  4: 'bg-grade-4 text-white',
  5: 'bg-grade-5 text-white',
}

const classes = computed(() =>
  grade === null
    ? 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
    : GRADE_CLASSES[grade],
)

const title = computed(() => (grade === null ? 'Noch nicht benotet' : gradeLabel(grade)))
</script>

<template>
  <span
    class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold tabular-nums"
    :class="[
      classes,
      highlight && 'ring-2 ring-brand-600 ring-offset-2 dark:ring-offset-slate-900',
    ]"
    :title="title"
  >
    {{ formatGrade(grade) }}
  </span>
</template>
