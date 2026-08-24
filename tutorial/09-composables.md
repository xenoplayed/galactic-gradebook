# 09 — Composables

## Ziel

Du schreibst eigene Composables: gebündelte Statistik zu einer Notenliste, ein generisches
`useLocalStorage<T>` und einen Zufallsgenerator. Danach überleben Anmeldung und Noten einen
Reload.

---

## Was ein Composable ist

Eine Funktion, die mit `use` beginnt und **reaktiven Zustand** zurückgibt. Mehr nicht — kein
Framework-Konstrukt, keine Registrierung, keine Basisklasse.

```ts
export function useZaehler(start = 0) {
  const stand = ref(start)
  const doppelt = computed(() => stand.value * 2)

  function hoch() { stand.value += 1 }

  return { stand, doppelt, hoch }
}
```

Erinnerst du dich an die Closures aus [Kapitel 02](02-js-fortgeschritten.md)? Das ist genau
dasselbe Prinzip: `stand` lebt weiter, weil die zurückgegebenen Dinge es festhalten. Jeder
Aufruf von `useZaehler()` erzeugt einen eigenen, unabhängigen Stand.

> **Anders als du es kennst**
> Ein Composable ist keine Klasse und keine Vererbung. Es ist Wiederverwendung durch
> **Zusammensetzen**: du rufst mehrere auf und kombinierst, was sie liefern. Wo du in einer
> OO-Sprache eine Basisklasse gebaut hättest, rufst du hier zwei Funktionen auf.

### Die Regeln

1. Name beginnt mit `use`.
2. Aufruf auf **oberster Ebene** von `<script setup>` oder in einem anderen Composable — nicht
   in einem Callback, nicht in einem `if`. Sonst kann Vue Lifecycle-Hooks und `watch` nicht
   der richtigen Komponente zuordnen.
3. Gib ein Objekt aus `ref`s und `computed`s zurück, keine ausgepackten Werte — die wären
   eingefroren.

## Flexible Eingaben: `MaybeRefOrGetter`

Der wichtigste Kniff, damit ein Composable reaktiv bleibt:

```ts
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export function useGradeStats(source: MaybeRefOrGetter<readonly (Grade | null)[]>) {
  const grades = computed(() => toValue(source))

  return {
    count: computed(() => gradedCount(grades.value)),
    average: computed(() => average(grades.value)),
    distribution: computed(() => distribution(grades.value)),
    isEmpty: computed(() => gradedCount(grades.value) === 0),
    peak: computed(() => Math.max(...Object.values(distribution(grades.value)), 1)),
  }
}
```

`MaybeRefOrGetter<T>` heißt: du darfst einen einfachen Wert, ein `ref` **oder eine Funktion**
übergeben. `toValue()` packt alle drei Fälle aus.

```ts
useGradeStats([1, 2, 3])              // fester Wert
useGradeStats(notenRef)               // ref
useGradeStats(() => draftGrades.value) // Getter
```

**Warum das wichtig ist:** Hättest du stattdessen `(grades: Grade[])` als Parameter, wäre der
Wert beim Aufruf eingefroren. Die Statistik zeigte für immer den Stand vom ersten Rendern. Das
ist der häufigste Fehler beim ersten eigenen Composable — und er sieht aus wie ein
Vue-Problem, ist aber ein gewöhnlicher Wertübergabe-Fehler.

Der Test dazu bringt es auf den Punkt:

```ts
const grades = ref<(Grade | null)[]>([5, 5])
const stats = useGradeStats(grades)
expect(stats.average.value).toBe(5)

grades.value = [1, 1]
expect(stats.average.value).toBe(1)   // ohne toValue bliebe es 5
```

## Ein generisches Composable

```ts
export function useLocalStorage<T>(
  key: string,
  fallback: T,
  parse: (raw: unknown, fallback: T) => T = (raw) => raw as T,
): Ref<T> {
  const initial = readFromStorage(key)
  const state = ref(initial === undefined ? fallback : parse(initial, fallback)) as Ref<T>

  watch(
    state,
    (value) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // Privater Modus oder volles Kontingent: Persistenz ist Komfort, kein Muss.
      }
    },
    { deep: true },
  )

  return state
}

function readFromStorage(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? undefined : JSON.parse(raw)
  } catch {
    return undefined
  }
}
```

Fünf Details:

**`<T>` macht es universell.** Der Rückgabetyp richtet sich nach dem Fallback:
`useLocalStorage<string | null>('session', null)` liefert `Ref<string | null>`,
`useLocalStorage('grades', createGradeBook())` liefert `Ref<GradeBook>`.

**`as Ref<T>` ist hier nötig.** `ref(x)` gibt `Ref<UnwrapRef<T>>` zurück — Vue packt
verschachtelte `ref`s automatisch aus, und der Typ bildet das ab. Bei einem generischen `T`
kommt TypeScript da nicht mit. Einer der wenigen Fälle, in denen ein `as` die richtige Antwort
ist.

