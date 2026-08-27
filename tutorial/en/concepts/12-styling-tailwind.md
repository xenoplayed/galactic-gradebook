# 12 — Styling with Tailwind CSS 4

> **Time:** about 3–4 hours · design eats time, that's normal

## Goal

You understand how Tailwind 4 is configured (in CSS), define your own design tokens — and build
**four completely different appearances that hang off a single HTML attribute**. No component
needs to know which academy it's being rendered in.

---

## Tailwind 4 is different from every tutorial you'll find

Version 4 moved configuration out of JavaScript and into CSS.

| | Tailwind 3 | Tailwind 4 |
| --- | --- | --- |
| Integration | PostCSS plugin | Vite plugin `@tailwindcss/vite` |
| Configuration | `tailwind.config.js` | `@theme` in CSS |
| Import | `@tailwind base; @tailwind components;` … | `@import "tailwindcss";` |
| Content scanning | `content: [...]` by hand | automatic |

**If you find a tutorial running `npx tailwindcss init`, it's for version 3.** There is no
`tailwind.config.js` any more.

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({ plugins: [vue(), tailwindcss()] })
```

```css
/* src/assets/main.css */
@import 'tailwindcss';
```

That was the whole setup.

## Design tokens with `@theme`

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

Everything inside `@theme` becomes **two things**: a CSS custom property *and* matching utility
classes. `--color-grade-1` automatically produces `bg-grade-1`, `text-grade-1`, `ring-grade-1`
and so on. The name prefixes (`--color-`, `--font-`, `--spacing-`) aren't decorative — they're
how Tailwind knows which utilities to generate.

**Why `oklch` instead of `#rrggbb`:** in oklch the first number is perceived lightness. Two
colours with the same first number look equally bright — which is why `grade-1` through
`grade-5` work as a series even though they run across half the colour wheel. With hex values
you'd have to adjust that by eye.

## Four themes on one attribute

This is the most interesting part of the chapter. The task: Jedi light and teal, Sith almost
black with crimson, Empire steel grey with signal red, Rebels warm and sandy. And not just the
colour — corner radius and typographic character too.

### The observation everything rests on

Look at what Tailwind actually makes of `bg-brand-600`. After `npm run build`, check the
generated CSS:

```css
.bg-brand-600 { background-color: var(--color-brand-600) }
.rounded-card { border-radius: var(--radius-card) }
```

**Tailwind doesn't insert the value, it references it.** Which means: redefine the custom
property and you change every use on the page — without touching a single class.

