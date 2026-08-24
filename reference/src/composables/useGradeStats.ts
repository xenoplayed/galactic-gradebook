import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { average, distribution, gradedCount, passRate } from '@/lib/grades'
import type { Grade } from '@/types/domain'

/**
 * Buendelt die Kennzahlen zu einer Notenliste als `computed`s.
 *
 * `MaybeRefOrGetter<T>` ist die uebliche Signatur fuer Composable-Eingaben:
 * du darfst einen einfachen Wert, ein `ref` oder eine Funktion uebergeben.
 * `toValue()` packt alle drei Faelle aus. Dadurch bleibt die Reaktivitaet
 * erhalten - haettest du stattdessen `(grades: Grade[])` als Parameter, waere
 * der Wert beim Aufruf eingefroren und die Statistik wuerde nie aktualisiert.
 */
export function useGradeStats(source: MaybeRefOrGetter<readonly (Grade | null)[]>) {
  const grades = computed(() => toValue(source))

  return {
    grades,
    /** Anzahl tatsaechlich vergebener Noten. */
    count: computed(() => gradedCount(grades.value)),
    /** Gesamtzahl der Plaetze, inklusive noch nicht benoteter. */
    total: computed(() => grades.value.length),
    /** Durchschnitt oder `null`, wenn noch nichts benotet wurde. */
    average: computed(() => average(grades.value)),
    /** Haeufigkeit je Note 1..5. */
    distribution: computed(() => distribution(grades.value)),
    /** Bestehensquote in Prozent oder `null`. */
    passRate: computed(() => passRate(grades.value)),
    /** Groesster Balken im Diagramm - Grundlage fuer die Skalierung. */
    peak: computed(() => Math.max(...Object.values(distribution(grades.value)), 1)),
    isEmpty: computed(() => gradedCount(grades.value) === 0),
    isComplete: computed(
      () => grades.value.length > 0 && gradedCount(grades.value) === grades.value.length,
    ),
  }
}
