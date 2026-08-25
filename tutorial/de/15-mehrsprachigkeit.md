# 15 — Mehrsprachigkeit

> **Zeitbedarf:** ca. 2–3 Stunden · davon die Hälfte Übersetzen

## Ziel

Die App spricht Deutsch und Englisch, umschaltbar über ein Menü — und eine dritte Sprache
hinzuzufügen ist **eine Datei und sonst nichts**. Kein Import, kein Eintrag in einer Liste,
keine Codeänderung.

Dies ist ein Erweiterungskapitel: Die App ist nach Kapitel 14 fertig. Hier kommt eine
Eigenschaft dazu, die man in echten Projekten fast immer nachrüstet statt von Anfang an
einzuplanen — mit allem, was das an Aufräumarbeit bedeutet.

---

## Erst die Frage: Bibliothek oder selbst bauen?

Bei Mehrsprachigkeit denkt man zuerst an etwas Simples: eine Datei mit Schlüsseln, eine
Funktion, die nachschlägt. Sechzig Zeilen, fertig. Das Projekt hat sonst auch keine
Abhängigkeit, die es nicht braucht.

Bis man auf **Plurale** stößt.

In diesem Projekt stand für die Fächerliste einer Akademie:

```ts
// So stand es wirklich im Code
`${academy.subjectLabel}e`
```

Ein „e" angehängt, fertig. Bei den Jedi ergab das „Lehrpfade", bei den Rebellen „Kurse" —
sieht gut aus. Und bei den anderen beiden:

```
sith    'Lehre'           + 'e'  ->  'Lehree'            ✗
empire  'Ausbildungsfach' + 'e'  ->  'Ausbildungsfache'  ✗
```

**Zwei von vier waren kaputt, in einer einzigen Sprache.** Das ist keine Nachlässigkeit,
sondern die Natur der Sache: Deutsche Pluralbildung kennt `-e`, `-en`, `-er`, `-¨er`, Nullplural
und Ausnahmen. Englisch hat `-s`, `-es`, `-ies` und Unregelmäßigkeiten. Polnisch hat drei
Pluralformen, abhängig von der Zahl. Arabisch hat sechs.

Genau deshalb steht in diesem Kapitel eine Bibliothek — **vue-i18n**:

```jsonc
"subjectLabel": "Lehre | Lehren"
```

```ts
t('academies.sith.subjectLabel', 6)   // "Lehren"
t('academies.sith.subjectLabel', 1)   // "Lehre"
```

Welche Form bei welcher Zahl gilt, weiß die Bibliothek je Sprache.

> **Die übertragbare Lehre.** „Bau es selbst" ist eine gute Grundhaltung — bis du auf eine
> Domäne triffst, in der jahrzehntelang Sonderfälle gesammelt wurden. Sprache, Zeitzonen,
> Kalender, Zeichenkodierung, Verschlüsselung: Da gewinnt die Bibliothek, und zwar nicht
> knapp. Die Kunst ist, den Unterschied zu erkennen, bevor der Bug im Produktivbetrieb steht.

---

## Sprachdateien finden statt aufzählen

Das ist die zentrale Entwurfsentscheidung. Naheliegend wäre:

```ts
// NICHT so
import de from './locales/de.json'
import en from './locales/en.json'
const messages = { de, en }
```

Das funktioniert — und ist genau die Stelle, die du beim Hinzufügen einer Sprache vergisst.
Vite kann Dateien selbst finden:

```ts
const modules = import.meta.glob<{ default: LocaleFile }>('./locales/*.json', { eager: true })

const messages = Object.fromEntries(
  Object.entries(modules).map(([path, module]) => [localeFromPath(path), module.default]),
)
```

`import.meta.glob` ist eine **Vite-Funktion**, kein JavaScript-Standard. Sie löst das Muster
beim Bauen auf und erzeugt die Importe selbst. `eager: true` heißt: die Dateien landen direkt
im Paket statt nachgeladen zu werden — bei ein paar kleinen JSON-Dateien die einfachere Wahl.

### Der Anzeigename gehört in die Datei

Das Auswahlmenü braucht lesbare Namen: „Deutsch", nicht „de". Woher?

```jsonc
{
  "_name": "Deutsch",
  "app": { … }
}
```

Aus der Datei selbst. Stünde die Zuordnung `{ de: 'Deutsch', en: 'English' }` im Code, hättest
du wieder eine zweite Liste zu pflegen — und damit genau das Problem zurück, das `glob` gerade
gelöst hat.

```ts
export const AVAILABLE_LOCALES = Object.entries(messages)
  .map(([code, message]) => ({ code, name: message._name }))
  .sort((a, b) => a.name.localeCompare(b.name))
```

**Die Regel dahinter:** Wenn das Hinzufügen von etwas an *zwei* Stellen gepflegt werden muss,
wird eine davon irgendwann vergessen. Leite die zweite aus der ersten ab.

---

## Der Test, der das Versprechen einlöst

„Eine neue Sprache ist einfach eine Datei" — schön gesagt. Aber was passiert, wenn jemand
`wookiee.json` anlegt und drei Schlüssel vergisst?

