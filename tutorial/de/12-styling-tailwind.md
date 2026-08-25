# 12 — Styling mit Tailwind CSS 4

> **Zeitbedarf:** ca. 3–4 Stunden · Design frisst Zeit, das ist normal

## Ziel

Du verstehst, wie Tailwind 4 konfiguriert wird (nämlich in CSS), definierst eigene
Design-Tokens — und baust **vier komplett verschiedene Erscheinungsbilder, die an einem
einzigen HTML-Attribut hängen**. Keine Komponente muss dafür wissen, in welcher Akademie sie
gerade gerendert wird.

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

## Vier Themes an einem Attribut

Das ist der interessanteste Teil dieses Kapitels. Die Aufgabe: Jedi hell und blaugrün, Sith
fast schwarz mit Karmesin, Imperium stahlgrau mit Signalrot, Rebellen warm und sandig. Und
zwar nicht nur die Farbe — auch Eckenradius und Schriftcharakter.

### Die Beobachtung, auf der alles beruht

Sieh dir an, was Tailwind aus `bg-brand-600` tatsächlich macht. Nach `npm run build` im
erzeugten CSS nachschauen:

```css
.bg-brand-600 { background-color: var(--color-brand-600) }
.rounded-card { border-radius: var(--radius-card) }
```

**Tailwind setzt den Wert nicht ein, es verweist auf ihn.** Damit gilt: Wer die Custom
Property neu belegt, ändert jede Verwendung auf der Seite — ohne eine einzige Klasse
anzufassen.

> Das ist kein Detail, sondern die tragende Annahme. Prüf sie nach, bevor du darauf aufbaust:
> ```bash
> npm run build && grep -o '\.bg-brand-600{[^}]*}' dist/assets/*.css
> ```
> Stünde dort ein fertiger Farbwert statt `var(…)`, müsstest du einen anderen Weg gehen
> (Tailwinds `@utility`-Direktive mit explizitem `var(…)`).

### Der Aufbau

```css
@theme {
  /* neutral - gilt auf dem Anmeldebildschirm */
  --color-brand-600: oklch(0.52 0.1 250);
  --color-surface: oklch(0.99 0 0);
  --color-ink: oklch(0.25 0.02 250);
  --radius-card: 0.75rem;
  --font-display: ui-sans-serif, system-ui, sans-serif;
}

[data-academy='jedi']   { --color-brand-600: oklch(0.57 0.12 195); --radius-card: 1rem;     … }
[data-academy='sith']   { --color-brand-600: oklch(0.48 0.22 10);  --radius-card: 0.125rem; … }
[data-academy='empire'] { --color-brand-600: oklch(0.52 0.23 27);  --radius-card: 0;        … }
[data-academy='rebels'] { --color-brand-600: oklch(0.62 0.18 50);  --radius-card: 0.5rem;   … }
```

Umgeschaltet wird in einem Composable:

```ts
// Modulweit: EIN Wert fuer die ganze App (siehe Kapitel 09).
const previewAcademyId = ref<AcademyId>('jedi')

export function useAcademyPreview() {
  return { previewAcademyId }
}

export function useAcademyTheme(): void {
  const { academy } = storeToRefs(useAuthStore())

  // Nach dem Anmelden die echte Akademie als Vorschau merken - sonst waere
  // das Abmelden ein optischer Sprung zurueck auf Jedi.
  watch(academy, (value) => {
    if (value !== null) previewAcademyId.value = value.id
  })

  watchEffect(() => {
    document.documentElement.dataset.academy = academy.value?.id ?? previewAcademyId.value
  })
}
```

Ein Aufruf in `App.vue`, das war es. `watchEffect` statt `watch`, weil die Abhängigkeiten
offensichtlich sind und der erste Lauf sofort passieren soll.

**Das Attribut wird nie gelöscht.** Angemeldet gilt die echte Akademie, sonst die vorgemerkte
— dadurch zeigt schon der Anmeldebildschirm ein vollständiges Design, statt neutral zu bleiben.
Die Werte im `@theme`-Block sind damit nur noch Rückfallebene.

### Das Aufblitzen beim Laden

Ein Detail, das man erst sieht, wenn man darauf achtet: Zwischen dem Anzeigen des HTML und dem
Moment, in dem Vue gemountet ist und `data-academy` setzt, vergehen ein paar Millisekunden. In
denen gilt die neutrale Palette — es blitzt kurz auf.

Die Lösung steht nicht in JavaScript, sondern im HTML:

