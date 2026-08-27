# Galactic Gradebook — Tutorial

Bau dir eine kleine, vollständige Vue-3-Anwendung von Grund auf: **Galactic Gradebook**, eine
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

Das Repo hat **zwei Teile**:

| Ordner | Rolle |
| --- | --- |
| `tutorial/` (dieser hier) | die Kapitel, die Konzeptseiten und die Übungen |
| `reference/` | die fertige App |

Und dazu **dein eigenes Projekt**, das du beim [Setup](konzepte/00-setup.md) anlegst — in einem
*eigenen* Repo daneben, z. B. `~/projects/nodejs/mein-gradebook`. Warum getrennt: dein Nachbau soll eine
eigene Historie bekommen, und du sollst ihn wegwerfen und neu anfangen können, ohne dieses
Repo anzufassen.

Die Referenz ist **kein Vorlagenordner zum Kopieren**. Sie ist dein Nachschlagewerk: erst
selbst versuchen, und wenn es klemmt oder du wissen willst, wie es sauberer ginge, dort
nachsehen. Jede Seite endet mit den passenden Dateipfaden — die beginnen mit `reference/`
und meinen immer die fertige App, nie dein Projekt.

Jede Konzeptseite ist gleich aufgebaut:

1. **Ziel** — was am Ende funktioniert
2. **Konzepte** — das Neue, mit Beispielen
3. **Deine Aufgabe** — was du baust
4. **Stolperfallen** — was hier erfahrungsgemäß schiefgeht
5. **Selbstcheck** — woran du merkst, dass es stimmt
6. **In der Referenz** — wo du vergleichen kannst

## Zwei Spuren

Die Seiten in [`konzepte/`](konzepte/) sind nach **Themen** geschnitten: eine Seite, ein
Konzept. Das ist gut zum Lernen
und gut zum Nachschlagen — aber es sagt dir nicht, in welcher Reihenfolge du die App tatsächlich
baust. Die [Ansicht der Lehrenden](konzepte/10-dozenten-view.md) verlangt am Ende Draft-State,
Watcher, `isDirty` und eine Zugriffsprüfung auf
einmal.

Deshalb gibt es daneben die **[Build-Spur](build/README.md)**: 21 Kapitel, die dasselbe Projekt
Schritt für Schritt aufbauen. Erst stehen die Noten hartcodiert in `App.vue`, dann kommen sie
aus einem Seed, dann aus einem Store. Der Login-Knopf navigiert erst nur weiter und prüft erst
später wirklich etwas. Und es gibt lange nur *eine* Akademie.

| Spur | Beantwortet |
| --- | --- |
| [Konzepte](konzepte/) | **warum und wie** funktioniert das |
| [Kapitel](build/README.md) | **was und in welcher Reihenfolge** baue ich jetzt |

Beides zusammen: Kapitel aufschlagen, verlinkte Konzeptseite lesen, bauen, Review-Liste
durchgehen, committen. Wenn du lieber am Stück liest, kannst du die Build-Spur auch ignorieren
— die Konzeptseiten stehen für sich.

> **Ein Wort zur Nummerierung.** Beide Spuren sind nummeriert, aber getrennt: *Kapitel 10* ist
> immer eine Seite aus `build/`. Die Konzeptseiten werden mit ihrem Titel genannt.

## Reihenfolge

**Grundlagen** — ohne Vue, dafür mit ausführbaren Übungen im `playground/`:

| Seite | Thema | Zeit |
| --- | --- | --- |
| [Setup](konzepte/00-setup.md) | DevContainer auf Podman, Projekt anlegen, Werkzeuge verstehen | 45–60 min |
| [JavaScript-Grundlagen](konzepte/01-js-grundlagen.md) | Werte, Objekte und Arrays, Referenzsemantik, Array-Methoden | 2–3 h |
| [Funktionen, Module, async](konzepte/02-js-fortgeschritten.md) | Arrow-Funktionen, `this`, Module, Promises, `async`/`await` | 2–3 h |
| [TypeScript](konzepte/03-typescript.md) | Typen, Unions, Narrowing, **Generics und generische Klassen** | 2–3 h |

**Die Anwendung** — ab hier wächst dein Projekt mit; die letzte Spalte sagt, in welchem
Kapitel das passiert:

