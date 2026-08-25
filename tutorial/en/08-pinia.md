# 08 — Pinia: state across components

> **Time:** about 1.5–2 hours

## Goal

Sign-in and the grade book live in stores that any component can reach. At the end signing in
works, the navigation shows the name, and the guard from chapter 07 works with real data.

---

## What a store is for

Who is signed in — and **which academy** they belong to — is needed by the navigation, the
router guard, both views and the theming. Passing that down through three levels of props
would be tedious ("prop drilling"), and the router guard isn't a component at all — it can't
reach props in the first place.

A store is state that lives outside the component tree.

**When a store, when a composable?**

| | |
| --- | --- |
| **Store** | There is exactly **one** instance for the whole app. Sign-in, the grade book. |
| **Composable** | Every call creates its **own** instance. Statistics for *this* list, a form state. |

Both are the same technique — a store is a composable that Pinia keeps as a singleton for you.

## A setup store

```ts
// src/stores/auth.ts
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const currentUserId = ref<string | null>(null)   // state
  const error = ref<string | null>(null)

  const currentUser = computed(() =>                // getter
    currentUserId.value === null ? null : (users.byId(currentUserId.value) ?? null),
  )
  const isLecturer = computed(() => currentUser.value?.role === 'lecturer')

  /**
   * The pivot of the whole app: from this follows which subjects are visible,
   * what trainees are called, how assessments are named and which design
   * applies. Derived, not stored - one source of truth.
   */
  const academy = computed(() =>
    currentUser.value === null ? null : (academies.byId(currentUser.value.academyId) ?? null),
  )

  function login(username: string, password: string): boolean {   // action
    // …
  }

  return { currentUserId, currentUser, error, isLecturer, login }
})
```

The function is shaped like a `<script setup>`: `ref` is state, `computed` are derived values,
plain functions are actions. Whatever you return is visible from outside — the rest stays
private.

The first parameter (`'auth'`) is the store's ID; it has to be unique.

> **Not what you're used to**
> `useAuthStore()` doesn't create a new store every time. The first call creates it, every
> further one returns the same. So you may call it in every component without passing anything
> around.

## `storeToRefs` — the most important trap

```ts
const auth = useAuthStore()

// WRONG: reactivity is gone
const { currentUser, isLecturer } = auth

// RIGHT
const { currentUser, isLecturer } = storeToRefs(auth)

// Functions, however, may be taken out directly
const { login, logout } = auth
```

Ordinary destructuring pulls out the **current value**. That severs the link to the store: the
navigation keeps showing "not signed in" long after the sign-in went through. `storeToRefs`
gives you `ref`s that stay connected instead.

Alternatively just write `auth.currentUser` in the template — access through the store object
always stays reactive.

## This app's auth store

```ts
function login(username: string, password: string): boolean {
  const normalized = toUsername(username)
  // `users` contains ALL people of ALL academies - which is why last names
  // have to be unique across academies (see chapter 06).
  const match = users.find((user) => toUsername(user.lastName) === normalized)

  if (match === undefined || toUsername(password) !== normalized) {
    error.value = 'Username or password is incorrect.'
    return false
  }

  currentUserId.value = match.id
  error.value = null
  return true
}
```

Four points:

**`toUsername` on both sides.** That makes `Sabé`, `sabé` and `sabe` all work.

**Returning a `boolean` instead of `throw`.** A wrong password is a normal flow, not an
exceptional situation. Exceptions are for things the caller can't anticipate.

**The same message for "unknown user" and "wrong password".** Otherwise the app reveals which
accounts exist. It doesn't matter here, but in real sign-ins it's a basic principle — and it
costs nothing to make it a habit.

**Only the ID in state.** The user object *and* the academy are derived fresh from the master
data on every access. Persisting them would give you three sources of truth that drift apart
after every data change.

> This is **not** authentication. Username and password are identical, and it's checked in the
> browser — anyone can change the store in the devtools. For a learning app without a backend
> that's fine; as soon as real data is involved, the check belongs on the server and the
> password in a hash.

