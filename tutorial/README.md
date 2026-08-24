# Notenverwaltung — Tutorial

Bau dir eine kleine, vollständige Vue-3-Anwendung von Grund auf: eine
**Notenverwaltung** mit zwei Rollen. Dozent:innen tragen pro Fach Noten für alle Studierenden
ein, Studierende sehen ihre eigenen Noten und den anonymen Klassenspiegel.

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
`~/projects/nodejs/Notenverwaltung/meine-notenverwaltung`.

Die Referenz ist **kein Vorlagenordner zum Kopieren**. Sie ist dein Nachschlagewerk: erst
selbst versuchen, und wenn es klemmt oder du wissen willst, wie es sauberer ginge, dort
nachsehen. Jedes Kapitel endet mit den passenden Dateipfaden.

Jedes Kapitel ist gleich aufgebaut:

1. **Ziel** — was am Ende funktioniert
2. **Konzepte** — das Neue, mit Beispielen
3. **Deine Aufgabe** — was du baust
4. **Stolperfallen** — was hier erfahrungsgemäß schiefgeht
5. **Selbstcheck** — woran du merkst, dass es stimmt
6. **In der Referenz** — wo du vergleichen kannst

## Reihenfolge

**Grundlagen** — ohne Vue, dafür mit ausführbaren Übungen im `playground/`:

| Kapitel | Thema |
| --- | --- |
| [00 — Setup](00-setup.md) | DevContainer auf Podman, Projekt anlegen, Werkzeuge verstehen |
| [01 — JavaScript-Grundlagen](01-js-grundlagen.md) | Werte, Objekte und Arrays, Referenzsemantik, Array-Methoden |
| [02 — JavaScript, zweiter Teil](02-js-fortgeschritten.md) | Arrow-Funktionen, `this`, Module, Promises, `async`/`await` |
| [03 — TypeScript](03-typescript.md) | Typen, Unions, Narrowing, **Generics und generische Klassen** |

**Die Anwendung** — ab hier wächst dein Projekt Kapitel für Kapitel:

| Kapitel | Thema |
| --- | --- |
| [04 — Vue-Reaktivität](04-vue-reactivity.md) | SFC, `ref`, `computed`, `watch`, Template-Syntax |
| [05 — Komponenten](05-komponenten.md) | Props, Emits, Slots, `v-model` auf eigenen Komponenten |
| [06 — Domänenmodell](06-domaenenmodell.md) | Typen, Fixtures, Vue-freie Fachlogik |
| [07 — Router](07-router.md) | Routen, Parameter, Guards, Rollenschutz |
| [08 — Pinia](08-pinia.md) | Anmeldung als Store, `storeToRefs` |
| [09 — Composables](09-composables.md) | eigene Composables, generisches `useLocalStorage<T>` |
| [10 — Dozenten-Ansicht](10-dozenten-view.md) | Notentabelle, Entwurf vs. gespeichert, Zufallsgenerator |
| [11 — Studierenden-Ansicht](11-studierenden-view.md) | eigene Noten, Klassenspiegel, Balkendiagramm |
| [12 — Styling](12-styling-tailwind.md) | Tailwind 4, Design-Tokens, Dark Mode |
| [13 — Tests](13-tests-vitest.md) | Vitest, Store-Tests, Komponententests |
| [14 — Build und Deployment](14-build-deployment.md) | Produktions-Build, Containerfile, nginx, CI |
| [99 — Spickzettel](99-cheatsheet.md) | alles Wichtige auf einer Seite |

Kapitel 01–03 kannst du überspringen, wenn du JavaScript und TypeScript schon kennst. Falls
du unsicher bist: mach die Übungen im `playground/`. Wenn sie grün werden, kannst du weiter.

## Der Übungs-Playground

Die Grundlagenkapitel haben ausführbaren Code. Im Ordner `playground/` liegen Aufgaben, die
alle mit `throw new Error('TODO: ...')` beginnen, und Tests, die deine Lösung prüfen.

```bash
cd playground
npm install
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

Los geht es mit [Kapitel 00](00-setup.md).
