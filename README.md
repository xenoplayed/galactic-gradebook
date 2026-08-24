# Datapad

Ein Lernprojekt für Vue 3 und TypeScript — mit Star-Wars-Anstrich.

**Datapad** verwaltet Ausbildungsbewertungen für vier Akademien: den Jedi-Tempel auf
Coruscant, die Sith-Akademie Korriban, die Imperiale Akademie Carida und die Allianz-Basis
Yavin IV. Lehrende tragen Bewertungen von 1 bis 5 ein, Lernende sehen ihre eigenen und den
anonymen Vergleich mit ihrem Jahrgang. Jede Akademie hat ihr eigenes Erscheinungsbild.

Das Repo enthält **zwei Dinge**:

| Ordner | Was drin ist |
| --- | --- |
| [`tutorial/`](tutorial/) | 16 Kapitel, mit denen du die App **selbst** baust — plus ausführbare Übungen |
| [`reference/`](reference/) | die fertige App, zum Nachschlagen wenn es klemmt |

Dein eigener Nachbau gehört in ein **eigenes Repo** daneben. Die Referenz ist Nachschlagewerk,
kein Vorlagenordner zum Kopieren.

## Schnellstart

Voraussetzung: [Podman](https://podman.io) mit laufender Maschine und VS Code mit der
Erweiterung *Dev Containers*. In den VS-Code-Settings einmalig:

```json
"dev.containers.dockerPath": "podman"
```

Dann den Ordner öffnen und *Reopen in Container* wählen. Danach:

```bash
npm --prefix reference run dev
```

Die App läuft auf <http://localhost:5173>. Node brauchst du auf deinem Rechner nicht — alles
läuft im Container.

### Zugänge

Auf dem Anmeldebildschirm wählst du oben eine Akademie — das **Erscheinungsbild wechselt
sofort**, noch bevor du angemeldet bist. Der Knopf *Zugänge anzeigen* listet alle Personen der
gewählten Akademie; ein Klick trägt Benutzername und Passwort ein.

Benutzername und Passwort sind jeweils der **kleingeschriebene Nachname**:

| Akademie | Lehrende | Lernende (Auswahl) |
| --- | --- | --- |
| Jedi-Tempel Coruscant | `yoda` | `tano`, `kestis`, `bridger` |
| Sith-Akademie Korriban | `bane` | `maul`, `ventress`, `talon` |
| Imperiale Akademie Carida | `thrawn` | `versio`, `ree`, `sloane` |
| Allianz-Basis Yavin IV | `organa` | `syndulla`, `wren`, `andor` |

Die Auswahl oben ist reine Vorschau: Du kannst dich jederzeit als jemand aus einer anderen
Akademie anmelden — danach gilt deren Design.

Alle Bewertungen liegen nur im Browser. Unter dem Formular setzt *Testdaten zurücksetzen*
alles auf den Auslieferungszustand zurück.

## Womit gebaut

Vue 3 (Composition API) · TypeScript · Vite · Vue Router · Pinia · Tailwind CSS 4 · Vitest.
Keine Datenbank, kein Backend — feste Testdaten, Änderungen landen im `localStorage`.

## Loslegen

Fang mit [`tutorial/README.md`](tutorial/README.md) an.

## Rechtliches

Nicht-kommerzielles Fan- und Lernprojekt, ohne Verbindung zu Lucasfilm oder Disney. Namen
werden ausschließlich als Testdaten verwendet, es sind keine Logos oder Filmbilder enthalten.
Die Hintergrundbilder stammen aus der gemeinfreien NASA-Bibliothek. Einzelheiten in
[CREDITS.md](CREDITS.md); der Code steht unter der [MIT-Lizenz](LICENSE).
