<script setup lang="ts">
/** Strenges Radialzeichen - alles gerade, alles gleich verteilt. */
</script>

<template>
  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <circle cx="32" cy="32" r="26" stroke="currentColor" stroke-width="3" />
    <circle cx="32" cy="32" r="9" fill="currentColor" />
    <!-- Acht Speichen, exakt gleichmaessig -->
    <g stroke="currentColor" stroke-width="4" stroke-linecap="butt">
      <path d="M32 6 L32 20" />
      <path d="M32 44 L32 58" />
      <path d="M6 32 L20 32" />
      <path d="M44 32 L58 32" />
      <path d="M14 14 L23 23" />
      <path d="M41 41 L50 50" />
      <path d="M50 14 L41 23" />
      <path d="M23 41 L14 50" />
    </g>
  </svg>
</template>
