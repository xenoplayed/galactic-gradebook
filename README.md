**English** · [Deutsch](README.de.md)

# Galactic Gradebook

A learning project for Vue 3 and TypeScript — with a Star Wars coat of paint.

**Galactic Gradebook** manages training assessments for four academies: the Jedi Temple on Coruscant, the
Sith Academy on Korriban, the Imperial Academy on Carida and the Alliance base on Yavin IV.
Instructors record grades from 1 to 5; trainees see their own results and an anonymous
comparison with their cohort. Each academy has its own look.

The repository holds **two things**:

| Folder | What's inside |
| --- | --- |
| [`tutorial/`](tutorial/) | 16 chapters that walk you through building the app **yourself** — plus runnable exercises |
| [`reference/`](reference/) | the finished app, to look things up when you get stuck |

Your own rebuild belongs in a **separate repository** next to this one. The reference is a
place to look things up, not a template to copy.

## Quick start

You need [Podman](https://podman.io) with a running machine, and VS Code with the *Dev
Containers* extension. Set this once in your VS Code settings:

```json
"dev.containers.dockerPath": "podman"
```

Then open the folder, choose *Reopen in Container*, and run:

```bash
npm --prefix reference run dev
```

The app runs at <http://localhost:5173>. You don't need Node on your machine — everything runs
inside the container.

## Signing in

Pick an academy at the top of the sign-in page — **the look changes immediately**, before you
sign in. *Show accounts* lists everyone in the selected academy; clicking a name fills in the
credentials.

Username and password are both the **lowercased last name**:

| Academy | Instructor | Trainees (a few) |
| --- | --- | --- |
| Jedi Temple, Coruscant | `yoda` | `tano`, `kestis`, `bridger` |
| Sith Academy, Korriban | `bane` | `maul`, `ventress`, `talon` |
| Imperial Academy, Carida | `thrawn` | `versio`, `ree`, `sloane` |
| Alliance Base, Yavin IV | `organa` | `syndulla`, `wren`, `andor` |

The academy picker is a preview only: you can sign in as someone from a different academy at
any time, and their look takes over.

All grades live in your browser alone. *Reset demo data* below the form restores the shipped
state.

## Built with

Vue 3 (Composition API) · TypeScript · Vite · Vue Router · Pinia · Tailwind CSS 4 · vue-i18n ·
Vitest. No database, no backend — fixed sample data, changes persist to `localStorage`.

## Getting started

Begin with [`tutorial/README.md`](tutorial/README.md).

## How this was made

The reference implementation and the tutorial were built with **Claude Code** (Anthropic):
the requirements, decisions and sign-off are mine, the writing is Claude's.

If you work through the tutorial, you should know that. The explanations have been checked and
the app is tested — but read them like any other source: with some scepticism, and check the
official documentation when it matters.

## Licence

**CC0 1.0** — this work is dedicated to the public domain. Take it, change it, teach with it,
sell it for all I care; you don't have to credit me and you don't owe me anything. Full text
in [LICENSE](LICENSE).

*(German law does not allow moral rights to be waived entirely. CC0 provides a fallback for
that; in practice it changes nothing about what you may do with this.)*

The background images come from NASA's public domain library — sources and credits in
[CREDITS.md](CREDITS.md).

## About the theme

This is a non-commercial fan and learning project with no connection to Lucasfilm or The Walt
Disney Company. "Star Wars" and the character and place names used here are trademarks of
their respective owners and appear only as sample data. **No** logos, film stills or other
works are included; the four academy crests are original drawings.

## Languages

Everything is available in German and English:

| | English | Deutsch |
| --- | --- | --- |
| This page | [`README.md`](README.md) | [`README.de.md`](README.de.md) |
| Tutorial | [`tutorial/en/`](tutorial/en/README.md) | [`tutorial/de/`](tutorial/de/README.md) |
| Reference | [`reference/README.md`](reference/README.md) | [`reference/README.de.md`](reference/README.de.md) |
| The app itself | switchable at runtime | switchable at runtime |

The German tutorial is the original, the English one a translation; where they differ, the
German text applies. The app's interface language is switched in the navigation bar — adding
another language means adding one file under `reference/src/i18n/locales/`.
