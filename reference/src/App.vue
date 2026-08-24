<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNav from '@/components/AppNav.vue'
import { useAcademyTheme } from '@/composables/useAcademyTheme'

// Setzt data-academy am <html> und schaltet damit die gesamte Palette um.
// Einmal hier aufgerufen, gilt es fuer die ganze App.
useAcademyTheme()
</script>

<template>
  <div class="min-h-dvh">
    <AppNav />
    <main class="mx-auto max-w-5xl px-4 py-8">
      <!-- Hier rendert der Router die zur URL passende View. -->
      <RouterView />
    </main>
  </div>
</template>
