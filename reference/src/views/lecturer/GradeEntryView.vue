<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, onBeforeRouteLeave } from 'vue-router'
import { students, subjects } from '@/data/seed'
import { useGradesStore } from '@/stores/grades'
import { useGradeStats } from '@/composables/useGradeStats'
import { useRandomGrades } from '@/composables/useRandomGrades'
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

const gradesStore = useGradesStore()
const { randomGradesFor } = useRandomGrades()

const subject = computed(() => subjects.byId(props.subjectId))
const roster = students.sortBy((student) => student.lastName).all()

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
const draftGrades = computed(() => roster.map((student) => draft.value[student.id] ?? null))

const stats = useGradeStats(draftGrades)

/** Weicht der Entwurf vom gespeicherten Stand ab? */
const isDirty = computed(() =>
  roster.some(
    (student) => draft.value[student.id] !== gradesStore.gradeOf(props.subjectId, student.id),
  ),
)

function fillRandom() {
  // Neues Objekt statt Einzelzuweisungen: eine Zuweisung, ein Render.
  draft.value = randomGradesFor(roster.map((student) => student.id))
}

function clearAll() {
  draft.value = Object.fromEntries(roster.map((student) => [student.id, null]))
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
  return window.confirm('Es gibt ungespeicherte Noten. Seite trotzdem verlassen?')
})
</script>

<template>
  <div v-if="subject === undefined">
    <BaseCard>
      <EmptyState
        title="Fach nicht gefunden"
        :description="`Es gibt kein Fach mit der ID «${subjectId}».`"
      >
        <RouterLink
          :to="{ name: 'lecturer-subjects' }"
          class="text-sm font-medium text-brand-600 hover:underline"
        >
          Zur Fächerliste
        </RouterLink>
      </EmptyState>
    </BaseCard>
  </div>

  <div v-else class="space-y-6">
    <div>
      <RouterLink
        :to="{ name: 'lecturer-subjects' }"
        class="text-sm text-slate-500 hover:underline dark:text-slate-400"
      >
        ← Fächer
      </RouterLink>
      <h1 class="mt-1 text-2xl font-semibold tracking-tight">{{ subject.name }}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        {{ subject.shortName }} · {{ subject.semester }}. Semester · {{ subject.ects }} ECTS
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <StatTile label="Benotet" :value="`${stats.count.value} / ${stats.total.value}`" />
      <StatTile label="Durchschnitt" :value="formatAverage(stats.average.value)" />
      <StatTile
        label="Bestanden"
        :value="stats.passRate.value === null ? '–' : `${Math.round(stats.passRate.value)} %`"
      />
    </div>

    <BaseCard
      title="Noten eintragen"
      subtitle="Werte von 1 bis 5. Leeres Feld = noch nicht benotet."
    >
      <template #header>
        <div class="flex flex-wrap items-center gap-2">
          <BaseButton variant="secondary" @click="fillRandom">Zufällig ausfüllen</BaseButton>
          <BaseButton variant="ghost" @click="clearAll">Leeren</BaseButton>
          <BaseButton variant="ghost" :disabled="!isDirty" @click="loadDraft">Verwerfen</BaseButton>
          <BaseButton :disabled="!isDirty" @click="save">Speichern</BaseButton>
        </div>
      </template>

      <div
        v-if="isDirty"
        class="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
      >
        Ungespeicherte Änderungen.
      </div>
      <div
        v-else-if="savedAt"
        class="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
      >
        Gespeichert um {{ savedAt.toLocaleTimeString('de-DE') }}.
      </div>

      <BaseTable>
        <template #head>
          <th class="py-2 pr-4 font-medium">Studierende:r</th>
          <th class="py-2 pr-4 font-medium">Matrikelnummer</th>
          <th class="py-2 font-medium">Note</th>
        </template>

        <tr v-for="student in roster" :key="student.id">
          <td class="py-2 pr-4 font-medium">{{ student.lastName }}, {{ student.firstName }}</td>
          <td class="py-2 pr-4 text-slate-500 tabular-nums dark:text-slate-400">
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
              :label="`Note für ${student.firstName} ${student.lastName}`"
              @update:model-value="(value) => (draft[student.id] = value)"
            />
          </td>
        </tr>
      </BaseTable>

      <div
        class="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
      >
        <BaseBadge v-for="grade in GRADES" :key="grade" tone="neutral">
          {{ grade }}× {{ stats.distribution.value[grade] }}
        </BaseBadge>
      </div>
    </BaseCard>
  </div>
</template>
