<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatGrade } from '@/lib/grades'
import type { Grade } from '@/types/domain'

const { t } = useI18n()

const {
  grade,
  highlight = false,
  label,
} = defineProps<{
  grade: Grade | null
  highlight?: boolean
  /** Bezeichnung aus der Akademie - fuer den Tooltip. */
  label?: string
}>()

// Tailwind kann keine zur Laufzeit zusammengebauten Klassennamen finden
// (`bg-grade-${grade}` waere im fertigen CSS schlicht nicht enthalten).
// Deshalb steht hier eine ausgeschriebene Zuordnung.
const GRADE_CLASSES: Record<Grade, string> = {
  1: 'bg-grade-1 text-white',
  2: 'bg-grade-2 text-white',
  3: 'bg-grade-3 text-ink',
  4: 'bg-grade-4 text-white',
  5: 'bg-grade-5 text-white',
}

const classes = computed(() =>
  grade === null ? 'bg-surface-2 text-ink-soft' : GRADE_CLASSES[grade],
)

const title = computed(() => (grade === null ? t('grades.notAssessedShort') : (label ?? '')))
</script>

<template>
  <span
    class="inline-flex h-8 w-8 items-center justify-center rounded-card text-sm font-semibold tabular-nums"
    :class="[classes, highlight && 'ring-2 ring-brand-600 ring-offset-2 ring-offset-surface']"
    :title="title"
  >
    {{ formatGrade(grade) }}
  </span>
</template>
