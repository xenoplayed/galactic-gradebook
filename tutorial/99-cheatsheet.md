# 99 — Spickzettel

Nachschlagen, nicht lesen.

---

## JavaScript

```js
const x = 1                  // Standard. Bindung fest, Objektinhalt trotzdem änderbar
let y = 2                    // nur wenn du neu zuweist

a === b                      // immer. Nie ==
wert ?? 'ersatz'             // nur bei null/undefined
wert || 'ersatz'             // auch bei 0 und '' — meist ein Bug
obj?.feld?.tiefer            // bricht bei null/undefined ab

{ ...obj, feld: neu }        // flache Kopie mit Änderung
[...arr]                     // Array-Kopie
structuredClone(obj)         // tiefe Kopie

const { a, b } = obj
const { a, ...rest } = obj
const [erste, zweite] = arr
const { a = 'standard' } = obj
```

Falsch in `if`: `false 0 -0 '' null undefined NaN`. **`[]` und `{}` sind wahr.**

### Arrays

```js
arr.map(x => …)              arr.filter(x => …)          arr.find(x => …)
arr.findIndex(x => …)        arr.some(x => …)            arr.every(x => …)
arr.includes(x)              arr.flatMap(x => …)         arr.at(-1)
arr.reduce((acc, x) => …, startwert)      // Startwert nicht vergessen
[...arr].sort((a, b) => a - b)            // Zahlen
[...arr].sort((a, b) => a.localeCompare(b, 'de'))   // deutscher Text
```

`sort` verändert das Original — immer erst kopieren.

### Objekte

```js
Object.keys/values/entries(obj)
Object.fromEntries(paare)
Object.hasOwn(obj, 'schluessel')
Object.fromEntries(liste.map(x => [x.id, x]))    // Index bauen
```

### Funktionen und async

```js
const f = (x) => x * 2
const g = (x) => ({ wert: x })     // Objekt: Klammern drum!

// Arrow-Funktion hat kein eigenes `this` — nimmt das der Schreibstelle.
[1].map(() => this.methode())      // richtig
[1].map(this.methode)              // this ist undefined

await Promise.all(ids.map(id => laden(id)))    // parallel
await Promise.allSettled(...)                  // wirft nie
for (const id of ids) await laden(id)          // nacheinander — meist falsch
```

## TypeScript

```ts
type Grade = 1 | 2 | 3 | 4 | 5
type Role = 'lecturer' | 'student'
const GRADES = [1,2,3,4,5] as const satisfies readonly Grade[]

interface Fach { id: string; name?: string; readonly ects: number }

Record<K, V>   Partial<T>   Pick<T,'a'>   Omit<T,'a'>   NonNullable<T>   ReturnType<typeof f>

// Type Guard
function isGrade(v: unknown): v is Grade { … }
arr.filter((n): n is Grade => n !== null)

// Narrowing
if (typeof x === 'string')      if (x instanceof Error)      if ('feld' in x)
if (user.role === 'student')    // Discriminated Union

// Generics
function erstes<T>(a: readonly T[]): T | undefined
function holen<T extends MitId>(a: readonly T[], id: string): T | undefined
function nurFelder<T extends object, K extends keyof T>(o: T, k: readonly K[]): Pick<T,K>

class Register<T extends MitId> {
  readonly #index: ReadonlyMap<string, T>     // # = wirklich privat
  map<R>(fn: (e: T) => R): R[] { … }          // zweiter Typparameter
}
```

`noUncheckedIndexedAccess`: `arr[0]` ist `T | undefined`. `obj[k] ?? standard`.

## Vue

```vue
<script setup lang="ts">
import { ref, computed, watch, useId, onMounted } from 'vue'

const zaehler = ref(0)                       // .value im Skript, nicht im Template
const doppelt = computed(() => zaehler.value * 2)

watch(quelle, (neu, alt) => …)
watch(() => props.id, laden, { immediate: true })   // Getter für abgeleitete Quellen!
watch(objekt, speichern, { deep: true })

const { variant = 'primary' } = defineProps<{ variant?: 'a' | 'b' }>()
const emit = defineEmits<{ save: [id: string] }>()
const model = defineModel<string>({ required: true })
const id = useId()
</script>
```

`ref` statt `reactive`. Ableiten statt mitpflegen.

```vue
{{ ausdruck }}
:attribut="wert"        @klick="fn"        v-model="x"
v-if / v-else-if / v-else        v-show
v-for="f in liste" :key="f.id"   <!-- key = ID, nie der Index -->
:class="[a, b && 'c', d ? 'e' : 'f']"      :class="{ aktiv: x }"
:style="{ height: `${p}%` }"
@submit.prevent   @click.stop   @keyup.enter
<slot />   <slot name="x" />   $slots.x
```

