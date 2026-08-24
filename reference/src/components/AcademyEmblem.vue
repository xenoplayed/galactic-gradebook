<script setup lang="ts">
import type { AcademyId } from '@/types/domain'
import JediEmblem from './emblems/JediEmblem.vue'
import SithEmblem from './emblems/SithEmblem.vue'
import EmpireEmblem from './emblems/EmpireEmblem.vue'
import RebelEmblem from './emblems/RebelEmblem.vue'

/**
 * Waehlt das Wappen zur Akademie.
 *
 * `Record<AcademyId, Component>` statt einer v-if-Kette: kommt eine fuenfte
 * Akademie dazu, ist der fehlende Eintrag ein Compile-Fehler statt einer
 * stillen Luecke in der Anzeige.
 */
defineProps<{ academyId: AcademyId }>()

const EMBLEMS = {
  jedi: JediEmblem,
  sith: SithEmblem,
  empire: EmpireEmblem,
  rebels: RebelEmblem,
} as const satisfies Record<AcademyId, unknown>
</script>

<template>
  <component :is="EMBLEMS[academyId]" />
</template>
