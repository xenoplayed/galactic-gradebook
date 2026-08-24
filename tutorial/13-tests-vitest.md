# 13 — Tests mit Vitest

> **Zeitbedarf:** ca. 2–3 Stunden

## Ziel

Du testest die vier Schichten deiner App mit je einem Vertreter: reine Funktionen, einen
Store, ein Composable und eine Komponente.

---

## Was zu testen sich lohnt

Nicht alles. Priorisiere nach **Aufwand pro gefundenem Fehler**:

| | |
| --- | --- |
| **Immer** | reine Funktionen in `lib/` — billig zu testen, oft benutzt |
| **Fast immer** | Stores und Composables — dort steckt das Verhalten |
| **Ausgewählt** | Komponenten mit echter Logik (`GradeInput`) |
| **Selten** | reine Anzeigekomponenten — ein Test, der prüft, ob `StatTile` seinen Text anzeigt, prüft im Wesentlichen Vue |

> **Anders als du es kennst**
> Wenn du CI-Pipelines baust, kennst du „grün heißt deploybar“. Hier ist der Nutzen ein
> anderer: Tests sind vor allem eine **ausführbare Beschreibung** dessen, was eine Funktion
> zusagt. `src/lib/__tests__/grades.spec.ts` erklärt die drei Rückgabefälle von `parseGrade`
> präziser als jeder Kommentar — und die Erklärung veraltet nicht.

## Vitest

Kommt mit `npm create vue@latest` mit. Kein zusätzliches Setup.

```bash
npm run test:unit             # einmal durchlaufen
npm run test:watch            # bleibt laufen
npm run test:unit -- --coverage
npm run test:unit -- grades   # nur passende Dateien
```

Tests liegen neben dem Code in `__tests__/`. Kurzer Weg zwischen Code und Test heißt: der Test
wird eher mitgepflegt.

## Reine Funktionen

```ts
import { describe, expect, it } from 'vitest'
import { average, parseGrade } from '@/lib/grades'

describe('parseGrade', () => {
  it('unterscheidet leer von ungültig', () => {
    expect(parseGrade('')).toBeNull()
    expect(parseGrade('7')).toBeUndefined()
    expect(parseGrade('3')).toBe(3)
  })
})

describe('average', () => {
  it('mittelt nur vergebene Noten', () => {
    // null darf nicht als 0 mitgerechnet werden - sonst wäre das Ergebnis 1.5.
    expect(average([1, 2, null, 3])).toBe(2)
  })

  it('gibt null statt NaN zurück', () => {
    expect(average([])).toBeNull()
  })
})
```

Der Kommentar im Test ist wichtiger als der Test. Er beantwortet die Frage „warum steht hier
2 und nicht 1,5?“, die sonst in einem halben Jahr niemand mehr beantworten kann.

**Testnamen als Aussagen schreiben**, nicht als Aufzählung. „unterscheidet leer von ungültig“
sagt etwas; „testet parseGrade“ sagt nichts.

## Stores

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
  })

  it('meldet eine lehrende Person an', () => {
    const auth = useAuthStore()

    expect(auth.login('yoda', 'yoda')).toBe(true)
    expect(auth.isLecturer).toBe(true)
    expect(auth.academy?.id).toBe('jedi')
  })

  it('verrät nicht, ob es den Benutzer gibt', () => {
    const auth = useAuthStore()

    auth.login('yoda', 'falsch')
    const bekannt = auth.error
    auth.login('gibtsnicht', 'gibtsnicht')

    expect(auth.error).toBe(bekannt)
  })
})
```

**Das `beforeEach` ist keine Formalität.** Ohne `setActivePinia` teilen sich alle Tests
denselben Store, ohne `localStorage.clear()` denselben persistierten Zustand — und der zweite
Test hängt am Ergebnis des ersten. Solche Abhängigkeiten fallen erst auf, wenn du einen
einzelnen Test isoliert laufen lässt und er plötzlich fehlschlägt.

**Im Store greifst du direkt auf `auth.isLecturer` zu**, ohne `.value`. Pinia packt das für
dich aus.

### Die Falle mit `watch`

```ts
it('persistiert nur die ID', async () => {
  const auth = useAuthStore()
  auth.login('yoda', 'yoda')

  await nextTick()      // ← ohne das steht im localStorage noch nichts

  expect(window.localStorage.getItem('datapad.session')).toBe('"d01"')
})
```

`watch` feuert nicht sofort, sondern gebündelt im nächsten Tick. Im Browser fällt das nie auf,
im Test schon — und man sucht den Fehler zunächst im Composable statt im Test.

## Composables

```ts
it('reagiert auf Änderungen an einem ref', () => {
  const grades = ref<(Grade | null)[]>([5, 5])
  const stats = useGradeStats(grades)

  expect(stats.average.value).toBe(5)

  grades.value = [1, 1]

  expect(stats.average.value).toBe(1)   // ohne toValue bliebe es 5
})
```

Genau dieser Test hält die Reaktivität fest. Baut jemand das Composable auf einen einfachen
Array-Parameter um, wird er rot — und das ist der einzige Weg, wie das auffällt.

`computed` wird beim Lesen ausgewertet; du brauchst hier kein `await nextTick()`.

## Komponenten

```ts
import { mount } from '@vue/test-utils'
import GradeInput from '@/components/GradeInput.vue'

