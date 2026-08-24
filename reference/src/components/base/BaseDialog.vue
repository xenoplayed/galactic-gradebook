<script setup lang="ts">
import { useTemplateRef, watch } from 'vue'

/**
 * Ein modales Fenster auf Basis des nativen <dialog>-Elements.
 *
 * `showModal()` bringt drei Dinge mit, die man sonst muehsam nachbaut:
 *   - eine Fokusfalle (Tab bleibt im Fenster)
 *   - Escape zum Schliessen
 *   - die Abdunklung dahinter, ansprechbar ueber ::backdrop
 *
 * Deshalb hier kein eigenes Overlay-Konstrukt: der Browser kann das laengst.
 */
const open = defineModel<boolean>({ required: true })

defineProps<{
  title: string
  description?: string
}>()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')

watch(open, (isOpen) => {
  const element = dialog.value
  if (element === null) return

  if (isOpen) {
    element.showModal()
  } else if (element.open) {
    // Die Pruefung auf `open` verhindert eine Endlosschleife: close() feuert
    // `close`, der Handler setzt das Model auf false, was diesen Watcher
    // erneut ausloest.
    element.close()
  }
})
</script>

<template>
  <!--
    @close ist nicht optional. Escape schliesst das Fenster nativ, ohne dass
    Vue etwas davon mitbekaeme - ohne diesen Handler wuerde das Model auf
    `true` stehen bleiben und ein zweiter Klick auf den Knopf taete nichts.

    @click.self schliesst bei Klick auf die Abdunklung: das <dialog> selbst
    fuellt die ganze Flaeche, `.self` unterscheidet sie vom Inhalt.
  -->
  <!--
    `m-auto` ist nicht optional: Browser zentrieren ein modales <dialog> ueber
    `margin: auto` bei `inset: 0`. Tailwinds Preflight setzt aber `margin: 0`
    auf alle Elemente - ohne m-auto klebt das Fenster oben links in der Ecke.
  -->
  <dialog
    ref="dialog"
    class="m-auto max-h-[calc(100dvh-2rem)] w-[min(34rem,calc(100vw-2rem))] rounded-card bg-surface p-0 text-ink shadow-xl backdrop:bg-black/60"
    :aria-label="title"
    @close="open = false"
    @click.self="open = false"
  >
    <header class="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div class="min-w-0">
        <h2 class="text-base font-semibold">{{ title }}</h2>
        <p v-if="description" class="mt-0.5 text-sm text-ink-soft">{{ description }}</p>
      </div>
      <button
        type="button"
        class="-mr-1 shrink-0 rounded-card px-2 py-1 text-xl leading-none text-ink-soft hover:bg-surface-2"
        aria-label="Schließen"
        @click="open = false"
      >
        ×
      </button>
    </header>

    <!-- Bei vielen Eintraegen scrollt der Inhalt, nicht die Seite dahinter. -->
    <div class="max-h-[60vh] overflow-y-auto p-5">
      <slot />
    </div>
  </dialog>
</template>
