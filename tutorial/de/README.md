# Datapad — Tutorial

Bau dir eine kleine, vollständige Vue-3-Anwendung von Grund auf: **Datapad**, eine
Ausbildungsverwaltung für vier Star-Wars-Akademien. Lehrende tragen Bewertungen von 1 bis 5
ein, Lernende sehen ihre eigenen und den anonymen Vergleich mit ihrem Jahrgang. Jede Akademie
— Jedi, Sith, Imperium, Rebellen — hat ihr eigenes Erscheinungsbild.

Das Ziel ist nicht die App. Das Ziel ist, dass du danach eigene Projekte in JavaScript,
TypeScript und Vue anfangen kannst, ohne bei jedem zweiten Schritt zu suchen.

## Für wen das geschrieben ist

Für jemanden, der **programmieren kann, aber nicht in diesem Ökosystem**: Scripting,
Automatisierung, Container, CI sind vertraut; JavaScript, TypeScript und Vue sind es nicht.

Deshalb steht hier nirgends, was eine Variable oder eine Schleife ist. Stattdessen gibt es
überall dort ausführliche Erklärungen, wo JavaScript sich **anders verhält, als du es aus
anderen Sprachen erwartest** — daran scheitern Umsteiger, nicht an den Grundlagen. Diese
Stellen sind markiert:

> **Anders als du es kennst**
> Kurzer Abgleich mit Python, Bash oder Go.

## Wie du damit arbeitest

Es gibt **zwei Repos**:

| Repo | Rolle |
| --- | --- |
| `datapad` (dieses hier) | die Kapitel und die Übungen |
| `datapad-reference` | die fertige App |

Und dazu **dein eigenes Projekt**, das du in Kapitel 00 anlegst — irgendwo daneben, z. B.
`~/projects/nodejs/mein-datapad`.

Die Referenz ist **kein Vorlagenordner zum Kopieren**. Sie ist dein Nachschlagewerk: erst
selbst versuchen, und wenn es klemmt oder du wissen willst, wie es sauberer ginge, dort
nachsehen. Jedes Kapitel endet mit den passenden Dateipfaden — die beginnen mit `reference/`
und meinen immer die fertige App, nie dein Projekt.

Jedes Kapitel ist gleich aufgebaut:

1. **Ziel** — was am Ende funktioniert
2. **Konzepte** — das Neue, mit Beispielen
3. **Deine Aufgabe** — was du baust
4. **Stolperfallen** — was hier erfahrungsgemäß schiefgeht
5. **Selbstcheck** — woran du merkst, dass es stimmt
6. **In der Referenz** — wo du vergleichen kannst

## Reihenfolge

**Grundlagen** — ohne Vue, dafür mit ausführbaren Übungen im `playground/`:

| Kapitel | Thema | Zeit |
| --- | --- | --- |
| [00 — Setup](00-setup.md) | DevContainer auf Podman, Projekt anlegen, Werkzeuge verstehen | 45–60 min |
| [01 — JavaScript-Grundlagen](01-js-grundlagen.md) | Werte, Objekte und Arrays, Referenzsemantik, Array-Methoden | 2–3 h |
| [02 — JavaScript, zweiter Teil](02-js-fortgeschritten.md) | Arrow-Funktionen, `this`, Module, Promises, `async`/`await` | 2–3 h |
| [03 — TypeScript](03-typescript.md) | Typen, Unions, Narrowing, **Generics und generische Klassen** | 2–3 h |

**Die Anwendung** — ab hier wächst dein Projekt Kapitel für Kapitel:

| Kapitel | Thema | Zeit |
| --- | --- | --- |
| [04 — Vue-Reaktivität](04-vue-reactivity.md) | SFC, `ref`, `computed`, `watch`, Template-Syntax | 1,5–2 h |
| [05 — Komponenten](05-komponenten.md) | Props, Emits, Slots, `v-model` auf eigenen Komponenten | 2–3 h |
| [06 — Domänenmodell](06-domaenenmodell.md) | Typen, Fixtures, die vier Akademien, Vue-freie Fachlogik | 2–3 h |
| [07 — Router](07-router.md) | Routen, Parameter, Guards, Rollenschutz | 1,5–2 h |
| [08 — Pinia](08-pinia.md) | Anmeldung als Store, `storeToRefs` | 1,5–2 h |
| [09 — Composables](09-composables.md) | eigene Composables, generisches `useLocalStorage<T>` | 2–3 h |
| [10 — Ansicht der Lehrenden](10-dozenten-view.md) | Bewertungstabelle, Entwurf vs. gespeichert, Zufallsgenerator | 3–4 h |
| [11 — Ansicht der Lernenden](11-studierenden-view.md) | eigene Bewertungen, Vergleich, Balkendiagramm | 3–4 h |
| [12 — Styling und Theming](12-styling-tailwind.md) | Tailwind 4, Design-Tokens, **vier Akademien in einem Attribut** | 3–4 h |
| [13 — Tests](13-tests-vitest.md) | Vitest, Store-Tests, Komponententests | 2–3 h |
| [14 — Build und Deployment](14-build-deployment.md) | Produktions-Build, Containerfile, nginx, CI | 1–1,5 h |
| [15 — Mehrsprachigkeit](15-mehrsprachigkeit.md) | Sprachdateien, Plurale, ein Test der Erweiterbarkeit absichert | 2–3 h |
| [99 — Spickzettel](99-cheatsheet.md) | alles Wichtige auf einer Seite | |

