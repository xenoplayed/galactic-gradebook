# 02 — Funktionen, Module, async

## Ziel

Du verstehst Arrow-Funktionen und `this`, kennst ES-Module und kannst mit Promises und
`async`/`await` umgehen. Übungen: `playground/uebungen/03-arrow-this.ts` und `04-async.ts`.

---

## Funktionen sind Werte

```js
function benannt(x) { return x * 2 }        // Deklaration
const alsWert = function (x) { return x * 2 }  // Ausdruck
const pfeil = (x) => x * 2                  // Arrow-Funktion
```

Funktionen kannst du in Variablen legen, herumreichen und zurückgeben. Das brauchst du
ständig — jedes `map(...)` bekommt eine Funktion als Argument.

### Arrow-Funktionen im Detail

```js
(x) => x * 2                    // ein Ausdruck: implizites return
(x) => { return x * 2 }         // Block: return nötig
() => 42                        // ohne Parameter
(a, b) => a + b
(x) => ({ wert: x })            // Objekt zurückgeben: Klammern drumherum!
```

> **Stolperfalle:** `(x) => { wert: x }` gibt `undefined` zurück. Die geschweifte Klammer
> wird als Funktionsrumpf gelesen, nicht als Objekt. Deshalb `({ ... })`.

### `this` — der Unterschied, auf den es ankommt

In JavaScript bekommt eine klassische Funktion ihr `this` **beim Aufruf** zugewiesen, nicht
beim Schreiben. Wer sie aufruft, bestimmt, was `this` ist.

```js
class Kurs {
  constructor(name) { this.name = name }

  kaputt() {
    return [1].map(this.formatieren)      // ← Methode als WERT übergeben
  }
  richtig() {
    return [1].map(() => this.formatieren())
  }
  formatieren() {
    return `Kurs: ${this.name}`
  }
}
```

In `kaputt()` wird `formatieren` von seinem Objekt getrennt. `map` ruft sie ohne Empfänger
auf, `this` ist `undefined`, und `this.name` wirft.

**Eine Arrow-Funktion hat kein eigenes `this`.** Sie benutzt das `this` der Stelle, an der sie
*geschrieben* steht. Deshalb funktioniert `richtig()`.

> **Anders als du es kennst**
> In Python ist `self` ein normaler Parameter und wird bei `obj.methode` fest gebunden — eine
> herausgezogene Methode funktioniert dort weiter. In JavaScript nicht. Die Alternative zur
> Arrow-Funktion ist `this.formatieren.bind(this)`.

**Praktische Regel:** Nimm Arrow-Funktionen für Callbacks. Nimm klassische Funktionen für
Deklarationen auf oberster Ebene und für Methoden in Klassen. In Vue mit `<script setup>`
kommst du mit `this` fast nie in Berührung — genau deshalb wird es gerne empfohlen.

### Closures

```js
function zaehler(beginn) {
  let stand = beginn
  return () => {
    stand += 1
    return stand
  }
}
const next = zaehler(10)
next()   // 11
next()   // 12
```

`stand` lebt weiter, obwohl `zaehler` längst zurückgekehrt ist. Die zurückgegebene Funktion
hält die Variable am Leben. Jeder Aufruf von `zaehler(...)` erzeugt einen **eigenen** Stand.

Das ist keine Kuriosität — es ist genau das Prinzip, auf dem Composables in
[Kapitel 09](09-composables.md) beruhen.

### Standardwerte und Rest

```js
function begruesse(name, gruss = 'Hallo') { ... }
function summe(...zahlen) { return zahlen.reduce((a, b) => a + b, 0) }
```

Der Standardwert greift bei `undefined`, **nicht** bei `null`.

---

## Module

Jede Datei ist ein eigener Namensraum. Nichts ist global.

```js
// grades.js
export function average(noten) { ... }        // benannter Export
export const MAX = 5
export default class Register { ... }         // Standard-Export, höchstens einer
```

```js
// woanders.js
import Register, { average, MAX } from './grades.js'
import { average as mittelwert } from './grades.js'
import * as grades from './grades.js'
import type { Grade } from './types.js'       // nur der Typ, verschwindet beim Bauen
```

Konventionen in diesem Projekt:

- **Benannte Exporte bevorzugen.** Beim Standard-Export darf jede importierende Datei einen
  anderen Namen wählen — das erschwert die Suche. Ausnahme: `.vue`-Dateien exportieren die
  Komponente per Standard, das gibt Vue so vor.
