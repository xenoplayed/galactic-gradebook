# Galactic Gradebook — Referenzimplementierung

[English](README.md) · **Deutsch**

Die fertige, lauffähige App zum [Tutorial](../tutorial/README.md). Sie ist als **Nachschlagewerk**
gedacht: Wenn dein eigener Nachbau klemmt, schaust du hier nach, wie es gelöst ist.

Vue 3 (Composition API) · TypeScript · Vite · Vue Router · Pinia · Tailwind CSS 4 · Vitest.
Keine Datenbank, kein Backend — die Daten sind fest hinterlegt, Änderungen landen im
`localStorage`.

## Was die App kann

Vier Akademien teilen sich eine Anwendung — Jedi, Sith, Imperium, Rebellen. Jede hat eigene
Lehrende, Lernende, Fächer, Bezeichnungen, Notenlabels und ein eigenes Erscheinungsbild.

- **Lehrende** sehen die Fächer **ihrer** Akademie mit Fortschritt und tragen Bewertungen von
  1–5 für ihre 10 Lernenden ein. *Zufällig ausfüllen* füllt alle Felder; gespeichert wird erst
  mit *Speichern*.
- **Lernende** sehen ihre eigenen Bewertungen samt Durchschnitt sowie den **anonymen Vergleich**
  je Fach: die Verteilung im eigenen Jahrgang, die eigene Bewertung hervorgehoben.

Die Trennung liegt in der Datenstruktur, nicht in Prüfungen in den Views: `createGradeBook()`
legt je Fach nur Zeilen für die eigene Akademie an, und Views behandeln ein fremdes Fach wie
ein nicht existierendes.

### Zugangsdaten

Benutzername und Passwort sind jeweils der **kleingeschriebene Nachname**. Akzente werden
ausgeschrieben (`Sabé` → `sabe`).

| Akademie | Lehrende | Lernende (Auswahl) |
| --- | --- | --- |
| Jedi-Tempel Coruscant | `yoda` | `tano`, `jarrus`, `kestis`, `bridger`, `vos` |
| Sith-Akademie Korriban | `bane` | `maul`, `ventress`, `talon`, `malgus`, `kun` |
| Imperiale Akademie Carida | `thrawn` | `versio`, `ree`, `kyrell`, `sloane`, `piett` |
| Allianz-Basis Yavin IV | `organa` | `syndulla`, `wren`, `erso`, `andor`, `sabe` |

Die Oberfläche gibt es auf **Deutsch und Englisch**; die Umschaltung sitzt rechts in der
Navigationsleiste und ist auch vor der Anmeldung erreichbar. Eine weitere Sprache ist genau
eine Datei in `src/i18n/locales/` — sie wird beim Bauen gefunden, nicht in einer Liste
aufgezählt.

Auf dem Anmeldebildschirm wählst du oben eine Akademie — das Erscheinungsbild wechselt sofort,
noch vor der Anmeldung. *Zugänge anzeigen* öffnet ein Fenster mit allen Personen dieser
Akademie; ein Klick trägt die Zugangsdaten ein. Die Auswahl ist reine Vorschau und schränkt
den Login nicht ein.

Pro Akademie sind zwei der sechs Fächer bereits bewertet, vier sind leer. *Testdaten
zurücksetzen* unter dem Formular stellt den Auslieferungszustand wieder her.

> Das ist **keine** echte Authentifizierung. Benutzername und Passwort sind identisch und
> werden im Browser geprüft. Für eine Lernanwendung ohne Backend ist das in Ordnung; für alles
> andere nicht.

## Starten

Vorgesehen ist der **DevContainer auf Podman**. In VS Code muss dafür einmalig

```json
"dev.containers.dockerPath": "podman"
```

in den User-Settings stehen — sonst tut *Reopen in Container* schlicht nichts.

Ohne VS Code geht es auch über die CLI:

```bash
npx @devcontainers/cli up --workspace-folder . --docker-path podman
```

Danach im Container:

```bash
npm run dev
```

Die App läuft dann auf <http://localhost:5173>. VS Code erkennt selbst, dass Vite im
Container lauscht, und richtet die Weiterleitung ein — dafür steht in der `devcontainer.json`
bewusst **nichts** zu Ports. Voraussetzung ist nur, dass Vite auf `0.0.0.0` lauscht
(`server.host` in `vite.config.ts`); auf dem Default `localhost` wäre er selbst für VS Code
unerreichbar.

### Ohne VS Code, nur mit der CLI

`devcontainer up` veröffentlicht **keine** Ports — die Weiterleitung ist ein VS-Code-Feature.
Willst du den Dev-Server ohne VS Code vom Host aus erreichen, ergänze vorübergehend

```jsonc
"appPort": ["5173:5173", "4173:4173"],
```

und nimm es wieder heraus, bevor du das Projekt in VS Code öffnest.

### Wenn `localhost:5173` antwortet, `127.0.0.1:5173` aber hängt

