import { watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

/**
 * Haengt das Erscheinungsbild an die Akademie des angemeldeten Users.
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
 *
 * Ohne Anmeldung wird das Attribut entfernt: der Login-Bildschirm bleibt
 * neutral.
 */
export function useAcademyTheme(): void {
  const { academy } = storeToRefs(useAuthStore())

  // watchEffect statt watch: die einzige Abhaengigkeit wird beim ersten Lauf
  // selbst erkannt, und der erste Lauf passiert sofort - genau das, was hier
  // gebraucht wird.
  watchEffect(() => {
    const root = document.documentElement

    if (academy.value === null) {
      delete root.dataset.academy
      return
    }
    root.dataset.academy = academy.value.id
  })
}