```html
<html lang="de" data-academy="jedi">
```

Damit ist die Palette gesetzt, bevor die erste Zeile JavaScript läuft. Dasselbe Muster
benutzen Seiten mit Dark Mode, um genau dieses Flackern zu vermeiden.

### Semantische Tokens statt Farbnamen

Damit das trägt, dürfen die Komponenten **keine konkreten Farben** mehr nennen. Statt

```html
<div class="bg-white ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
```

heißt es

```html
<div class="bg-surface ring-line">
```

Der Gewinn ist doppelt: Es funktioniert in vier Paletten, **und** die `dark:`-Varianten fallen
weg. Die Akademie bestimmt, ob es hell oder dunkel ist — nicht die Systemeinstellung.

Der Satz Tokens, den du brauchst:

| Token | wofür |
| --- | --- |
| `--color-surface`, `--color-surface-2` | Karten und Seitenhintergrund |
| `--color-ink`, `--color-ink-soft` | Text und abgeschwächter Text |
| `--color-line` | Rahmen und Trennlinien |
| `--color-brand-*` | die Markenfarbe, trägt **weiße** Schrift |
| `--color-link` | Textfarbe für Links |
| `--color-ok`, `--color-warn` | Statusfarben |
| `--radius-card`, `--font-display` | Form und Schriftcharakter |

### Warum `--color-link` getrennt von `--color-brand-600` sein muss

Das sieht nach Doppelung aus, ist aber der Punkt, an dem ich beim Bauen der Referenz auf die
Nase gefallen bin. `brand-600` muss zwei unvereinbare Dinge können:

1. als **Fläche** unter weißer Schrift funktionieren (Buttons) → muss dunkel genug sein
2. als **Schrift** auf der Fläche lesbar sein (Links) → muss hell genug sein

Auf dem fast schwarzen Korriban-Hintergrund erreichte `text-brand-600` gerade mal **2,89:1**.
Gefordert sind 4,5:1. Mit einem eigenen, deutlich helleren `--color-link` sind es **7,86:1**.

Mess das nach, statt es zu schätzen. In der Konsole der Entwicklerwerkzeuge:

```js
const cv = document.createElement('canvas'); cv.width = cv.height = 1
const ctx = cv.getContext('2d', { willReadFrequently: true })
const rgb = c => { ctx.fillStyle = c; ctx.fillRect(0,0,1,1); return [...ctx.getImageData(0,0,1,1).data] }
const lum = ([r,g,b]) => { [r,g,b] = [r,g,b].map(v => { v/=255; return v<=0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4 })
                           return 0.2126*r + 0.7152*g + 0.0722*b }
const ratio = (a,b) => { const [x,y] = [lum(rgb(a)), lum(rgb(b))]
                         return ((Math.max(x,y)+0.05) / (Math.min(x,y)+0.05)).toFixed(2) }

const cs = getComputedStyle(document.documentElement)
ratio(cs.getPropertyValue('--color-link'), cs.getPropertyValue('--color-surface'))
```

Der Umweg über Canvas ist nötig, weil moderne Browser `oklch()` als solches zurückgeben —
eine Farbe „von Hand" zu parsen scheitert daran.

> **Miss gegen die Tokens, nicht gegen `getComputedStyle(element).backgroundColor`.** Beim
> Bauen der Referenz habe ich beides gemischt und dabei Kontrastwerte von 1,17 gemessen, wo in
> Wirklichkeit 16,25 anstanden — die Seite sah völlig korrekt aus, nur die Messung war Unfug.
> Die Tokens am `<html>` sind die verlässliche Quelle: sie sind genau das, was die Utilities
> per `var()` einsetzen.

### Zwei dunkle Themes auseinanderhalten

Sith und Imperium sind beide dunkel und beide rot. Wenn die sich ähneln, war die ganze Mühe
umsonst. Farbe allein reicht dafür nicht — es braucht mehrere Ebenen gleichzeitig:

| | Imperium | Sith |
| --- | --- | --- |
| Grundfläche | Stahlgrau, **kein** Farbstich | Tiefschwarz mit Rotstich |
| Akzent | reines Signalrot (Hue 27) | Karmesin ins Purpur (Hue 10) |
| Form | `--radius-card: 0` | `0.125rem`, fast eckig |
| Schrift | Monospace, Versalien, weit gesperrt | Serif, normal |

Die Versalien kommen aus dem CSS, nicht aus den Komponenten:

