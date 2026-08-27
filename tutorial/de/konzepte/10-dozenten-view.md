# 10 — Die Ansicht der Lehrenden

> **Zeitbedarf:** ca. 3–4 Stunden · das umfangreichste Kapitel

> **Baust du Schritt für Schritt mit?** Diese Seite gehört zu den Build-Kapiteln
> [10](../build/10-grades-store-und-draft.md) und [11](../build/11-grade-input.md) — dort steht,
> wann du was davon brauchst.

## Ziel

Die Fächerliste mit Fortschrittsanzeige und das Bewertungsformular: eine Zeile je lernender
Person, ein Knopf füllt alle Felder mit Zufallswerten, und erst *Speichern* schreibt die Daten.
Alles beschränkt auf die **eigene Akademie**.

Das ist das Herzstück der Anwendung — und das Kapitel, in dem die Konzepte der letzten sechs
zusammenkommen.

---

## Die Fächerliste

```ts
const rows = computed(() =>
  subjects
    .sortBy((subject) => subject.semester * 100 + Number(subject.id.slice(1)))
    .map((subject) => {
      const grades = gradesStore.gradesForSubject(subject.id)
      const graded = gradedCountBySubject.value[subject.id] ?? 0

      return {
        subject,
        graded,
        isComplete: graded === studentCount.value,
        average: average(grades),
      }
    }),
)
```

Eine Zeile ist mehr als ein Fach: sie trägt gleich den Fortschritt und den Durchschnitt. Diese
Anreicherung gehört in ein `computed` und nicht ins Template — dort liefe sie bei jedem
Rendern erneut.

Der Sortierschlüssel `semester * 100 + nummer` ist ein Trick, um nach zwei Kriterien zu
sortieren, ohne eine zweistufige Vergleichsfunktion zu schreiben: das erste Kriterium
dominiert, weil sein Beitrag immer größer ist als alles, was das zweite beisteuern kann.

Der Fortschritt als Badge:

```vue
<BaseBadge :tone="row.isComplete ? 'success' : 'warning'">
  {{ row.graded }} / {{ studentCount }}
</BaseBadge>
```

## Das Bewertungsformular

### Entwurf und gespeicherter Stand

Die zentrale Entwurfsentscheidung dieses Kapitels:

```ts
const draft = ref<Record<string, Grade | null>>({})

function loadDraft() {
  draft.value = gradesStore.gradeMapForSubject(props.subjectId)
  savedAt.value = null
}
```

Der Entwurf ist eine **lokale Kopie**, kein Store-Zustand. Deshalb ändert *Zufällig ausfüllen*
noch nichts an den echten Daten — genau so soll es sein: der Generator füllt die Felder, du
siehst das Ergebnis und bestätigst.

Nebenbei bekommst du dadurch *Verwerfen* geschenkt und kannst „ungespeichert“ überhaupt
anzeigen:

```ts
const isDirty = computed(() =>
  roster.value.some(
    (student) => draft.value[student.id] !== gradesStore.gradeOf(props.subjectId, student.id),
  ),
)
```

### Der Watcher auf den Route-Parameter

```ts
watch(() => props.subjectId, loadDraft, { immediate: true })
```

Ohne diese Zeile ist die Ansicht kaputt, und zwar auf eine Weise, die man leicht übersieht:
Wechselst du von `/lecturer/subjects/f02` zu `/f03`, **wird die Komponente wiederverwendet**. Vue
erzeugt sie nicht neu, weil dieselbe Route mit anderen Parametern gilt. `<script setup>` läuft
also nicht erneut, und der alte Entwurf bleibt stehen — du trägst Noten für das falsche Fach
ein.

`immediate: true` sorgt dafür, dass der Watcher auch beim ersten Rendern einmal läuft; sonst
bräuchtest du zusätzlich ein `onMounted`.

