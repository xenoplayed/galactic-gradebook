<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, onBeforeRouteLeave } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { studentsOf, subjects } from '@/data/seed'
import { useAuthStore } from '@/stores/auth'
import { useGradesStore } from '@/stores/grades'
import { useGradeStats } from '@/composables/useGradeStats'
import { useRandomGrades } from '@/composables/useRandomGrades'
import { useAcademyLabels } from '@/composables/useAcademyLabels'
import { formatAverage } from '@/lib/grades'
import { GRADES, type Grade, type StudentId } from '@/types/domain'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseTable from '@/components/base/BaseTable.vue'
import EmptyState from '@/components/base/EmptyState.vue'
import GradeInput from '@/components/GradeInput.vue'
import StatTile from '@/components/StatTile.vue'

// Kommt aus der Route (`props: true` im Router).
const props = defineProps<{ subjectId: string }>()

const { t, locale } = useI18n()
const auth = useAuthStore()
const { academy } = storeToRefs(auth)
const labels = useAcademyLabels(() => academy.value?.id)
const gradesStore = useGradesStore()
const { randomGradesFor } = useRandomGrades()

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
 * Die Lernenden DIESES Fachs - also die der Akademie, zu der es gehoert.
 *
 * Ein `computed`, kein konstantes Array wie vorher: beim Fachwechsel kann sich
 * die Liste aendern. (Die Route-Guards verhindern zwar, dass jemand ein Fach
 * einer fremden Akademie oeffnet - aber die Liste haengt trotzdem am Fach.)
 */
const roster = computed(() =>
  subject.value === undefined ? [] : studentsOf(subject.value.academyId),
)

/**
 * Der Entwurf ist eine LOKALE Kopie, kein Store-Zustand.
 *
 * Deshalb aendert "Zufällig ausfüllen" noch nichts an den echten Daten -
 * erst "Speichern" schreibt in den Store. Genau das wolltest du: der
 * Generator fuellt die Felder, du siehst das Ergebnis und bestaetigst.
 */
const draft = ref<Record<StudentId, Grade | null>>({})
const savedAt = ref<Date | null>(null)

function loadDraft() {
  draft.value = gradesStore.gradeMapForSubject(props.subjectId)
  savedAt.value = null
}

// `immediate: true` laesst den Watcher sofort einmal laufen (statt erst bei der
// naechsten Aenderung) - so ist der Entwurf schon beim ersten Rendern gefuellt.
// Ohne den Watcher bliebe beim Fachwechsel der alte Entwurf stehen: die Route
// aendert sich, die Komponente wird aber wiederverwendet.
watch(() => props.subjectId, loadDraft, { immediate: true })

/** Noten in Listenreihenfolge - Eingabe fuer die Statistik. */
const draftGrades = computed(() => roster.value.map((student) => draft.value[student.id] ?? null))

const stats = useGradeStats(draftGrades)

/** Weicht der Entwurf vom gespeicherten Stand ab? */
const isDirty = computed(() =>
  roster.value.some(
    (student) => draft.value[student.id] !== gradesStore.gradeOf(props.subjectId, student.id),
  ),
)

function fillRandom() {
  // Neues Objekt statt Einzelzuweisungen: eine Zuweisung, ein Render.
  draft.value = randomGradesFor(roster.value.map((student) => student.id))
}

function clearAll() {
  draft.value = Object.fromEntries(roster.value.map((student) => [student.id, null]))
}

function save() {
  gradesStore.saveSubject(props.subjectId, draft.value)
  savedAt.value = new Date()
}

/**
 * Schutz vor versehentlichem Datenverlust. `onBeforeRouteLeave` ist ein Guard,
 * der an *dieser Komponente* haengt - er verschwindet automatisch mit ihr.
 */
onBeforeRouteLeave(() => {
  if (!isDirty.value) return true
  return window.confirm(t('lecturer.leaveConfirm'))
})
</script>

