import { ref, watch, type Ref } from 'vue'

/**
 * Ein `ref`, das sich selbst in den localStorage spiegelt.
 *
 * Der Typparameter `<T>` macht das Composable universell: der Rueckgabetyp
 * richtet sich nach dem, was du als Fallback hineingibst.
 *
 *   const token = useLocalStorage<string | null>('session', null)  // Ref<string | null>
 *   const book  = useLocalStorage('grades', createGradeBook())     // Ref<GradeBook>
 *
 * `parse` ist optional und dient dazu, gespeicherte Daten zu pruefen oder mit
 * neuen Feldern zusammenzufuehren - localStorage ist persistent, dein
 * Datenmodell aendert sich aber ueber die Zeit.
 */
export function useLocalStorage<T>(
  key: string,
  fallback: T,
  parse: (raw: unknown, fallback: T) => T = (raw) => raw as T,
): Ref<T> {
  const initial = readFromStorage(key)
  const state = ref(initial === undefined ? fallback : parse(initial, fallback)) as Ref<T>

  // `deep: true`, weil sich bei verschachtelten Objekten (der Notenmatrix)
  // sonst nur ein Austausch der ganzen Referenz melden wuerde, nicht die
  // Aenderung eines einzelnen Eintrags.
  watch(
    state,
    (value) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // Privater Modus oder volles Quota: Persistenz ist hier ein Komfort-
        // Feature, kein Muss - die App laeuft ohne sie weiter.
      }
    },
    { deep: true },
  )

  return state
}

/**
 * `undefined` bedeutet "nichts Brauchbares gespeichert".
 * Der try/catch ist nicht optional: ein halb geschriebener oder von Hand
 * veraenderter Eintrag laesst `JSON.parse` werfen und wuerde sonst die ganze
 * App beim Start abschiessen.
 */
function readFromStorage(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? undefined : JSON.parse(raw)
  } catch {
    return undefined
  }
}
