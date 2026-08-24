# 05 — Komponenten

## Ziel

Du kannst Komponenten schreiben, die Daten entgegennehmen (Props), Ereignisse melden (Emits)
und fremdes Markup aufnehmen (Slots). Am Ende stehen deine wiederverwendbaren Bausteine in
`src/components/base/`.

---

## Props: Daten hinein

```vue
<!-- StatTile.vue -->
<script setup lang="ts">
defineProps<{
  label: string
  value: string
  hint?: string        // optional
}>()
</script>

<template>
  <div>
    <p>{{ label }}</p>
    <p>{{ value }}</p>
    <p v-if="hint">{{ hint }}</p>
  </div>
</template>
```

```vue
<StatTile label="Durchschnitt" :value="formatAverage(schnitt)" />
```

Beachte den Unterschied: `label="..."` übergibt einen **String**, `:value="..."` wertet einen
**Ausdruck** aus. `:count="5"` ist die Zahl 5, `count="5"` ist der String `'5'`.

`defineProps` und die anderen `define*` sind Compiler-Makros: kein Import nötig, und sie
dürfen nur direkt in `<script setup>` stehen.

### Standardwerte

```vue
<script setup lang="ts">
const { variant = 'primary', disabled = false } = defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  disabled?: boolean
}>()
</script>
```

Destrukturieren mit Standardwert — seit Vue 3.5 bleibt die Reaktivität dabei erhalten. In
älteren Beispielen findest du stattdessen `withDefaults(defineProps<...>(), {...})`; beides
funktioniert, die kurze Form ist heute üblich.

> **Props sind schreibgeschützt.** Eine Prop im Kind zu ändern ist ein Fehler. Der Datenfluss
> geht nur in eine Richtung: hinunter über Props, hinauf über Emits. Musst du eine Prop als
> Startwert für lokalen Zustand nehmen, kopiere sie in ein eigenes `ref`.

## Emits: Ereignisse hinaus

```vue
<script setup lang="ts">
const emit = defineEmits<{
  save: [subjectId: string]
  cancel: []
}>()

function speichern() {
  emit('save', 'f01')
}
</script>
```

```vue
<GradeForm @save="handleSave" @cancel="zurueck" />
```

## `v-model` auf eigenen Komponenten

`v-model` ist nur Zucker für „Prop hinein, Ereignis hinaus“:

```vue
<BaseInput v-model="name" />

<!-- ist exakt das hier: -->
<BaseInput :model-value="name" @update:model-value="name = $event" />
```

Mit `defineModel()` schreibst du das im Kind in einer Zeile:

```vue
<script setup lang="ts">
const model = defineModel<string>({ required: true })
</script>

<template>
  <input v-model="model" />
</template>
```

`model` ist ein ganz normales `ref`: lesen mit `model.value`, schreiben mit `model.value = x`
— das Ereignis nach oben löst Vue selbst aus.

Es lohnt sich, die ausgeschriebene Form zu kennen. In
[Kapitel 10](10-dozenten-view.md) brauchst du sie, weil du den Wert beim Hineinreichen
normalisieren musst.

## Slots: Markup hinein

Props reichen Daten weiter. Slots reichen **Markup** weiter.

```vue
<!-- BaseCard.vue -->
<template>
  <section>
    <header v-if="title || $slots.header">
      <h2 v-if="title">{{ title }}</h2>
      <slot name="header" />        <!-- benannter Slot -->
    </header>
    <div class="p-5">
      <slot />                      <!-- Standard-Slot -->
    </div>
  </section>
</template>
```

```vue
<BaseCard title="Noten eintragen">
  <template #header>
    <BaseButton @click="speichern">Speichern</BaseButton>
  </template>

  <p>Beliebiger Inhalt.</p>
</BaseCard>
```

`$slots.header` prüft, ob der Slot überhaupt befüllt wurde — sonst bliebe ein leerer Kopf mit
Trennlinie stehen. Diese Prüfung ist der Unterschied zwischen einer Komponente, die man gerne
benutzt, und einer, die man umgeht.

## Attribute, die durchfallen

```vue
<BaseButton variant="ghost" @click="abmelden" class="ml-2" />
```

