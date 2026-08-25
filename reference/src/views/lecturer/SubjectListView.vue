<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { subjectsOf } from '@/data/seed'
import { useAuthStore } from '@/stores/auth'
import { useGradesStore } from '@/stores/grades'
import { useAcademyLabels } from '@/composables/useAcademyLabels'
import { average, formatAverage } from '@/lib/grades'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseTable from '@/components/base/BaseTable.vue'
import StatTile from '@/components/StatTile.vue'
import AcademyBanner from '@/components/AcademyBanner.vue'

const { t } = useI18n()
const auth = useAuthStore()
const gradesStore = useGradesStore()
const { academy } = storeToRefs(auth)
const { gradedCountBySubject } = storeToRefs(gradesStore)

const labels = useAcademyLabels(() => academy.value?.id)

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
    <AcademyBanner :academy-id="academy.id" />

    <div class="grid gap-4 sm:grid-cols-3">
      <!-- subjectLabel(n) waehlt Singular oder Plural - siehe useAcademyLabels. -->
      <StatTile
        :label="labels.subjectLabel(ownSubjects.length)"
        :value="String(ownSubjects.length)"
      />
      <StatTile
        :label="t('lecturer.openCount')"
        :value="String(openCount)"
        :hint="openCount === 0 ? t('lecturer.openHintNone') : t('lecturer.openHintSome')"
      />
      <StatTile :label="t('lecturer.overallAverage')" :value="formatAverage(totalAverage)" />
    </div>

    <BaseCard
      :title="labels.subjectLabel(2)"
      :subtitle="t('lecturer.chooseSubject', { students: labels.studentLabel(2) })"
    >
      <BaseTable>
        <template #head>
          <th class="py-2 pr-4 font-medium">{{ labels.subjectLabel(1) }}</th>
          <th class="py-2 pr-4 font-medium">{{ t('table.semester') }}</th>
          <th class="py-2 pr-4 font-medium">{{ t('table.progress') }}</th>
          <th class="py-2 pr-4 text-right font-medium">Ø</th>
          <th class="py-2">
            <span class="sr-only">{{ t('table.action') }}</span>
          </th>
        </template>

        <tr v-for="row in rows" :key="row.subject.id" class="hover:bg-surface-2">
          <td class="py-3 pr-4">
            <div class="font-medium">{{ t(`subjects.${row.subject.id}`) }}</div>
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
              {{ row.isComplete ? t('lecturer.edit') : t('lecturer.assess') }}
            </RouterLink>
          </td>
        </tr>
      </BaseTable>
    </BaseCard>
  </div>
</template>
