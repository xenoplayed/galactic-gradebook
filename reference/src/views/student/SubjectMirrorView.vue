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
const { currentUser, academy } = storeToRefs(auth)

/**
 * Das Fach - aber nur, wenn es zur eigenen Akademie gehoert.
 *
 * `subjects.byId` findet JEDES Fach, auch das einer fremden Akademie. Die
 * subjectId kommt aus der URL und ist damit frei waehlbar; ohne diese Pruefung
 * koennte ein Rekrut per Adresszeile den Sith-Vergleich einsehen. Ein fremdes
 * Fach wird deshalb behandelt wie ein nicht existierendes.
 */
const subject = computed(() => {
  const found = subjects.byId(props.subjectId)
  if (found === undefined || academy.value === null) return undefined
  return found.academyId === academy.value.id ? found : undefined
})

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
        class="text-sm font-medium text-link hover:underline"
      >
        Zu meinen Bewertungen
      </RouterLink>
    </EmptyState>
  </BaseCard>

  <div v-else class="space-y-6">
    <div>
      <RouterLink :to="{ name: 'student-dashboard' }" class="text-sm text-ink-soft hover:underline">
        ← Meine Bewertungen
      </RouterLink>
      <h1 class="mt-1 text-2xl font-semibold tracking-tight">{{ subject.name }}</h1>
      <p class="text-sm text-ink-soft">
        {{ subject.shortName }} · {{ subject.semester }}. Semester · {{ subject.ects }} ECTS
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-4">
      <div class="rounded-card bg-surface p-4 ring-1 ring-line">
        <p class="text-xs font-medium tracking-wide text-ink-soft uppercase">Meine Bewertung</p>
        <div class="mt-2 flex items-center gap-3">
          <GradeBadge :grade="ownGrade" highlight />
          <span class="text-sm text-ink-soft">
            {{
              ownGrade === null ? 'noch nicht bewertet' : gradeLabel(ownGrade, academy?.gradeLabels)
            }}
          </span>
        </div>
      </div>
      <StatTile label="Durchschnitt" :value="formatAverage(stats.average.value)" />
      <StatTile label="Bewertet" :value="`${stats.count.value} / ${stats.total.value}`" />
      <StatTile
        label="Platzierung"
        :value="rank === null ? '–' : `${rank.position}. von ${rank.of}`"
        hint="bei gleicher Note geteilt"
      />
    </div>

    <BaseCard
      title="Vergleich"
      :subtitle="`Verteilung aller Bewertungen unter den ${academy?.studentPlural ?? 'Lernenden'} – anonym.`"
    >
      <EmptyState
        v-if="stats.isEmpty.value"
        title="Hier wurde noch nicht bewertet"
        description="Der Vergleich erscheint, sobald Bewertungen vorliegen."
      />
      <GradeDistributionChart
        v-else
        :distribution="stats.distribution.value"
        :own-grade="ownGrade"
      />
    </BaseCard>
  </div>
</template>
