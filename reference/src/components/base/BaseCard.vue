<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <section class="rounded-xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <!--
      `$slots.header` pruefen, damit der Kopfbereich komplett verschwindet, wenn
      niemand ihn befuellt - sonst bliebe ein leerer Rahmen mit Rand stehen.
    -->
    <header
      v-if="title || $slots.header"
      class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800"
    >
      <div>
        <h2 v-if="title" class="text-base font-semibold">{{ title }}</h2>
        <p v-if="subtitle" class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {{ subtitle }}
        </p>
      </div>
      <!-- Benannter Slot: Platz fuer Buttons rechts oben im Kartenkopf. -->
      <slot name="header" />
    </header>

    <div class="p-5">
      <slot />
    </div>
  </section>
</template>
