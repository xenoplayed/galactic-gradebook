<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { parseGrade } from '@/lib/grades'
import type { Grade } from '@/types/domain'

/**
 * Eingabefeld fuer genau eine Note.
 *
 * Der Knackpunkt: ein <input> liefert immer einen String, das Modell will aber
 * `Grade | null`. Deshalb haelt die Komponente einen eigenen Text-`ref` und
 * uebersetzt in beide Richtungen. Ungueltige Eingaben werden angezeigt, aber
 * NICHT nach oben gemeldet - das Modell bleibt zu jedem Zeitpunkt gueltig.
 */
const model = defineModel<Grade | null>({ required: true })

defineProps<{
  label: string
}>()

const text = ref(model.value === null ? '' : String(model.value))
const invalid = ref(false)

// Aenderungen von aussen (z.B. "Zufaellig ausfuellen" oder Fachwechsel) muessen
// im Textfeld ankommen. Ohne diesen watch bliebe der alte Text stehen.
watch(model, (value) => {
  const next = value === null ? '' : String(value)
  if (next !== text.value) {
    text.value = next
    invalid.value = false
  }
})

watch(text, (value) => {
  const parsed = parseGrade(value)

  // parseGrade unterscheidet drei Faelle:
  //   null      -> Feld geleert, das ist erlaubt
  //   undefined -> Unsinn eingegeben, Modell nicht anfassen
  //   1..5      -> gueltige Note
  if (parsed === undefined) {
    invalid.value = true
    return
  }

  invalid.value = false
  model.value = parsed
})

// Pro Instanz eindeutig - die Komponente steht 15-mal auf der Seite, und
// doppelte IDs zerstoeren die Zuordnung fuer Screenreader.
const hintId = useId()
const describedBy = computed(() => (invalid.value ? hintId : undefined))
</script>

<template>
  <div class="inline-flex flex-col">
    <input
      v-model="text"
      type="text"
      inputmode="numeric"
      maxlength="1"
      :aria-label="label"
      :aria-invalid="invalid"
      :aria-describedby="describedBy"
      placeholder="–"
      class="h-9 w-14 rounded-lg border-0 bg-white text-center text-sm font-semibold tabular-nums text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600"
      :class="invalid && 'ring-red-500 dark:ring-red-500'"
    />
    <span v-if="invalid" :id="hintId" class="mt-1 text-xs text-red-600 dark:text-red-400">
      nur 1–5
    </span>
  </div>
</template>
