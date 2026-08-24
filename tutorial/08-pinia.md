# 08 — Pinia: Zustand über Komponenten hinweg

## Ziel

Anmeldung und Notenmatrix leben in Stores, auf die jede Komponente zugreifen kann. Am Ende
funktioniert der Login, die Navigation zeigt den Namen, und der Guard aus Kapitel 07 arbeitet
mit echten Daten.

---

## Wozu ein Store

Wer angemeldet ist, brauchen die Navigation, der Router-Guard und beide Ansichten. Über Props
durch drei Ebenen zu reichen wäre mühsam („Prop Drilling“), und der Router-Guard ist gar keine
Komponente — er kommt an Props überhaupt nicht heran.

Ein Store ist Zustand, der außerhalb des Komponentenbaums lebt.

**Wann ein Store, wann ein Composable?**

| | |
| --- | --- |
| **Store** | Es gibt genau **eine** Instanz für die ganze App. Anmeldung, Notenmatrix. |
| **Composable** | Jeder Aufruf erzeugt eine **eigene** Instanz. Statistik zu *dieser* Liste, ein Formularzustand. |

Beides ist dieselbe Technik — ein Store ist ein Composable, das Pinia für dich einmalig hält.

## Ein Setup-Store

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

  function login(username: string, password: string): boolean {   // action
    // …
  }

  return { currentUserId, currentUser, error, isLecturer, login }
})
```

Die Funktion ist aufgebaut wie ein `<script setup>`: `ref` ist Zustand, `computed` sind
abgeleitete Werte, normale Funktionen sind Aktionen. Was du zurückgibst, ist von außen
sichtbar — der Rest bleibt privat.

Der erste Parameter (`'auth'`) ist die ID des Stores; sie muss eindeutig sein.

> **Anders als du es kennst**
> `useAuthStore()` erzeugt nicht jedes Mal einen neuen Store. Der erste Aufruf legt ihn an,
> jeder weitere gibt denselben zurück. Du darfst ihn also in jeder Komponente aufrufen, ohne
> etwas herumzureichen.

## `storeToRefs` — die wichtigste Falle

```ts
const auth = useAuthStore()

// FALSCH: die Reaktivität ist weg
const { currentUser, isLecturer } = auth

// RICHTIG
const { currentUser, isLecturer } = storeToRefs(auth)

