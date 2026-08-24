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
    <label :for="selectId" class="block text-sm font-medium text-ink">
      {{ label }}
    </label>
    <select
      :id="selectId"
      v-model="model"
      class="mt-1 block w-full rounded-card border-0 bg-surface px-3 py-2 text-sm text-ink ring-1 ring-line focus:ring-2 focus:ring-brand-500"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
