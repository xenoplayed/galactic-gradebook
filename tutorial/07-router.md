# 07 — Vue Router

## Ziel

Deine App bekommt echte Adressen: `/login`, `/dozent/faecher`, `/student/noten/f03`. Ein
Guard sorgt dafür, dass niemand ohne Anmeldung oder mit der falschen Rolle irgendwo landet,
wo er nichts zu suchen hat.

---

## Was der Router tut

Eine SPA lädt **eine** HTML-Seite. Der Router entscheidet anhand der URL, welche Komponente in
`<RouterView />` gerendert wird — ohne dass der Browser neu lädt.

```
/login                    -> LoginView
/dozent/faecher           -> SubjectListView
/dozent/faecher/f03       -> GradeEntryView (subjectId = 'f03')
/student/noten            -> DashboardView
```

## Routen definieren

```ts
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/dozent/faecher/:subjectId',
      name: 'lecturer-grade-entry',
      props: true,
      component: () => import('@/views/lecturer/GradeEntryView.vue'),
      meta: { role: 'lecturer' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { public: true },
    },
  ],
})

export default router
```

Vier Dinge daran:

**`component: () => import(...)`** statt eines normalen Imports. Das ist Lazy Loading: Vite
schnürt jede View in ein eigenes Paket, das erst geladen wird, wenn jemand die Route
aufruft. Beim `npm run build` siehst du das an den vielen kleinen Dateien in `dist/assets/`.

**`name`** — verlinke immer über den Namen, nie über den Pfad:

```vue
<RouterLink :to="{ name: 'lecturer-grade-entry', params: { subjectId: fach.id } }">
```

Ändert sich später der Pfad, musst du genau eine Stelle anfassen. Mit
`:to="`/dozent/faecher/${fach.id}`"` suchst du sie überall.

**`props: true`** reicht die Route-Parameter als Props in die Komponente:

```vue
<script setup lang="ts">
const props = defineProps<{ subjectId: string }>()
</script>
```

Ohne das müsste die View `useRoute()` aufrufen und wäre an den Router gekettet — im Test
müsstest du einen ganzen Router aufbauen, nur um eine Komponente zu mounten. Mit `props: true`
ist sie eine gewöhnliche Komponente mit einer Prop.

**`/:pathMatch(.*)*`** fängt alles ab, was auf keine Route passt. Muss zuletzt stehen.

## `meta` typisieren

`meta` ist standardmäßig ein beliebiges Objekt — Tippfehler fallen nicht auf. Das lässt sich
reparieren:

```ts
declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    role?: Role
  }
}
```

Das ist **Declaration Merging**: TypeScript erlaubt, ein `interface` aus einem fremden Modul zu
erweitern. Ab hier ist `meta: { rolle: 'lecturer' }` ein Compile-Fehler statt eines stillen
Bugs, der erst auffällt, wenn jemand an der falschen Stelle hereinspaziert.

## Navigation Guards

```ts
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    if (to.meta.public) return true
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const role = auth.role!

  if (to.name === 'login' || to.name === 'home') {
    return homeRouteFor(role)
  }

  if (to.meta.role !== undefined && to.meta.role !== role) {
    return homeRouteFor(role)
  }

  return true
})
```

Rückgabewerte: `true` (oder nichts) lässt durch, `false` bricht ab, ein Route-Objekt leitet um.

**Ein globaler Guard statt `beforeEnter` je Route.** Die Regel „angemeldet sein und die
passende Rolle haben“ gilt für alles. Wiederholtest du sie pro Route, wäre die Route, die du
zu ergänzen vergisst, ungeschützt — und das merkst du nie beim Testen der Routen, die du
ergänzt hast.

> **Stolperfalle:** `useAuthStore()` muss **innerhalb** des Guards stehen. Beim Import des
> Router-Moduls existiert die Pinia-Instanz noch nicht; ein Aufruf auf oberster Ebene wirft
> „getActivePinia() was called but there was no active Pinia“.

Der `redirect`-Parameter merkt sich das ursprüngliche Ziel:

