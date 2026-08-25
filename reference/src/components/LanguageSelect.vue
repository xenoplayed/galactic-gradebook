<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useLocale } from '@/composables/useLocale'

/**
 * Sprachauswahl.
 *
 * Die Liste kommt aus `AVAILABLE_LOCALES`, das wiederum aus den gefundenen
 * Sprachdateien entsteht. Hier steht also keine Aufzaehlung, die man beim
 * Hinzufuegen einer Sprache pflegen muesste.
 */
const { t } = useI18n()

// Der Rahmen nutzt ink-soft statt der Linienfarbe: `--color-line` trennt
// Flaechen und liegt deshalb bei ~1,4:1. Fuer ein Bedienelement fordert
// WCAG 1.4.11 aber 3:1 - sonst ist nicht erkennbar, DASS es eins ist.
const { current, available } = useLocale()
</script>

<template>
  <label class="flex items-center gap-1.5">
    <span class="sr-only">{{ t('nav.language') }}</span>
    <select
      v-model="current"
      class="rounded-card border-0 bg-transparent py-1 pr-6 pl-2 text-sm text-ink-soft ring-1 ring-ink-soft focus:ring-2 focus:ring-brand-500"
    >
      <option v-for="entry in available" :key="entry.code" :value="entry.code">
        {{ entry.name }}
      </option>
    </select>
  </label>
</template>