**`deep: true`.** Ohne das feuert der Watcher nur, wenn die ganze Referenz ersetzt wird —
Änderungen *innerhalb* der Notenmatrix blieben ungespeichert.

**Zwei `try`/`catch`.** Beim Lesen: ein von Hand veränderter oder halb geschriebener Eintrag
lässt `JSON.parse` werfen und würde sonst die ganze App beim Start abschießen. Beim Schreiben:
im privaten Modus wirft `setItem`.

**Der `parse`-Parameter.** `localStorage` ist dauerhaft, dein Datenmodell ändert sich. Ohne
Zusammenführung wäre `book.value['f11']` nach dem Hinzufügen eines Fachs `undefined`, und die
Ansicht liefe auf einen Fehler.

### Die Zusammenführung im Noten-Store

```ts
const book = useLocalStorage<GradeBook>(GRADES_KEY, createGradeBook(), mergeWithSeed)
```

`mergeWithSeed` nimmt die **Struktur** aus dem Seed (welche Fächer, welche Personen) und die
**Werte** aus dem gespeicherten Stand — aber nur gültige. Der Kernpunkt:

```ts
if (!Object.hasOwn(storedRow, studentId)) {
  row[studentId] = seedRow[studentId] ?? null   // Person ist neu -> Seed
  continue
}
const value = storedRow[studentId]
row[studentId] = isGrade(value) ? value : null  // bewusst geleert -> bleibt leer
```

„Schlüssel fehlt“ und „Wert ist `null`“ sind zwei verschiedene Dinge. Behandelte man sie
gleich, käme eine gelöschte Note beim nächsten Laden aus dem Seed zurück — ein Fehler, den man
erst Tage später bemerkt.

## Ein kleines Composable ohne Zustand

```ts
const WEIGHTS: Record<Grade, number> = { 1: 0.15, 2: 0.3, 3: 0.3, 4: 0.17, 5: 0.08 }

export function randomGrade(): Grade {
  let threshold = Math.random()
  for (const grade of GRADES) {
    threshold -= WEIGHTS[grade]
    if (threshold <= 0) return grade
  }
  return 3
}

export function useRandomGrades() {
  function randomGradesFor(studentIds: readonly string[]): Record<string, Grade> {
    return Object.fromEntries(studentIds.map((id) => [id, randomGrade()]))
  }
  return { randomGrade, randomGradesFor }
}
```

Gewichtet statt gleichverteilt: eine echte Klausur produziert selten gleich viele Einsen wie
Fünfen. Mit `Math.floor(Math.random() * 5) + 1` sähe der Klassenspiegel aus wie ein
Balkendiagramm ohne Aussage — und du könntest nicht beurteilen, ob deine Verteilungsrechnung
stimmt.

Das Verfahren: eine Zufallszahl in [0,1) laufen lassen und die Gewichte abziehen, bis sie
negativ wird. Die Trefferwahrscheinlichkeit jeder Note ist dann genau ihr Gewicht.

---

## Deine Aufgabe

1. `src/composables/useLocalStorage.ts` — generisch, mit `parse`-Parameter.
2. `src/composables/useGradeStats.ts` — mit `MaybeRefOrGetter` und `toValue`.
3. `src/composables/useRandomGrades.ts`.
4. Beide Stores auf `useLocalStorage` umstellen: `auth` speichert nur die ID,
   `grades` die Matrix mit `mergeWithSeed`.
5. Im Browser prüfen: anmelden, Seite neu laden — du bist noch angemeldet.

## Stolperfallen

- Composable ohne `MaybeRefOrGetter`, dann friert der Wert ein.
- `deep: true` vergessen — die Matrix wird nie gespeichert.
- Kein `try`/`catch` beim Lesen. Probier es aus: schreib in den DevTools
  `localStorage.setItem('datapad.grades', 'kaputt')` und lade neu. Mit `catch` läuft
  die App weiter, ohne bleibt sie weiß.
- Composable in einem Callback aufrufen statt auf oberster Ebene.
- In Tests: `watch` feuert erst im nächsten Tick. Ohne `await nextTick()` steht im
  `localStorage` noch nichts.

## Selbstcheck

- [ ] Anmelden, Reload — noch angemeldet
- [ ] Noten eintragen, speichern, Reload — Noten sind da
- [ ] `localStorage` enthält nur die User-**ID**, nicht Name und Rolle
- [ ] `localStorage` mit Müll füllen und neu laden: App startet trotzdem
- [ ] `useGradeStats` mit einem `ref` gefüttert: Zahlen aktualisieren sich

## In der Referenz

- `reference/src/composables/useLocalStorage.ts`, `useGradeStats.ts`, `useRandomGrades.ts`
- `reference/src/stores/grades.ts` — `mergeWithSeed` am Ende der Datei
- `reference/src/composables/__tests__/useGradeStats.spec.ts` — der Reaktivitätstest
