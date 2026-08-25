[English](README.md) · **Deutsch**

# Galactic Gradebook

Ein Lernprojekt für Vue 3 und TypeScript — mit Star-Wars-Anstrich.

**Galactic Gradebook** verwaltet Ausbildungsbewertungen für vier Akademien: den Jedi-Tempel auf
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

## Entstehung

Referenzimplementierung und Tutorial sind mit **Claude Code** (Anthropic) entstanden:
Anforderungen, Entscheidungen und Abnahme kamen von mir, geschrieben hat Claude.

Wer das Tutorial durcharbeitet, sollte das wissen. Die Erklärungen sind geprüft und die App
ist getestet — aber lies sie wie jede andere Quelle: mit Skepsis, und schlag im Zweifel in der
offiziellen Dokumentation nach.

## Lizenz

**CC0 1.0** — die Arbeit ist der Allgemeinheit gewidmet. Nimm sie, ändere sie, unterrichte
damit, verkauf sie meinetwegen; du musst mich nicht nennen und nichts zurückgeben. Der
vollständige Text steht in [LICENSE](LICENSE).

*(In Deutschland lässt sich das Urheberpersönlichkeitsrecht nicht vollständig abtreten. CC0
sieht dafür einen Auffang-Mechanismus vor; praktisch ändert das nichts an dem, was du damit
tun darfst.)*

Die Hintergrundbilder stammen aus der gemeinfreien NASA-Bibliothek — Herkunft und Urheber in
[CREDITS.md](CREDITS.md).

## Rechtliches zum Thema

Nicht-kommerzielles Fan- und Lernprojekt, ohne Verbindung zu Lucasfilm oder The Walt Disney
Company. „Star Wars" sowie die verwendeten Figuren- und Ortsnamen sind Marken ihrer jeweiligen
Inhaber und werden hier ausschließlich als Testdaten verwendet. Es sind **keine** Logos,
Filmbilder oder sonstigen Werke enthalten; die vier Akademie-Wappen sind eigene Zeichnungen.

## Sprachen

Alles liegt auf Deutsch und Englisch vor:

| | Deutsch | English |
| --- | --- | --- |
| Diese Seite | [`README.de.md`](README.de.md) | [`README.md`](README.md) |
| Tutorial | [`tutorial/de/`](tutorial/de/README.md) | [`tutorial/en/`](tutorial/en/README.md) |
| Referenz | [`reference/README.de.md`](reference/README.de.md) | [`reference/README.md`](reference/README.md) |
| Die App selbst | zur Laufzeit umschaltbar | zur Laufzeit umschaltbar |

Die deutsche Fassung des Tutorials ist das Original, die englische eine Übersetzung; bei
Abweichungen gilt die deutsche. Die Oberflächensprache der App wechselst du in der
Navigationsleiste — eine weitere Sprache ist eine Datei unter
`reference/src/i18n/locales/`.
