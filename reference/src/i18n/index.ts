import { createI18n, type LocaleMessages, type VueMessageType } from 'vue-i18n'

/**
 * Mehrsprachigkeit.
 *
 * Die zentrale Entwurfsentscheidung: **Sprachdateien werden gefunden, nicht
 * aufgezaehlt.** Eine neue Sprache ist genau eine Datei in `locales/` - kein
 * Import, kein Eintrag in einer Liste, keine Codeaenderung.
 *
 * `import.meta.glob` ist eine Vite-Funktion: sie loest das Muster beim Bauen
 * auf und erzeugt die Importe selbst. `eager: true` heisst, die Dateien landen
 * direkt im Paket statt nachgeladen zu werden - bei vier kleinen JSON-Dateien
 * ist das die einfachere Wahl.
 */
const modules = import.meta.glob<{ default: LocaleFile }>('./locales/*.json', {
  eager: true,
})

/** Der Aufbau einer Sprachdatei, so weit ihn der Code kennen muss. */
export interface LocaleFile {
  /** Der Anzeigename der Sprache - steht IN der Datei, siehe unten. */
  _name: string
  [key: string]: unknown
}

export const DEFAULT_LOCALE = 'de'

function localeFromPath(path: string): string {
  // './locales/de.json' -> 'de'
  return path.slice(path.lastIndexOf('/') + 1, -'.json'.length)
}

const messages = Object.fromEntries(
  Object.entries(modules).map(([path, module]) => [localeFromPath(path), module.default]),
)

/**
 * Die Liste fuer das Auswahlmenue - abgeleitet, nicht gepflegt.
 *
 * Der Anzeigename kommt aus `_name` in der Datei selbst. Stuende er in einer
 * separaten Liste hier im Code, waere das genau die zweite Stelle, die man
 * beim Hinzufuegen einer Sprache vergisst.
 */
export const AVAILABLE_LOCALES = Object.entries(messages)
  .map(([code, message]) => ({ code, name: (message as LocaleFile)._name }))
  .sort((a, b) => a.name.localeCompare(b.name))

/**
 * Ohne die lose Typisierung leitet vue-i18n aus der ersten Sprachdatei ein
 * festes Schema ab und verlangt dann exakt dieselben Locale-Codes. Da die
 * Dateien erst zur Bauzeit gefunden werden, kann das hier nicht stimmen.
 */
export const i18n = createI18n<false>({
  // Composition API statt der alten Options-API-Variante.
  legacy: false,
  locale: DEFAULT_LOCALE,
  // Faellt eine Uebersetzung aus, erscheint der deutsche Text statt des
  // rohen Schluessels.
  fallbackLocale: DEFAULT_LOCALE,
  messages: messages as Record<string, LocaleMessages<VueMessageType>>,
})

export function isSupportedLocale(value: unknown): value is string {
  return typeof value === 'string' && Object.hasOwn(messages, value)
}
