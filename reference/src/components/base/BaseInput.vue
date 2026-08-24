<script setup lang="ts">
import { useId } from 'vue'

/**
 * Ein Textfeld mit Label und Fehlermeldung.
 *
 * `defineModel()` ist die Kurzform fuer "prop `modelValue` + Event
 * `update:modelValue`". Damit funktioniert `v-model` auf dieser Komponente
 * genauso wie auf einem nativen <input>.
 */
const model = defineModel<string>({ required: true })

defineProps<{
  label: string
  type?: 'text' | 'password'
  placeholder?: string
  autocomplete?: string
  error?: string | null
}>()

// `useId()` liefert eine im Dokument eindeutige ID. Von Hand vergebene IDs
// kollidieren, sobald dieselbe Komponente zweimal auf der Seite steht - und
// dann zeigt das <label> auf das falsche Feld.
const inputId = useId()
</script>

<template>
  <div>
    <label :for="inputId" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
      {{ label }}
    </label>
    <input
      :id="inputId"
      v-model="model"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :aria-invalid="Boolean(error)"
      class="mt-1 block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600"
      :class="error && 'ring-red-500 dark:ring-red-500'"
    />
    <p v-if="error" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
  </div>
</template>