// Funktionen dagegen darf man direkt herausnehmen
const { login, logout } = auth
```

Beim gewöhnlichen Destrukturieren holst du den **aktuellen Wert** heraus. Die Verbindung zum
Store ist damit gekappt: die Navigation zeigt weiter „nicht angemeldet“, obwohl der Login
längst durch ist. `storeToRefs` gibt dir stattdessen `ref`s, die verbunden bleiben.

Alternativ einfach `auth.currentUser` im Template schreiben — der Zugriff über das
Store-Objekt bleibt immer reaktiv.

## Der Auth-Store dieser App

```ts
function login(username: string, password: string): boolean {
  const normalized = toUsername(username)
  const match = users.find((user) => toUsername(user.lastName) === normalized)

  if (match === undefined || toUsername(password) !== normalized) {
    error.value = 'Benutzername oder Passwort ist falsch.'
    return false
  }

  currentUserId.value = match.id
  error.value = null
  return true
}
```

Vier Punkte:

**`toUsername` auf beiden Seiten.** Damit funktioniert `Müller`, `müller` und `mueller`
gleichermaßen.

**Rückgabewert `boolean` statt `throw`.** Ein falsches Passwort ist ein normaler Ablauf, keine
Ausnahmesituation. Ausnahmen sind für Dinge, mit denen der Aufrufer nicht rechnen kann.

**Dieselbe Meldung für „Benutzer unbekannt“ und „Passwort falsch“.** Sonst verrät die
Anwendung, welche Konten existieren. Hier ist das ohne Belang, in echten Anmeldungen ist es
ein Grundprinzip — und es kostet nichts, es sich anzugewöhnen.

**Nur die ID im Zustand.** Das User-Objekt wird bei jedem Zugriff frisch aus den Stammdaten
gelesen. Persistierte man es, hätte man eine zweite Quelle der Wahrheit, die nach jeder
Datenänderung veraltet ist.

> Das ist **keine** Authentifizierung. Benutzername und Passwort sind identisch, und geprüft
> wird im Browser — jeder kann in den DevTools den Store ändern. Für eine Lernanwendung ohne
> Backend ist das in Ordnung; sobald echte Daten im Spiel sind, gehört die Prüfung auf den
> Server und das Passwort in einen Hash.

## Der Noten-Store

```ts
export const useGradesStore = defineStore('grades', () => {
  const book = ref<GradeBook>(createGradeBook())

  function gradesForSubject(subjectId: string): (Grade | null)[] {
    const row = book.value[subjectId] ?? {}
    return students.map((student) => row[student.id] ?? null)
  }

  function saveSubject(subjectId: string, draft: Record<string, Grade | null>): void {
    const row: Record<string, Grade | null> = {}
    for (const student of students) {
      const value = draft[student.id]
      row[student.id] = isGrade(value) ? value : null
    }
    book.value = { ...book.value, [subjectId]: row }
  }

  return { book, gradesForSubject, saveSubject /* … */ }
})
```

**Ein Aufruf für ein ganzes Fach**, nicht fünfzehn einzelne Setter. Das Formular arbeitet auf
einem lokalen Entwurf und übergibt ihn beim Speichern in einem Stück — ein Schreibvorgang, ein
Rendern, später auch genau ein Schreiben in den `localStorage`.

**`isGrade(value) ? value : null`** ist die Grenzkontrolle des Stores. Egal, was das Formular
hereinreicht: im Store landen nur gültige Werte.

**`book.value = { ...book.value, [subjectId]: row }`** statt
`book.value[subjectId] = row`. Beides funktioniert in Vue; die Zuweisung eines neuen Objekts
ist aber eindeutiger und spielt gut mit dem `watch` zusammen, der in
[Kapitel 09](09-composables.md) für die Persistenz sorgt.

## Store in einer Komponente

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const { currentUser, greeting } = storeToRefs(auth)

function abmelden() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <span>{{ greeting }} · {{ currentUser?.roleLabel }}</span>
</template>
```

---

## Deine Aufgabe

1. `src/stores/auth.ts`: `currentUserId`, `error`, die abgeleiteten Werte `currentUser`,
   `isAuthenticated`, `role`, `isLecturer`, `isStudent`, `greeting` sowie `login`, `logout`,
   `clearError`.
2. `src/stores/grades.ts`: `book`, `gradesForSubject`, `gradeMapForSubject`,
   `gradesForStudent`, `gradeOf`, `saveSubject`, `resetAll` und ein `computed`
   `gradedCountBySubject` für die Fortschrittsanzeige.
3. Guard aus Kapitel 07 auf den echten Store umstellen.
4. `LoginView` mit `BaseInput`, `BaseButton`, `BaseCard` und einem echten `<form>` mit
   `@submit.prevent`.
5. `AppNav` zeigt Begrüßung, Rollenbezeichnung und einen Abmelden-Knopf.

Die Begrüßung nutzt nur den **Vornamen** plus die Rollenbezeichnung aus den Daten:
„Hallo Greta · Studentin“.

## Stolperfallen

- Store destrukturieren ohne `storeToRefs`.
- Store im Router-Modul auf oberster Ebene holen.
- Ein `<div>` mit Klick-Handler statt eines `<form>`: dann funktioniert Enter im Feld nicht,
  und Passwortmanager erkennen das Formular nicht.
- Das ganze User-Objekt im Store halten statt der ID.

## Selbstcheck

- [ ] Login mit `weber`/`weber` führt zur Fächerliste, mit `mueller`/`mueller` zu den Noten
- [ ] `Müller` und `MUELLER` funktionieren beide
- [ ] Falsches Passwort zeigt eine Meldung, das Passwortfeld wird geleert, kein Zugang
- [ ] Nach dem Login zeigt die Navigation sofort den Namen (sonst fehlt `storeToRefs`)
- [ ] Enter im Passwortfeld sendet das Formular ab
- [ ] Abmelden führt zurück auf `/login`, und `/dozent/faecher` ist wieder gesperrt

## In der Referenz

- `src/stores/auth.ts`, `src/stores/grades.ts`
- `src/views/LoginView.vue`, `src/components/AppNav.vue`
- `src/stores/__tests__/auth.spec.ts` — beschreibt das erwartete Verhalten präzise
