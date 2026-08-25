import { describe, expect, it } from 'vitest'
import { AVAILABLE_LOCALES, DEFAULT_LOCALE, i18n, isSupportedLocale } from '@/i18n'
import { GRADES, type AcademyId } from '@/types/domain'
import { ACADEMIES } from '@/data/academies'

/** Alle Schluessel eines Objekts als flache Pfadliste: "login.title" usw. */
function flatKeys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]

  return Object.entries(value).flatMap(([key, child]) =>
    flatKeys(child, prefix === '' ? key : `${prefix}.${key}`),
  )
}

const messages = i18n.global.messages.value as Record<string, Record<string, unknown>>
const locales = Object.keys(messages)

describe('Sprachdateien', () => {
  it('findet mindestens Deutsch und Englisch', () => {
    expect(locales).toContain('de')
    expect(locales).toContain('en')
    expect(isSupportedLocale(DEFAULT_LOCALE)).toBe(true)
  })

  it('kennt zu jeder Datei einen Anzeigenamen', () => {
    // Der Name steht IN der Datei (`_name`). Stuende er in einer separaten
    // Liste im Code, waere das die zweite Stelle, die man beim Hinzufuegen
    // einer Sprache vergisst.
    expect(AVAILABLE_LOCALES).toHaveLength(locales.length)
    expect(AVAILABLE_LOCALES.every((entry) => entry.name.length > 0)).toBe(true)
  })

  /**
   * DER Test dieses Projekts, was Mehrsprachigkeit angeht.
   *
   * Er ist die eigentliche Garantie hinter "eine neue Sprache ist einfach eine
   * Datei": wer `wookiee.json` anlegt und drei Schluessel vergisst, sieht hier
   * genau diese drei - statt spaeter einen rohen Schluessel in der Oberflaeche.
   */
  it.each(locales.filter((code) => code !== DEFAULT_LOCALE))(
    'hat in "%s" dieselben Schluessel wie in der Standardsprache',
    (code) => {
      const expected = new Set(flatKeys(messages[DEFAULT_LOCALE]))
      const actual = new Set(flatKeys(messages[code]))

      const missing = [...expected].filter((key) => !actual.has(key)).sort()
      const extra = [...actual].filter((key) => !expected.has(key)).sort()

      expect({ fehlend: missing, ueberzaehlig: extra }).toEqual({ fehlend: [], ueberzaehlig: [] })
    },
  )

  it.each(locales)('beschreibt in "%s" alle vier Akademien vollstaendig', (code) => {
    const t = (key: string) => i18n.global.t(key, code)

    for (const { id } of ACADEMIES as readonly { id: AcademyId }[]) {
      for (const field of ['name', 'shortName', 'motto', 'lecturerLabel']) {
        expect(t(`academies.${id}.${field}`)).not.toBe(`academies.${id}.${field}`)
      }
      for (const grade of GRADES) {
        expect(t(`academies.${id}.gradeLabels.${grade}`)).toBeTruthy()
      }
    }
  })
})

describe('Pluralformen', () => {
  /**
   * Der Grund, warum hier eine Bibliothek steht und kein Eigenbau.
   *
   * Vorher entstand der Plural durch Anhaengen von "e" - das ergab "Lehree"
   * und "Ausbildungsfache". Zwei von vier Akademien waren kaputt, in EINER
   * Sprache.
   */
  it.each([
    ['de', 'jedi', 'Lehrpfad', 'Lehrpfade'],
    ['de', 'sith', 'Lehre', 'Lehren'],
    ['de', 'empire', 'Ausbildungsfach', 'Ausbildungsfächer'],
    ['de', 'rebels', 'Kurs', 'Kurse'],
    ['en', 'sith', 'Teaching', 'Teachings'],
    ['en', 'empire', 'Course', 'Courses'],
  ])('bildet %s/%s korrekt: %s → %s', (code, academy, singular, plural) => {
    expect(i18n.global.t(`academies.${academy}.subjectLabel`, 1, { locale: code })).toBe(singular)
    expect(i18n.global.t(`academies.${academy}.subjectLabel`, 6, { locale: code })).toBe(plural)
  })

  it.each([
    ['de', 'jedi', 'Padawan', 'Padawane'],
    ['de', 'sith', 'Akolyth', 'Akolythen'],
    ['en', 'rebels', 'Recruit', 'Recruits'],
  ])('bildet Lernende %s/%s korrekt', (code, academy, singular, plural) => {
    expect(i18n.global.t(`academies.${academy}.studentLabel`, 1, { locale: code })).toBe(singular)
    expect(i18n.global.t(`academies.${academy}.studentLabel`, 3, { locale: code })).toBe(plural)
  })
})