<template>
  <div v-if="subject === undefined || academy === null">
    <BaseCard>
      <EmptyState
        :title="t('common.subjectNotFound', { subject: labels.subjectLabel(1) })"
        :description="t('common.subjectNotFoundBody', { id: subjectId })"
      >
        <RouterLink
          :to="{ name: 'lecturer-subjects' }"
          class="text-sm font-medium text-link hover:underline"
        >
          {{ t('common.toSubjects') }}
        </RouterLink>
      </EmptyState>
    </BaseCard>
  </div>

  <div v-else class="space-y-6">
    <div>
      <RouterLink :to="{ name: 'lecturer-subjects' }" class="text-sm text-ink-soft hover:underline">
        ← {{ labels.subjectLabel(2) }}
      </RouterLink>
      <h1 class="mt-1 text-2xl font-semibold tracking-tight">{{ t(`subjects.${subject.id}`) }}</h1>
      <p class="text-sm text-ink-soft">
        {{ subject.shortName }} · {{ subject.semester }}. Semester · {{ subject.ects }} ECTS
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <StatTile
        :label="t('grades.assessed')"
        :value="`${stats.count.value} / ${stats.total.value}`"
      />
      <StatTile :label="t('student.average')" :value="formatAverage(stats.average.value)" />
      <StatTile
        :label="t('grades.passed')"
        :value="stats.passRate.value === null ? '–' : `${Math.round(stats.passRate.value)} %`"
      />
    </div>

    <BaseCard :title="t('lecturer.entryTitle')" :subtitle="t('lecturer.entrySubtitle')">
      <template #header>
        <div class="flex flex-wrap items-center gap-2">
          <BaseButton variant="secondary" @click="fillRandom">{{
            t('lecturer.fillRandom')
          }}</BaseButton>
          <BaseButton variant="ghost" @click="clearAll">{{ t('lecturer.clear') }}</BaseButton>
          <BaseButton variant="ghost" :disabled="!isDirty" @click="loadDraft">{{
            t('lecturer.discard')
          }}</BaseButton>
          <BaseButton :disabled="!isDirty" @click="save">{{ t('lecturer.save') }}</BaseButton>
        </div>
      </template>

      <div v-if="isDirty" class="mb-4 rounded-card bg-amber-50 px-3 py-2 text-sm text-amber-800">
        {{ t('lecturer.unsaved') }}
      </div>
      <div
        v-else-if="savedAt"
        class="mb-4 rounded-card bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
      >
        {{ t('lecturer.savedAt', { time: savedAt.toLocaleTimeString(locale) }) }}
      </div>

      <BaseTable>
        <template #head>
          <th class="py-2 pr-4 font-medium">{{ labels.studentLabel(1) }}</th>
          <th class="py-2 pr-4 font-medium">{{ t('table.matriculation') }}</th>
          <th class="py-2 font-medium">Note</th>
        </template>

        <tr v-for="student in roster" :key="student.id">
          <td class="py-2 pr-4 font-medium">{{ student.lastName }}, {{ student.firstName }}</td>
          <td class="py-2 pr-4 text-ink-soft tabular-nums">
            {{ student.matriculationNumber }}
          </td>
          <td class="py-2">
            <!--
              `v-model` ausgeschrieben. Der Grund ist der Typ: ein Zugriff wie
              draft[id] kann laut TypeScript `undefined` sein (die tsconfig hat
              noUncheckedIndexedAccess an), GradeInput will aber `Grade | null`.
              Mit den zwei Haelften laesst sich der Wert beim Hineingeben
              normalisieren. v-model ist genau diese Kurzform.
            -->
            <GradeInput
              :model-value="draft[student.id] ?? null"
              :label="
                t('lecturer.assessmentFor', { name: `${student.firstName} ${student.lastName}` })
              "
              @update:model-value="(value) => (draft[student.id] = value)"
            />
          </td>
        </tr>
      </BaseTable>

      <div class="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
        <BaseBadge v-for="grade in GRADES" :key="grade" tone="neutral">
          {{ grade }}× {{ stats.distribution.value[grade] }}
        </BaseBadge>
      </div>
    </BaseCard>
  </div>
</template>