> Alternative: `<RouterView :key="$route.fullPath" />` erzwingt eine neue Komponente pro URL.
> Das ist der grobe Hammer — er wirft auch Scrollposition und jeden anderen lokalen Zustand
> weg.

### Zufällig ausfüllen

```ts
function fillRandom() {
  draft.value = randomGradesFor(roster.value.map((student) => student.id))
}
```

Ein neues Objekt statt zehn Einzelzuweisungen: **eine** Zuweisung, **ein** Rendern.

### Speichern

```ts
function save() {
  gradesStore.saveSubject(props.subjectId, draft.value)
  savedAt.value = new Date()
}
```

Danach ist `isDirty` automatisch `false` — es vergleicht ja gegen den Store. Du musst nichts
zurücksetzen; der abgeleitete Wert stimmt von selbst. Das ist der Gewinn aus der Regel in
[Vue-Reaktivität](04-vue-reactivity.md): ableiten statt mitpflegen.

## `v-model` auf einem Index-Zugriff

Hier stolperst du über `noUncheckedIndexedAccess` aus [TypeScript](03-typescript.md):

```vue
<!-- Typfehler: draft[student.id] ist Grade | null | undefined,
     GradeInput will aber Grade | null -->
<GradeInput v-model="draft[student.id]" />
```

Die Lösung ist, `v-model` in seine beiden Hälften aufzulösen:

```vue
<GradeInput
  :model-value="draft[student.id] ?? null"
  :label="`Bewertung für ${student.firstName} ${student.lastName}`"
  @update:model-value="(value) => (draft[student.id] = value)"
/>
```

Deshalb war es in [Komponenten](05-komponenten.md) die Mühe wert, die ausgeschriebene Form zu
kennen: sobald der Wert beim Hineingeben angepasst werden muss, reicht die Kurzform nicht.

Das `:label` ist kein Beiwerk. Zehn Eingabefelder ohne sichtbares Label brauchen ein
`aria-label`, sonst hört ein Screenreader zehnmal „Textfeld“.

## `GradeInput`: Übersetzen zwischen Text und Note

Ein `<input>` liefert immer einen String, das Modell will `Grade | null`. Die Komponente hält
deshalb einen eigenen Text-`ref` und übersetzt in beide Richtungen.

```ts
const model = defineModel<Grade | null>({ required: true })
const text = ref(model.value === null ? '' : String(model.value))
const invalid = ref(false)

// Von außen nach innen: "Zufällig ausfüllen", Fachwechsel
watch(model, (value) => {
  const next = value === null ? '' : String(value)
  if (next !== text.value) {
    text.value = next
    invalid.value = false
  }
})

// Von innen nach außen: Tippen
watch(text, (value) => {
  const parsed = parseGrade(value)
  if (parsed === undefined) {
    invalid.value = true     // ungültig: anzeigen, aber NICHT melden
    return
  }
  invalid.value = false
  model.value = parsed
})
```

**Die zentrale Zusage: ungültige Eingaben werden angezeigt, aber nicht nach oben gemeldet.**
Das Modell ist zu jedem Zeitpunkt gültig. Tippt jemand eine 9, steht „nur 1–5“ am Feld und die
vorherige Note bleibt unangetastet.

Der Vergleich `if (next !== text.value)` im ersten Watcher verhindert eine Endlosschleife:
ohne ihn schreibt jede Änderung von `model` in `text`, was wieder `model` schreibt.

Und die Fehlermeldung braucht eine eindeutige ID:

```ts
const hintId = useId()
```

`aria-describedby` verweist auf die Meldung. Zehn Felder mit derselben festen ID würden
alle auf dieselbe zeigen.

---

## Deine Aufgabe

**`views/lecturer/SubjectListView.vue`:**
1. `computed` mit Fach, Fortschritt, `isComplete` und Durchschnitt.
2. Kennzahlen oben: Anzahl Fächer, offene Fächer, Gesamtdurchschnitt.
3. Tabelle mit Badge und Link auf das Bewertungsformular.

