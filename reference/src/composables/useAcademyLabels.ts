import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useI18n } from 'vue-i18n'
import { GRADES, type AcademyId, type Grade } from '@/types/domain'

/**
 * Die Begriffe einer Akademie in der aktuellen Sprache.
 *
 * Buendelt die Schluesselketten an einer Stelle, damit in den Views nicht
 * ueberall `t('academies.' + id + '.studentLabel')` steht - das waere
 * fehleranfaellig und beim Umbenennen kaum zu finden.
 */
export function useAcademyLabels(academyId: MaybeRefOrGetter<AcademyId | null | undefined>) {
  const { t } = useI18n()

  const base = computed(() => {
    const id = toValue(academyId)
    return id === null || id === undefined ? null : `academies.${id}`
  })

  /** Uebersetzt, oder ein leerer String solange keine Akademie feststeht. */
  const key = (suffix: string) => (base.value === null ? '' : t(`${base.value}.${suffix}`))

  return {
    name: computed(() => key('name')),
    shortName: computed(() => key('shortName')),
    motto: computed(() => key('motto')),
    lecturerLabel: computed(() => key('lecturerLabel')),

    /**
     * Singular oder Plural, je nach Anzahl.
     *
     * DAS ist der Grund fuer vue-i18n. Vorher entstand der Plural durch
     * Anhaengen von "e" - das ergab "Lehree" und "Ausbildungsfache". Die
     * Sprachdatei schreibt "Lehre | Lehren", und die Regel welche Form bei
     * welcher Anzahl gilt, kennt die Bibliothek je Sprache.
     */
    studentLabel: (count: number) =>
      base.value === null ? '' : t(`${base.value}.studentLabel`, count),
    subjectLabel: (count: number) =>
      base.value === null ? '' : t(`${base.value}.subjectLabel`, count),

    /** Die fuenf Notenbezeichnungen als fertige Tabelle fuer `gradeLabel()`. */
    gradeLabels: computed<Record<Grade, string>>(
      () =>
        Object.fromEntries(GRADES.map((grade) => [grade, key(`gradeLabels.${grade}`)])) as Record<
          Grade,
          string
        >,
    ),
  }
}