| Seite | Thema | Zeit | Kapitel |
| --- | --- | --- | --- |
| [Vue-Reaktivität](konzepte/04-vue-reactivity.md) | SFC, `ref`, `computed`, `watch`, Template-Syntax | 1,5–2 h | [01](build/01-erste-noten.md), [03](build/03-eingabe-roh.md) |
| [Komponenten](konzepte/05-komponenten.md) | Props, Emits, Slots, `v-model` auf eigenen Komponenten | 2–3 h | [02](build/02-erste-komponente.md), [16](build/16-base-components.md) |
| [Domänenmodell](konzepte/06-domaenenmodell.md) | Typen, Fixtures, die vier Akademien, Vue-freie Fachlogik | 2–3 h | [04](build/04-seed-und-typen.md), [05](build/05-fachliste.md), [15](build/15-vier-akademien.md) |
| [Vue Router](konzepte/07-router.md) | Routen, Parameter, Guards, Rollenschutz | 1,5–2 h | [06](build/06-router-zwei-views.md), [07](build/07-login-mock.md), [09](build/09-router-guards.md) |
| [Pinia](konzepte/08-pinia.md) | Anmeldung als Store, `storeToRefs` | 1,5–2 h | [08](build/08-auth-store.md), [10](build/10-grades-store-und-draft.md) |
| [Composables](konzepte/09-composables.md) | eigene Composables, generisches `useLocalStorage<T>` | 2–3 h | [12](build/12-localstorage-composable.md), [14](build/14-klassenspiegel-chart.md) |
| [Ansicht der Lehrenden](konzepte/10-dozenten-view.md) | Bewertungstabelle, Entwurf vs. gespeichert, Zufallsgenerator | 3–4 h | [10](build/10-grades-store-und-draft.md), [11](build/11-grade-input.md) |
| [Ansicht der Lernenden](konzepte/11-studierenden-view.md) | eigene Bewertungen, Vergleich, Balkendiagramm | 3–4 h | [13](build/13-student-dashboard.md), [14](build/14-klassenspiegel-chart.md) |
| [Styling mit Tailwind](konzepte/12-styling-tailwind.md) | Tailwind 4, Design-Tokens, **vier Akademien in einem Attribut** | 3–4 h | [17](build/17-tailwind-layout.md), [18](build/18-academy-themes.md) |
| [Tests mit Vitest](konzepte/13-tests-vitest.md) | Vitest, Store-Tests, Komponententests | 2–3 h | [19](build/19-tests-vitest.md) |
| [Build und Deployment](konzepte/14-build-deployment.md) | Produktions-Build, Containerfile, nginx, CI | 1–1,5 h | [20](build/20-build-deployment.md) |
| [Mehrsprachigkeit](konzepte/15-mehrsprachigkeit.md) | Sprachdateien, Plurale, ein Test der Erweiterbarkeit absichert | 2–3 h | [21](build/21-i18n.md) |
| [Spickzettel](konzepte/99-cheatsheet.md) | alles Wichtige auf einer Seite | | |

## Wie lange dauert das?

**Insgesamt rund 32–43 Stunden.** Die Schätzungen gehen davon aus, dass du selbst tippst,
nachschlägst, die Übungen machst — und **nicht** aus der Referenz kopierst.

| Teil | Seiten | Zeit |
| --- | --- | --- |
| Einrichtung | Setup | ~1 h |
| Sprachgrundlagen | JavaScript-Grundlagen bis TypeScript | ~6–9 h |
| Vue verstehen | Vue-Reaktivität, Komponenten | ~3,5–5 h |
| Fachlichkeit und Struktur | Domänenmodell bis Composables | ~7–10 h |
| Die beiden Ansichten | Lehrende, Lernende | ~6–8 h |
| Feinschliff und Ausliefern | Styling bis Deployment | ~6–8,5 h |
| Erweiterung | Mehrsprachigkeit | ~2–3 h |
| **Gesamt** | | **~32–43 h** |

Bei zwei Abenden pro Woche à zwei Stunden sind das etwa **zehn Wochen**:

| Woche | Kapitel | Ergebnis am Ende der Woche |
| --- | --- | --- |
| 1 | Setup, 01 | Projekt läuft im Container, erster Bildschirm steht |
| 2 | — | Playground komplett grün, TypeScript sitzt |
| 3 | 02–05 | eigene Komponenten, Fächerliste aus dem Seed |
| 4 | 06–09 | Routen greifen, Anmeldung funktioniert |
| 5 | 10–12 | Bewertungen eintragen, speichern, Reload überlebt |
| 6 | 13–14 | eigene Bewertungen und der Vergleich mit Diagramm |
| 7 | 15 | vier Akademien im Datenmodell |
| 8 | 16–18 | vier Akademien sehen wirklich verschieden aus |
| 9 | 19–20 | Tests grün, Container gebaut |
| 10 | 21 | die App spricht zwei Sprachen |

> **Zwei Sätze zur Beruhigung.**
>
> Doppelt so lange zu brauchen ist normal und kein schlechtes Zeichen — die Zahlen sind eine
> Orientierung, damit du weißt, ob eine Seite noch in den Abend passt. Sie sind kein Soll.
>
> Und: Zeit, die in „warum funktioniert das jetzt nicht" fließt, ist nicht verlorene Zeit.
> Genau daran bleibt am meisten hängen.

Die drei Sprachseiten kannst du überspringen, wenn du JavaScript und TypeScript schon kennst. Falls
du unsicher bist: mach die Übungen im `playground/`. Wenn sie grün werden, kannst du weiter.

## Der Übungs-Playground

Die Grundlagenseiten haben ausführbaren Code. Im Ordner `playground/` liegen Aufgaben, die
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

Los geht es mit dem [Setup](konzepte/00-setup.md) — und danach mit
[Kapitel 01](build/01-erste-noten.md).
