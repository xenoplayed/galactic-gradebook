# 01 — JavaScript-Grundlagen

> **Zeitbedarf:** ca. 2–3 Stunden · gut die Hälfte davon in den Übungen

## Ziel

Du kennst die Stellen, an denen JavaScript sich anders verhält, als du es erwartest, und
arbeitest mit Arrays über Methoden statt über Schleifen. Danach löst du die Übungen
`playground/uebungen/01-arrays.ts` und `02-objects.ts`.

Dieses Kapitel erklärt keine Grundlagen des Programmierens. Es erklärt **Unterschiede**.

---

## Variablen: `const` als Normalfall

```js
const name = 'Weber'     // Bindung kann nicht neu zugewiesen werden
let zaehler = 0          // kann neu zugewiesen werden
zaehler += 1
```

`var` gibt es noch, hat aber eine andere Gültigkeitsregel und wird heute nicht mehr benutzt.
Schreib `const`, bis der Compiler sich beschwert.

> **Anders als du es kennst**
> `const` heißt **nicht** unveränderlich. Es heißt: die Variable zeigt weiter auf dasselbe
> Objekt. Das Objekt selbst darf sich ändern.
> ```js
> const noten = [1, 2]
> noten.push(3)      // erlaubt, noten ist jetzt [1,2,3]
> noten = []         // Fehler: Assignment to constant variable
> ```

## `undefined` und `null` sind zwei verschiedene Dinge

| Wert | Bedeutung |
| --- | --- |
| `undefined` | „hier war nie etwas“ — nicht gesetzte Variable, fehlendes Feld, fehlendes Argument |
| `null` | „hier ist absichtlich nichts“ — das setzt *dein* Code |

In diesem Projekt ist das eine Entwurfsentscheidung: eine nicht vergebene Note ist `null`
(bewusst leer), nicht `undefined` (Schlüssel fehlt) und schon gar nicht `0` (damit könnte man
versehentlich rechnen).

## Gleichheit: immer `===`

```js
1 == '1'        // true   — konvertiert vorher
1 === '1'       // false  — vergleicht auch den Typ
null == undefined   // true
null === undefined  // false
```

**Nimm immer `===`.** Die einzige verbreitete Ausnahme ist `x == null`, was genau
„`null` oder `undefined`“ prüft — aber selbst da ist `x === null || x === undefined`
deutlicher.

## Truthiness

`if (wert)` behandelt diese Werte als falsch: `false`, `0`, `-0`, `''`, `null`, `undefined`,
`NaN`. Alles andere ist wahr — auch `[]` und `{}`.

```js
if ([]) console.log('läuft')   // läuft! Ein leeres Array ist truthy.
```

> **Anders als du es kennst**
> In Python sind leere Listen und leere Dicts falsch. In JavaScript **nicht**. Prüfe die
> Länge: `if (noten.length > 0)`.

Daraus folgt der wichtigste Operator-Unterschied überhaupt:

```js
const anzeige = wert || 'unbekannt'   // greift auch bei 0 und ''  ← meist ein Bug
const anzeige = wert ?? 'unbekannt'   // greift NUR bei null/undefined  ← meist gemeint
```

`??` heißt Nullish Coalescing. Bei Noten ist der Unterschied echter Schaden: `note || '–'`
würde eine `0` verschlucken, und selbst wenn 0 keine gültige Note ist — die Angewohnheit
bringt dich anderswo um.

## Objekte und Arrays sind Referenzen

Das ist der Punkt, an dem die meisten Fehler entstehen.

```js
const a = { name: 'Weber' }
const b = a
b.name = 'Müller'
console.log(a.name)   // 'Müller' — a und b sind dasselbe Objekt
```

Kopieren geht mit **Spread**:

```js
const kopie = { ...a }              // flache Kopie
const geaendert = { ...a, name: 'X' }   // Kopie mit einem geänderten Feld
const arrayKopie = [...noten]
```

> **Anders als du es kennst**
> `{ ...a }` ist **flach**. Verschachtelte Objekte werden weiterhin geteilt:
> ```js
> const fach = { name: 'DB', dozent: { name: 'Weber' } }
> const kopie = { ...fach }
> kopie.dozent.name = 'X'
> fach.dozent.name   // 'X' — dieselbe Referenz
> ```
> Für tiefe Kopien: `structuredClone(fach)`.

Das `{ ...alt, feld: neu }`-Muster wirst du ständig sehen. Vue und Pinia erkennen Änderungen
zuverlässiger, wenn du ein neues Objekt zuweist, statt in einem bestehenden herumzuschreiben.

## Destructuring

```js
const { name, ects } = fach              // zwei Felder herausziehen
const { name, ...rest } = fach           // name einzeln, Rest als Objekt
const { dozent = 'unbesetzt' } = fach    // Standardwert, wenn undefined
const [erste, zweite] = noten            // aus Arrays, nach Position
const { dozent: verantwortlich } = fach  // beim Herausziehen umbenennen
```

Genauso in Parameterlisten:

```js
function anzeige({ name, ects }) {
  return `${name} (${ects} ECTS)`
}
```

