<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { subjects } from '@/data/seed'
import { useGradesStore } from '@/stores/grades'
import { formatAverage, average } from '@/lib/grades'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseTable from '@/components/base/BaseTable.vue'
import StatTile from '@/components/StatTile.vue'

const gradesStore = useGradesStore()
const { studentCount, gradedCountBySubject } = storeToRefs(gradesStore)

/**
 * Eine Zeile pro Fach, angereichert um Fortschritt und Durchschnitt.
 * Die Berechnung steht bewusst hier als `computed` und nicht im Template:
 * im Template waere sie bei jedem Rendern erneut gelaufen.
 */
const rows = computed(() =>
  subjects
    .sortBy((subject) => subject.semester * 100 + Number(subject.id.slice(1)))
    .map((subject) => {
      const grades = gradesStore.gradesForSubject(subject.id)
      const graded = gradedCountBySubject.value[subject.id] ?? 0

      return {
        subject,
        graded,
        isComplete: graded === studentCount.value,
        average: average(grades),
      }
    }),
)

const openCount = computed(() => rows.value.filter((row) => !row.isComplete).length)
const totalAverage = computed(() =>
  average(subjects.all().flatMap((subject) => gradesStore.gradesForSubject(subject.id))),
)
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-3">
      <StatTile label="Fächer" :value="String(subjects.size)" />
      <StatTile
        label="Offen"
        :value="String(openCount)"
        :hint="openCount === 0 ? 'Alles benotet' : 'noch nicht vollständig benotet'"
      />
      <StatTile label="Gesamtdurchschnitt" :value="formatAverage(totalAverage)" />
    </div>

    <BaseCard title="Fächer" subtitle="Ein Fach auswählen, um Noten einzutragen.">
      <BaseTable>
        <template #head>
          <th class="py-2 pr-4 font-medium">Fach</th>
          <th class="py-2 pr-4 font-medium">Semester</th>
          <th class="py-2 pr-4 font-medium">Fortschritt</th>
          <th class="py-2 pr-4 text-right font-medium">Ø</th>
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
          <td class="py-3 pr-4">
            <BaseBadge :tone="row.isComplete ? 'success' : 'warning'">
              {{ row.graded }} / {{ studentCount }}
            </BaseBadge>
          </td>
          <td class="py-3 pr-4 text-right tabular-nums">{{ formatAverage(row.average) }}</td>
          <td class="py-3 text-right">
            <RouterLink
              :to="{ name: 'lecturer-grade-entry', params: { subjectId: row.subject.id } }"
              class="text-sm font-medium text-brand-600 hover:underline dark:text-brand-100"
            >
              {{ row.isComplete ? 'Bearbeiten' : 'Noten eintragen' }}
            </RouterLink>
          </td>
        </tr>
      </BaseTable>
    </BaseCard>
  </div>
</template>