```ts
const redirect = route.query.redirect
if (typeof redirect === 'string' && redirect.startsWith('/')) {
  router.push(redirect)
}
```

Die Prüfung auf `startsWith('/')` gehört dazu. Ein Query-Parameter kommt aus der URL und ist
von außen beeinflussbar — ohne Prüfung ließe sich jemand über einen präparierten Link nach dem
Anmelden auf eine fremde Adresse schicken (eine offene Weiterleitung).

## Navigieren

```vue
<RouterLink :to="{ name: 'student-dashboard' }">Meine Noten</RouterLink>
<RouterLink :to="..." active-class="font-medium">…</RouterLink>
```

```ts
const router = useRouter()   // navigieren
const route = useRoute()     // aktuelle Route lesen

router.push({ name: 'login' })    // Eintrag in der Historie
router.replace({ name: 'login' }) // ersetzt den aktuellen Eintrag
router.back()

route.params.subjectId
route.query.redirect
```

`useRouter` und `useRoute` musst du auf oberster Ebene von `<script setup>` aufrufen, nicht in
einem Callback.

## Guards an einer Komponente

```ts
import { onBeforeRouteLeave } from 'vue-router'

onBeforeRouteLeave(() => {
  if (!isDirty.value) return true
  return window.confirm('Es gibt ungespeicherte Noten. Seite trotzdem verlassen?')
})
```

Das brauchst du in [Kapitel 10](10-dozenten-view.md): wer 15 Noten eingetragen und nicht
gespeichert hat, soll nicht mit einem Fehlklick alles verlieren. Der Guard hängt an der
Komponente und verschwindet mit ihr.

## Der Rahmen

```vue
<!-- App.vue -->
<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNav from '@/components/AppNav.vue'
</script>

<template>
  <div class="min-h-dvh">
    <AppNav />
    <main class="mx-auto max-w-5xl px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>
```

Was auf jeder Seite gleich ist (Navigation, Rahmen), steht in `App.vue`. Was sich ändert,
rendert `<RouterView />`.

---

## Deine Aufgabe

1. `src/router/index.ts` mit allen Routen: `login`, `home` (leitet weiter), die beiden
   Dozenten-Routen, die beiden Studierenden-Routen, `not-found`.
2. `meta` per Declaration Merging typisieren.
3. `beforeEach`-Guard schreiben (der Auth-Store kommt in Kapitel 08 — bis dahin kannst du mit
   einem hartcodierten `const role = 'lecturer'` arbeiten).
4. `App.vue` auf `<RouterView />` und `AppNav` umbauen.
5. Platzhalter-Views anlegen, die erst mal nur ihren Namen anzeigen.

## Stolperfallen

| Symptom | Ursache |
| --- | --- |
| „no active Pinia“ | Store außerhalb des Guards geholt |
| Endlosschleife beim Umleiten | Guard leitet auf eine Route um, die er selbst wieder umleitet — die Ausnahme für `public`/`login` fehlt |
| Route-Parameter ist `undefined` | `props: true` vergessen |
| Direkter URL-Aufruf ergibt 404 im Produktivbetrieb | Server-Konfiguration, siehe [Kapitel 14](14-build-deployment.md) |
| Ansicht ändert sich beim Fachwechsel nicht | Komponente wird wiederverwendet — Watcher auf den Parameter nötig, siehe Kapitel 10 |

## Selbstcheck

- [ ] Direkter Aufruf von `/dozent/faecher/f03` zeigt die richtige View
- [ ] Ohne Anmeldung landest du auf `/login?redirect=/dozent/faecher/f03`
- [ ] `/gibtsnicht` zeigt die 404-View
- [ ] `npm run build` erzeugt mehrere Dateien in `dist/assets/` (Lazy Loading wirkt)

## In der Referenz

- `reference/src/router/index.ts` — Routen, typisiertes `meta`, Guard, `homeRouteFor`
- `reference/src/App.vue`, `reference/src/components/AppNav.vue`
- `reference/src/views/LoginView.vue` — Umgang mit `redirect`
- `reference/src/views/lecturer/GradeEntryView.vue` — `onBeforeRouteLeave`
