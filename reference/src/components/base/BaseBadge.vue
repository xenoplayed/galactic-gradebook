<script setup lang="ts">
type Tone = 'neutral' | 'success' | 'warning' | 'info'

const { tone = 'neutral' } = defineProps<{ tone?: Tone }>()

/**
 * Die Toene kommen aus Theme-Tokens, nicht aus festen Tailwind-Farben.
 * Dadurch stimmt der Kontrast in allen vier Akademien - eine helle
 * Emerald-Pille auf dem fast schwarzen Korriban-Hintergrund saehe aus wie ein
 * aufgeklebter Sticker.
 *
 * `/12` ist die Deckkraft: dieselbe Farbe einmal flaechig gedaempft als
 * Hintergrund, einmal voll als Schrift.
 */
const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-ink/10 text-ink-soft',
  success: 'bg-ok/12 text-ok',
  warning: 'bg-warn/12 text-warn',
  info: 'bg-link/12 text-link',
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
    :class="TONE_CLASSES[tone]"
  >
    <slot />
  </span>
</template>
