<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useGradesStore } from '@/stores/grades'
import { useGradeStats } from '@/composables/useGradeStats'
import { formatAverage, gradeLabel } from '@/lib/grades'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseTable from '@/components/base/BaseTable.vue'
import EmptyState from '@/components/base/EmptyState.vue'
import GradeBadge from '@/components/GradeBadge.vue'
import StatTile from '@/components/StatTile.vue'

const auth = useAuthStore()
const gradesStore = useGradesStore()
const { currentUser, greeting } = storeToRefs(auth)

/**
 * Alle Faecher mit der eigenen Note. `currentUser` kann theoretisch `null`
 * sein - der Route-Guard schliesst das praktisch aus, der Compiler weiss das
 * aber nicht, also wird der Fall sauber behandelt.
 */
const rows = computed(() => {
  const user = currentUser.value
  if (user === null) return []
  return gradesStore.gradesForStudent(user.id)
})

const ownGrades = computed(() => rows.value.map((row) => row.grade))
const stats = useGradeStats(ownGrades)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">{{ greeting }}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Angemeldet als {{ currentUser?.roleLabel }} · Matrikelnummer
        {{
          currentUser && 'matriculationNumber' in currentUser
            ? currentUser.matriculationNumber
            : '–'
        }}
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <StatTile
        label="Notendurchschnitt"
        :value="formatAverage(stats.average.value)"
        hint="über alle benoteten Fächer"
      />
      <StatTile label="Benotete Fächer" :value="`${stats.count.value} / ${stats.total.value}`" />
      <StatTile
        label="Bestanden"
        :value="stats.passRate.value === null ? '–' : `${Math.round(stats.passRate.value)} %`"
      />
    </div>

    <BaseCard title="Meine Noten" subtitle="Ein Fach auswählen, um den Klassenspiegel zu sehen.">
      <EmptyState
        v-if="stats.isEmpty.value"
        title="Noch keine Noten"
        description="Sobald die Dozentin Noten einträgt, erscheinen sie hier."
      />

      <BaseTable v-else>
        <template #head>
          <th class="py-2 pr-4 font-medium">Fach</th>
          <th class="py-2 pr-4 font-medium">Semester</th>
          <th class="py-2 pr-4 font-medium">Note</th>
          <th class="py-2 pr-4 font-medium">Bewertung</th>
          <th class="py-2"><span class="sr-only">Aktion</span></th>
        </template>

        <tr
          v-for="row in rows"
          :key="row.subject.id"
          class="hover:bg-slate-50 dark:hover:bg-slate-800/50"
        >
          <td class="py-3 pr-4">
            <div class="font-medium">{{ row.subject.name }}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400">
              {{ row.subject.shortName }} · {{ row.subject.ects }} ECTS
            </div>
          </td>
          <td class="py-3 pr-4 text-slate-600 tabular-nums dark:text-slate-300">
            {{ row.subject.semester }}
          </td>
          <td class="py-3 pr-4"><GradeBadge :grade="row.grade" /></td>
          <td class="py-3 pr-4 text-slate-600 dark:text-slate-300">
            {{ row.grade === null ? 'noch nicht benotet' : gradeLabel(row.grade) }}
          </td>
          <td class="py-3 text-right">
            <RouterLink
              :to="{ name: 'student-subject', params: { subjectId: row.subject.id } }"
              class="text-sm font-medium text-brand-600 hover:underline dark:text-brand-100"
            >
              Klassenspiegel
            </RouterLink>
          </td>
        </tr>
      </BaseTable>
    </BaseCard>
  </div>
</template>
