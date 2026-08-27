# 11 — Die Ansicht der Lernenden

> **Zeitbedarf:** ca. 3–4 Stunden · das Diagramm kostet mehr Zeit als es aussieht

> **Baust du Schritt für Schritt mit?** Diese Seite gehört zu den Build-Kapiteln
> [13](../build/13-student-dashboard.md) und [14](../build/14-klassenspiegel-chart.md) — dort
> steht, wann du was davon brauchst.

## Ziel

Eigene Noten mit Durchschnitt, und je Fach der **Klassenspiegel**: die anonyme Notenverteilung
als Balkendiagramm, die eigene Note hervorgehoben. Ohne Chart-Bibliothek.

---

## Das Dashboard

```ts
const rows = computed(() => {
  const user = currentUser.value
  if (user === null) return []
  // Die Akademie kommt vom User selbst - dadurch sieht ein Padawan nie ein
  // imperiales Fach, egal was in der URL steht.
  return gradesStore.gradesForStudent(user.id, user.academyId)
})

const ownGrades = computed(() => rows.value.map((row) => row.grade))
const stats = useGradeStats(ownGrades)
```

Die Prüfung auf `null` ist nicht überflüssig, obwohl der Router-Guard sie praktisch
ausschließt. Der Compiler weiß nichts von deinem Guard, und die Alternative — ein `!` — ist
eine Behauptung, die beim nächsten Umbau falsch werden kann. Eine leere Liste
zurückzugeben ist billiger als jede Diskussion darüber.

Ein Detail beim Zugriff auf rollenspezifische Felder:

```vue
{{ currentUser && 'matriculationNumber' in currentUser ? currentUser.matriculationNumber : '–' }}
```

`currentUser` ist `User`, also `Student | Lecturer`. Der `in`-Operator grenzt ein — das ist
Narrowing aus [TypeScript](03-typescript.md) an einer Stelle, an der es wirklich hilft.

## Der Klassenspiegel

### Nur Noten, keine Namen

```ts
const classGrades = computed(() => gradesStore.gradesForSubject(props.subjectId))
const stats = useGradeStats(classGrades)
```

`gradesForSubject` liefert **nur die Bewertungen der eigenen Akademie**, in Listenreihenfolge,
ohne Zuordnung zu Personen. Das ist Absicht: was die Ansicht nie erhält, kann sie auch nicht versehentlich
anzeigen. Hätte sie die vollständigen Datensätze und filterte die Namen erst im Template
heraus, wäre die Anonymität eine Frage der Sorgfalt — so ist sie eine Eigenschaft der
Datenstruktur.

Die eigene Note kommt getrennt dazu:

```ts
const ownGrade = computed(() => {
  const user = currentUser.value
  return user === null ? null : gradesStore.gradeOf(props.subjectId, user.id)
})
```

### Platzierung

```ts
const rank = computed(() => {
  const own = ownGrade.value
  if (own === null) return null

  const better = classGrades.value.filter((grade) => grade !== null && grade < own).length
  return { position: better + 1, of: stats.count.value }
})
```

Wer bei gleicher Bewertung dieselbe Platzierung bekommt („geteilt“), ist eine fachliche
Entscheidung — und sie ist die richtige: Zehn Leute nach Bewertung zu sortieren und
durchzunummerieren erzeugt eine Rangfolge, die es nicht gibt.

## Das Balkendiagramm

Fünf Balken, deren Höhe ein Prozentwert ist. Eine Chart-Bibliothek wären ~100 kB für etwas,
das mit Flexbox in zwanzig Zeilen erledigt ist.

```ts
const peak = computed(() => Math.max(...Object.values(distribution), 1))

const bars = computed(() =>
  GRADES.map((grade) => ({
    grade,
    count: distribution[grade],
    heightPercent: (distribution[grade] / peak.value) * 100,
    share: total.value === 0 ? 0 : Math.round((distribution[grade] / total.value) * 100),
    isOwn: grade === ownGrade,
  })),
)
```

Skaliert wird auf den **größten** Balken, nicht auf die Gesamtzahl: sonst wäre bei einer
gleichmäßigen Verteilung jeder Balken nur ein Fünftel hoch und das Diagramm wirkte flach. Die
`, 1` am Ende von `Math.max(...)` ist die Absicherung gegen Division durch null.

### Die Falle, die dich garantiert erwischt

```vue
<!-- SO GEHT ES NICHT -->
<div class="flex h-44 items-end">
  <div v-for="bar in bars" class="flex flex-1 flex-col items-center">
    <span>{{ bar.count }}</span>
    <div :style="{ height: `${bar.heightPercent}%` }" class="w-full bg-grade-1" />
    <span>{{ bar.grade }}</span>
  </div>
</div>
```

Ergebnis: **keine sichtbaren Balken.** Kein Fehler in der Konsole, keine Warnung, die Zahlen
stimmen alle — die Balken sind einfach nicht da.

Der Grund ist CSS, nicht Vue: **eine prozentuale Höhe bezieht sich auf die Höhe des
Elternelements.** Der Elterncontainer hier ist die Spalte, und die hat keine festgelegte Höhe
(`auto`, sie richtet sich nach ihrem Inhalt). Ohne Bezugswert kann der Browser die Prozente
nicht auflösen und behandelt sie wie `auto` — also 0.

Richtig ist eine eigene „Schiene“ mit fester Höhe:

