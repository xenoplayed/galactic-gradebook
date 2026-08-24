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
    <label :for="inputId" class="block text-sm font-medium text-ink">
      {{ label }}
    </label>
    <input
      :id="inputId"
      v-model="model"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :aria-invalid="Boolean(error)"
      class="mt-1 block w-full rounded-card border-0 bg-surface px-3 py-2 text-sm text-ink ring-1 ring-line placeholder:text-ink-soft focus:ring-2 focus:ring-brand-500"
      :class="error && 'ring-red-500'"
    />
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>