function mountInput(modelValue: Grade | null = null) {
  return mount(GradeInput, { props: { modelValue, label: 'Note für Testperson' } })
}

it('gibt ungültige Eingaben NICHT nach oben weiter', async () => {
  const wrapper = mountInput(2)

  await wrapper.get('input').setValue('9')

  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  expect(wrapper.text()).toContain('nur 1–5')
  expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
})

it('übernimmt Änderungen von außen', async () => {
  const wrapper = mountInput(1)

  await wrapper.setProps({ modelValue: 5 })     // wie "Zufällig ausfüllen"

  expect(wrapper.get('input').element.value).toBe('5')
})
```

Das Werkzeug:

```ts
wrapper.get('input')                  // wirft, wenn nichts gefunden wird
wrapper.find('.klasse')               // gibt einen leeren Wrapper zurück
wrapper.text()
wrapper.emitted('update:modelValue')  // Array aller Aufrufe
await wrapper.get('button').trigger('click')
await wrapper.setProps({ ... })
```

Das `await` ist nötig: Vue aktualisiert das DOM asynchron. Ohne `await` prüfst du den Zustand
von vorher — der häufigste Grund für einen Komponententest, der „grundlos“ fehlschlägt.

**Teste, was die Komponente zusagt, nicht wie sie es macht.** „Meldet eine gültige Note nach
oben“ überlebt einen Umbau; „hat ein `<div>` mit der Klasse `wrapper`“ nicht.

## Wenn die Testumgebung nicht mitspielt

jsdom ist kein Browser. Es bildet das DOM sehr weitgehend nach — aber nicht vollständig. Das
native `<dialog>` gehört zu den Lücken:

```ts
const d = document.createElement('dialog')
typeof d.showModal   // 'undefined'  (jsdom 29)
```

Der Komponententest zu `BaseDialog` läuft damit sofort auf einen `TypeError`. Die Versuchung
ist groß, die Komponente „defensiv" zu machen (`if (typeof el.showModal === 'function')`).
**Tu das nicht** — dann trägt der Produktionscode dauerhaft Ballast für ein Problem, das nur
im Test existiert, und jeder Leser fragt sich später, welchen Browser das betrifft.

Repariert wird, wo der Fehler herkommt: in der Testumgebung.

```ts
// vitest.setup.ts
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function () {
    this.open = false
    // Das echte <dialog> feuert `close` - ohne dieses Ereignis liesse sich
    // nicht testen, dass die Komponente den Zustand zurueckmeldet.
    this.dispatchEvent(new Event('close'))
  }
}
```

Registriert wird die Datei in `vitest.config.ts`:

```ts
test: {
  environment: 'jsdom',
  setupFiles: ['./vitest.setup.ts'],
}
```

Die Prüfung `!HTMLDialogElement.prototype.showModal` ist Absicht: sobald jsdom es nachliefert,
verschwindet der Ersatz von selbst.

> **Die allgemeine Lehre:** Wenn ein Test an der Umgebung scheitert und nicht an deinem Code,
> repariere die Umgebung. Und prüf das **früh** — ich habe die jsdom-Lücke bewusst
> nachgemessen, bevor ich die Komponente gebaut habe, statt am Ende vor einer roten Suite zu
> stehen und zu rätseln.

## Was du dir sparen kannst

- Das Framework testen (`v-if` funktioniert).
- Auf CSS-Klassen prüfen, außer die Klasse ist die eigentliche Aussage.
- Auf eine Abdeckungszahl hinarbeiten. 100 % über Anzeigekomponenten sind weniger wert als
  fünf gute Tests über `parseGrade`.

---

## Deine Aufgabe

Schreib mindestens je einen Test pro Schicht:

1. **`src/lib/__tests__/grades.spec.ts`** — `parseGrade` (alle drei Fälle), `average` (mit
   `null` und leer), `distribution` (keine fehlenden Schlüssel), `passRate`.
2. **`src/lib/__tests__/strings.spec.ts`** — `toUsername` mit `Müller`, `Groß`, einem Namen mit
   Akzent und einem mit Apostroph.
3. **`src/lib/__tests__/collection.spec.ts`** — `byId`, `require` wirft, `filter` lässt das
   Original in Ruhe, `sortBy` sortiert Umlaute deutsch.
4. **`src/stores/__tests__/auth.spec.ts`** — Login richtig und falsch, Akzent-Schreibweisen,
   Abmelden, Persistenz (mit `await nextTick()`), und je Akademie die richtige Zuordnung.
   Für die vier Akademien lohnt sich `it.each`:

   ```ts
   it.each([['yoda','jedi'], ['bane','sith'], ['thrawn','empire'], ['organa','rebels']])(
     'ordnet %s der Akademie %s zu',
     (login, academyId) => { … },
   )
   ```
5. **`src/composables/__tests__/useGradeStats.spec.ts`** — der Reaktivitätstest oben.
6. **`src/components/__tests__/GradeInput.spec.ts`** — gültig, leer, ungültig, Änderung von
   außen.
7. **`src/components/__tests__/BaseDialog.spec.ts`** — öffnen, schließen, und vor allem:
   dass ein natives `close`-Ereignis das Model zurücksetzt.
8. **`src/composables/__tests__/useAcademyTheme.spec.ts`** — Standard, Auswahl, angemeldete
   Akademie schlägt die Vorschau, und dass die Vorschau nach dem Abmelden stehen bleibt.
9. **`src/data/__tests__/academies.spec.ts`** — der wichtigste neue Test: dass
   `createGradeBook()` je Fach **genau** die Lernenden der eigenen Akademie enthält, keine
   fremden und keine fehlenden. Dazu die Eindeutigkeit der Login-Namen.

   ```ts
   for (const subject of subjects) {
     const ownIds = studentsOf(subject.academyId).map((s) => s.id)
     const rowIds = Object.keys(book[subject.id] ?? {})
     expect(rowIds.sort()).toEqual([...ownIds].sort())
   }
   ```

   Solche Tests sind Gold wert: Sie prüfen eine **Zusage der Datenstruktur**, nicht das
   Verhalten einer Funktion. Wer die Trennung später versehentlich aufweicht, wird hier rot.

Dann: `npm run test:unit` muss grün sein, und `npm run build` (der `type-check` mit ausführt)
ebenfalls.

## Stolperfallen

| Symptom | Ursache |
| --- | --- |
| „no active Pinia“ | `setActivePinia(createPinia())` im `beforeEach` fehlt |
| Test hängt vom vorigen ab | Store oder `localStorage` nicht zurückgesetzt |
| `localStorage` leer, obwohl gespeichert wurde | `await nextTick()` fehlt |
| DOM zeigt den alten Stand | `await` vor `trigger`/`setValue`/`setProps` fehlt |
| `Property 'at' does not exist` | `tsconfig.vitest.json` hat `"lib": []` — setz es auf `["ESNext"]` |
| `showModal is not a function` | jsdom-Lücke — Ersatz in `vitest.setup.ts`, nicht in der Komponente |
| „no active effect scope" beim Composable-Test | Composable mit Watchern außerhalb einer Komponente aufgerufen — in `effectScope()` verpacken |

## Selbstcheck

- [ ] `npm run test:unit` ist grün
- [ ] Ein einzeln laufender Test ist auch einzeln grün
- [ ] Ein Test wird rot, wenn du absichtlich `average` kaputt machst
- [ ] `npm run build` läuft durch

## In der Referenz

- `reference/src/lib/__tests__/`, `reference/src/stores/__tests__/`, `reference/src/composables/__tests__/`,
  `reference/src/components/__tests__/` — 41 Tests
- `reference/tsconfig.vitest.json` — inklusive der `lib`-Korrektur
- `reference/vitest.setup.ts` — der jsdom-Ersatz für `<dialog>`
