<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { subjects } from '@/data/seed'
import { useAuthStore } from '@/stores/auth'
import { useGradesStore } from '@/stores/grades'
import { useGradeStats } from '@/composables/useGradeStats'
import { formatAverage, gradeLabel } from '@/lib/grades'
import BaseCard from '@/components/base/BaseCard.vue'
import EmptyState from '@/components/base/EmptyState.vue'
import GradeBadge from '@/components/GradeBadge.vue'
import GradeDistributionChart from '@/components/GradeDistributionChart.vue'
import StatTile from '@/components/StatTile.vue'

const props = defineProps<{ subjectId: string }>()

const auth = useAuthStore()
const gradesStore = useGradesStore()
const { currentUser } = storeToRefs(auth)

const subject = computed(() => subjects.byId(props.subjectId))

/**
 * Der Klassenspiegel enthaelt NUR die Noten - keine Namen, keine Zuordnung.
 * Was die View nie erhaelt, kann sie auch nicht versehentlich anzeigen.
 */
const classGrades = computed(() => gradesStore.gradesForSubject(props.subjectId))
const stats = useGradeStats(classGrades)

const ownGrade = computed(() => {
  const user = currentUser.value
  if (user === null) return null
  return gradesStore.gradeOf(props.subjectId, user.id)
})

/** Wie viele Kursnoten sind besser als die eigene? Ergibt die Platzierung. */
const rank = computed(() => {
  const own = ownGrade.value
  if (own === null) return null

  const better = classGrades.value.filter((grade) => grade !== null && grade < own).length
  return { position: better + 1, of: stats.count.value }
})
</script>

<template>
  <BaseCard v-if="subject === undefined">
    <EmptyState
      title="Fach nicht gefunden"
      :description="`Es gibt kein Fach mit der ID «${subjectId}».`"
    >
      <RouterLink
        :to="{ name: 'student-dashboard' }"
        class="text-sm font-medium text-brand-600 hover:underline"
      >
        Zu meinen Noten
      </RouterLink>
    </EmptyState>
  </BaseCard>

  <div v-else class="space-y-6">
    <div>
      <RouterLink
        :to="{ name: 'student-dashboard' }"
        class="text-sm text-slate-500 hover:underline dark:text-slate-400"
      >
        ← Meine Noten
      </RouterLink>
      <h1 class="mt-1 text-2xl font-semibold tracking-tight">{{ subject.name }}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        {{ subject.shortName }} · {{ subject.semester }}. Semester · {{ subject.ects }} ECTS
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-4">
      <div
        class="rounded-xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
      >
        <p class="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
          Meine Note
        </p>
        <div class="mt-2 flex items-center gap-3">
          <GradeBadge :grade="ownGrade" highlight />
          <span class="text-sm text-slate-600 dark:text-slate-300">
            {{ ownGrade === null ? 'noch nicht benotet' : gradeLabel(ownGrade) }}
          </span>
        </div>
      </div>
      <StatTile label="Kursdurchschnitt" :value="formatAverage(stats.average.value)" />
      <StatTile label="Benotet" :value="`${stats.count.value} / ${stats.total.value}`" />
      <StatTile
        label="Platzierung"
        :value="rank === null ? '–' : `${rank.position}. von ${rank.of}`"
        hint="bei gleicher Note geteilt"
      />
    </div>

    <BaseCard title="Klassenspiegel" subtitle="Verteilung aller Noten in diesem Fach – anonym.">
      <EmptyState
        v-if="stats.isEmpty.value"
        title="Noch keine Noten in diesem Fach"
        description="Der Klassenspiegel erscheint, sobald benotet wurde."
      />
      <GradeDistributionChart
        v-else
        :distribution="stats.distribution.value"
        :own-grade="ownGrade"
      />
    </BaseCard>
  </div>
</template>