Ohne Absicherung: In der Oberfläche steht irgendwo `login.password` statt eines Textes. Vielleicht
fällt es auf, vielleicht auch erst Wochen später auf einem Bildschirm, den selten jemand
öffnet.

Deshalb dieser Test:

```ts
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
```

`flatKeys` macht aus dem verschachtelten Objekt eine flache Liste von Pfaden
(`login.password`, `academies.sith.motto`, …). Der Vergleich meldet dann nicht nur „etwas
fehlt", sondern **was genau**:

```
- "fehlend": [],
+ "fehlend": [
+   "academies.sith.motto",
+   "login.password",
+   "nav.signOut",
+ ],
```

Das ist der eigentliche Kern des Kapitels. Nicht die Bibliothek, nicht das Glob — **dieser
Test** ist es, der aus „theoretisch erweiterbar" ein belastbares Versprechen macht.

`ueberzaehlig` ist genauso wichtig: Es fängt Tippfehler in Schlüsselnamen. Wer
`login.passwort` schreibt, sieht einen fehlenden *und* einen überzähligen Schlüssel.

> **Probier es aus.** Kopier deine `de.json` nach `klingon.json`, lösch drei Schlüssel, lass
> den Test laufen. Genau dieses Gefühl — der Test sagt dir, was du vergessen hast — willst du
> in jedem Projekt haben, das erweiterbar sein soll.

---

## Was übersetzt wird und was nicht

Die schwierigere Hälfte ist nicht die Technik, sondern die Entscheidung, **welche Zeichenkette
Sprache ist und welche Daten**.

| | Beispiel | Übersetzen? |
| --- | --- | --- |
| Oberflächentexte | „Anmelden", „Speichern" | **Ja**, offensichtlich |
| Rollen- und Fachbezeichnungen | „Padawan", „Ausbildungsfach" | **Ja** — es sind Bezeichnungen, keine Namen |
| Fachnamen | „Exerzierdienst" → „Drill Duty" | **Ja** — beschreibende Titel |
| Notenbezeichnungen | „Im Gleichgewicht" | **Ja** |
| Personennamen | „Ahsoka Tano" | **Nein** — Eigennamen |
| Kürzel | `EXD`, `TIE` | **Nein** — Kennzeichen wie Modulnummern |
| IDs und Logins | `f13`, `yoda` | **Nein** — technische Bezeichner |

Der Grenzfall sind die **Kürzel**. „EXD" steht für „Exerzierdienst" — auf Englisch müsste es
„DRL" heißen. Aber: An einer echten Hochschule ist eine Modulnummer ein Kennzeichen, das über
Jahre stabil bleibt und in Zeugnissen auftaucht. Genau deshalb bleibt es hier.

**Was daraus folgt, ist ein Umbau der Stammdaten.** In `data/academies.ts` stand vorher
alles — Name, Motto, Bezeichnungen, Notenlabels. Jetzt steht dort:

```ts
export const ACADEMIES = [
  { id: 'jedi' },
  { id: 'sith' },
  { id: 'empire' },
  { id: 'rebels' },
] as const satisfies readonly Academy[]
```

Nur noch die Struktur. Und `Person.roleLabel` ist ganz verschwunden: Die Bezeichnung folgt aus
Rolle plus Akademie und lebt in den Sprachdateien.

> **Der Grundsatz aus [Kapitel 06](06-domaenenmodell.md) gilt weiter, nur präziser.** Damals
> hieß es: alles Sprachliche gehört an einen Ort und wird nicht aus dem Namen abgeleitet. Der
> Ort war die Akademie-Datei, jetzt sind es die Sprachdateien. Und aus dem Namen abgeleitet
> wird nach wie vor nichts.

---

## Der Zugriff aus den Views

Ohne Hilfe stünde in jeder View eine zusammengebaute Schlüsselkette:

```vue
{{ t(`academies.${academy.id}.studentLabel`, 2) }}
```

Fehleranfällig und beim Umbenennen kaum zu finden. Ein Composable bündelt das:

```ts
export function useAcademyLabels(academyId: MaybeRefOrGetter<AcademyId | null | undefined>) {
  const { t } = useI18n()
  const base = computed(() => { … })

  return {
    name: computed(() => key('name')),
    lecturerLabel: computed(() => key('lecturerLabel')),
    studentLabel: (count: number) => t(`${base.value}.studentLabel`, count),
    subjectLabel: (count: number) => t(`${base.value}.subjectLabel`, count),
    gradeLabels: computed<Record<Grade, string>>(() => …),
  }
}
```

Beachte den Unterschied: `name` ist ein `computed`, `studentLabel` eine **Funktion**. Der Grund
ist der Plural — die Anzahl kennt erst der Aufrufer.

```vue
<StatTile :label="labels.subjectLabel(ownSubjects.length)" :value="…" />
<th>{{ labels.subjectLabel(1) }}</th>
```

### Reine Funktionen bleiben sprachfrei

`accessEntriesFor()` in `data/seed.ts` baute vorher fertige Anzeigetexte:

