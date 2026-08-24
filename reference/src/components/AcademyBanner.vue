<script setup lang="ts">
import type { Academy } from '@/types/domain'
import AcademyEmblem from './AcademyEmblem.vue'

/**
 * Kopfband einer Akademie: Wappen, Name und Motto ueber einer Weltraumaufnahme.
 *
 * Warum ein Band und kein seitenfuellender Hintergrund: zwei der vier
 * Akademien haben helle Flaechen. Ein dunkles Foto hinter der ganzen Seite
 * wuerde dort mit der Lesbarkeit kaempfen. Als abgegrenztes Band mit
 * Abdunklung funktioniert dasselbe Bild in allen vier Paletten.
 */
const { academy, title, subtitle } = defineProps<{
  academy: Academy
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <div class="relative overflow-hidden rounded-card">
    <!--
      alt="" ist hier richtig und kein Versehen: das Bild ist reine Dekoration.
      Eine Beschreibung vorzulesen wuerde einen Screenreader nur aufhalten -
      Name und Motto stehen ohnehin als Text daneben.
    -->
    <img
      :src="`/backgrounds/${academy.id}.jpg`"
      alt=""
      class="h-36 w-full object-cover sm:h-40"
      loading="lazy"
    />

    <!-- Abdunklung: sichert den Kontrast der weissen Schrift ueber jedem Motiv. -->
    <div class="absolute inset-0 bg-black/55"></div>

    <div class="absolute inset-0 flex items-center gap-4 px-5 sm:px-7">
      <span class="hidden h-12 w-12 shrink-0 text-white/90 sm:block">
        <AcademyEmblem :academy-id="academy.id" />
      </span>
      <div class="min-w-0">
        <h1 class="truncate text-xl font-semibold text-white sm:text-2xl">
          {{ title ?? academy.name }}
        </h1>
        <p class="mt-0.5 truncate text-sm text-white/80 italic">
          {{ subtitle ?? `„${academy.motto}"` }}
        </p>
      </div>
    </div>
  </div>
</template>