> **Merke dir das jetzt schon:** Aus einem Pinia-Store darfst du **nicht** so destrukturieren
> — dabei geht die Reaktivität verloren. Dafür gibt es `storeToRefs`, siehe
> [Kapitel 08](08-pinia.md).

## Optionales Verketten

```js
fach.dozent?.email          // undefined statt Absturz, wenn dozent fehlt
fach.dozent?.email ?? null  // und ein sauberer Ersatzwert
liste?.[0]                  // auch für Indizes
callback?.()                // und für Funktionen
```

## Arrays: Methoden statt Schleifen

Das ist die eigentliche Umstellung. In Vue-Templates und in `computed` schreibst du fast
ausschließlich so:

```js
noten.map(n => n * 2)                 // umformen        -> neues Array
noten.filter(n => n <= 3)             // aussieben       -> neues Array
noten.find(n => n === 5)              // erstes Treffer  -> Element oder undefined
noten.findIndex(n => n === 5)         // Position        -> Index oder -1
noten.some(n => n === 5)              // gibt es eins?   -> boolean
noten.every(n => n <= 4)              // gilt für alle?  -> boolean
noten.includes(5)                     // enthalten?      -> boolean
noten.reduce((sum, n) => sum + n, 0)  // zu einem Wert zusammenfalten
studis.flatMap(s => s.noten)          // map + eine Ebene abflachen
noten.at(-1)                          // letztes Element
```

Zu `reduce`: der zweite Parameter ist der **Startwert**. Ohne ihn wirft `reduce` bei einem
leeren Array. Schreib ihn immer hin.

```js
// Verteilung zählen — Startwert ist ein vollständiges Objekt,
// damit hinterher keine Schlüssel fehlen.
noten.reduce((acc, note) => {
  acc[note] += 1
  return acc
}, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
```

### `sort` verändert das Original

```js
const sortiert = [...alle].sort((a, b) => a.wert - b.wert)
```

> **Anders als du es kennst**
> `sort()` sortiert **an Ort und Stelle** und gibt dasselbe Array zurück. Ohne `[...alle]`
> hast du nebenbei die Eingabe umsortiert — in einem Vue-`computed` sortierst du damit den
> Store um, und die Anzeige beginnt zu flackern.
>
> Und: `sort()` ohne Vergleichsfunktion sortiert **als Text**. `[10, 9, 100].sort()` ergibt
> `[10, 100, 9]`. Für Zahlen `(a, b) => a - b`, für deutsche Texte
> `(a, b) => a.localeCompare(b, 'de')` — nur das sortiert Umlaute richtig ein.

## Objekte als Nachschlagewerk

```js
Object.keys(obj)      // ['id', 'name']
Object.values(obj)
Object.entries(obj)   // [['id','f01'], ['name','DB']]
Object.fromEntries(paare)   // zurück zum Objekt
Object.hasOwn(obj, 'id')
```

`Object.fromEntries(liste.map(x => [x.id, x]))` ist das Standardmuster, um aus einer Liste
einen Index zu bauen — das brauchst du in Kapitel 06 wieder.

> **Anders als du es kennst**
> Objektschlüssel sind **immer Strings** (oder Symbole). `obj[1]` und `obj['1']` sind
> derselbe Eintrag. Brauchst du echte Schlüssel beliebigen Typs, nimm `Map`.

## Template-Literale

```js
`Hallo ${vorname}, du hast ${noten.length} Noten`
```

Backticks, mehrzeilig erlaubt, `${...}` wertet aus. Nutze sie statt String-Verkettung.

---

## Deine Aufgabe

```bash
cd playground
npm install
npm run test:watch
```

Bearbeite `uebungen/01-arrays.ts` und `uebungen/02-objects.ts`. Jede Funktion beginnt mit
`throw new Error('TODO: ...')` — ersetze das durch eine Lösung, bis die Tests grün werden.

Regel für `01-arrays.ts`: **keine `for`-Schleife**. Nicht aus Prinzip, sondern weil du in
Vue-Templates ohnehin nur die Methoden verwenden kannst.

## Stolperfallen

- `sort` ohne vorherige Kopie — der erste Test dazu prüft genau das.
- `reduce` ohne Startwert.
- `||` statt `??`.
- `filter(...)` liefert **immer** ein Array, auch bei einem Treffer. Für ein einzelnes
  Element: `find`.
- `map` auf ein Array of Arrays, wenn `flatMap` gemeint war.

## Selbstcheck

- [ ] `npm test` im `playground/` ist für 01 und 02 grün
- [ ] Du kannst erklären, warum `nachDurchschnitt` eine Kopie braucht
- [ ] Du kannst erklären, wann `??` und wann `||` richtig ist
- [ ] Du weißt, warum `{ ...fach }` das verschachtelte `dozent`-Objekt nicht schützt

## In der Referenz

- `reference/src/lib/grades.ts` — `average`, `distribution`, `passRate` benutzen genau diese Methoden
- `reference/src/lib/collection.ts` — `sortBy` mit `[...this.#items].sort(...)` und `localeCompare`
