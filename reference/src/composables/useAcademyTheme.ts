import { ref, watch, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import type { AcademyId } from '@/types/domain'

/** Womit die Seite startet, solange niemand angemeldet ist. */
const DEFAULT_ACADEMY: AcademyId = 'jedi'

/**
 * Die vorgemerkte Akademie - das, was ohne Anmeldung gilt.
 *
 * ACHTUNG, hier steckt der wichtigste Unterschied dieses Moduls: der `ref`
 * steht **ausserhalb** der Funktion. Damit gibt es ihn genau EINMAL fuer die
 * ganze Anwendung, und alle Aufrufer teilen sich denselben Wert.
 *
 * Ein `ref` INNERHALB einer Composable-Funktion (so wie in `useGradeStats`)
 * erzeugt dagegen bei jedem Aufruf einen eigenen. Beides ist richtig - man
 * muss nur wissen, welches man gerade schreibt.
 */
const previewAcademyId = ref<AcademyId>(DEFAULT_ACADEMY)

/** Die Akademiewahl auf dem Anmeldebildschirm. */
export function useAcademyPreview() {
  return { previewAcademyId }
}

/**
 * Haengt das Erscheinungsbild an die Akademie - angemeldet an die echte,
 * sonst an die vorgemerkte.
 *
 * Die ganze Umschaltung besteht aus einem Attribut am <html>-Element:
 *
 *   <html data-academy="sith">
 *
 * In `assets/main.css` haengen daran vier Paletten, die dieselben
 * CSS-Custom-Properties mit anderen Werten belegen. Weil Tailwind seine
 * Utilities als `var(--color-…)` ausgibt, aendert sich damit jedes
 * `bg-brand-600` auf der Seite - ohne dass eine einzige Komponente wissen
 * muss, in welcher Akademie sie gerade gerendert wird.
 */
export function useAcademyTheme(): void {
  const { academy } = storeToRefs(useAuthStore())

  // Nach dem Anmelden die echte Akademie als Vorschau merken. Sonst waere das
  // Abmelden ein optischer Sprung: wer sich als Sith abmeldet, landete sonst
  // wieder im hellen Jedi-Design.
  watch(academy, (value) => {
    if (value !== null) previewAcademyId.value = value.id
  })

  // watchEffect statt watch: die Abhaengigkeiten werden beim ersten Lauf selbst
  // erkannt, und der erste Lauf passiert sofort - genau das, was hier gebraucht
  // wird.
  watchEffect(() => {
    document.documentElement.dataset.academy = academy.value?.id ?? previewAcademyId.value
  })
}
