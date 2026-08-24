# 12 — Styling mit Tailwind CSS 4

## Ziel

Du verstehst, wie Tailwind 4 konfiguriert wird (nämlich in CSS), definierst eigene
Design-Tokens und bekommst einen funktionierenden Dark Mode.

---

## Tailwind 4 ist anders als alle Tutorials, die du findest

Version 4 hat die Konfiguration von JavaScript nach CSS verlegt.

| | Tailwind 3 | Tailwind 4 |
| --- | --- | --- |
| Einbindung | PostCSS-Plugin | Vite-Plugin `@tailwindcss/vite` |
| Konfiguration | `tailwind.config.js` | `@theme` im CSS |
| Import | `@tailwind base; @tailwind components;` … | `@import "tailwindcss";` |
| Inhalts-Suche | `content: [...]` von Hand | automatisch |

**Findest du ein Tutorial, das `npx tailwindcss init` ausführt, ist es für Version 3.** Es gibt
keine `tailwind.config.js` mehr.

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({ plugins: [vue(), tailwindcss()] })
```

```css
/* src/assets/main.css */
@import 'tailwindcss';
```

Das war das ganze Setup.

## Design-Tokens mit `@theme`

```css
@theme {
  --color-brand-500: oklch(0.58 0.16 255);
  --color-brand-600: oklch(0.51 0.16 255);

  --color-grade-1: oklch(0.65 0.16 155);
  --color-grade-2: oklch(0.72 0.16 130);
  --color-grade-3: oklch(0.78 0.15 85);
  --color-grade-4: oklch(0.7 0.16 55);
  --color-grade-5: oklch(0.62 0.19 25);

  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
}
```

Alles in `@theme` wird zu **zweierlei**: einer CSS-Custom-Property *und* passenden
Utility-Klassen. `--color-grade-1` erzeugt automatisch `bg-grade-1`, `text-grade-1`,
`ring-grade-1` und so weiter. Die Namenspräfixe (`--color-`, `--font-`, `--spacing-`) sind
dabei nicht dekorativ — an ihnen erkennt Tailwind, welche Utilities es erzeugen soll.

**Warum `oklch` statt `#rrggbb`:** In oklch ist die erste Zahl die wahrgenommene Helligkeit.
Zwei Farben mit gleicher erster Zahl wirken gleich hell — deshalb passen `grade-1` bis
`grade-5` als Reihe zusammen, obwohl sie über den halben Farbkreis laufen. Bei Hex-Werten
müsstest du das nach Augenmaß nachjustieren.

## Utilities oder Komponenten?

Tailwind schreibt Stil direkt ins Markup:

```vue
<button class="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium">
```

Das ist gewöhnungsbedürftig und funktioniert trotzdem, weil du es **nicht wiederholst**. Die
Wiederverwendung passiert auf Komponentenebene, nicht auf CSS-Ebene:

```vue
<BaseButton variant="primary">Speichern</BaseButton>
```

> **Anders als du es kennst**
> Die Versuchung ist groß, `@apply` zu benutzen und eine `.btn`-Klasse zu bauen. Damit bist du
> wieder da, wo du mit klassischem CSS warst: zwei Orte, an denen Stil steht, und die Frage,
> welcher gewinnt. Nimm `@apply` nur für echte Grundlagen (`body`, Fokus-Ringe) und mach
> ansonsten Komponenten.

## Klassennamen dürfen nicht zusammengebaut werden

```vue
<!-- FUNKTIONIERT NICHT -->
<span :class="`bg-grade-${note}`">
```

Tailwind durchsucht deinen Quelltext nach **vollständigen Zeichenketten**, die wie
Klassennamen aussehen. `bg-grade-${note}` steht so nirgends, also erzeugt Tailwind die Regel
nicht — die Klasse landet im HTML, aber im CSS gibt es sie nicht. Kein Fehler, keine Warnung,
nur eine farblose Fläche.

Richtig ist eine ausgeschriebene Zuordnung:

```ts
const GRADE_CLASSES: Record<Grade, string> = {
  1: 'bg-grade-1 text-white',
  2: 'bg-grade-2 text-white',
  3: 'bg-grade-3 text-slate-900',
  4: 'bg-grade-4 text-white',
  5: 'bg-grade-5 text-white',
}
```

Diese Regel gilt für **alle** Utilities, nicht nur Farben: `w-${n}`, `mt-${x}` — nichts davon
funktioniert.

## `:class` in Vue

```vue
<div :class="['immer-da', aktiv && 'aktiv', fehler ? 'rot' : 'grau']">
<div :class="{ aktiv: istAktiv }">
<div class="rounded-lg" :class="VARIANT_CLASSES[variant]">
```

Ein statisches `class` und ein dynamisches `:class` am selben Element werden von Vue
zusammengeführt. Das ist das übliche Muster für Basiskomponenten: das Gemeinsame statisch, das
Variable dynamisch.

