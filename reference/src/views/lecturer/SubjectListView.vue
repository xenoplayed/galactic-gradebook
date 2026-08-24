<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { subjectsOf } from '@/data/seed'
import { useAuthStore } from '@/stores/auth'
import { useGradesStore } from '@/stores/grades'
import { average, formatAverage } from '@/lib/grades'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseTable from '@/components/base/BaseTable.vue'
import StatTile from '@/components/StatTile.vue'

const auth = useAuthStore()
const gradesStore = useGradesStore()
const { academy } = storeToRefs(auth)
const { gradedCountBySubject } = storeToRefs(gradesStore)

/** Nur die Faecher der eigenen Akademie - die Trennung passiert hier. */
const ownSubjects = computed(() => (academy.value === null ? [] : subjectsOf(academy.value.id)))

const studentCount = computed(() =>
  academy.value === null ? 0 : gradesStore.studentCountOf(academy.value.id),
)

/**
 * Eine Zeile ist mehr als ein Fach: sie traegt gleich Fortschritt und
 * Durchschnitt. Diese Anreicherung gehoert in ein `computed` und nicht ins
 * Template - dort liefe sie bei jedem Rendern erneut.
 */
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

const openCount = computed(() => rows.value.filter((row) => !row.isComplete).length)
const totalAverage = computed(() =>
  average(ownSubjects.value.flatMap((subject) => gradesStore.gradesForSubject(subject.id))),
)
</script>

<template>
  <div v-if="academy" class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">{{ academy.name }}</h1>
      <p class="text-sm text-ink-soft italic">„{{ academy.motto }}"</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <StatTile :label="`${academy.subjectLabel}e`" :value="String(ownSubjects.length)" />
      <StatTile
        label="Offen"
        :value="String(openCount)"
        :hint="openCount === 0 ? 'Alles bewertet' : 'noch nicht vollständig bewertet'"
      />
      <StatTile label="Gesamtdurchschnitt" :value="formatAverage(totalAverage)" />
    </div>

    <BaseCard
      :title="`${academy.subjectLabel}e`"
      :subtitle="`Auswählen, um Bewertungen für ${academy.studentPlural} einzutragen.`"
    >
      <BaseTable>
        <template #head>
          <th class="py-2 pr-4 font-medium">{{ academy.subjectLabel }}</th>
          <th class="py-2 pr-4 font-medium">Semester</th>
          <th class="py-2 pr-4 font-medium">Fortschritt</th>
          <th class="py-2 pr-4 text-right font-medium">Ø</th>
          <th class="py-2"><span class="sr-only">Aktion</span></th>
        </template>

        <tr v-for="row in rows" :key="row.subject.id" class="hover:bg-surface-2">
          <td class="py-3 pr-4">
            <div class="font-medium">{{ row.subject.name }}</div>
            <div class="text-xs text-ink-soft">
              {{ row.subject.shortName }} · {{ row.subject.ects }} ECTS
            </div>
          </td>
          <td class="py-3 pr-4 text-ink-soft tabular-nums">{{ row.subject.semester }}</td>
          <td class="py-3 pr-4">
            <BaseBadge :tone="row.isComplete ? 'success' : 'warning'">
              {{ row.graded }} / {{ studentCount }}
            </BaseBadge>
          </td>
          <td class="py-3 pr-4 text-right tabular-nums">{{ formatAverage(row.average) }}</td>
          <td class="py-3 text-right">
            <RouterLink
              :to="{ name: 'lecturer-grade-entry', params: { subjectId: row.subject.id } }"
              class="text-sm font-medium text-link hover:underline"
            >
              {{ row.isComplete ? 'Bearbeiten' : 'Bewerten' }}
            </RouterLink>
          </td>
        </tr>
      </BaseTable>
    </BaseCard>
  </div>
</template>
