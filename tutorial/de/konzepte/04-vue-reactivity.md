# 04 — Vue: Reaktivität und Templates

> **Zeitbedarf:** ca. 1,5–2 Stunden · viel Lesen, wenig Tippen

> **Baust du Schritt für Schritt mit?** Diese Seite gehört zu den Build-Kapiteln
> [01](../build/01-erste-noten.md) und [03](../build/03-eingabe-roh.md) — dort steht, wann du was
> davon brauchst.

## Ziel

Du verstehst, wie eine Single-File-Komponente aufgebaut ist, kennst den Unterschied zwischen
`ref`, `computed` und `watch` und kannst ein Template schreiben. Als Ergebnis läuft ein
erster eigener Bildschirm in deiner App.

---

## Das Grundprinzip

Vue ist **deklarativ**: du beschreibst, wie die Oberfläche bei einem gegebenen Zustand
aussehen soll. Ändert sich der Zustand, aktualisiert Vue die betroffenen Stellen im DOM.

> **Anders als du es kennst**
> Kein `document.querySelector`, kein `element.textContent = ...`. Du fasst das DOM nicht an.
> Du änderst eine Variable, und Vue kümmert sich um den Rest. Wenn du in einer Vue-App
> `querySelector` schreibst, ist fast immer etwas anderes falsch.

## Die Single-File-Komponente

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const zaehler = ref(0)
const doppelt = computed(() => zaehler.value * 2)

function hoch() {
  zaehler.value += 1
}
</script>

<template>
  <p>{{ zaehler }} × 2 = {{ doppelt }}</p>
  <button @click="hoch">Mehr</button>
</template>

<style scoped>
p { font-weight: 600; }
</style>
```

Drei Blöcke: Logik, Markup, Stil — für **eine** Komponente, in **einer** Datei.

`<script setup>` ist die kurze Form der Composition API. Der Code darin läuft einmal, wenn
die Komponente erzeugt wird. Alles, was du dort auf oberster Ebene deklarierst, ist im
Template sichtbar — kein `return`, kein `this`.

`<style scoped>` begrenzt die Stile auf diese Komponente. Vue hängt dazu ein eindeutiges
Attribut an die Elemente. (In diesem Projekt nutzen wir überwiegend Tailwind statt `scoped`,
siehe [Styling mit Tailwind](12-styling-tailwind.md).)

## `ref` — veränderlicher Zustand

```ts
const zaehler = ref(0)
zaehler.value += 1          // im Skript: .value
```

```vue
<p>{{ zaehler }}</p>        <!-- im Template: ohne .value -->
```

`ref` verpackt einen Wert in ein Objekt mit dem Feld `.value`. Nur so kann Vue mitbekommen,
dass du ihn liest oder schreibst — eine einfache Variable ließe sich nicht überwachen.

> **Stolperfalle Nummer eins bei Vue:** `.value` im Skript vergessen. `zaehler += 1` ist ein
> Typfehler, `if (zaehler)` dagegen ist immer wahr (ein Objekt ist truthy) und läuft still
> falsch. Im **Template** entpackt Vue automatisch — dort wäre `zaehler.value` falsch.

### `ref` oder `reactive`?

```ts
const a = ref({ name: 'Weber' })      // a.value.name
const b = reactive({ name: 'Weber' }) // b.name
```

**Nimm `ref`.** Immer. `reactive` funktioniert nur mit Objekten, verliert seine Reaktivität
beim Destrukturieren und lässt sich nicht als Ganzes ersetzen (`b = {...}` bricht die
Verbindung). Ein `ref` kann alles enthalten und ist als Ganzes austauschbar. Die einheitliche
Regel „alles ist ein `ref`, im Skript mit `.value`" erspart dir eine ganze Fehlerklasse.

## `computed` — abgeleiteter Zustand

```ts
const noten = ref<Grade[]>([1, 2, 3])
const durchschnitt = computed(() => noten.value.reduce((a, b) => a + b, 0) / noten.value.length)
```

Ein `computed` ist **schreibgeschützt**, wird **zwischengespeichert** und rechnet nur neu,
wenn sich eine seiner Quellen ändert.

Faustregel: **Ist ein Wert aus anderem Zustand ableitbar, dann leite ihn ab.** Ihn zusätzlich
in einem eigenen `ref` zu halten und von Hand aktuell zu halten, ist die zweite große
Fehlerquelle in Vue-Apps.

```ts
// Falsch: zwei Quellen der Wahrheit
const noten = ref([1, 2])
const anzahl = ref(2)     // muss überall mitgepflegt werden

// Richtig
const anzahl = computed(() => noten.value.length)
```

Rechnung im Template? Nur für Triviales. `{{ a + b }}` ist in Ordnung, alles Größere gehört in
ein `computed` — im Template liefe es bei **jedem** Rendern erneut.

## `watch` — auf Änderungen reagieren

`computed` ist für *Werte*. `watch` ist für *Nebenwirkungen*: etwas speichern, etwas neu
laden, etwas zurücksetzen.

```ts
watch(suchtext, (neu, alt) => { ... })

// Auf einen abgeleiteten Wert: als Getter-Funktion
watch(() => props.subjectId, laden, { immediate: true })

// Mehrere Quellen
watch([a, b], ([aNeu, bNeu]) => { ... })

