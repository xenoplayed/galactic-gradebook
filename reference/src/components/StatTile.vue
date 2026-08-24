<script setup lang="ts">
defineProps<{
  label: string
  value: string
  hint?: string
}>()
</script>

<template>
  <div class="rounded-card bg-surface p-4 ring-1 ring-line">
    <p class="text-xs font-medium tracking-wide text-ink-soft uppercase">
      {{ label }}
    </p>
    <p class="mt-1 text-2xl font-semibold tabular-nums">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs text-ink-soft">{{ hint }}</p>
  </div>
</template>
