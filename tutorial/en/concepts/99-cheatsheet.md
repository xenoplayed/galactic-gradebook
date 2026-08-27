# 99 — Cheat sheet

For looking things up, not for reading.

---

## JavaScript

```js
const x = 1                  // the default. Binding fixed, object contents still mutable
let y = 2                    // only when you reassign

a === b                      // always. Never ==
value ?? 'fallback'          // only for null/undefined
value || 'fallback'          // also for 0 and '' — usually a bug
obj?.field?.deeper           // bails out on null/undefined

{ ...obj, field: next }      // shallow copy with a change
[...arr]                     // array copy
structuredClone(obj)         // deep copy

const { a, b } = obj
const { a, ...rest } = obj
const [first, second] = arr
const { a = 'default' } = obj
```

Falsy in `if`: `false 0 -0 '' null undefined NaN`. **`[]` and `{}` are truthy.**

### Arrays

```js
arr.map(x => …)              arr.filter(x => …)          arr.find(x => …)
arr.findIndex(x => …)        arr.some(x => …)            arr.every(x => …)
arr.includes(x)              arr.flatMap(x => …)         arr.at(-1)
arr.reduce((acc, x) => …, initialValue)   // don't forget the initial value
[...arr].sort((a, b) => a - b)            // numbers
[...arr].sort((a, b) => a.localeCompare(b, locale))   // text, per language
```

`sort` mutates the original — always copy first.

### Objects

```js
Object.keys/values/entries(obj)
Object.fromEntries(pairs)
Object.hasOwn(obj, 'key')
Object.fromEntries(list.map(x => [x.id, x]))    // build an index
```

### Functions and async

```js
const f = (x) => x * 2
const g = (x) => ({ value: x })    // object: wrap in parentheses!

// An arrow function has no `this` of its own — it takes the one where it's written.
[1].map(() => this.method())       // right
[1].map(this.method)               // this is undefined

await Promise.all(ids.map(id => load(id)))     // parallel
await Promise.allSettled(...)                  // never throws
for (const id of ids) await load(id)           // sequential — usually wrong
```

## TypeScript

```ts
type Grade = 1 | 2 | 3 | 4 | 5
type Role = 'lecturer' | 'student'
const GRADES = [1,2,3,4,5] as const satisfies readonly Grade[]

interface Subject { id: string; name?: string; readonly ects: number }

Record<K, V>   Partial<T>   Pick<T,'a'>   Omit<T,'a'>   NonNullable<T>   ReturnType<typeof f>

// Type guard
function isGrade(v: unknown): v is Grade { … }
arr.filter((n): n is Grade => n !== null)

// Narrowing
if (typeof x === 'string')      if (x instanceof Error)      if ('field' in x)
if (user.role === 'student')    // discriminated union

// Generics
function first<T>(a: readonly T[]): T | undefined
function get<T extends WithId>(a: readonly T[], id: string): T | undefined
function onlyFields<T extends object, K extends keyof T>(o: T, k: readonly K[]): Pick<T,K>

class Registry<T extends WithId> {
  readonly #index: ReadonlyMap<string, T>     // # = genuinely private
  map<R>(fn: (e: T) => R): R[] { … }          // a second type parameter
}
```

`noUncheckedIndexedAccess`: `arr[0]` is `T | undefined`. `obj[k] ?? fallback`.

## Vue

```vue
<script setup lang="ts">
import { ref, computed, watch, useId, onMounted } from 'vue'

const counter = ref(0)                       // .value in the script, not in the template
const doubled = computed(() => counter.value * 2)

watch(source, (next, prev) => …)
watch(() => props.id, load, { immediate: true })   // a getter for derived sources!
watch(object, save, { deep: true })

const { variant = 'primary' } = defineProps<{ variant?: 'a' | 'b' }>()
const emit = defineEmits<{ save: [id: string] }>()
const model = defineModel<string>({ required: true })
const id = useId()
</script>
```

`ref` rather than `reactive`. Derive instead of maintaining.

```vue
{{ expression }}
:attribute="value"      @click="fn"        v-model="x"
v-if / v-else-if / v-else        v-show
v-for="s in list" :key="s.id"    <!-- key = ID, never the index -->
:class="[a, b && 'c', d ? 'e' : 'f']"      :class="{ active: x }"
:style="{ height: `${p}%` }"
@submit.prevent   @click.stop   @keyup.enter
<slot />   <slot name="x" />   $slots.x
```

`v-model` spelled out:

```vue
<Comp :model-value="x" @update:model-value="v => x = v" />
```

### Modal without a library

```vue
<dialog ref="d" @close="open = false" @click.self="open = false" class="m-auto backdrop:bg-black/60">
```
`showModal()` gives you a focus trap, Escape and the backdrop. `@close` is mandatory (Escape
closes natively), `m-auto` too (preflight kills the UA centring). jsdom doesn't know
`showModal` → stand-in in `vitest.setup.ts`.

### State in a composable: own or shared?

```ts
export function useX() { const s = ref(0); … }   // ref INSIDE  -> own per call
const shared = ref(0)                            // ref OUTSIDE -> everyone shares it
export function useY() { return { shared } }
```

