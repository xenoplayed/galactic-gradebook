import { watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { AVAILABLE_LOCALES, DEFAULT_LOCALE, isSupportedLocale } from '@/i18n'
import { useLocalStorage } from '@/composables/useLocalStorage'

const LOCALE_KEY = 'datapad.locale'

/**
 * Erraet die Startsprache aus den Browsereinstellungen.
 *
 * `navigator.languages` ist die Wunschliste des Nutzers, in seiner Reihenfolge.
 * Aus "de-DE" wird "de" - wir haben keine regionalen Varianten.
 */
function detectLocale(): string {
  for (const tag of navigator.languages ?? []) {
    const short = tag.split('-')[0]
    if (isSupportedLocale(short)) return short
  }
  return DEFAULT_LOCALE
}

/**
 * Sprachwahl: merken, umschalten, und `<html lang>` mitfuehren.
 *
 * Das `lang`-Attribut ist kein Detail: Screenreader waehlen daran ihre
 * Aussprache. Ohne Umstellung liest eine deutsche Stimme den englischen Text
 * vor - verstaendlich ist das nicht.
 */
export function useLocale() {
  const { locale, t } = useI18n()
  const stored = useLocalStorage<string>(LOCALE_KEY, detectLocale(), (raw, fallback) =>
    isSupportedLocale(raw) ? raw : fallback,
  )

  watchEffect(() => {
    locale.value = stored.value
    document.documentElement.lang = stored.value
    // Der Titel im Browsertab gehoert zur Sprache dazu - er steht sonst
    // dauerhaft in der Sprache, in der die index.html geschrieben wurde.
    document.title = `${t('app.name')} — ${t('app.tagline')}`
  })

  return { current: stored, available: AVAILABLE_LOCALES }
}
