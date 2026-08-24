<script setup lang="ts">
defineProps<{
  label: string
  value: string
  hint?: string
}>()
</script>

<template>
  <div class="rounded-xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <p class="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
      {{ label }}
    </p>
    <p class="mt-1 text-2xl font-semibold tabular-nums">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ hint }}</p>
  </div>
</template>
