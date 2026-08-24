<script setup lang="ts">
/**
 * Ein Button mit ein paar festen Varianten.
 *
 * Der Sinn einer solchen Basiskomponente: die Design-Entscheidungen (Farben,
 * Abstaende, Fokus-Ring) stehen genau einmal hier und nicht 40-mal als
 * Utility-Klassen-Kette in den Views.
 */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const {
  variant = 'primary',
  type = 'button',
  disabled = false,
  block = false,
} = defineProps<{
  variant?: Variant
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  block?: boolean
}>()

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  secondary:
    'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600 dark:hover:bg-slate-700',
  ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    :class="[VARIANT_CLASSES[variant], block && 'w-full']"
  >
    <!-- Der Default-Slot macht den Button universell: Text, Icon+Text, was auch immer. -->
    <slot />
  </button>
</template>