## The grades store

```ts
export const useGradesStore = defineStore('grades', () => {
  const book = ref<GradeBook>(createGradeBook())

  /**
   * The trainees belonging to a subject. Exactly ONE place where
   * "which subject belongs to which academy" lives.
   */
  function rosterFor(subjectId: string): readonly Student[] {
    const subject = subjects.byId(subjectId)
    return subject === undefined ? [] : studentsOf(subject.academyId)
  }

  function gradesForSubject(subjectId: string): (Grade | null)[] {
    const row = book.value[subjectId] ?? {}
    return rosterFor(subjectId).map((student) => row[student.id] ?? null)
  }

  function saveSubject(subjectId: string, draft: Record<string, Grade | null>): void {
    const row: Record<string, Grade | null> = {}
    for (const student of rosterFor(subjectId)) {
      const value = draft[student.id]
      row[student.id] = isGrade(value) ? value : null
    }
    book.value = { ...book.value, [subjectId]: row }
  }

  return { book, gradesForSubject, saveSubject /* … */ }
})
```

**`rosterFor` in exactly one place.** All four access functions of the store go through it. If
the subject → academy mapping lived in four places, the one you forget would be the security
hole.

**One call for a whole subject**, not ten individual setters. The form works on a local draft
and hands it over in one piece when saving — one write, one render, and later exactly one write
to `localStorage`.

**`isGrade(value) ? value : null`** is the store's boundary check. Whatever the form hands in,
only valid values land in the store.

**`book.value = { ...book.value, [subjectId]: row }`** instead of
`book.value[subjectId] = row`. Both work in Vue; assigning a new object is clearer though, and
plays well with the `watch` that handles persistence in [chapter 09](09-composables.md).

## A store in a component

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const { currentUser, greeting } = storeToRefs(auth)

function signOut() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <span>{{ greeting }} · {{ currentUser?.roleLabel }}</span>
</template>
```

---

## Your task

1. `src/stores/auth.ts`: `currentUserId`, `error`, the derived values `currentUser`,
   **`academy`**, `isAuthenticated`, `role`, `isLecturer`, `isStudent`, `greeting`, plus
   `login`, `logout`, `clearError`.
2. `src/stores/grades.ts`: `book`, `rosterFor`, `gradesForSubject`, `gradeMapForSubject`,
   `gradesForStudent`, `gradeOf`, `saveSubject`, `resetAll`, `studentCountOf` and a `computed`
   `gradedCountBySubject` for the progress display.
3. Switch the guard from chapter 07 to the real store.
4. `LoginView` with `BaseInput`, `BaseButton`, `BaseCard` and a real `<form>` using
   `@submit.prevent`.
5. `AppNav` shows the greeting, the role label and a sign-out button.

The greeting uses only the **first name** plus the role label from the data: "Hello Ahsoka ·
Padawan".

## Pitfalls

- Destructuring the store without `storeToRefs`.
- Fetching the store at the top level of the router module.
- A `<div>` with a click handler instead of a `<form>`: then Enter in the field doesn't work,
  and password managers don't recognise the form.
- Keeping the whole user object in the store instead of the ID.

## Self-check

- [ ] Signing in with `yoda`/`yoda` leads to the subject list, `tano`/`tano` to the assessments
- [ ] `Sabé`, `sabé` and `sabe` all work
- [ ] `auth.academy?.id` gives `'sith'` for `bane` and `'empire'` for `thrawn`
- [ ] A wrong password shows a message, clears the password field, and grants no access
- [ ] After signing in the navigation shows the name immediately (otherwise `storeToRefs` is missing)
- [ ] Enter in the password field submits the form
- [ ] Signing out returns to `/login`, and `/dozent/faecher` is locked again

## In the reference

- `reference/src/stores/auth.ts`, `reference/src/stores/grades.ts`
- `reference/src/views/LoginView.vue`, `reference/src/components/AppNav.vue`
- `reference/src/stores/__tests__/auth.spec.ts` — describes the expected behaviour precisely
