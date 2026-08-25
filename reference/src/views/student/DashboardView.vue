<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useGradesStore } from '@/stores/grades'
import { useGradeStats } from '@/composables/useGradeStats'
import { useAcademyLabels } from '@/composables/useAcademyLabels'
import { formatAverage, gradeLabel } from '@/lib/grades'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseTable from '@/components/base/BaseTable.vue'
import EmptyState from '@/components/base/EmptyState.vue'
import GradeBadge from '@/components/GradeBadge.vue'
import StatTile from '@/components/StatTile.vue'
import AcademyBanner from '@/components/AcademyBanner.vue'

const { t } = useI18n()
const auth = useAuthStore()
const gradesStore = useGradesStore()
const { currentUser, academy } = storeToRefs(auth)

const labels = useAcademyLabels(() => academy.value?.id)

/**
 * Alle Faecher mit der eigenen Bewertung. `currentUser` kann theoretisch `null`
 * sein - der Route-Guard schliesst das praktisch aus, der Compiler weiss das
 * aber nicht, also wird der Fall sauber behandelt.
 */
const rows = computed(() => {
  const user = currentUser.value
  if (user === null) return []
  // Die Akademie kommt vom User selbst - dadurch sieht ein Padawan nie ein
  // imperiales Fach, egal was in der URL steht.
  return gradesStore.gradesForStudent(user.id, user.academyId)
})

const ownGrades = computed(() => rows.value.map((row) => row.grade))
const stats = useGradeStats(ownGrades)

const greeting = computed(() =>
  currentUser.value === null ? '' : t('login.greeting', { name: currentUser.value.firstName }),
)

const subtitle = computed(() => {
  const user = currentUser.value
  if (user === null) return ''
  return t('student.signedInAs', {
    role: labels.studentLabel(1),
    academy: labels.name.value,
    number: 'matriculationNumber' in user ? user.matriculationNumber : '–',
  })
})
</script>

<template>
  <div v-if="academy" class="space-y-6">
    <AcademyBanner :academy-id="academy.id" :title="greeting" :subtitle="subtitle" />

    <div class="grid gap-4 sm:grid-cols-3">
      <StatTile
        :label="t('student.average')"
        :value="formatAverage(stats.average.value)"
        :hint="t('student.averageHint', { subjects: labels.subjectLabel(2) })"
      />
      <StatTile
        :label="t('student.assessedSubjects', { subjects: labels.subjectLabel(2) })"
        :value="`${stats.count.value} / ${stats.total.value}`"
      />
      <StatTile
        :label="t('grades.passed')"
        :value="stats.passRate.value === null ? '–' : `${Math.round(stats.passRate.value)} %`"
      />
    </div>

    <BaseCard
      :title="t('student.myTitle')"
      :subtitle="t('student.mySubtitle', { students: labels.studentLabel(2) })"
    >
      <EmptyState
        v-if="stats.isEmpty.value"
        :title="t('student.emptyTitle')"
        :description="t('student.emptyBody', { lecturer: labels.lecturerLabel.value })"
      />

      <BaseTable v-else>
        <template #head>
          <th class="py-2 pr-4 font-medium">{{ labels.subjectLabel(1) }}</th>
          <th class="py-2 pr-4 font-medium">{{ t('table.semester') }}</th>
          <th class="py-2 pr-4 font-medium">{{ t('table.value') }}</th>
          <th class="py-2 pr-4 font-medium">{{ t('table.rating') }}</th>
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
            <GradeBadge
              :grade="row.grade"
              :label="row.grade === null ? undefined : labels.gradeLabels.value[row.grade]"
            />
          </td>
          <td class="py-3 pr-4 text-ink-soft">
            {{
              row.grade === null
                ? t('grades.notAssessed')
                : gradeLabel(row.grade, labels.gradeLabels.value)
            }}
          </td>
          <td class="py-3 text-right">
            <RouterLink
              :to="{ name: 'student-subject', params: { subjectId: row.subject.id } }"
              class="text-sm font-medium text-link hover:underline"
            >
              {{ t('student.compare') }}
            </RouterLink>
          </td>
        </tr>
      </BaseTable>
    </BaseCard>
  </div>
</template>