```ts
display: person.role === 'lecturer' ? `${fullName(person)} (${person.roleLabel})` : fullName(person)
```

Das geht jetzt nicht mehr — die Klammer hängt an der Sprache, und eine reine Funktion soll
keinen Übersetzer hereingereicht bekommen. Also gibt sie **Rohdaten** zurück, und die View
setzt zusammen:

```vue
{{ entry.isLecturer ? `${entry.name} (${labels.lecturerLabel.value})` : entry.name }}
```

Der Gewinn zeigt sich im Test: `accessEntriesFor` bleibt ohne Übersetzer, ohne Komponente und
ohne Store prüfbar.

---

## Zwei Details, die man übersieht

### `<html lang>` ist kein Detail

```ts
document.documentElement.lang = stored.value
```

Screenreader wählen daran ihre **Aussprache**. Ohne Umstellung liest eine deutsche Stimme den
englischen Text vor — verständlich ist das nicht. Denselben Weg nimmt der Seitentitel im
Browsertab, der sonst dauerhaft in der Sprache steht, in der die `index.html` geschrieben wurde.

### Anführungszeichen sind sprachabhängig

Deutsch schreibt „so", Englisch "so", Französisch « so ». Wer die Zeichen ins Template tippt,
hat sie in einer Sprache falsch:

```vue
<!-- falsch, sobald es mehr als eine Sprache gibt -->
<p>„{{ motto }}"</p>

<!-- richtig: der Browser setzt sie anhand von <html lang> -->
<q>{{ motto }}</q>
```

Genau dafür gibt es `<q>`. Ein Element, das die meisten nie benutzen — und das hier eine echte
Aufgabe hat.

---

## Deine Aufgabe

1. `npm install vue-i18n`, dann `src/i18n/index.ts` mit `import.meta.glob`, `fallbackLocale`
   und der abgeleiteten `AVAILABLE_LOCALES`.
2. `src/i18n/locales/de.json` anlegen und **alle** Oberflächentexte dorthin ziehen.
3. **Den Vollständigkeitstest zuerst schreiben**, bevor die zweite Sprache existiert. Dann
   sagt er dir beim Übersetzen, was noch fehlt, statt hinterher zu prüfen.
4. `academies.ts` auf die IDs eindampfen, `Person.roleLabel` entfernen, Fachnamen verschieben.
5. `useAcademyLabels` schreiben, Views umstellen, Plurale reparieren.
6. `useLocale` mit Persistenz über `useLocalStorage`, Browsersprache als Startwert,
   `<html lang>` und Seitentitel.
7. `LanguageSelect` in die Navigation — sie ist auch **vor** der Anmeldung sichtbar, und ohne
   Sprachwahl auf dem Anmeldebildschirm hilft die beste Übersetzung nichts.
8. `en.json` übersetzen.
9. Gegenprobe: eine dritte Sprachdatei mit absichtlichen Lücken anlegen, Test laufen lassen,
   Datei wieder löschen.

## Stolperfallen

| Symptom | Ursache |
| --- | --- |
| Roher Schlüssel in der Oberfläche (`login.title`) | Schlüssel fehlt oder ist vertippt — genau das fängt der Vollständigkeitstest |
| Plural stimmt in einer Sprache nicht | `\|`-Form in der Sprachdatei vergessen, oder `t(key)` ohne Anzahl aufgerufen |
| Komponententests werfen beim Mounten | i18n-Plugin fehlt — global im Test-Setup bereitstellen, nicht in jedem Test |
| Sprachwahl nach Reload weg | Persistenz vergessen |
| Screenreader liest falsch | `<html lang>` nicht mitgeführt |
| Typfehler in `createI18n` | vue-i18n leitet aus der ersten Sprachdatei ein festes Schema ab; bei per Glob gefundenen Dateien muss man den Typ lockern |

## Selbstcheck

- [ ] Umschalten ändert Navigation, Karten, Tabellen, Leerzustände und Fehlermeldungen
- [ ] Sith zeigt „Lehre"/„Lehren", Imperium „Ausbildungsfach"/„Ausbildungsfächer"
- [ ] Alle vier Akademien in beiden Sprachen: Name, Motto, Notenbezeichnungen
- [ ] Die Sprachwahl überlebt den Reload, `<html lang>` und der Seitentitel passen
- [ ] Das Menü ist auch vor der Anmeldung erreichbar
- [ ] Eine Sprachdatei mit fehlenden Schlüsseln lässt den Test rot werden — **und er nennt
      die fehlenden Schlüssel beim Namen**
- [ ] `grep` findet keinen fest verdrahteten Oberflächentext mehr in `.vue`-Dateien

## In der Referenz

- `reference/src/i18n/index.ts` — Glob, `AVAILABLE_LOCALES`, Fallback
- `reference/src/i18n/locales/de.json`, `en.json`
- `reference/src/i18n/__tests__/locales.spec.ts` — Vollständigkeit und Plurale
- `reference/src/composables/useAcademyLabels.ts`, `useLocale.ts`
- `reference/src/components/LanguageSelect.vue`
- `reference/vitest.setup.ts` — i18n global für Komponententests
