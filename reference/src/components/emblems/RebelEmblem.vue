<script setup lang="ts">
/** Aufwaerts strebender Bogen - Aufbruch, offen nach oben. */
</script>

<template>
  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <!-- Offener Ring, unten geschlossen -->
    <path
      d="M10 30 A22 22 0 0 0 32 56 A22 22 0 0 0 54 30"
      stroke="currentColor"
      stroke-width="4"
      stroke-linecap="round"
    />
    <!-- Aufsteigende Flamme -->
    <path d="M32 4 L40 30 L32 24 L24 30 Z" fill="currentColor" />
    <!-- Seitliche Auslaeufer -->
    <path d="M18 22 L24 38 L20 36 L15 30 Z" fill="currentColor" opacity="0.7" />
    <path d="M46 22 L40 38 L44 36 L49 30 Z" fill="currentColor" opacity="0.7" />
  </svg>
</template>
