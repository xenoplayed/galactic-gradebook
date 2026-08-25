# Galactic Gradebook — reference implementation

**English** · [Deutsch](README.de.md)

The finished, running app that goes with the [tutorial](../tutorial/README.md). It is meant as
a **reference**: when your own rebuild gets stuck, you look here to see how it was solved.

Vue 3 (Composition API) · TypeScript · Vite · Vue Router · Pinia · Tailwind CSS 4 · Vitest.
No database, no backend — the data is hard-coded, changes end up in `localStorage`.

## What the app does

Four academies share one application — Jedi, Sith, Empire, Rebels. Each has its own lecturers,
trainees, subjects, terminology, grade labels and its own visual identity.

- **Lecturers** see the subjects of **their** academy with progress and enter grades from 1–5
  for their 10 trainees. *Fill randomly* fills every field; nothing is stored until you press
  *Save*.
- **Trainees** see their own grades including the average, plus the **anonymous comparison**
  per subject: the distribution within their own year, their own grade highlighted.

The separation lives in the data structure, not in checks inside the views:
`createGradeBook()` only creates rows for a subject's own academy, and views treat a foreign
subject like one that doesn't exist.

### Credentials

Username and password are both the **lower-case last name**. Accents are spelled out
(`Sabé` → `sabe`).

| Academy | Lecturer | Trainees (a selection) |
| --- | --- | --- |
| Jedi Temple Coruscant | `yoda` | `tano`, `jarrus`, `kestis`, `bridger`, `vos` |
| Sith Academy Korriban | `bane` | `maul`, `ventress`, `talon`, `malgus`, `kun` |
| Imperial Academy Carida | `thrawn` | `versio`, `ree`, `kyrell`, `sloane`, `piett` |
| Alliance Base Yavin IV | `organa` | `syndulla`, `wren`, `erso`, `andor`, `sabe` |

The interface is available in **German and English**; the switch sits on the right of the
navigation bar and is reachable before signing in as well. Another language is exactly one
file in `src/i18n/locales/` — it is discovered at build time, not listed anywhere.

On the login screen you pick an academy at the top — the appearance changes immediately, before
you sign in. *Show accounts* opens a window with everyone in that academy; one click fills in
the credentials. The selection is a preview only and does not restrict the login.

Per academy two of the six subjects are already graded, four are empty. *Reset test data*
below the form restores the delivered state.

> This is **not** real authentication. Username and password are identical and are checked in
> the browser. For a learning application without a backend that's fine; for anything else it
> isn't.

## Running it

The intended path is the **dev container on Podman**. In VS Code this needs

```json
"dev.containers.dockerPath": "podman"
```

in your user settings once — otherwise *Reopen in Container* simply does nothing.

It works without VS Code through the CLI too:

```bash
npx @devcontainers/cli up --workspace-folder . --docker-path podman
```

Then, inside the container:

```bash
npm run dev
```

The app runs at <http://localhost:5173>. VS Code notices on its own that Vite is listening
inside the container and sets up the forward — which is why `devcontainer.json` deliberately
says **nothing** about ports. The only prerequisite is that Vite listens on `0.0.0.0`
(`server.host` in `vite.config.ts`); on the default `localhost` it would be unreachable even
for VS Code.

### Without VS Code, CLI only

`devcontainer up` publishes **no** ports — forwarding is a VS Code feature. If you want to
reach the dev server from the host without VS Code, temporarily add

```jsonc
"appPort": ["5173:5173", "4173:4173"],
```

and take it out again before you open the project in VS Code.

### When `localhost:5173` answers but `127.0.0.1:5173` hangs

Then **two** forwards sit on the same port — typically `appPort` (podman publishes it) *and*
VS Code's own. The second one points at the already-published port and sends itself in a loop.
Because macOS resolves `localhost` to `::1` first, only `127.0.0.1` hits the broken IPv4
socket — which looks like an intermittent fault.

```bash
lsof -nP -iTCP:5173 -sTCP:LISTEN
```

Two lines (a `Code Helper` **and** `gvproxy`) are the proof. The VS Code forward outlives the
container and even the closing of the window — it hangs off the application process. Remove it
in the **Ports** panel, or quit VS Code entirely (`Cmd+Q`, not just the window).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | dev server with hot reload on port 5173 |
| `npm run build` | type-check + production build into `dist/` |
| `npm run preview` | serve the built state on port 4173 |
| `npm run type-check` | `vue-tsc` only |
| `npm run test:unit` | run Vitest once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run lint` | oxlint + ESLint, both with `--fix` |
| `npm run format` | Prettier over `src/` |

## Layout

```
src/
  types/domain.ts     domain types (Grade, Academy, User, Subject, GradeBook)
  lib/                Vue-free logic: Collection<T>, grade arithmetic, strings
  data/               four academies, 4 lecturers, 40 trainees, 24 subjects, seed
  stores/             Pinia: auth (login + academy) and grades (the grade matrix)
  composables/        useLocalStorage<T>, useGradeStats, useRandomGrades, useAcademyTheme,
                      useLocale, useAcademyLabels
  i18n/               setup with glob discovery, locales/de.json, locales/en.json
  components/base/    generic building blocks: Button, Card, Dialog, Input, Select, Table, Badge
  components/         domain-specific: GradeInput, GradeBadge, chart, crest, banner
  router/index.ts     routes, typed `meta`, role guard
  views/              one page each, split into lecturer/ and student/
public/backgrounds/   four NASA images used as banners (see ../CREDITS.md)
```

Four decisions that explain the rest:

1. **`lib/` and `data/` don't know Vue.** The domain is testable without a framework and could
   be swapped for a real backend without touching a single view.
2. **The academy is a data dimension, not a check.** An `academyId` on person and subject is
   enough — `GradeBook` stays two levels deep, because the subject already fixes the academy.
3. **The draft in the grading form is local, not in the store.** That's why *Fill randomly*
   changes no data yet — only *Save* writes.
4. **Theming hangs off one attribute.** `data-academy` on `<html>` redefines the same CSS
   custom properties; no component knows an academy. The initial value sits in `index.html`
   so nothing flashes on load.

## Known quirks

- `server.watch.usePolling` is enabled in `vite.config.ts`. No inotify events arrive across a
  bind mount from host into container; without polling Vite never notices file changes. If you
  run without a container you can turn it off and save a little CPU.
- `node_modules` lives in a named volume inside the dev container, not in the bind mount. Two
  reasons: speed (writing 3000 small files — bind mount 3059 ms, volume 86 ms; here it's over
  10,000 files) and the fact that native binaries installed on the Mac (esbuild, rollup) are
  unusable inside the Linux container.
- **No `--userns=keep-id`.** Whether you need it depends on your Podman machine:

  ```bash
  podman info --format '{{.Host.Security.Rootless}}'
  ```

  On `false` (rootful) there is no user-namespace mapping — the `uid_map` is `0 0 4294967295`,
  and Podman ignores `keep-id`. If your machine runs **rootless** and files created in the
  container aren't owned by you on the host, add `"runArgs": ["--userns=keep-id"]`.
- A fresh `npm install` of the Vue template can abort with `ERESOLVE` (`oxlint` against
  `eslint-plugin-oxlint`). Here both are pinned to the same minor version in `package.json`.
  `npm install --legacy-peer-deps` fixes it too, but then skips the check for **all** packages.