```css
[data-academy='empire'] h1,
[data-academy='empire'] h2 { text-transform: uppercase; }
```

### `color-scheme` nicht vergessen

```css
html { color-scheme: light; }
html[data-academy='sith'],
html[data-academy='empire'] { color-scheme: dark; }
```

Ohne das bleiben Scrollbalken und Browser-Formularelemente hell, während der Rest dunkel ist.

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

## Was aus dem Dark Mode wurde

In vielen Projekten schreibst du `dark:`-Varianten, die auf die Systemeinstellung reagieren.
**Hier nicht.** Die Akademie bestimmt, ob es hell oder dunkel ist — Korriban ist immer dunkel,
Yavin IV immer warm-hell.

Das ist eine bewusste Entscheidung, keine Auslassung: Zwei unabhängige Achsen (Akademie *und*
Systemeinstellung) ergäben acht Kombinationen, die alle geprüft werden müssten. Bei einer
Lernanwendung ist das den Aufwand nicht wert.

Für ein Projekt, in dem du beides brauchst, ginge es so — der `dark:`-Präfix belegt dieselben
Tokens noch einmal:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-academy]) { --color-surface: …; --color-ink: …; }
}
```

Wichtig bleibt: **prüf es wirklich nach.** In den Chrome-Entwicklerwerkzeugen unter
Rendering → *Emulate CSS prefers-color-scheme*.

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

## Wappen als Inline-SVG statt Icon-Bibliothek

Jede Akademie hat ein Wappen. Naheliegend wäre eine Icon-Bibliothek oder eine PNG-Datei — beides
ist hier die schlechtere Wahl:

```vue
<template>
  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M32 6 L32 44" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
    …
  </svg>