```vue
<div class="flex items-end gap-2">
  <div v-for="bar in bars" :key="bar.grade" class="flex flex-1 flex-col items-center gap-2">
    <span>{{ bar.count }}</span>

    <div class="flex h-36 w-full items-end">      <!-- feste Höhe = Bezugswert -->
      <div
        class="w-full rounded-t-md transition-[height] duration-300"
        :class="[BAR_CLASSES[bar.grade], bar.isOwn && 'ring-2 ring-slate-900']"
        :style="{ height: `${Math.max(bar.heightPercent, 2)}%` }"
      />
    </div>

    <span>{{ bar.grade }}</span>
    <span>{{ bar.share }} %</span>
  </div>
</div>
```

Die Beschriftungen liegen **außerhalb** der Schiene. Stünden sie darin, zählten sie zur
Bezugshöhe mit, und 100 % würden überlaufen.

`Math.max(..., 2)` lässt auch einen sehr kleinen Balken noch als Strich erkennen.

### Farben: keine zusammengebauten Klassennamen

```ts
const BAR_CLASSES: Record<Grade, string> = {
  1: 'bg-grade-1', 2: 'bg-grade-2', 3: 'bg-grade-3', 4: 'bg-grade-4', 5: 'bg-grade-5',
}
```

`` `bg-grade-${bar.grade}` `` funktioniert **nicht**. Tailwind durchsucht deinen Quelltext nach
vollständigen Klassennamen; einen zur Laufzeit zusammengesetzten findet es nie, und die Klasse
landet nicht im CSS. Mehr dazu in [Styling mit Tailwind](12-styling-tailwind.md).

### Zugänglichkeit

```vue
<div
  role="img"
  :aria-label="`Note ${bar.grade} (${gradeLabel(bar.grade)}): ${bar.count} von ${total}`"
/>
```

Ein Balken ist ein leeres `<div>`. Ohne Beschriftung ist das Diagramm für einen Screenreader
nicht vorhanden. Zusätzlich stehen Anzahl und Prozentwert als Text daneben — die eigene Note
wird nicht **nur** durch die Umrandung markiert, sondern auch durch die Kennzahl „Meine Note“
darüber. Information nie allein über Farbe oder Form transportieren.

## Leere Zustände

Vier von sechs Fächern sind unbewertet. Das ist der Normalfall, nicht die Ausnahme:

```vue
<EmptyState
  v-if="stats.isEmpty.value"
  title="Noch keine Noten in diesem Fach"
  description="Der Klassenspiegel erscheint, sobald benotet wurde."
/>
<GradeDistributionChart v-else :distribution="stats.distribution.value" :own-grade="ownGrade" />
```

Ein Diagramm aus fünf Nullbalken ist keine gute Antwort auf „es gibt noch nichts“.

---

## Deine Aufgabe

**`views/student/DashboardView.vue`:**
1. Begrüßung mit Vorname, Rollenbezeichnung und Matrikelnummer.
2. Kennzahlen: Durchschnitt, benotete Fächer, Bestehensquote.
3. Tabelle aller Fächer mit `GradeBadge`, Bewertungstext und Link zum Klassenspiegel.
4. `EmptyState`, solange nichts benotet ist.

**`components/GradeBadge.vue`:**
5. Note als farbiges Kästchen, `null` als `–`, optionale Hervorhebung, `title` mit dem
   Bewertungstext.

**`components/GradeDistributionChart.vue`:**
6. Props `distribution` und `ownGrade`. Fünf Balken mit fester Schiene, Anzahl und Prozentwert,
   eigene Note umrandet, `aria-label` je Balken.

**`views/student/SubjectMirrorView.vue`:**
7. `subjectId` als Prop, unbekanntes Fach abfangen.
8. Kennzahlen: eigene Note, Kursdurchschnitt, benotet, Platzierung.
9. Diagramm bzw. `EmptyState`.

## Stolperfallen

- Prozenthöhe ohne Elternelement mit fester Höhe.
- Klassennamen zur Laufzeit zusammensetzen.
- Auf die Gesamtzahl statt auf den größten Balken skalieren.
- Namen in den Klassenspiegel geben und erst im Template herausfiltern.
- Division durch null bei leerer Verteilung.

## Selbstcheck

- [ ] Als `tano` anmelden: Bewertungen in den zwei vorbelegten Fächern, `–` in den übrigen
- [ ] Es erscheinen **nur** die 6 Jedi-Fächer, keine der anderen 18
- [ ] Der Vergleich zeigt **sichtbare** Balken über **10** Bewertungen, nicht 40
- [ ] Die Summe der Balken entspricht der Anzahl vergebener Bewertungen
- [ ] Die eigene Note ist umrandet und steht zusätzlich als Kennzahl da
- [ ] Prozentwerte ergeben zusammen ungefähr 100
- [ ] Unbenotetes Fach zeigt den leeren Zustand, kein Diagramm aus Nullen
- [ ] Nirgends steht ein fremder Name
- [ ] `/student/grades/f99` stürzt nicht ab
- [ ] Ein Fach einer fremden Akademie ebenfalls nicht — und zeigt **keine** fremden Daten
- [ ] Als Studentin `/lecturer/subjects` aufrufen → Guard leitet zurück

## In der Referenz

- `reference/src/views/student/DashboardView.vue`, `reference/src/views/student/SubjectMirrorView.vue`
- `reference/src/components/GradeDistributionChart.vue`, `reference/src/components/GradeBadge.vue`,
  `reference/src/components/StatTile.vue`
