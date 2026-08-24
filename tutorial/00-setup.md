# 00 — Setup: DevContainer, Podman, Projekt

## Ziel

Am Ende dieses Kapitels läuft ein leeres, aber vollständiges Vue-Projekt in einem
DevContainer auf Podman, und du erreichst es im Browser deines Rechners. Du weißt, was jede
Zeile der `devcontainer.json` tut und warum in der `vite.config.ts` `host: '0.0.0.0'` stehen
muss.

## Zwei Repos, nicht eins

Bevor du anfängst: **dein Projekt gehört nicht in dieses Repo.** Leg es daneben an:

```
~/projects/nodejs/
  datapad/              ← dieses Repo (Tutorial + Referenz), nur lesen
    tutorial/
    reference/
  mein-datapad/         ← dein Nachbau, eigenes Repo
```

Der Grund ist nicht Ordnungsliebe: dein Nachbau soll eine eigene Git-Historie bekommen, und du
sollst ihn wegwerfen und neu anfangen können, ohne dieses Repo anzufassen. Die Vorlagen in
[`vorlagen/`](vorlagen/) sind genau dafür da.

Dieses Repo hat übrigens **einen** DevContainer an der Wurzel, der Referenz und Playground
zusammen bedient. Deiner wird einer für ein einzelnes Projekt — das ist der Normalfall und
etwas einfacher.

## Warum überhaupt ein Container

Node-Projekte binden **plattformspezifische Binärdateien** ein (esbuild, rollup, sharp …).
Ein `npm install` auf dem Mac legt `darwin-arm64`-Binaries ab, die unter Linux nicht laufen.
Der Container macht daraus eine feste, reproduzierbare Umgebung — dasselbe Argument, aus dem
du Build-Jobs containerisierst.

## Die Konfiguration

Lege in deinem neuen Projektordner `.devcontainer/devcontainer.json` an. Die fertige Vorlage
liegt in [`vorlagen/.devcontainer/`](vorlagen/.devcontainer/); hier ist sie Stück für Stück.

```jsonc
{
  "name": "Datapad (mein Nachbau)",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:24-bookworm",
```

Das offizielle DevContainer-Image bringt Node, npm, git und ein paar Bequemlichkeiten mit.
`24` ist die Node-Hauptversion, `bookworm` die Debian-Basis.

```jsonc
  // steht in dieser Vorlage NICHT drin
  "runArgs": ["--userns=keep-id"],
```

Diesen Eintrag findest du in fast jeder Podman-Anleitung: er sorgt dafür, dass Dateien, die du
im Container anlegst, auf dem Host weiterhin dir gehören. **Ob du ihn brauchst, hängt davon
ab, wie deine Podman-Maschine läuft.**

```bash
podman machine inspect podman-machine-default --format '{{.Rootful}}'
podman info --format '{{.Host.Security.Rootless}}'
```

| Maschine | Bedeutung |
| --- | --- |
| **rootful** (`Rootful: true`) | Es gibt keine User-Namespace-Abbildung. `keep-id` wird ignoriert und ist überflüssig. |
| **rootless** | Deine UID wird auf eine Subordinate-UID abgebildet. Ohne `keep-id` gehören die Dateien einer fremden UID — dann brauchst du ihn. |

Nachgemessen auf einer **rootful** Maschine, mit und ohne den Schalter:

```
uid_map:  0  0  4294967295      ← in beiden Fällen identisch
Datei im Container als UID 1000 angelegt  ->  auf dem Host: uid 503 (ehlf)
```

`0 0 4294967295` ist die Identitätsabbildung — es gibt schlicht nichts umzurechnen. Podman
ignoriert `keep-id` in diesem Modus.

> Merk dir den Reflex, nicht das Ergebnis: Eine verbreitete Empfehlung kann völlig richtig
> sein — für eine andere Betriebsart. Zwei Zeilen `podman info` beantworten, ob sie auf dich
> zutrifft.

```jsonc
  "mounts": [
    "source=mein-datapad-node-modules,target=${containerWorkspaceFolder}/node_modules,type=volume"
  ],
```

**Der wichtigste Eintrag der ganzen Datei.** Der Projektordner wird vom Host in den Container
gemountet. Läge `node_modules` mit darin, hättest du zwei Probleme:

**Tempo.** Ein Bind-Mount über die Podman-VM ist bei vielen kleinen Dateien dramatisch
langsamer. Gemessen in genau diesem Projekt, 3000 kleine Dateien schreiben:

```
Bind-Mount:    3059 ms
Named Volume:    86 ms      → Faktor 36
```

`node_modules` hat hier **über 10.000 Dateien**. Jedes `npm install` und jeder Start des
Dev-Servers zahlt diesen Aufschlag.

**Binärdateien.** Eine Installation auf dem Mac legt `darwin-arm64`-Binaries von esbuild und
rollup ab, die im Linux-Container nicht laufen — und umgekehrt.

Das Named Volume legt `node_modules` daneben: im Container sichtbar, auf dem Host nicht.

```jsonc
  "postCreateCommand": "bash .devcontainer/post-create.sh",
```

