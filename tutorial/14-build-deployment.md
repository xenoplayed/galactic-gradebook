# 14 — Build und Deployment

## Ziel

Aus deinem Projekt wird ein Produktions-Build, daraus ein Container-Image mit nginx, und du
weißt, warum der direkte Aufruf einer Route ohne Zusatzkonfiguration einen 404 ergibt.

Hier bist du wieder auf vertrautem Gelände — deshalb liegt der Schwerpunkt auf dem, was an
einer **SPA** anders ist als an dem, was du sonst ausrollst.

---

## Der Build

```bash
npm run build
```

Das ist `run-p type-check build-only`: Typprüfung und Vite-Build. **Die Typprüfung ist Teil
des Builds** — der Dev-Server prüft keine Typen (er transpiliert nur, deshalb ist er so
schnell). Ein Typfehler fällt also erst hier auf. Wenn du eine Pipeline baust: `npm run build`
deckt beides ab.

Ergebnis in `dist/`:

```
dist/
  index.html
  assets/
    index-Hyjej6kb.css
    index-y5iI8q_W.js
    GradeEntryView-C0EkdKlJ.js     ← eigenes Paket dank Lazy Loading
    vue-router-Hk5tZpEr.js
```

**Der Hash im Dateinamen ist der Kern der Auslieferungsstrategie.** Ändert sich der Inhalt,
ändert sich der Name. Deshalb dürfen diese Dateien dauerhaft zwischengespeichert werden — es
gibt nie eine „alte Version unter demselben Namen“.

`index.html` heißt dagegen immer gleich und verweist auf die gehashten Dateien. Sie darf
**nicht** gecacht werden, sonst zeigen Nutzer nach einem Deployment weiter die alte App.

```bash
npm run preview     # liefert dist/ auf Port 4173 aus
```

Immer einmal machen, bevor du ausrollst. Der Produktions-Build verhält sich an ein paar
Stellen anders als der Dev-Server (Minifizierung, echtes Tree-Shaking, `import.meta.env.PROD`).

## Der SPA-Fallback

Das ist die Sache, die man einmal übersieht und dann nie wieder.

Deine App kennt `/dozent/faecher/f03`. Auf der Platte existiert diese Datei nicht — die Route
kennt nur der Router **im Browser**. Klickt jemand innerhalb der App dorthin, passiert nichts
Serverseitiges. Ruft aber jemand die URL direkt auf oder lädt neu, fragt der Browser den
Server nach `/dozent/faecher/f03`, und der findet nichts.

Die Lösung: alles Unbekannte auf `index.html` umleiten.

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Bei anderen Servern heißt das anders, ist aber dasselbe: Apache `FallbackResource /index.html`,
Caddy `try_files {path} /index.html`, Netlify/Vercel eine Rewrite-Regel `/* -> /index.html`.

> **Anders als du es kennst**
> Bei einer klassischen serverseitig gerenderten Anwendung entspricht jede URL einem Endpunkt.
> Hier entspricht **jede** URL derselben Datei. Der Server liefert immer die gleiche Hülle;
> was darin passiert, entscheidet der Router im Browser.

Die Alternative wäre `createWebHashHistory()` (`/#/dozent/faecher/f03`) — funktioniert ohne
Serverkonfiguration, sieht aber schlechter aus und ist für Suchmaschinen ungünstig. Nimm den
Fallback.

## Das Containerfile