> That's not a detail, it's the load-bearing assumption. Verify it before you build on it:
> ```bash
> npm run build && grep -o '\.bg-brand-600{[^}]*}' dist/assets/*.css
> ```
> If a resolved colour value appeared there instead of `var(…)`, you'd need another route
> (Tailwind's `@utility` directive with an explicit `var(…)`).

### The structure

```css
@theme {
  /* neutral - applies on the sign-in screen */
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

Switching happens in a composable:

```ts
// Module-level: ONE value for the whole app (see Composables).
const previewAcademyId = ref<AcademyId>('jedi')

export function useAcademyPreview() {
  return { previewAcademyId }
}

export function useAcademyTheme(): void {
  const { academy } = storeToRefs(useAuthStore())

  // Remember the real academy as the preview after signing in - otherwise
  // signing out would be a visual jump back to Jedi.
  watch(academy, (value) => {
    if (value !== null) previewAcademyId.value = value.id
  })

  watchEffect(() => {
    document.documentElement.dataset.academy = academy.value?.id ?? previewAcademyId.value
  })
}
```

One call in `App.vue` and that's it. `watchEffect` rather than `watch`, because the
dependencies are obvious and the first run should happen immediately.

**The attribute is never removed.** Signed in, the real academy applies; otherwise the
preselected one — which is why the sign-in screen already shows a complete design instead of
staying neutral. The values in the `@theme` block are now only a fallback.

### The flash on load

A detail you only see once you look for it: between the HTML being displayed and the moment Vue
is mounted and sets `data-academy`, a few milliseconds pass. During those the neutral palette
applies — a brief flash.

The fix isn't in JavaScript, it's in the HTML:

```html
<html lang="en" data-academy="jedi">
```

That sets the palette before the first line of JavaScript runs. Sites with dark mode use the
same pattern to avoid exactly this flicker.

### Semantic tokens instead of colour names

For this to hold, components must no longer name **concrete colours**. Instead of

```html
<div class="bg-white ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
```

it becomes

```html
<div class="bg-surface ring-line">
```

The gain is twofold: it works across four palettes, **and** the `dark:` variants disappear. The
academy decides whether it's light or dark — not the system setting.

The set of tokens you need:

| Token | For |
| --- | --- |
| `--color-surface`, `--color-surface-2` | cards and page background |
| `--color-ink`, `--color-ink-soft` | text and muted text |
| `--color-line` | borders and separators |
| `--color-brand-*` | the brand colour, carries **white** text |
| `--color-link` | text colour for links |
| `--color-ok`, `--color-warn` | status colours |
| `--radius-card`, `--font-display` | shape and typographic character |

### Why `--color-link` has to be separate from `--color-brand-600`

It looks like duplication, but it's the point where I fell flat on my face building the
reference. `brand-600` has to do two incompatible things:

1. work as a **surface** under white text (buttons) → must be dark enough
2. be readable as **text** on the surface (links) → must be light enough

On Korriban's almost black background, `text-brand-600` reached a mere **2.89:1**. The
requirement is 4.5:1. With a separate, much lighter `--color-link` it's **7.86:1**.

Measure that instead of guessing. In the devtools console:

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

The detour through canvas is necessary because modern browsers return `oklch()` as such —
parsing a colour "by hand" fails on that.

> **Measure against the tokens, not against `getComputedStyle(element).backgroundColor`.**
> Building the reference I mixed the two and measured contrast values of 1.17 where the truth
> was 16.25 — the page looked entirely correct, only the measurement was nonsense. The tokens
> on `<html>` are the reliable source: they are exactly what the utilities insert via `var()`.

### Telling two dark themes apart

Sith and Empire are both dark and both red. If they resemble each other, the whole effort was
wasted. Colour alone isn't enough — it takes several layers at once:

| | Empire | Sith |
| --- | --- | --- |
| Surface | steel grey, **no** colour cast | deep black with a red cast |
| Accent | pure signal red (hue 27) | crimson towards purple (hue 10) |
| Shape | `--radius-card: 0` | `0.125rem`, almost square |
| Type | monospace, uppercase, widely tracked | serif, normal |

The uppercase comes from the CSS, not from the components:

```css
[data-academy='empire'] h1,
[data-academy='empire'] h2 { text-transform: uppercase; }
```

### Don't forget `color-scheme`

```css
html { color-scheme: light; }
html[data-academy='sith'],
html[data-academy='empire'] { color-scheme: dark; }
```

Without it, scrollbars and browser form controls stay light while the rest is dark.

## Utilities or components?

Tailwind writes style straight into the markup:

```vue
<button class="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium">
```

That takes getting used to and still works, because you **don't repeat it**. Reuse happens at
the component level, not the CSS level:

```vue
<BaseButton variant="primary">Save</BaseButton>
```

> **Not what you're used to**
> The temptation to use `@apply` and build a `.btn` class is strong. That puts you back where
> classic CSS left you: two places where style lives, and the question of which wins. Use
> `@apply` only for genuine basics (`body`, focus rings) and make components otherwise.

## Class names must not be assembled

```vue
<!-- DOES NOT WORK -->
<span :class="`bg-grade-${grade}`">
```

Tailwind scans your source for **complete strings** that look like class names.
`bg-grade-${grade}` appears nowhere as such, so Tailwind never generates the rule — the class
lands in the HTML but doesn't exist in the CSS. No error, no warning, just an uncoloured area.

The right way is a spelled-out mapping:

```ts
const GRADE_CLASSES: Record<Grade, string> = {
  1: 'bg-grade-1 text-white',
  2: 'bg-grade-2 text-white',
  3: 'bg-grade-3 text-ink',
  4: 'bg-grade-4 text-white',
  5: 'bg-grade-5 text-white',
}
```

This rule applies to **all** utilities, not just colours: `w-${n}`, `mt-${x}` — none of it
works.

## `:class` in Vue

```vue
<div :class="['always-there', active && 'active', error ? 'red' : 'grey']">
<div :class="{ active: isActive }">
<div class="rounded-lg" :class="VARIANT_CLASSES[variant]">
```

A static `class` and a dynamic `:class` on the same element are merged by Vue. That's the usual
pattern for base components: the shared part static, the variable part dynamic.

`false`, `null` and `undefined` in an array are dropped — which is why `active && 'active'`
works.

## What became of dark mode

In many projects you write `dark:` variants that react to the system setting. **Not here.** The
academy decides light or dark — Korriban is always dark, Yavin IV always warm and light.

That's a deliberate decision, not an omission: two independent axes (academy *and* system
setting) would give eight combinations, all of which would need checking. For a learning app
that isn't worth the effort.

For a project where you need both, it would go like this — the `dark:` prefix redefines the
same tokens once more:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-academy]) { --color-surface: …; --color-ink: …; }
}
```

What stays important: **actually check it.** In Chrome devtools under Rendering → *Emulate CSS
prefers-color-scheme*.

## Accessibility in passing

```css
:focus-visible {
  @apply outline-2 outline-offset-2 outline-brand-500;
}
```

The browser's default focus ring is cleared away by many resets. Without a replacement the app
is unusable by keyboard — you can't see where you are. `:focus-visible` shows it only for
keyboard navigation, not on mouse clicks.

Other things needed here:

- `sr-only` — visible to screen readers, not visually. For column headers without text.
- `tabular-nums` — digits of equal width. Otherwise numeric columns jump around.
- `aria-invalid`, `aria-describedby` on fields in error.
- Contrast: `text-slate-400` on white is too weak for body text.

## Crests as inline SVG rather than an icon library

Each academy has a crest. An icon library or a PNG would be the obvious choice — and both are
worse here:

```vue
<template>
  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M32 6 L32 44" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
    …
  </svg>
</template>
```

- **`currentColor`** lets the crest inherit the text colour. So it recolours with the academy
  automatically, without a mapping anywhere.
- **`aria-hidden="true"`**, because the name is right next to it as text. A screen reader
  shouldn't announce "image" and then the same name again.
- No network request, no dependency, crisp at any size.

Selection goes through a `Record`, not a `v-if` chain:

```ts
const EMBLEMS = {
  jedi: JediEmblem, sith: SithEmblem, empire: EmpireEmblem, rebels: RebelEmblem,
} as const satisfies Record<AcademyId, unknown>
```

Add a fifth academy and the missing entry is a **compile error** instead of a silent gap in the
display.

## Embedding photos without ruining readability

Each academy has a header band with a space photograph. Three decisions about it:

**A band, not a full-page background.** Two of the four academies are light. A dark photo behind
the whole page would fight the text there permanently. As a bounded band the same image works
in all four palettes.

**A darkening layer on top**, so white text always carries:

```html
<img :src="`/backgrounds/${academyId}.jpg`" alt="" class="h-40 w-full object-cover" />
<div class="absolute inset-0 bg-black/55"></div>
```

`alt=""` is right here and not an oversight: the image is pure decoration, the name is right
there as text.

You can check this against the **brightest pixel** of the image — not the average, because
contrast breaks at the brightest spot first. Draw the image scaled down into a canvas, multiply
every pixel by `1 - 0.55` and find the maximum. In the reference the worst value is 5.03:1.

**Shrink the images.** A photo straight from a picture library is quickly several megabytes. On
macOS the built-in `sips` is enough:

```bash
sips --resampleWidth 1600 image.jpg
sips -c 421 1600 image.jpg                     # centre-crop to banner format
sips -s format jpeg -s formatOptions 55 image.jpg --out public/backgrounds/jedi.jpg
```

Target: under 200 KB per image. Files in `public/` are **not** touched by Vite, just copied —
the optimisation is your job.

> **The legal side is part of it.** The images in the reference come from NASA's public domain
> library, the crests are original drawings. Sources and credits are in `CREDITS.md`.
> Downloading someone else's logos would be the convenient and the wrong route.

## Layout: the three tools that suffice

```vue
<div class="mx-auto max-w-5xl px-4 py-8">        <!-- centred content area -->
<div class="grid gap-4 sm:grid-cols-3">          <!-- cards, stacked on mobile -->
<div class="flex items-center justify-between">  <!-- a row with space between -->
```

Breakpoints apply **from** that size upwards: `sm:grid-cols-3` means "three columns from 640 px
on". Tailwind is mobile-first — the default applies to small screens.

For the assessment table:

```vue
<div class="-mx-5 overflow-x-auto px-5">
  <table class="w-full min-w-lg">
```

The table scrolls **within itself** instead of making the whole page wide. The negative `-mx-5`
against the `px-5` lets the scroll area run to the card edge while the content stays inset.

---

## Your task

1. `src/assets/main.css` with `@import 'tailwindcss'` and an `@theme` block: the semantic
   tokens from the table above.
2. **Check first** that `bg-brand-600` compiles to `var(…)`. Everything else depends on it.
3. Four `[data-academy='…']` blocks that redefine the same tokens — colour, radius, type.
4. Write `useAcademyTheme()` and call it in `App.vue`. Also put the starting value
   `data-academy="jedi"` into `index.html`.
5. Go through all components: replace fixed colours (`bg-white`, `text-slate-500`, `dark:*`)
   with semantic tokens.
6. Four crests as inline SVG, selected through a `Record<AcademyId, …>`.
7. The header band with image and darkening layer.
8. Measure contrast — all four academies, links and status colours.
9. Check at 375 px width: nothing overflows.

## Pitfalls

| Symptom | Cause |
| --- | --- |
| A colour has no effect | class name assembled at runtime |
| Everything unstyled | `@import 'tailwindcss'` missing, or `main.css` not imported in `main.ts` |
| `tailwind.config.js` is ignored | version 4 no longer reads it |
| Colour doesn't change when switching academies | fixed colour instead of token, or token not overridden in the `[data-academy]` block |
| Sith and Empire look the same | only the hue differs — surface, shape and type have to differ too |
| Text on the header band barely readable | darkening missing or too weak; check against the **brightest** pixel |
| A different palette flashes on load | `data-academy` missing in `index.html` |
| Modal sticks to the top left instead of centred | `m-auto` missing — Tailwind's preflight sets `margin: 0` |
| The whole page scrolls horizontally | table without `overflow-x-auto` |
| Numbers jump around | `tabular-nums` missing |

## Self-check

- [ ] `bg-brand-600` and `bg-grade-3` take effect
- [ ] Signing in as `yoda`, `bane`, `thrawn`, `organa` — four clearly different looks
- [ ] Sith and Empire side by side: they differ in surface, shape **and** type
- [ ] Every text colour reaches 4.5:1 in all four academies (measured, not guessed)
- [ ] On load the sign-in screen shows the Jedi design, not the neutral palette
- [ ] Clicking another academy switches immediately
- [ ] After signing out, the design of the last academy stays
- [ ] A hard reload flashes nothing
- [ ] Tabbing through the sign-in form: the focus is visible everywhere
- [ ] At 375 px width the page doesn't scroll horizontally
- [ ] `npm run build`: the CSS is a few dozen kilobytes, not several hundred

## In the reference

- `reference/src/assets/main.css` — `@theme`, the four palettes, `color-scheme`
- `reference/src/composables/useAcademyTheme.ts` — the switching plus preview
- `reference/index.html` — the starting value against the flash
- `reference/src/views/LoginView.vue` — the academy picker as a radio group
- `reference/src/components/emblems/` — the four crests
- `reference/src/components/AcademyBanner.vue` — header band with darkening
- `reference/src/components/GradeBadge.vue`, `GradeDistributionChart.vue` — the colour mappings
- `reference/src/components/base/BaseButton.vue` — variants as a `Record`
- `reference/src/components/base/BaseTable.vue` — the scrolling frame