Läuft **einmalig**, nachdem der Container gebaut wurde. Das Skript (siehe Vorlage) korrigiert
den Eigentümer des frisch angelegten Volumes — ein neues Volume gehört `root`, und `npm
install` scheitert sonst mit `EACCES` — und installiert danach die Abhängigkeiten.

Zu den **Ports** steht in der Vorlage bewusst gar nichts. Das ist kein Vergessen, sondern die
Lehre aus einem Fehler.

Es gibt drei Wege, an einen Port im Container zu kommen:

| Weg | Wirkung |
| --- | --- |
| gar nichts eintragen | VS Code erkennt den lauschenden Prozess selbst und leitet automatisch weiter |
| `"forwardPorts": [5173]` | dasselbe, nur explizit angekündigt |
| `"appPort": ["5173:5173"]` | wird zu einem echten `podman run -p`, veröffentlicht den Port für alle |

**Nimm genau einen.** Kombinierst du `appPort` mit VS Codes Weiterleitung, entstehen zwei
Weiterleitungen auf demselben Port: podman veröffentlicht ihn, und VS Codes eigene zeigt dann
auf den bereits veröffentlichten Port — also auf sich selbst — und hängt.

> **Das Fehlerbild ist gemein:** `localhost:5173` **antwortet**, `127.0.0.1:5173` **hängt**.
> macOS löst `localhost` zuerst nach `::1` auf und trifft den intakten IPv6-Socket; nur wer
> `127.0.0.1` eintippt, landet auf dem kaputten IPv4-Socket. Es sieht aus, als funktioniere
> die App „manchmal".
>
> Diagnose:
> ```bash
> lsof -nP -iTCP:5173 -sTCP:LISTEN
> ```
> Zwei Zeilen — ein `Code Helper` **und** `gvproxy` — sind der Beweis. Die VS-Code-Weiterleitung
> überlebt den Container und sogar das Schließen des Fensters; sie hängt am Anwendungsprozess.
> Entfern sie im **Ports**-Panel oder beende VS Code mit `Cmd+Q`.

Damit die automatische Weiterleitung überhaupt greifen kann, muss Vite auf `0.0.0.0` lauschen
— dazu gleich mehr.

Startest du den Container über die **CLI** statt in VS Code, gibt es keine automatische
Weiterleitung; dann brauchst du `appPort` — und darfst das Projekt währenddessen nicht
zusätzlich in VS Code öffnen.

```jsonc
  "remoteUser": "node",
  "customizations": { "vscode": { "extensions": [ ... ] } }
}
```

Nicht als `root` arbeiten, und VS Code im Container gleich die richtigen Erweiterungen geben
(Volar für Vue, ESLint, Prettier, Tailwind IntelliSense, Vitest Explorer).

## VS Code auf Podman umstellen

Einmalig in den User-Settings (`settings.json`):

```json
"dev.containers.dockerPath": "podman"
```

Ohne das passiert bei *Reopen in Container* schlicht nichts oder du bekommst „Docker not
found“. Danach: Kommandopalette → **Dev Containers: Reopen in Container**.

Ohne VS Code geht es auch über die CLI:

```bash
npx @devcontainers/cli up --workspace-folder . --docker-path podman
```

## Das Projekt anlegen

**Im Container** (Terminal in VS Code, oder `podman exec`):

```bash
npm create vue@latest
```

Beantworte die Fragen so:

| Frage | Antwort |
| --- | --- |
| Project name | `.` (das aktuelle Verzeichnis) |
| TypeScript | **Ja** |
| JSX | Nein |
| Vue Router | **Ja** |
| Pinia | **Ja** |
| Vitest | **Ja** |
| End-to-End Testing | Nein |
| ESLint | **Ja** |
| Prettier | **Ja** |

Alternativ in einem Rutsch:

```bash
npm create vue@latest -- . --ts --router --pinia --vitest --eslint --prettier
```

> **Stolperfalle:** Ist der Ordner nicht leer (und das ist er nicht — `.devcontainer` liegt
> ja schon drin), fragt der Scaffolder, ob er ihn **leeren** darf. Sag Nein und lass ihn in
> einen Unterordner scaffolden, den du danach ausräumst — sonst ist deine
> DevContainer-Konfiguration weg:
> ```bash
> npm create vue@latest -- tmp-scaffold --ts --router --pinia --vitest --eslint --prettier
> cp -a tmp-scaffold/. . && rm -rf tmp-scaffold
> ```

Dann installieren:

```bash
npm install
```

> **Falls `npm install` mit `ERESOLVE` abbricht:** Die Vue-Vorlage hatte zeitweise einen
> Versionskonflikt zwischen `oxlint` und `eslint-plugin-oxlint`. Zwei Wege:
>
> - **Sauber:** beide in der `package.json` auf dieselbe Nebenversion setzen (z. B. beide
>   `~1.79.0`) und den Befehl wiederholen.
> - **Schnell:** `npm install --legacy-peer-deps`. Das übergeht die Peer-Prüfung allerdings
>   für *alle* Pakete, nicht nur für das eine kaputte — der nächste echte Konflikt fällt dann
>   nicht mehr auf.
>
> Solche Konflikte in frisch generierten Projekten sind normal, kein Fehler deinerseits.

