<script setup lang="ts" generic="T extends string">
import { useId } from 'vue'

/**
 * Auswahlfeld ueber eine Liste von Optionen.
 *
 * `generic="T extends string"` am script-Tag macht die Komponente generisch.
 * Der Nutzen: gibst du Optionen vom Typ `{ value: SubjectId }` hinein, ist
 * auch das v-model-Ziel ein `SubjectId` - kein `string`, in den jeder
 * beliebige Wert passt.
 */
defineProps<{
  label: string
  options: readonly { value: T; label: string }[]
}>()

const model = defineModel<T>({ required: true })
const selectId = useId()
</script>

<template>
  <div>
    <label :for="selectId" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
      {{ label }}
    </label>
    <select
      :id="selectId"
      v-model="model"
      class="mt-1 block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
