# 07 — Vue Router

> **Time:** about 1.5–2 hours

## Goal

Your app gets real addresses: `/login`, `/lecturer/subjects`, `/student/grades/f03`. A guard makes
sure nobody without a sign-in, or with the wrong role, ends up somewhere they have no business
being.

---

## What the router does

An SPA loads **one** HTML page. Based on the URL, the router decides which component is
rendered inside `<RouterView />` — without the browser reloading.

```
/login                       -> LoginView
/lecturer/subjects           -> SubjectListView
/lecturer/subjects/f03       -> GradeEntryView (subjectId = 'f03')
/student/grades              -> DashboardView
```

## Defining routes

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
      path: '/lecturer/subjects/:subjectId',
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

Four things about that:

**`component: () => import(...)`** instead of a normal import. That's lazy loading: Vite bundles
every view into its own chunk, loaded only when someone visits the route. You'll see it in
`npm run build` as the many small files in `dist/assets/`.

**`name`** — always link by name, never by path:

```vue
<RouterLink :to="{ name: 'lecturer-grade-entry', params: { subjectId: subject.id } }">
```

If the path changes later, you touch exactly one place. With
`:to="`/lecturer/subjects/${subject.id}`"` you'd be hunting everywhere.

**`props: true`** passes the route params into the component as props:

```vue
<script setup lang="ts">
const props = defineProps<{ subjectId: string }>()
</script>
```

Without it the view would have to call `useRoute()` and be chained to the router — in a test
you'd have to build a whole router just to mount a component. With `props: true` it's an
ordinary component with a prop.

**`/:pathMatch(.*)*`** catches everything that matches no route. Must come last.

## Typing `meta`

By default `meta` is an arbitrary object — typos go unnoticed. That can be fixed:

```ts
declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    role?: Role
  }
}
```

This is **declaration merging**: TypeScript lets you extend an `interface` from a foreign
module. From here on `meta: { rolle: 'lecturer' }` is a compile error instead of a silent bug
that only shows up when somebody walks in where they shouldn't.

## Navigation guards

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

Return values: `true` (or nothing) lets it through, `false` aborts, a route object redirects.

**One global guard instead of `beforeEnter` per route.** The rule "be signed in and have the
matching role" applies to everything. If you repeated it per route, the route you forget to add
it to would be unprotected — and you'd never notice while testing the routes you did add it to.

> **Pitfall:** `useAuthStore()` must be **inside** the guard. When the router module is
> imported, the Pinia instance doesn't exist yet; a top-level call throws "getActivePinia() was
> called but there was no active Pinia".

The `redirect` parameter remembers the original destination:

```ts
const redirect = route.query.redirect
if (typeof redirect === 'string' && redirect.startsWith('/')) {
  router.push(redirect)
}
```

The `startsWith('/')` check is part of it. A query parameter comes from the URL and can be
influenced from outside — without the check, a crafted link could send someone to a foreign
address after signing in (an open redirect).

## Navigating

```vue
<RouterLink :to="{ name: 'student-dashboard' }">My assessments</RouterLink>
<RouterLink :to="..." active-class="font-medium">…</RouterLink>
```

```ts
const router = useRouter()   // to navigate
const route = useRoute()     // to read the current route

router.push({ name: 'login' })    // adds a history entry
router.replace({ name: 'login' }) // replaces the current entry
router.back()

route.params.subjectId
route.query.redirect
```

`useRouter` and `useRoute` must be called at the top level of `<script setup>`, not inside a
callback.

## Guards on a component

```ts
import { onBeforeRouteLeave } from 'vue-router'

onBeforeRouteLeave(() => {
  if (!isDirty.value) return true
  return window.confirm('There are unsaved assessments. Leave the page anyway?')
})
```

You'll need this in [The instructor view](10-instructor-view.md): someone who entered ten
assessments and didn't save shouldn't lose everything to a stray click. The guard hangs off the
component and disappears with it.

## The shell

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

Whatever is the same on every page (navigation, frame) lives in `App.vue`. Whatever changes is
rendered by `<RouterView />`.

---

## Your task

1. `src/router/index.ts` with all routes: `login`, `home` (which redirects), the two instructor
   routes, the two trainee routes, `not-found`.
2. Type `meta` via declaration merging.
3. Write the `beforeEach` guard (the auth store arrives in [Pinia](08-pinia.md) — until then
   you can work with a hard-coded `const role = 'lecturer'`).
4. Rebuild `App.vue` around `<RouterView />` and `AppNav`.
5. Create placeholder views that just display their name for now.

## Pitfalls

| Symptom | Cause |
| --- | --- |
| "no active Pinia" | store fetched outside the guard |
| Infinite redirect loop | the guard redirects to a route it redirects again — the exception for `public`/`login` is missing |
| Route param is `undefined` | forgot `props: true` |
| Direct URL gives a 404 in production | server configuration, see [Build and deployment](14-build-deployment.md) |
| View doesn't change when switching subjects | the component is reused — you need a watcher on the param, see [The instructor view](10-instructor-view.md) |

## Self-check

- [ ] Visiting `/lecturer/subjects/f03` directly shows the right view
- [ ] Without signing in you land on `/login?redirect=/lecturer/subjects/f03`
- [ ] `/does-not-exist` shows the 404 view
- [ ] `npm run build` produces several files in `dist/assets/` (lazy loading works)

## In the reference

- `reference/src/router/index.ts` — routes, typed `meta`, guard, `homeRouteFor`
- `reference/src/App.vue`, `reference/src/components/AppNav.vue`
- `reference/src/views/LoginView.vue` — handling `redirect`
- `reference/src/views/lecturer/GradeEntryView.vue` — `onBeforeRouteLeave`