## Tailwind ergänzen

```bash
npm install -D tailwindcss @tailwindcss/vite
```

Tailwind 4 wird als **Vite-Plugin** eingebunden und **in CSS** konfiguriert. Eine
`tailwind.config.js` gibt es nicht mehr — falls du auf ein Tutorial stößt, das eine anlegt,
ist es für Version 3. Details in [Kapitel 12](12-styling-tailwind.md).

## Vite für den Container konfigurieren

Öffne `vite.config.ts` und ergänze:

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  // ...
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: { usePolling: true, interval: 300 },
  },
})
```

Jede Zeile hat einen Grund:

- **`host: '0.0.0.0'`** — Vite lauscht standardmäßig nur auf `localhost`, und das ist
  *innerhalb des Containers* nur der Container selbst. Von außen käme trotz Port-Weiterleitung
  keine Verbindung an. `0.0.0.0` heißt „auf allen Netzwerkschnittstellen“.
- **`port: 5173`** — fest, damit du immer dieselbe Adresse im Browser hast.
- **`strictPort: true`** — ohne das weicht Vite bei belegtem Port still auf 5174 aus. Die
  Weiterleitung zeigt dann ins Leere, und du suchst den Fehler an der falschen Stelle.
- **`watch.usePolling`** — über einen Bind-Mount vom Host in den Container kommen keine
  inotify-Ereignisse an. Ohne Polling merkt Vite Dateiänderungen **nie**: Hot Reload feuert
  nicht, und selbst ein harter Reload liefert weiter die alte Version aus dem Modulgraphen.
  Das kostet etwas CPU, ist aber der Unterschied zwischen „funktioniert“ und „ich verstehe
  nicht, warum sich nichts ändert“.

## Deine Aufgabe

1. Projektordner anlegen, `.devcontainer/devcontainer.json` und `post-create.sh` aus
   [`vorlagen/`](vorlagen/) übernehmen.
2. Container starten.
3. Vue-Projekt scaffolden, Tailwind ergänzen, `vite.config.ts` anpassen.
4. `npm run dev` und im Browser deines Rechners <http://localhost:5173> öffnen.

## Was die npm-Skripte tun

| Skript | Bedeutung |
| --- | --- |
| `dev` | Dev-Server mit Hot Reload. Kein Build — Vite liefert deine Dateien direkt als ES-Module aus, deshalb startet er in Millisekunden. |
| `build` | Typprüfung plus Produktions-Build nach `dist/`. Nur das gehört auf einen Server. |
| `preview` | liefert `dist/` aus, um den Produktionsstand lokal zu prüfen. |
| `type-check` | `vue-tsc`, der TypeScript-Compiler mit Verständnis für `.vue`-Dateien. Prüft nur, erzeugt nichts. |
| `lint` | oxlint + ESLint. Findet Fehlerklassen, keine Formatierung. |
| `format` | Prettier. Formatierung, keine Fehler. |
| `test:unit` | Vitest. |

> **Anders als du es kennst**
> `npm run dev` **baut nicht**. Der Browser bekommt deine Quelldateien fast unverändert; nur
> was er anfragt, wird übersetzt. Deshalb ist es egal, wie groß das Projekt wird.

## Stolperfallen

| Symptom | Ursache |
| --- | --- |
| *Reopen in Container* tut nichts | `dev.containers.dockerPath` nicht auf `podman` gesetzt |
| `Cannot connect to Podman` | `podman machine start` vergessen |
| Dateien gehören auf dem Host nicht dir | rootless Maschine ohne `--userns=keep-id` — prüfen mit `podman info --format '{{.Host.Security.Rootless}}'` |
| `EACCES` bei `npm install` | Volume gehört noch `root` — das ist der Zweck von `post-create.sh` |
| Browser erreicht 5173 nicht | `host: '0.0.0.0'` fehlt — auf `localhost` kommt selbst VS Code nicht heran |
| `localhost:5173` geht, `127.0.0.1:5173` hängt | zwei konkurrierende Weiterleitungen — `appPort` neben VS Codes eigener |
| Änderungen kommen nicht an | `watch.usePolling` fehlt |
| `Cannot find module 'esbuild-linux-arm64'` | `node_modules` vom Host durchgereicht statt Named Volume |

## Selbstcheck

- [ ] `npm run dev` läuft im Container, die Startseite erscheint auf <http://localhost:5173>
- [ ] **Auch** <http://127.0.0.1:5173> antwortet — sonst hast du zwei Weiterleitungen
- [ ] `lsof -nP -iTCP:5173 -sTCP:LISTEN` zeigt genau **eine** Zeile
- [ ] Du änderst Text in `src/App.vue` und der Browser aktualisiert sich **ohne** Reload
- [ ] Eine im Container angelegte Datei gehört auf dem Host dir (`ls -l`)
- [ ] `npm run build` läuft durch

## In der Referenz

- `.devcontainer/devcontainer.json`, `.devcontainer/post-create.sh`
- `reference/vite.config.ts`
- `reference/README.md` — Abschnitt *Starten*
