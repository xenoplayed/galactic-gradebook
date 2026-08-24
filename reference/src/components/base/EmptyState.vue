<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="px-4 py-12 text-center">
    <p class="text-sm font-medium text-ink">{{ title }}</p>
    <p v-if="description" class="mx-auto mt-1 max-w-md text-sm text-ink-soft">
      {{ description }}
    </p>
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>