`v-model` ausgeschrieben:

```vue
<Komp :model-value="x" @update:model-value="v => x = v" />
```

## Router

```ts
{ path: '/f/:id', name: 'f', props: true, component: () => import('…'), meta: { role: 'lecturer' } }
{ path: '/:pathMatch(.*)*', name: 'not-found' }    // zuletzt

declare module 'vue-router' {
  interface RouteMeta { public?: boolean; role?: Role }
}

router.beforeEach((to) => {
  const auth = useAuthStore()      // INNERHALB des Guards
  if (!auth.isAuthenticated && !to.meta.public)
    return { name: 'login', query: { redirect: to.fullPath } }
  return true
})
```

```ts
const router = useRouter()   // navigieren
const route = useRoute()     // lesen
router.push({ name: 'x', params: { id } })
onBeforeRouteLeave(() => isDirty.value ? confirm('Wirklich?') : true)
```

```vue
<RouterLink :to="{ name: 'x', params: { id } }" active-class="font-medium">
<RouterView />
```

## Pinia

```ts
export const useAuthStore = defineStore('auth', () => {
  const id = ref<string | null>(null)                  // state
  const user = computed(() => …)                       // getter
  function login(u: string, p: string): boolean { … }  // action
  return { id, user, login }
})
```

```ts
const auth = useAuthStore()
const { user, isLecturer } = storeToRefs(auth)   // Werte: IMMER storeToRefs
const { login, logout } = auth                   // Funktionen: direkt
```

## Composables

```ts
export function useGradeStats(source: MaybeRefOrGetter<readonly (Grade|null)[]>) {
  const grades = computed(() => toValue(source))   // toValue = Wert/ref/Getter
  return { average: computed(() => average(grades.value)) }
}

export function useLocalStorage<T>(key: string, fallback: T): Ref<T> {
  const state = ref(gelesen ?? fallback) as Ref<T>
  watch(state, v => localStorage.setItem(key, JSON.stringify(v)), { deep: true })
  return state
}
```

Auf oberster Ebene aufrufen. `MaybeRefOrGetter` + `toValue`, sonst friert der Wert ein.

## Tailwind 4

```css
@import 'tailwindcss';

@theme {
  --color-brand-600: oklch(0.51 0.16 255);   /* erzeugt bg-brand-600, text-brand-600, … */
}
```

Keine `tailwind.config.js`. **Klassennamen nie zusammenbauen** — `bg-grade-${n}` findet
Tailwind nicht; nimm ein `Record<Grade, string>`.

```
mx-auto max-w-5xl px-4     grid gap-4 sm:grid-cols-3     flex items-center justify-between
dark:bg-slate-900          overflow-x-auto               tabular-nums    sr-only
```

## Vitest

```ts
import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()) })

expect(x).toBe(1)            .toEqual({…})       .toBeNull()      .toBeUndefined()
expect(fn).toThrow(/text/)   expect(p).resolves.toBe(1)           .rejects.toThrow()

const w = mount(Komp, { props: { … } })
await w.get('input').setValue('2')
await w.get('button').trigger('click')
await w.setProps({ modelValue: 5 })
w.emitted('update:modelValue')?.at(-1)
```

`await` vor jeder DOM-Interaktion. `await nextTick()` bevor du `watch`-Wirkungen prüfst.

## Befehle

```bash
npm run dev          # :5173, Hot Reload
npm run build        # type-check + Build nach dist/
npm run preview      # :4173, liefert dist/
npm run type-check   npm run lint   npm run format   npm run test:unit

npx @devcontainers/cli up --workspace-folder . --docker-path podman
podman build -t app:1.0 -f Containerfile .
podman run --rm -p 8080:80 app:1.0
```

## Die zwölf häufigsten Fehler

1. `.value` im Skript vergessen (oder im Template hinzugefügt)
2. Store destrukturiert ohne `storeToRefs`
3. `watch(props.id, …)` statt `watch(() => props.id, …)`
4. Kein Watcher auf den Route-Parameter → Komponente wird wiederverwendet, alte Daten bleiben
5. `:key="index"` statt `:key="item.id"`
6. `sort()` ohne vorherige Kopie
7. `reduce` ohne Startwert
8. `||` statt `??`
9. Tailwind-Klassennamen zusammengebaut
10. Prozenthöhe ohne Elternelement mit fester Höhe
11. `await` in einer Schleife statt `Promise.all`
12. Composable ohne `toValue` → Wert eingefroren
13. Zwei Portweiterleitungen im DevContainer → `localhost` geht, `127.0.0.1` hängt