// Verschachtelte Änderungen mitbekommen
watch(notenmatrix, speichern, { deep: true })
```

Die Optionen, die du brauchen wirst:

- **`immediate: true`** — einmal sofort ausführen, nicht erst bei der nächsten Änderung.
- **`deep: true`** — auch Änderungen *innerhalb* eines Objekts melden. Ohne das feuert der
  Watcher nur, wenn die ganze Referenz ersetzt wird.

> **Stolperfalle:** `watch(props.subjectId, ...)` funktioniert nicht. Du übergibst damit den
> aktuellen *Wert*, nicht die Quelle. Es muss `watch(() => props.subjectId, ...)` heißen — ein
> Getter, den Vue erneut auswerten kann.

`watchEffect(fn)` sammelt seine Abhängigkeiten automatisch aus dem, was `fn` liest. Bequem,
aber weniger explizit; für den Anfang ist `watch` die bessere Wahl.

## Template-Syntax

```vue
{{ ausdruck }}                          <!-- Text -->
<img :src="pfad" :alt="beschreibung">   <!-- Attribut binden (v-bind) -->
<button @click="hoch">                  <!-- Ereignis (v-on) -->
<input v-model="text">                  <!-- Zwei-Wege-Bindung -->
```

`:` ist die Kurzform von `v-bind:`, `@` die von `v-on:`.

### Bedingungen

```vue
<p v-if="laedt">Lädt …</p>
<p v-else-if="fehler">{{ fehler }}</p>
<p v-else>Fertig</p>

<p v-show="sichtbar">immer im DOM, nur per CSS versteckt</p>
```

`v-if` erzeugt und entfernt Elemente wirklich. `v-show` schaltet nur `display`. Wechselt etwas
häufig, ist `v-show` günstiger; sonst `v-if`.

### Listen

```vue
<li v-for="fach in faecher" :key="fach.id">{{ fach.name }}</li>
<li v-for="(fach, index) in faecher" :key="fach.id">{{ index }}: {{ fach.name }}</li>
<li v-for="(wert, schluessel) in objekt" :key="schluessel">…</li>
```

**`:key` ist Pflicht** und muss stabil und eindeutig sein. Nimm die ID, nicht den Index —
sonst ordnet Vue beim Einfügen oder Löschen die falschen DOM-Knoten zu, und Eingabefelder
behalten Werte der falschen Zeile. Genau das würdest du in der Notentabelle sofort merken.

`v-if` und `v-for` nie am selben Element. Filtere stattdessen im `computed`:

```ts
const offene = computed(() => faecher.value.filter((f) => !f.fertig))
```

### Klassen und Stile

```vue
<div :class="['immer', aktiv && 'aktiv', fehler ? 'rot' : 'grau']">
<div :class="{ aktiv: istAktiv, fehler: hatFehler }">
<div :style="{ height: `${prozent}%` }">
```

Ein Inline-`:style` ist dann richtig, wenn der Wert **berechnet** ist (eine Balkenhöhe). Für
alles andere: Klassen.

### Ereignis-Modifikatoren

```vue
<form @submit.prevent="absenden">   <!-- kein event.preventDefault() nötig -->
<div @click.stop="…">               <!-- stopPropagation -->
<input @keyup.enter="…">
```

## Lifecycle

```ts
import { onMounted, onUnmounted } from 'vue'

onMounted(() => { /* DOM steht */ })
onUnmounted(() => { /* aufräumen */ })
```

Was du selbst registrierst (Timer, `addEventListener` auf `window`), musst du in
`onUnmounted` auch wieder abmelden. `watch` und `computed` räumen sich selbst auf.

---

## Deine Aufgabe

Baue einen ersten Bildschirm — noch ohne Router, ohne Store, ohne Login. Ersetze den Inhalt
von `src/App.vue`:

1. Ein `ref` mit ein paar hartcodierten Noten (`[1, 3, 2, 5]`).
2. Ein `computed` für den Durchschnitt, das bei leerer Liste `null` liefert.
3. Ein `computed` für die Verteilung (wie oft kommt jede Note vor).
4. Ein Eingabefeld mit `v-model` und einen Knopf, der die Note hinzufügt.
5. Eine `v-for`-Liste der Noten mit `:key`, jede mit einem Knopf zum Entfernen.
6. Ein `watch`, der bei jeder Änderung die Anzahl auf die Konsole schreibt.

Sobald das läuft, hast du die Bausteine, aus denen der Rest der App besteht.

## Stolperfallen

| Symptom | Ursache |
| --- | --- |
| Wert ändert sich nicht | `.value` im Skript vergessen |
| `[object Object]` im Template | `.value` im Template *hinzugefügt* |
| Falsche Zeile behält Eingabe | `:key="index"` statt `:key="fach.id"` |
| `watch` feuert nie | Wert statt Getter übergeben |
| `watch` feuert bei verschachtelten Änderungen nicht | `deep: true` fehlt |
| Liste aktualisiert sich nicht | Array mutiert, wo eine Zuweisung nötig war |

## Selbstcheck

- [ ] Note hinzufügen aktualisiert Liste, Durchschnitt und Verteilung gleichzeitig
- [ ] Bei leerer Liste steht `–` statt `NaN`
- [ ] Du kannst erklären, wann `computed` und wann `watch` richtig ist
- [ ] Der Browser aktualisiert ohne Reload (sonst siehe [Setup](00-setup.md), `usePolling`)

## In der Referenz

- `reference/src/components/GradeInput.vue` — `ref` plus zwei `watch` in beide Richtungen
- `reference/src/composables/useGradeStats.ts` — mehrere `computed` gebündelt
- `reference/src/views/lecturer/GradeEntryView.vue` — `watch` mit `immediate` auf einem Route-Parameter
