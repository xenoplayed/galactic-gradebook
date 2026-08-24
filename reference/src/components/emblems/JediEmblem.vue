<script setup lang="ts">
/**
 * Aufsteigende Schwinge - Ruhe und Aufstieg.
 *
 * Eigene Zeichnung, kein heruntergeladenes Logo: `currentColor` laesst das
 * Wappen die Textfarbe erben, es skaliert verlustfrei und braucht kein Netz.
 */
</script>

<template>
  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <!-- Klinge -->
    <path d="M32 6 L32 44" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
    <!-- Schwingen -->
    <path
      d="M32 20 C22 24 16 32 14 42 C20 36 26 32 32 31 C38 32 44 36 50 42 C48 32 42 24 32 20 Z"
      fill="currentColor"
      opacity="0.85"
    />
    <!-- Basisring -->
    <circle cx="32" cy="49" r="6" stroke="currentColor" stroke-width="3" />
  </svg>
</template>