`false`, `null` und `undefined` in einem Array werden weggelassen — deshalb funktioniert
`aktiv && 'aktiv'`.

## Dark Mode

```css
html { color-scheme: light dark; }

body {
  @apply bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100;
}
```

Der `dark:`-Präfix richtet sich standardmäßig nach der Systemeinstellung
(`prefers-color-scheme`). `color-scheme` auf `html` sorgt dafür, dass auch Scrollbalken und
Formularelemente des Browsers mitziehen.

Für jede Farbe braucht es eine dunkle Entsprechung:

```vue
<div class="bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
```

Zwei Fehler, die man immer wieder sieht: einen Hintergrund abdunkeln, aber den Text vergessen
(schwarz auf dunkelgrau); und Rahmen vergessen (`ring-slate-200` verschwindet auf dunklem
Grund).

**Prüf es wirklich nach.** In den Chrome-DevTools: Rendering → *Emulate CSS
prefers-color-scheme*. Ein Dark Mode, den man nie ansieht, ist keiner.

## Zugänglichkeit im Vorbeigehen

```css
:focus-visible {
  @apply outline-2 outline-offset-2 outline-brand-500;
}
```

Der Standard-Fokus-Ring des Browsers wird von vielen Resets weggeräumt. Ohne Ersatz ist die
Anwendung mit der Tastatur unbenutzbar — du siehst nicht, wo du bist. `:focus-visible` zeigt
ihn nur bei Tastaturnavigation, nicht bei Mausklick.

Weiteres, das hier gebraucht wird:

- `sr-only` — für Screenreader sichtbar, optisch nicht. Für Spaltenüberschriften ohne Text.
- `tabular-nums` — Ziffern gleich breit. In Zahlenspalten springt sonst alles.
- `aria-invalid`, `aria-describedby` an fehlerhaften Feldern.
- Kontrast: `text-slate-400` auf Weiß ist für Fließtext zu schwach.

## Layout: die drei Werkzeuge, die reichen

```vue
<div class="mx-auto max-w-5xl px-4 py-8">        <!-- zentrierter Inhaltsbereich -->
<div class="grid gap-4 sm:grid-cols-3">          <!-- Karten, mobil untereinander -->
<div class="flex items-center justify-between">  <!-- Zeile mit Abstand dazwischen -->
```

Breakpoints wirken **ab** der Größe: `sm:grid-cols-3` heißt „ab 640 px drei Spalten“. Tailwind
ist mobile-first — der Standard gilt für kleine Bildschirme.

Für die Notentabelle:

```vue
<div class="-mx-5 overflow-x-auto px-5">
  <table class="w-full min-w-lg">
```

Die Tabelle scrollt **in sich**, statt die ganze Seite breit zu machen. Das negative `-mx-5`
gegen das `px-5` lässt den Scrollbereich bis an den Kartenrand laufen, während der Inhalt
eingerückt bleibt.

---

## Deine Aufgabe

1. `src/assets/main.css` mit `@import 'tailwindcss'` und einem `@theme`-Block: Markenfarbe,
   fünf Notenfarben, Schriftfamilie.
2. `body` mit `@apply` grundstylen, `color-scheme` setzen, Fokus-Ring definieren.
3. Alle Komponenten und Views durchgehen: für jede helle Farbe eine `dark:`-Entsprechung.
4. Notenfarben in `GradeBadge` und `GradeDistributionChart` über ein `Record`, nicht
   zusammengebaut.
5. Bei 375 px Breite prüfen: nichts läuft über den Rand, die Tabellen scrollen in sich.

## Stolperfallen

| Symptom | Ursache |
| --- | --- |
| Farbe wirkt nicht | Klassenname zusammengebaut |
| Alles unformatiert | `@import 'tailwindcss'` fehlt oder `main.css` nicht in `main.ts` importiert |
| `tailwind.config.js` wird ignoriert | Version 4 liest sie nicht mehr |
| Dunkler Text auf dunklem Grund | `dark:text-*` vergessen |
| Ganze Seite scrollt horizontal | Tabelle ohne `overflow-x-auto` |
| Zahlen springen | `tabular-nums` fehlt |

## Selbstcheck

- [ ] `bg-brand-600` und `bg-grade-3` wirken
- [ ] Dark Mode umschalten: alles bleibt lesbar
- [ ] Mit Tab durch das Login-Formular: der Fokus ist überall sichtbar
- [ ] Bei 375 px Breite kein horizontales Scrollen der Seite
- [ ] `npm run build`: das CSS ist ein paar Dutzend Kilobyte, nicht mehrere hundert

## In der Referenz

- `src/assets/main.css` — `@theme` und die Grundstile
- `src/components/GradeBadge.vue`, `GradeDistributionChart.vue` — die Farbzuordnungen
- `src/components/base/BaseButton.vue` — Varianten als `Record`
- `src/components/base/BaseTable.vue` — der scrollende Rahmen
