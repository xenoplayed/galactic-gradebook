import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { academies, users } from '@/data/seed'
import { toUsername } from '@/lib/strings'
import { useLocalStorage } from '@/composables/useLocalStorage'
import type { Academy, User } from '@/types/domain'

const SESSION_KEY = 'datapad.session'

/**
 * Setup-Store: die Funktion ist aufgebaut wie ein `<script setup>`.
 * `ref` -> state, `computed` -> getters, normale Funktionen -> actions.
 * Alles, was du am Ende zurueckgibst, ist von aussen sichtbar.
 *
 * ACHTUNG - so etwas ist KEINE echte Authentifizierung. Benutzername und
 * Passwort sind hier beide der Nachname, und geprueft wird im Browser.
 * Das ist eine Lernuebung; echte Anmeldung passiert serverseitig gegen
 * gehashte Passwoerter.
 */
export const useAuthStore = defineStore('auth', () => {
  /** Nur die ID wird persistiert, nicht das ganze User-Objekt. */
  const currentUserId = useLocalStorage<string | null>(SESSION_KEY, null)
  const error = ref<string | null>(null)

  /**
   * Das User-Objekt wird bei jedem Zugriff frisch aus den Stammdaten gelesen.
   * Wuerde man es persistieren, haette man eine zweite Quelle der Wahrheit,
   * die nach einer Datenaenderung veraltet ist.
   */
  const currentUser = computed<User | null>(() => {
    if (currentUserId.value === null) return null
    return users.byId(currentUserId.value) ?? null
  })

  /**
   * Die Akademie des angemeldeten Users - der Dreh- und Angelpunkt der App.
   *
   * Daraus folgt alles Weitere: welche Faecher sichtbar sind, wie Lernende
   * heissen, wie die Noten benannt werden und welches Design gilt. Deshalb
   * abgeleitet und nicht gespeichert: eine Quelle der Wahrheit.
   */
  const academy = computed<Academy | null>(() => {
    const user = currentUser.value
    return user === null ? null : (academies.byId(user.academyId) ?? null)
  })

  const isAuthenticated = computed(() => currentUser.value !== null)
  const role = computed(() => currentUser.value?.role ?? null)
  const isLecturer = computed(() => role.value === 'lecturer')
  const isStudent = computed(() => role.value === 'student')

  /** "Hallo Greta" - die Begruessung nutzt bewusst nur den Vornamen. */
  const greeting = computed(() => {
    const user = currentUser.value
    if (user === null) return ''
    return `Hallo ${user.firstName}`
  })

  /**
   * Login. Gibt `true` bei Erfolg zurueck; im Fehlerfall steht die Meldung
   * in `error`. Bewusst kein `throw`: ein falsches Passwort ist ein normaler
   * Ablauf, keine Ausnahmesituation.
   */
  function login(username: string, password: string): boolean {
    const normalized = toUsername(username)

    const match = users.find((user) => toUsername(user.lastName) === normalized)

    // Auch bei unbekanntem Benutzer dieselbe Meldung: verrate nicht, welcher
    // Teil falsch war. (Bei echter Anmeldung ist das ein Sicherheitsprinzip.)
    if (match === undefined || toUsername(password) !== normalized) {
      error.value = 'Benutzername oder Passwort ist falsch.'
      return false
    }

    currentUserId.value = match.id
    error.value = null
    return true
  }

  function logout(): void {
    currentUserId.value = null
    error.value = null
  }

  function clearError(): void {
    error.value = null
  }

  return {
    currentUserId,
    currentUser,
    academy,
    error,
    isAuthenticated,
    role,
    isLecturer,
    isStudent,
    greeting,
    login,
    logout,
    clearError,
  }
})