Dann liegen **zwei** Weiterleitungen auf demselben Port — typischerweise `appPort` (podman
veröffentlicht ihn) *und* VS Codes eigene. Die zweite zeigt dann auf den bereits
veröffentlichten Port und schickt sich selbst in die Schleife. Weil macOS `localhost` zuerst
nach `::1` auflöst, trifft nur `127.0.0.1` den kaputten IPv4-Socket — das sieht aus wie ein
sporadischer Fehler.

```bash
lsof -nP -iTCP:5173 -sTCP:LISTEN
```

Zwei Zeilen (ein `Code Helper` **und** `gvproxy`) sind der Beweis. Die VS-Code-Weiterleitung
überlebt den Container und sogar das Schließen des Fensters — sie hängt am Anwendungsprozess.
Entfern sie im **Ports**-Panel, oder beende VS Code ganz (`Cmd+Q`, nicht nur das Fenster).

## Befehle

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Dev-Server mit Hot Reload auf Port 5173 |
| `npm run build` | Typprüfung + Produktions-Build nach `dist/` |
| `npm run preview` | den gebauten Stand auf Port 4173 ausliefern |
| `npm run type-check` | nur `vue-tsc` |
| `npm run test:unit` | Vitest einmal durchlaufen lassen |
| `npm run test:watch` | Vitest im Watch-Modus |
| `npm run lint` | oxlint + ESLint, jeweils mit `--fix` |
| `npm run format` | Prettier über `src/` |

## Aufbau

```
src/
  types/domain.ts     Typen der Fachlichkeit (Grade, Academy, User, Subject, GradeBook)
  lib/                Vue-freie Logik: Collection<T>, Bewertungen rechnen, Strings
  data/               vier Akademien, 4 Lehrende, 40 Lernende, 24 Fächer, Seed
  stores/             Pinia: auth (Anmeldung + Akademie) und grades (Bewertungsmatrix)
  composables/        useLocalStorage<T>, useGradeStats, useRandomGrades, useAcademyTheme,
                      useLocale, useAcademyLabels
  i18n/               Setup mit Glob-Erkennung, locales/de.json, locales/en.json
  components/base/    generische Bausteine: Button, Card, Dialog, Input, Select, Table, Badge
  components/         fachlich: GradeInput, GradeBadge, Diagramm, Wappen, Kopfband
  router/index.ts     Routen, typisiertes `meta`, Rollen-Guard
  views/              je eine Seite, getrennt nach lecturer/ und student/
public/backgrounds/   vier NASA-Aufnahmen als Kopfband (siehe ../CREDITS.md)
```

Vier Entscheidungen, die den Rest erklären:

1. **`lib/` und `data/` kennen Vue nicht.** Die Fachlichkeit ist ohne Framework testbar und
   ließe sich gegen ein echtes Backend tauschen, ohne eine View anzufassen.
2. **Die Akademie ist eine Datendimension, keine Prüfung.** `academyId` auf Person und Fach
   genügt — `GradeBook` bleibt zweistufig, weil das Fach die Akademie bereits festlegt.
3. **Der Entwurf im Bewertungsformular ist lokal, nicht im Store.** Deshalb ändert *Zufällig
   ausfüllen* noch keine Daten — erst *Speichern* schreibt.
4. **Das Theming hängt an einem Attribut.** `data-academy` am `<html>` belegt dieselben
   CSS-Custom-Properties neu; keine Komponente kennt eine Akademie. Der Startwert steht im
   `index.html`, damit beim Laden nichts aufblitzt.

## Bekannte Eigenheiten

- `server.watch.usePolling` ist in `vite.config.ts` aktiv. Über einen Bind-Mount vom Host in
  den Container kommen keine inotify-Events an; ohne Polling merkt Vite Dateiänderungen nie.
  Läufst du ohne Container, kannst du es abschalten und sparst etwas CPU.
- `node_modules` liegt im DevContainer in einem Named Volume und nicht im Bind-Mount. Zwei
  Gründe: Tempo (3000 kleine Dateien schreiben — Bind-Mount 3059 ms, Volume 86 ms; hier über
  10.000 Dateien) und die Tatsache, dass auf dem Mac installierte native Binaries (esbuild,
  rollup) im Linux-Container unbrauchbar sind.
- **Kein `--userns=keep-id`.** Ob du es brauchst, hängt von deiner Podman-Maschine ab:

  ```bash
  podman info --format '{{.Host.Security.Rootless}}'
  ```

  Bei `false` (rootful) gibt es keine User-Namespace-Abbildung — die `uid_map` ist
  `0 0 4294967295`, und Podman ignoriert `keep-id`. Läuft deine Maschine **rootless** und
  gehören dir die im Container angelegten Dateien auf dem Host nicht, ergänze
  `"runArgs": ["--userns=keep-id"]`.
- Bei einem frischen `npm install` kann die Vue-Vorlage mit `ERESOLVE` abbrechen
  (`oxlint` gegen `eslint-plugin-oxlint`). Hier sind beide in der `package.json` auf dieselbe
  Nebenversion gesetzt. `npm install --legacy-peer-deps` löst es ebenfalls, übergeht die
  Prüfung dann aber für **alle** Pakete.
