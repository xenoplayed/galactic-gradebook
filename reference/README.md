# Notenverwaltung — Referenzimplementierung

Die fertige, lauffähige App zum Tutorial. Sie ist als **Nachschlagewerk** gedacht:
Wenn dein eigener Nachbau klemmt, schaust du hier nach, wie es gelöst ist.

Vue 3 (Composition API) · TypeScript · Vite · Vue Router · Pinia · Tailwind CSS 4 · Vitest.
Keine Datenbank, kein Backend — die Daten sind fest hinterlegt, Änderungen landen im
`localStorage`.

## Was die App kann

Zwei Rollen:

- **Dozent:in** — sieht alle Fächer mit Fortschritt, trägt pro Fach für alle 15 Studierenden
  Noten von 1–5 ein. Ein Klick auf *Zufällig ausfüllen* füllt alle Felder; gespeichert wird
  erst mit *Speichern*.
- **Studierende** — sehen ihre eigenen Noten samt Durchschnitt sowie den **Klassenspiegel**
  je Fach: die anonyme Notenverteilung, die eigene Note hervorgehoben.

### Zugangsdaten

Benutzername und Passwort sind jeweils der **kleingeschriebene Nachname**.
Umlaute werden ausgeschrieben (`Müller` → `mueller`).

| Rolle | Benutzer | Passwort |
| --- | --- | --- |
| Dozentin | `weber` | `weber` |
| Studentin | `mueller` | `mueller` |
| weitere Studierende | `ackermann`, `berger`, `conrad`, `doerner`, `engel`, `fischer`, `gross`, `hartmann`, `ilgner`, `jahn`, `koehler`, `lorenz`, `nowak`, `petrov` | jeweils identisch |

Vier der zehn Fächer sind bereits benotet (Mathematik I, Datenbanken, Webentwicklung,
Statistik), sechs sind leer.

> Das ist **keine** echte Authentifizierung. Benutzername und Passwort sind identisch und
> werden im Browser geprüft. Für eine Lernanwendung ohne Backend ist das in Ordnung; für
> alles andere nicht.

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
  types/domain.ts     Typen der Fachlichkeit (Grade, User, Subject, GradeBook)
  lib/                Vue-freie Logik: Collection<T>, Notenrechnen, Strings
  data/               fest hinterlegte Dozentin, 15 Studierende, 10 Fächer, Seed
  stores/             Pinia: auth (Anmeldung) und grades (Notenmatrix)
  composables/        useLocalStorage<T>, useGradeStats, useRandomGrades
  components/base/    generische Bausteine: Button, Card, Input, Select, Table, Badge
  components/         fachliche Bausteine: GradeInput, GradeBadge, Diagramm, StatTile
  router/index.ts     Routen, typisiertes `meta`, Rollen-Guard
  views/              je eine Seite, getrennt nach lecturer/ und student/
```

Drei Entscheidungen, die den Rest erklären:

1. **`lib/` und `data/` kennen Vue nicht.** Die Fachlichkeit ist ohne Framework testbar und
   ließe sich gegen ein echtes Backend tauschen, ohne eine View anzufassen.
2. **Der Entwurf im Notenformular ist lokal, nicht im Store.** Deshalb ändert *Zufällig
   ausfüllen* noch keine Daten — erst *Speichern* schreibt.
3. **Der Klassenspiegel bekommt nur Noten, keine Namen.** Was die View nie erhält, kann sie
   auch nicht versehentlich anzeigen.

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