</template>
```

- **`currentColor`** lässt das Wappen die Textfarbe erben. Es färbt sich also automatisch mit
  der Akademie um, ohne dass irgendwo eine Zuordnung stehen muss.
- **`aria-hidden="true"`**, weil daneben der Name als Text steht. Ein Screenreader soll nicht
  „Grafik" vorlesen und dann denselben Namen noch einmal.
- Keine Netzwerkanfrage, keine Abhängigkeit, gestochen scharf in jeder Größe.

Die Auswahl läuft über ein `Record`, nicht über eine `v-if`-Kette:

```ts
const EMBLEMS = {
  jedi: JediEmblem, sith: SithEmblem, empire: EmpireEmblem, rebels: RebelEmblem,
} as const satisfies Record<AcademyId, unknown>
```

Kommt eine fünfte Akademie dazu, ist der fehlende Eintrag ein **Compile-Fehler** statt einer
stillen Lücke in der Anzeige.

## Fotos einbinden, ohne die Lesbarkeit zu ruinieren

Jede Akademie hat ein Kopfband mit einer Weltraumaufnahme. Drei Entscheidungen dazu:

**Ein Band, kein seitenfüllender Hintergrund.** Zwei der vier Akademien sind hell. Ein dunkles
Foto hinter der ganzen Seite würde dort permanent mit dem Text kämpfen. Als abgegrenztes Band
funktioniert dasselbe Motiv in allen vier Paletten.

**Eine Abdunklung darüber**, damit weiße Schrift immer trägt:

```html
<img :src="`/backgrounds/${academy.id}.jpg`" alt="" class="h-40 w-full object-cover" />
<div class="absolute inset-0 bg-black/55"></div>
```

`alt=""` ist hier richtig und kein Versehen: Das Bild ist reine Dekoration, der Name steht als
Text daneben.

Prüfen lässt sich das gegen das **hellste Pixel** des Bildes — nicht gegen den Durchschnitt,
denn genau an der hellsten Stelle bricht der Kontrast zuerst. Zeichne das Bild verkleinert in
ein Canvas, multipliziere jeden Pixel mit `1 - 0.55` und such das Maximum. In der Referenz
liegt der schlechteste Wert bei 5,03:1.

**Bilder verkleinern.** Ein Foto direkt aus einer Bilddatenbank hat schnell mehrere Megabyte.
Auf macOS reicht das eingebaute `sips`:

```bash
sips --resampleWidth 1600 bild.jpg
sips -c 421 1600 bild.jpg                     # mittig auf Bannerformat schneiden
sips -s format jpeg -s formatOptions 55 bild.jpg --out public/backgrounds/jedi.jpg
```

Ziel: unter 200 KB je Bild. Bilder in `public/` werden von Vite **nicht** angefasst, sondern
unverändert kopiert — die Optimierung ist deine Aufgabe.

> **Rechtliches gehört dazu.** Die Bilder in der Referenz stammen aus der gemeinfreien
> NASA-Bibliothek, die Wappen sind eigene Zeichnungen. Herkunft und Urheber stehen in
> `CREDITS.md`. Fremde Logos herunterzuladen wäre der bequeme und der falsche Weg.

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

1. `src/assets/main.css` mit `@import 'tailwindcss'` und einem `@theme`-Block: die
   semantischen Tokens aus der Tabelle oben.
2. **Prüf zuerst nach**, dass `bg-brand-600` zu `var(…)` kompiliert. Alles Weitere hängt daran.
3. Vier `[data-academy='…']`-Blöcke, die dieselben Tokens neu belegen — Farbe, Radius,
   Schrift.
4. `useAcademyTheme()` schreiben und in `App.vue` aufrufen. Startwert `data-academy="jedi"`
   zusätzlich fest ins `index.html`.
5. Alle Komponenten durchgehen: feste Farben (`bg-white`, `text-slate-500`, `dark:*`) durch
   semantische Tokens ersetzen.
6. Vier Wappen als Inline-SVG, Auswahl über ein `Record<AcademyId, …>`.
7. Kopfband mit Bild und Abdunklung.
8. Kontrast messen — alle vier Akademien, Links und Statusfarben.
9. Bei 375 px Breite prüfen: nichts läuft über den Rand.

## Stolperfallen

| Symptom | Ursache |
| --- | --- |
| Farbe wirkt nicht | Klassenname zusammengebaut |
| Alles unformatiert | `@import 'tailwindcss'` fehlt oder `main.css` nicht in `main.ts` importiert |
| `tailwind.config.js` wird ignoriert | Version 4 liest sie nicht mehr |
| Farbe ändert sich beim Akademiewechsel nicht | feste Farbe statt Token, oder Token nicht im `[data-academy]`-Block überschrieben |
| Sith und Imperium sehen gleich aus | nur der Farbton unterscheidet sich — Fläche, Form und Schrift müssen mit |
| Text auf dem Kopfband kaum lesbar | Abdunklung fehlt oder zu schwach; gegen das **hellste** Pixel prüfen |
| Beim Laden blitzt kurz eine andere Palette auf | `data-academy` fehlt im `index.html` |
| Modal klebt oben links statt zentriert | `m-auto` fehlt — Tailwinds Preflight setzt `margin: 0` |
| Ganze Seite scrollt horizontal | Tabelle ohne `overflow-x-auto` |
| Zahlen springen | `tabular-nums` fehlt |

## Selbstcheck

- [ ] `bg-brand-600` und `bg-grade-3` wirken
- [ ] Anmelden als `yoda`, `bane`, `thrawn`, `organa` — vier klar verschiedene Bilder
- [ ] Sith und Imperium nebeneinander: unterscheiden sich in Fläche, Form **und** Schrift
- [ ] Alle Textfarben erreichen 4,5:1 in allen vier Akademien (gemessen, nicht geschätzt)
- [ ] Der Anmeldebildschirm zeigt beim Laden das Jedi-Design, nicht die neutrale Palette
- [ ] Eine andere Akademie anklicken schaltet sofort um
- [ ] Nach dem Abmelden bleibt das Design der zuletzt angemeldeten Akademie stehen
- [ ] Beim harten Neuladen blitzt nichts auf
- [ ] Mit Tab durch das Login-Formular: der Fokus ist überall sichtbar
- [ ] Bei 375 px Breite kein horizontales Scrollen der Seite
- [ ] `npm run build`: das CSS ist ein paar Dutzend Kilobyte, nicht mehrere hundert

## In der Referenz

- `reference/src/assets/main.css` — `@theme`, die vier Paletten, `color-scheme`
- `reference/src/composables/useAcademyTheme.ts` — die Umschaltung samt Vorschau
- `reference/index.html` — der Startwert gegen das Aufblitzen
- `reference/src/views/LoginView.vue` — die Akademiewahl als Radio-Gruppe
- `reference/src/components/emblems/` — die vier Wappen
- `reference/src/components/AcademyBanner.vue` — Kopfband mit Abdunklung
- `reference/src/components/GradeBadge.vue`, `GradeDistributionChart.vue` — die Farbzuordnungen
- `reference/src/components/base/BaseButton.vue` — Varianten als `Record`
- `reference/src/components/base/BaseTable.vue` — der scrollende Rahmen
