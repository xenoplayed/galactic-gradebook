<script setup lang="ts">
type Tone = 'neutral' | 'success' | 'warning' | 'info'

const { tone = 'neutral' } = defineProps<{ tone?: Tone }>()

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  info: 'bg-brand-100 text-brand-700 dark:bg-brand-700/25 dark:text-brand-100',
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
    :class="TONE_CLASSES[tone]"
  >
    <slot />
  </span>
</template>
