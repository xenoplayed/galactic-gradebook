import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/types/domain'

/**
 * Declaration Merging: TypeScript erlaubt, ein Interface aus einem fremden
 * Modul zu erweitern. Damit wird `meta` typsicher - `meta: { rolle: 'x' }`
 * waere jetzt ein Compile-Fehler statt eines stillen Bugs.
 */
declare module 'vue-router' {
  interface RouteMeta {
    /** Ohne Anmeldung erreichbar. */
    public?: boolean
    /** Nur fuer diese Rolle erreichbar. */
    role?: Role
  }
}

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
      // Sammel-Einstieg: der Guard unten leitet je nach Rolle weiter.
      path: '/',
      name: 'home',
      redirect: { name: 'login' },
    },
    {
      path: '/lecturer/subjects',
      name: 'lecturer-subjects',
      component: () => import('@/views/lecturer/SubjectListView.vue'),
      meta: { role: 'lecturer' },
    },
    {
      path: '/lecturer/subjects/:subjectId',
      name: 'lecturer-grade-entry',
      // `props: true` reicht die Route-Parameter als Props in die Komponente.
      // Die View muss dann nicht selbst `useRoute()` aufrufen und ist damit
      // isoliert testbar.
      props: true,
      component: () => import('@/views/lecturer/GradeEntryView.vue'),
      meta: { role: 'lecturer' },
    },
    {
      path: '/student/grades',
      name: 'student-dashboard',
      component: () => import('@/views/student/DashboardView.vue'),
      meta: { role: 'student' },
    },
    {
      path: '/student/grades/:subjectId',
      name: 'student-subject',
      props: true,
      component: () => import('@/views/student/SubjectMirrorView.vue'),
      meta: { role: 'student' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { public: true },
    },
  ],
})

/** Wo eine Rolle nach dem Login landet. */
function homeRouteFor(role: Role) {
  return role === 'lecturer' ? { name: 'lecturer-subjects' } : { name: 'student-dashboard' }
}

/**
 * Ein globaler Guard statt `beforeEnter` je Route: die Regel ("angemeldet sein
 * und die passende Rolle haben") gilt fuer alles. Wuerde man sie pro Route
 * wiederholen, waere die neue Route, die man zu ergaenzen vergisst, ungeschuetzt.
 *
 * Rueckgabe: `true`/nichts = durchlassen, ein Route-Objekt = umleiten.
 */
router.beforeEach((to) => {
  // Der Store darf hier erst *innerhalb* des Guards geholt werden - beim
  // Import dieses Moduls existiert die Pinia-Instanz noch nicht.
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    if (to.meta.public) return true
    // Ziel merken, damit es nach dem Login direkt weitergeht.
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const role = auth.role!

  // Angemeldet, aber auf Login oder dem Sammel-Einstieg -> zur eigenen Startseite.
  if (to.name === 'login' || to.name === 'home') {
    return homeRouteFor(role)
  }

  // Falsche Rolle -> zurueck auf die eigene Startseite statt einer Fehlerseite.
  if (to.meta.role !== undefined && to.meta.role !== role) {
    return homeRouteFor(role)
  }

  return true
})

export default router
export { homeRouteFor }
