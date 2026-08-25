<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { GRADES, type Grade } from '@/types/domain'
import type { GradeDistribution } from '@/lib/grades'

/**
 * Der Klassenspiegel als Balkendiagramm - bewusst ohne Chart-Bibliothek.
 * Fuenf Balken, deren Hoehe ein Prozentwert ist, sind reines CSS; eine
 * Bibliothek dafuer waeren ~100 kB, die niemand braucht.
 */
const { t } = useI18n()

const {
  distribution,
  ownGrade = null,
  gradeLabels,
} = defineProps<{
  distribution: GradeDistribution
  ownGrade?: Grade | null
  /** Bezeichnungen der Akademie - fuer die Vorlesehilfe je Balken. */
  gradeLabels: Record<Grade, string>
}>()

const BAR_CLASSES: Record<Grade, string> = {
  1: 'bg-grade-1',
  2: 'bg-grade-2',
  3: 'bg-grade-3',
  4: 'bg-grade-4',
  5: 'bg-grade-5',
}

const total = computed(() => Object.values(distribution).reduce((sum, count) => sum + count, 0))

/** Hoechster Balken - daran wird skaliert, damit der Groesste immer 100 % hoch ist. */
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
</script>

<template>
  <div>
    <div class="flex items-end gap-2 sm:gap-4">
      <div v-for="bar in bars" :key="bar.grade" class="flex flex-1 flex-col items-center gap-2">
        <span class="text-xs font-medium text-ink-soft tabular-nums">
          {{ bar.count }}
        </span>

        <!--
          Diese "Schiene" braucht eine FESTE Hoehe (h-36).
          Eine prozentuale Hoehe bezieht sich immer auf die Hoehe des
          Elternelements - ist die `auto`, hat der Browser keinen Bezugswert
          und der Balken bleibt unsichtbar. Deshalb liegen die Beschriftungen
          ausserhalb der Schiene: sonst zaehlten sie zur Bezugshoehe mit und
          100 % wuerden ueberlaufen.
        -->
        <div class="flex h-36 w-full items-end">
          <div
            class="w-full rounded-t-md transition-[height] duration-300"
            :class="[
              BAR_CLASSES[bar.grade],
              bar.count === 0 && 'opacity-25',
              bar.isOwn && 'ring-2 ring-ink',
            ]"
            :style="{ height: `${Math.max(bar.heightPercent, 2)}%` }"
            role="img"
            :aria-label="`${bar.grade} — ${gradeLabels[bar.grade]}: ${bar.count} / ${total}`"
          />
        </div>

        <span
          class="text-sm font-semibold tabular-nums"
          :class="bar.isOwn ? 'text-link' : 'text-ink-soft'"
        >
          {{ bar.grade }}
        </span>
        <span class="text-xs text-ink-soft tabular-nums">{{ bar.share }} %</span>
      </div>
    </div>

    <p v-if="ownGrade !== null" class="mt-4 text-xs text-ink-soft">
      {{ t('student.ownBarNote') }}
    </p>
  </div>
</template>
