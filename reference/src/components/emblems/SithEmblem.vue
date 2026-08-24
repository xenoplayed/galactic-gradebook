<script setup lang="ts">
/** Abwaerts weisender Dreizack - Spitzen statt Rundungen. */
</script>

<template>
  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <!-- Mittlere Spitze -->
    <path d="M32 4 L37 34 L32 60 L27 34 Z" fill="currentColor" />
    <!-- Aeussere Spitzen -->
    <path d="M12 12 L22 34 L20 50 L14 34 Z" fill="currentColor" opacity="0.75" />
    <path d="M52 12 L42 34 L44 50 L50 34 Z" fill="currentColor" opacity="0.75" />
    <!-- Querbalken -->
    <path d="M10 28 L54 28" stroke="currentColor" stroke-width="2.5" opacity="0.6" />
  </svg>
</template>