## Wie lange dauert das?

**Insgesamt rund 32–43 Stunden.** Die Schätzungen gehen davon aus, dass du selbst tippst,
nachschlägst, die Übungen machst — und **nicht** aus der Referenz kopierst.

| Teil | Kapitel | Zeit |
| --- | --- | --- |
| Einrichtung | 00 | ~1 h |
| Sprachgrundlagen | 01–03 | ~6–9 h |
| Vue verstehen | 04–05 | ~3,5–5 h |
| Fachlichkeit und Struktur | 06–09 | ~7–10 h |
| Die beiden Ansichten | 10–11 | ~6–8 h |
| Feinschliff und Ausliefern | 12–14 | ~6–8,5 h |
| Erweiterung | 15 | ~2–3 h |
| **Gesamt** | | **~32–43 h** |

Bei zwei Abenden pro Woche à zwei Stunden sind das etwa **zehn Wochen**:

| Woche | Kapitel | Ergebnis am Ende der Woche |
| --- | --- | --- |
| 1 | 00–01 | Projekt läuft im Container, Array-Übungen grün |
| 2 | 02–03 | Playground komplett grün, TypeScript sitzt |
| 3 | 04–05 | erste eigene Komponenten auf dem Bildschirm |
| 4 | 06–07 | Domänenmodell steht, Routen greifen |
| 5 | 08–09 | Anmeldung funktioniert, Daten überleben den Reload |
| 6 | 10 | Bewertungen eintragen und speichern |
| 7 | 11 | eigene Bewertungen und der Vergleich mit Diagramm |
| 8 | 12 | vier Akademien sehen wirklich verschieden aus |
| 9 | 13–14 | Tests grün, Container gebaut |
| 10 | 15 | die App spricht zwei Sprachen |

> **Zwei Sätze zur Beruhigung.**
>
> Doppelt so lange zu brauchen ist normal und kein schlechtes Zeichen — die Zahlen sind eine
> Orientierung, damit du weißt, ob ein Kapitel noch in den Abend passt. Sie sind kein Soll.
>
> Und: Zeit, die in „warum funktioniert das jetzt nicht" fließt, ist nicht verlorene Zeit.
> Genau daran bleibt am meisten hängen.

Kapitel 01–03 kannst du überspringen, wenn du JavaScript und TypeScript schon kennst. Falls
du unsicher bist: mach die Übungen im `playground/`. Wenn sie grün werden, kannst du weiter.

## Der Übungs-Playground

Die Grundlagenkapitel haben ausführbaren Code. Im Ordner `playground/` liegen Aufgaben, die
alle mit `throw new Error('TODO: ...')` beginnen, und Tests, die deine Lösung prüfen.

```bash
cd tutorial/playground
npm install           # im DevContainer schon erledigt
npm test              # prüft deinen Code in uebungen/
npm run test:watch    # bleibt laufen und prüft bei jedem Speichern
npm run test:loesungen # prüft die Musterlösungen in loesungen/
```

`loesungen/` ist die Musterlösung. Schau erst hinein, wenn du selbst etwas versucht hast —
Lesen fühlt sich nach Verstehen an, ist es aber nicht.

## Was du brauchst

- **Podman** (getestet mit 6.0) und eine laufende Maschine: `podman machine start`
- **VS Code** mit der Erweiterung *Dev Containers* — plus einmalig in den User-Settings:
  ```json
  "dev.containers.dockerPath": "podman"
  ```
- Node brauchst du auf deinem Rechner **nicht**. Alles läuft im Container.

## Ein Wort zum Thema

Die Akademien sind mehr als Dekoration: sie sind eine echte Dimension im Datenmodell. Ein
Padawan darf keine imperialen Fächer sehen, und der Vergleich zählt nur den eigenen Jahrgang.
Genau daran lernst du, wie man so eine Trennung in die *Datenstruktur* legt statt in die
Sorgfalt beim Programmieren — und wie vier komplett verschiedene Designs aus einem einzigen
HTML-Attribut entstehen.

Los geht es mit [Kapitel 00](00-setup.md).