```dockerfile
FROM docker.io/library/node:24-alpine AS build
WORKDIR /app

# Erst nur die Manifeste. Aendert sich nur der Quelltext, bleibt die
# npm-ci-Schicht im Cache und die Installation wird uebersprungen.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM docker.io/library/nginx:1.29-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

Das Ergebnis sind rund **63 MB** — fast alles davon nginx und Alpine. Node, `node_modules` und
dein Quelltext sind in der ersten Stufe geblieben und nie ins Ergebnis gekommen.

`npm ci` statt `npm install`: installiert exakt nach `package-lock.json`, verändert die
Lockdatei nicht und ist schneller. Das Argument für Reproduzierbarkeit ist dasselbe wie
überall sonst bei dir.

Dazu eine `.containerignore`:

```
node_modules
dist
coverage
.git
.devcontainer
.vscode
*.md
```

Ohne die schickt Podman dein lokales `node_modules` als Build-Kontext mit — hunderte Megabyte
für nichts, und im Zweifel überschreibt es das `npm ci` des Images.

```bash
podman build -t datapad:1.0 -f Containerfile .
podman run --rm -p 8080:80 datapad:1.0
```

## DevContainer und Produktions-Image sind zwei verschiedene Dinge

| | DevContainer | Produktions-Image |
| --- | --- | --- |
| Zweck | darin **entwickeln** | die gebaute App **ausliefern** |
| Enthält | Node, npm, git, Werkzeuge | nginx und `dist/` |
| Quelltext | vom Host gemountet | einkompiliert |
| Größe | ~1 GB | ~63 MB |

Es ist verlockend, den DevContainer auch zum Ausrollen zu nehmen. Tu es nicht: du lieferst dann
einen Compiler, eine Shell und deinen Quelltext mit aus.

## Konfiguration zur Bauzeit

```ts
const base = import.meta.env.VITE_API_BASE
if (import.meta.env.PROD) { ... }
```

Nur Variablen mit dem Präfix `VITE_` landen im Ergebnis.

> **Wichtig, und anders als bei allem, was du sonst deployst:** Diese Werte werden beim
> **Bauen** eingesetzt und stehen danach im Klartext im ausgelieferten JavaScript. Es gibt
> keine „Umgebungsvariablen zur Laufzeit“ im Browser. **Niemals ein Geheimnis in eine
> `VITE_`-Variable.** Wer es nicht sehen soll, darf es nicht im Browser sein — dann braucht es
> einen Server dazwischen.
>
> Willst du dasselbe Image gegen verschiedene Umgebungen fahren, lies die Konfiguration zur
> Laufzeit: eine `config.json` neben `index.html`, die beim Start geladen wird.

## Eine Pipeline

```yaml
# .github/workflows/ci.yml — als Skizze, nicht als Vorlage
name: CI
on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run build
```

`cache: npm` cacht anhand der `package-lock.json` und spart bei jedem Lauf die halbe Zeit.

Die Reihenfolge ist Absicht: **das Schnellste zuerst**. Lint bricht in Sekunden ab, der Build
braucht am längsten.

## Wenn es doch ein Backend werden soll

Was du dafür anfassen müsstest — und was nicht:

| Was | Aufwand |
| --- | --- |
| `src/data/` | wird zur API-Anbindung |
| `src/stores/` | Aktionen werden `async` und rufen `fetch` |
| Ladezustände und Fehlermeldungen | neu (`isLoading`, `error` je Aktion) |
| Echte Anmeldung | Token vom Server statt Vergleich im Browser |
| `src/views/`, `src/components/`, `src/lib/` | **nichts** |

Dass die letzte Zeile so aussieht, ist genau der Ertrag der Trennung aus
[Kapitel 06](06-domaenenmodell.md). Die Views sprechen mit Stores, nicht mit Datenquellen.

---

## Deine Aufgabe

1. `npm run build`, dann `npm run preview`, und die App unter <http://localhost:4173>
   durchklicken.
2. `Containerfile`, `nginx.conf` und `.containerignore` anlegen.
3. `podman build` und `podman run`.
4. **Den Fallback beweisen:** ruf `http://localhost:8080/dozent/faecher/f03` direkt auf. Dann
   kommentier `try_files` aus, bau neu — und sieh dir den 404 an. Diesen Fehler willst du
   einmal bewusst gesehen haben.
5. Prüf die Header:
   ```bash
   curl -sI http://localhost:8080/assets/<datei>.js | grep -i cache-control
   curl -sI http://localhost:8080/index.html | grep -i cache-control
   ```

## Selbstcheck

- [ ] `npm run build` läuft ohne Fehler und Warnungen
- [ ] `npm run preview` zeigt die vollständige App
- [ ] Das Image ist unter 100 MB
- [ ] Direktaufruf einer tiefen Route funktioniert
- [ ] Assets: `max-age=31536000, immutable`; `index.html`: `no-cache`
- [ ] Im Image ist kein `node_modules` (`podman run --rm ... ls /usr/share/nginx/html`)

## In der Referenz

- `reference/Containerfile`, `reference/nginx.conf`, `reference/.containerignore`
- `reference/package.json` — die Skripte