## Router

```ts
{ path: '/s/:id', name: 's', props: true, component: () => import('…'), meta: { role: 'lecturer' } }
{ path: '/:pathMatch(.*)*', name: 'not-found' }    // last

declare module 'vue-router' {
  interface RouteMeta { public?: boolean; role?: Role }
}

router.beforeEach((to) => {
  const auth = useAuthStore()      // INSIDE the guard
  if (!auth.isAuthenticated && !to.meta.public)
    return { name: 'login', query: { redirect: to.fullPath } }
  return true
})
```

```ts
const router = useRouter()   // to navigate
const route = useRoute()     // to read
router.push({ name: 'x', params: { id } })
onBeforeRouteLeave(() => isDirty.value ? confirm('Really?') : true)
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
const { user, isLecturer } = storeToRefs(auth)   // values: ALWAYS storeToRefs
const { login, logout } = auth                   // functions: directly
```

## Composables

```ts
export function useGradeStats(source: MaybeRefOrGetter<readonly (Grade|null)[]>) {
  const grades = computed(() => toValue(source))   // toValue = value/ref/getter
  return { average: computed(() => average(grades.value)) }
}

export function useLocalStorage<T>(key: string, fallback: T): Ref<T> {
  const state = ref(stored ?? fallback) as Ref<T>
  watch(state, v => localStorage.setItem(key, JSON.stringify(v)), { deep: true })
  return state
}
```

Call at the top level. `MaybeRefOrGetter` + `toValue`, otherwise the value freezes.

## Tailwind 4

```css
@import 'tailwindcss';

@theme {
  --color-brand-600: oklch(0.51 0.16 255);   /* produces bg-brand-600, text-brand-600, … */
}
```

Themes through one attribute, without touching a component:

```css
[data-academy='sith'] { --color-brand-600: …; --radius-card: 0.125rem; }
```
```ts
document.documentElement.dataset.academy = 'sith'
```
Works because Tailwind emits `bg-brand-600` as `var(--color-brand-600)` — verify with
`grep -o '\.bg-brand-600{[^}]*}' dist/assets/*.css`.

No `tailwind.config.js`. **Never assemble class names** — Tailwind won't find
`bg-grade-${n}`; use a `Record<Grade, string>`.

```
mx-auto max-w-5xl px-4     grid gap-4 sm:grid-cols-3     flex items-center justify-between
bg-surface text-ink        overflow-x-auto               tabular-nums    sr-only
```

## Internationalisation (vue-i18n)

```ts
// Find files, don't list them - a new language is ONE file
const modules = import.meta.glob('./locales/*.json', { eager: true })
```
```jsonc
{ "_name": "English",                        // display name IN the file
  "academies": { "sith": { "subjectLabel": "Teaching | Teachings" } } }
```
```ts
t('academies.sith.subjectLabel', 6)   // "Teachings" - plural rule per language
document.documentElement.lang = 'en'  // screen-reader pronunciation
```
`<q>{{ motto }}</q>` instead of hard-coded quotation marks. A test compares the key sets of
all locale files and names the missing ones.

## Vitest

```ts
import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()) })

expect(x).toBe(1)            .toEqual({…})       .toBeNull()      .toBeUndefined()
expect(fn).toThrow(/text/)   expect(p).resolves.toBe(1)           .rejects.toThrow()

const w = mount(Comp, { props: { … } })
await w.get('input').setValue('2')
await w.get('button').trigger('click')
await w.setProps({ modelValue: 5 })
w.emitted('update:modelValue')?.at(-1)
```

`await` before every DOM interaction. `await nextTick()` before checking `watch` effects.

## Commands

```bash
npm run dev          # :5173, hot reload
npm run build        # type-check + build into dist/
npm run preview      # :4173, serves dist/
npm run type-check   npm run lint   npm run format   npm run test:unit

npx @devcontainers/cli up --workspace-folder . --docker-path podman
podman build -t app:1.0 -f Containerfile .
podman run --rm -p 8080:80 app:1.0
```

## The most common mistakes

1. Forgetting `.value` in the script (or adding it in the template)
2. Destructuring a store without `storeToRefs`
3. `watch(props.id, …)` instead of `watch(() => props.id, …)`
4. No watcher on the route param → the component is reused, old data stays
5. `:key="index"` instead of `:key="item.id"`
6. `sort()` without copying first
7. `reduce` without an initial value
8. `||` instead of `??`
9. Assembled Tailwind class names
10. A percentage height without a parent of fixed height
11. `await` in a loop instead of `Promise.all`
12. A composable without `toValue` → the value freezes
13. Two port forwards in the dev container → `localhost` works, `127.0.0.1` hangs
14. Looking up an identifier from the URL unchecked → foreign data becomes visible
15. Contrast guessed instead of measured → text fails on a dark background
16. Forgetting `@close` on the `<dialog>` → it won't reopen after Escape
17. A `ref` outside the function where own state was meant → values outlive the page
18. Building plurals by appending a letter → German "Lehre" becomes "Lehree"; put both forms
    in the locale file (`"Teaching | Teachings"`) and call `t(key, n)`
19. Listing locale files in code instead of finding them → the new language is missing