**`views/lecturer/GradeEntryView.vue`:**
4. `subjectId` als Prop (`props: true` im Router).
5. Lokaler `draft`, Watcher mit `immediate: true`, `isDirty` als `computed`.
6. Knöpfe: *Zufällig ausfüllen*, *Leeren*, *Verwerfen*, *Speichern*. Die letzten beiden nur
   aktiv, wenn `isDirty`.
7. Hinweis „Ungespeicherte Änderungen“ bzw. „Gespeichert um HH:MM:SS“.
8. Tabelle mit `GradeInput` je Zeile.
9. Kennzahlen aus `useGradeStats(draftGrades)` — sie sollen sich **live beim Tippen**
   aktualisieren, nicht erst beim Speichern.
10. `onBeforeRouteLeave` mit Rückfrage bei ungespeicherten Änderungen.

**`components/GradeInput.vue`:** wie oben beschrieben.

**Unbekanntes *und fremdes* Fach abfangen:** `/lecturer/subjects/f99` darf nicht abstürzen — und
`/lecturer/subjects/<Sith-Fach>` als Jedi ebenfalls nicht funktionieren:

```ts
const subject = computed(() => {
  const found = subjects.byId(props.subjectId)
  if (found === undefined || academy.value === null) return undefined
  // Fremdes Fach == nicht vorhandenes Fach.
  return found.academyId === academy.value.id ? found : undefined
})
```

> **Das ist kein hypothetischer Fall.** Beim Bauen der Referenz hatte ich genau diese Prüfung
> zunächst vergessen: `subjects.byId` findet *jedes* Fach, und die ID kommt aus der URL. Ein
> Rekrut konnte über die Adresszeile den Sith-Vergleich einsehen. Immer wenn ein Bezeichner
> aus der URL kommt, gehört dazu die Frage: *Darf diese Person das überhaupt?*

## Stolperfallen

| Symptom | Ursache |
| --- | --- |
| Fachwechsel zeigt alte Noten | Watcher auf `props.subjectId` fehlt |
| Watcher feuert nie | `watch(props.subjectId, …)` statt `watch(() => props.subjectId, …)` |
| Beim ersten Laden ist alles leer | `immediate: true` fehlt |
| Typfehler bei `v-model` | Index-Zugriff kann `undefined` sein — ausschreiben |
| Endlosschleife in `GradeInput` | Vergleich vor der Zuweisung fehlt |
| Zufallsnoten sind sofort gespeichert | in den Store statt in den Entwurf geschrieben |
| Falsche Zeile behält Wert | `:key` ist der Index statt der ID |

## Selbstcheck

- [ ] Leeres Fach öffnen, *Zufällig ausfüllen* → alle **10** Felder gefüllt (nicht 40!), „ungespeichert“ steht da
- [ ] Der Store ist noch unverändert (im Vue-Devtools nachsehen)
- [ ] *Verwerfen* stellt den alten Stand wieder her
- [ ] *Speichern* → Hinweis wechselt, Reload → Noten sind noch da
- [ ] Eine 9 eintippen → „nur 1–5“, vorheriger Wert bleibt erhalten
- [ ] Feld leeren → wird als „nicht benotet“ gespeichert
- [ ] Bei ungespeicherten Änderungen wegnavigieren → Rückfrage
- [ ] Fachwechsel über die Liste zeigt die richtigen Noten
- [ ] `/lecturer/subjects/f99` zeigt eine freundliche Meldung
- [ ] Ein Fach einer **fremden** Akademie über die Adresszeile ebenfalls

## In der Referenz

- `reference/src/views/lecturer/SubjectListView.vue`, `reference/src/views/lecturer/GradeEntryView.vue`
- `reference/src/components/GradeInput.vue`
- `reference/src/components/__tests__/GradeInput.spec.ts` — prüft genau die Zusage „ungültige Eingaben
  werden nicht gemeldet“