- `@/` ist ein Alias für `src/`, eingerichtet in `vite.config.ts` und `tsconfig.app.json`.
  `import { average } from '@/lib/grades'` funktioniert damit aus jeder Tiefe gleich.

> **Anders als du es kennst**
> Importe werden **hochgezogen** und laufen, bevor irgendein Code der Datei ausgeführt wird.
> Ein Import mitten im Code ist keine bedingte Ausführung. Willst du wirklich bedingt oder
> verzögert laden, brauchst du `await import('./modul.js')` — genau das macht der Router beim
> Lazy Loading von Views.

---

## Asynchron

Der wichtigste Satz zuerst: **JavaScript hat einen Thread.** Es gibt kein Blockieren. Was
dauert (Netzwerk, Timer, Dateien), wird angestoßen; dein Code läuft weiter, und wenn das
Ergebnis da ist, kommt eine Rückmeldung.

### Promise

Ein `Promise` ist die Zusage auf ein späteres Ergebnis. Drei Zustände: *pending*,
*fulfilled*, *rejected*.

```js
function warte(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
```

### `async` / `await`

```js
async function laden(id) {
  const antwort = await fetch(`/api/items/${id}`)
  if (!antwort.ok) throw new Error(`HTTP ${antwort.status}`)
  return await antwort.json()
}
```

- `async` vor einer Funktion heißt: sie gibt **immer** ein Promise zurück.
- `await` wartet auf ein Promise. Es blockiert nicht den Thread — es setzt die Funktion an
  dieser Stelle aus und macht später weiter.
- Ein `throw` in einer `async`-Funktion wird zu einem abgelehnten Promise.

> **Anders als du es kennst**
> `await` ist nicht `sleep`. Während gewartet wird, laufen andere Dinge weiter — Klicks,
> Timer, andere Anfragen. Deshalb kann sich der Zustand deiner Anwendung über ein `await`
> hinweg geändert haben. Prüfe nach einem `await` nach, was du vorher gelesen hast.

### Parallel statt nacheinander

Der häufigste Performance-Fehler:

```js
// LANGSAM: jede Anfrage wartet auf die vorige
for (const id of ids) {
  ergebnisse.push(await laden(id))
}

// SCHNELL: alle starten sofort
const ergebnisse = await Promise.all(ids.map((id) => laden(id)))
```

`ids.map(id => laden(id))` startet alle Aufrufe **sofort** und liefert ein Array von
Promises. `Promise.all` wartet dann auf alle gleichzeitig und behält die Reihenfolge der
Eingabe bei — nicht die der Fertigstellung.

| | Verhalten |
| --- | --- |
| `Promise.all` | wirft, sobald **eines** ablehnt |
| `Promise.allSettled` | wartet auf alle, wirft nie, meldet je Eintrag `fulfilled`/`rejected` |
| `Promise.race` | das erste Ergebnis gewinnt — brauchbar für Timeouts |
| `Promise.any` | das erste **erfolgreiche** gewinnt |

### Fehlerbehandlung

```js
try {
  const daten = await laden(id)
} catch (fehler) {
  // fehler ist `unknown` — in TypeScript musst du das eingrenzen
  const text = fehler instanceof Error ? fehler.message : String(fehler)
} finally {
  laedt.value = false
}
```

> **Stolperfalle:** Ein Promise ohne `await` und ohne `.catch()` schlägt still fehl
> („unhandled rejection“). Rufst du eine `async`-Funktion auf, ohne auf sie zu warten,
> hänge mindestens ein `.catch()` an.

---

## Deine Aufgabe

Bearbeite `playground/uebungen/03-arrow-this.ts` und `04-async.ts`.

Der Test *„ladeAlle lädt wirklich parallel"* misst die Zeit — mit `await` in einer Schleife
wird er rot. Genau das ist der Punkt der Aufgabe.

## Selbstcheck

- [ ] Übungen 03 und 04 sind grün
- [ ] Du kannst erklären, warum `[1].map(this.formatieren)` scheitert
- [ ] Du kannst den Unterschied zwischen `Promise.all` und `Promise.allSettled` benennen
- [ ] Du weißt, warum `await` in einer Schleife meist ein Fehler ist

## In der Referenz

- `reference/src/composables/useLocalStorage.ts` — Closure über `key` und `fallback`
- Eine Service-Ebene für Netzwerkzugriffe gibt es in der Referenz nicht — die App holt keine
  Daten über das Netz. `async` brauchst du trotzdem, sobald du in
  [Kapitel 14](14-build-deployment.md) über ein echtes Backend nachdenkst.