`variant` ist eine Prop. `@click` und `class` sind es nicht — Vue hängt sie automatisch an das
Wurzelelement der Komponente. Deshalb funktioniert `@click` auf `BaseButton`, ohne dass die
Komponente ein `click`-Emit deklariert.

Das setzt **ein** Wurzelelement voraus. Bei mehreren musst du `inheritAttrs: false` setzen und
`v-bind="$attrs"` selbst platzieren.

## Warum überhaupt Basiskomponenten

Statt

```vue
<button class="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm ...">
```

vierzig Mal im Projekt zu wiederholen:

```vue
<BaseButton>Speichern</BaseButton>
```

Der Gewinn ist nicht die Kürze, sondern dass die Entscheidung **an einer Stelle** liegt. Soll
der Fokus-Ring anders aussehen, änderst du eine Datei statt vierzig — und keine wird
vergessen.

Wo die Grenze verläuft:

- **`components/base/`** — weiß nichts über Noten. `BaseButton`, `BaseInput`, `BaseCard`,
  `BaseTable`, `BaseBadge`, `BaseSelect`, `EmptyState`. In jedem Projekt wiederverwendbar.
- **`components/`** — kennt die Fachlichkeit. `GradeInput`, `GradeBadge`,
  `GradeDistributionChart`, `StatTile`, `AppNav`.
- **`views/`** — eine ganze Seite, hängt an einer Route.

## Eine generische Komponente

```vue
<script setup lang="ts" generic="T extends string">
defineProps<{
  label: string
  options: readonly { value: T; label: string }[]
}>()

const model = defineModel<T>({ required: true })
</script>
```

`generic="..."` am `<script setup>` macht die Komponente generisch. Übergibst du Optionen vom
Typ `{ value: SubjectId }`, ist auch das `v-model`-Ziel ein `SubjectId` — kein `string`, in
den jeder beliebige Wert passt.

## Eindeutige IDs

```ts
import { useId } from 'vue'
const inputId = useId()
```

`<label for>` braucht die ID des Feldes. Eine fest vergebene ID kollidiert, sobald die
Komponente zweimal auf der Seite steht — dann zeigt das Label auf das falsche Feld. In der
Notentabelle steht `GradeInput` fünfzehnmal. `useId()` liefert pro Instanz eine eindeutige ID.

---

## Deine Aufgabe

Lege `src/components/base/` an und baue:

1. **`BaseButton.vue`** — Props `variant`, `type`, `disabled`, `block`; Standard-Slot. Die
   Klassen je Variante als `Record<Variant, string>` im Skript, nicht als `if`-Kette im
   Template.
2. **`BaseInput.vue`** — `defineModel<string>()`, Props `label`, `type`, `placeholder`,
   `error`; `useId()` für die Label-Verknüpfung; Fehlermeldung darunter.
3. **`BaseCard.vue`** — Props `title`, `subtitle`; Standard-Slot plus benannter Slot `header`.
4. **`EmptyState.vue`** — Props `title`, `description`, Slot für eine Aktion.

Baue sie in deinem Bildschirm aus Kapitel 04 ein und prüfe, dass `@click` auf `BaseButton`
funktioniert, obwohl die Komponente kein `click`-Emit deklariert.

## Stolperfallen

- Prop im Kind ändern — schreibgeschützt, kopiere sie in ein `ref`.
- Im Template `modelValue` schreiben statt `model-value`. Im Template gilt kebab-case, im
  Skript camelCase.
- Slot vergessen zu prüfen (`$slots.header`) und einen leeren Rahmen erzeugen.
- Klassennamen zur Laufzeit zusammenbauen (`bg-grade-${note}`). Tailwind findet die nie —
  mehr dazu in [Kapitel 12](12-styling-tailwind.md).

## Selbstcheck

- [ ] `BaseButton` in drei Varianten sieht unterschiedlich aus
- [ ] `v-model` auf `BaseInput` funktioniert in beide Richtungen
- [ ] `BaseCard` ohne `header`-Slot zeigt keinen leeren Kartenkopf
- [ ] Zwei `BaseInput` auf einer Seite: Klick aufs Label fokussiert das *richtige* Feld

## In der Referenz

- `reference/src/components/base/` — alle Basiskomponenten
- `reference/src/components/base/BaseSelect.vue` — die generische Variante
- `reference/src/components/base/BaseCard.vue` — `$slots.header`
