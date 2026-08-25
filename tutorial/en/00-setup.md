# 00 — Setup: dev container, Podman, project

> **Time:** about 45–60 minutes · one-off setup, never again afterwards

## Goal

At the end of this chapter an empty but complete Vue project runs in a dev container on
Podman, and you can reach it in the browser on your machine. You know what every line of the
`devcontainer.json` does, and why `vite.config.ts` needs `host: '0.0.0.0'`.

## Two repositories, not one

Before you start: **your project does not belong in this repository.** Put it next to it:

```
~/projects/nodejs/
  galactic-gradebook/              ← this repository (tutorial + reference), read only
    tutorial/
    reference/
  my-gradebook/           ← your rebuild, its own repository
```

The reason isn't tidiness: your rebuild should get its own git history, and you should be able
to throw it away and start over without touching this repository. The templates in
[`vorlagen/`](../vorlagen/) exist exactly for that.

Incidentally, this repository has **one** dev container at the root serving both the reference
and the playground. Yours will be one for a single project — the normal case, and slightly
simpler.

## Why a container at all

Node projects pull in **platform-specific binaries** (esbuild, rollup, sharp …). An
`npm install` on a Mac drops `darwin-arm64` binaries that won't run on Linux. The container
turns that into a fixed, reproducible environment — the same argument that makes you
containerise build jobs.

## The configuration

Create `.devcontainer/devcontainer.json` in your new project folder. The finished template is
in [`vorlagen/.devcontainer/`](../vorlagen/.devcontainer/); here it is piece by piece.

```jsonc
{
  "name": "Galactic Gradebook (my rebuild)",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:24-bookworm",
```

The official dev container image brings Node, npm, git and a few conveniences. `24` is the
Node major version, `bookworm` the Debian base.

```jsonc
  // NOT present in this template
  "runArgs": ["--userns=keep-id"],
```

You'll find this line in almost every Podman guide: it makes sure that files you create inside
the container still belong to you on the host. **Whether you need it depends on how your
Podman machine runs.**

```bash
podman machine inspect podman-machine-default --format '{{.Rootful}}'
podman info --format '{{.Host.Security.Rootless}}'
```

| Machine | Meaning |
| --- | --- |
| **rootful** (`Rootful: true`) | There is no user-namespace mapping. `keep-id` is ignored and pointless. |
| **rootless** | Your UID is mapped to a subordinate UID. Without `keep-id` the files belong to a foreign UID — then you need it. |

Measured on a **rootful** machine, with and without the flag:

```
uid_map:  0  0  4294967295      ← identical in both cases
file created in the container as UID 1000  ->  on the host: uid 503
```

`0 0 4294967295` is the identity mapping — there is simply nothing to translate. Podman
ignores `keep-id` in this mode.

> Remember the reflex, not the result: a widespread recommendation can be entirely correct —
> for a different mode of operation. Two lines of `podman info` tell you whether it applies to
> you.

```jsonc
  "mounts": [
    "source=my-gradebook-node-modules,target=${containerWorkspaceFolder}/node_modules,type=volume"
  ],
```

**The most important line in the whole file.** The project folder is mounted from the host into
the container. If `node_modules` sat inside it, you'd have two problems:

**Speed.** A bind mount through the Podman VM is dramatically slower for many small files.
Measured in this very project, writing 3000 small files:

```
bind mount:    3059 ms
named volume:    86 ms      → 36× faster
```

`node_modules` has **over 10,000 files** here. Every `npm install` and every dev-server start
pays that surcharge.

**Binaries.** An install on the Mac drops `darwin-arm64` builds of esbuild and rollup that
don't run in the Linux container — and vice versa.

The named volume puts `node_modules` beside the mount: visible in the container, not on the
host.

```jsonc
  "postCreateCommand": "bash .devcontainer/post-create.sh",
```

Runs **once**, after the container has been built. The script (see the template) fixes the
owner of the freshly created volume — a new volume belongs to `root`, and `npm install` would
otherwise fail with `EACCES` — and then installs the dependencies.

There is deliberately **nothing** about **ports** in the template. That's not an oversight,
it's the lesson from a mistake.

There are three ways to reach a port inside the container:

| Way | Effect |
| --- | --- |
| write nothing | VS Code detects the listening process itself and forwards automatically |
| `"forwardPorts": [5173]` | the same, just announced explicitly |
| `"appPort": ["5173:5173"]` | becomes a real `podman run -p`, publishes the port for everyone |

**Pick exactly one.** If you combine `appPort` with VS Code's own forwarding, you end up with
two forwards on the same port: podman publishes it, and VS Code's forward then points at the
already-published port — at itself — and hangs.

> **The symptom is nasty:** `localhost:5173` **answers**, `127.0.0.1:5173` **hangs**. macOS
> resolves `localhost` to `::1` first and hits the intact IPv6 socket; only someone typing
> `127.0.0.1` lands on the broken IPv4 one. It looks as if the app works "sometimes".
>
> Diagnosis:
> ```bash
> lsof -nP -iTCP:5173 -sTCP:LISTEN
> ```
> Two lines — a `Code Helper` **and** `gvproxy` — are the proof. VS Code's forward survives the
> container and even closing the window; it hangs off the application process. Remove it in the
> **Ports** panel, or quit VS Code with `Cmd+Q`.

For the automatic forwarding to work at all, Vite has to listen on `0.0.0.0` — more on that in
a moment.

If you start the container through the **CLI** instead of VS Code there is no automatic
forwarding; then you do need `appPort` — and must not open the project in VS Code at the same
time.

```jsonc
  "remoteUser": "node",
  "customizations": { "vscode": { "extensions": [ ... ] } }
}
```

Don't work as `root`, and give VS Code inside the container the right extensions right away
(Volar for Vue, ESLint, Prettier, Tailwind IntelliSense, Vitest Explorer).

## Pointing VS Code at Podman

Once, in your user settings (`settings.json`):

```json
"dev.containers.dockerPath": "podman"
```

Without it, *Reopen in Container* simply does nothing, or you get "Docker not found".
Afterwards: command palette → **Dev Containers: Reopen in Container**.

Without VS Code it works through the CLI too:

```bash
npx @devcontainers/cli up --workspace-folder . --docker-path podman
```

## Creating the project

**Inside the container** (terminal in VS Code, or `podman exec`):

```bash
npm create vue@latest
```

Answer the questions like this:

| Question | Answer |
| --- | --- |
| Project name | `.` (the current directory) |
| TypeScript | **Yes** |
| JSX | No |
| Vue Router | **Yes** |
| Pinia | **Yes** |
| Vitest | **Yes** |
| End-to-End Testing | No |
| ESLint | **Yes** |
| Prettier | **Yes** |

Or all at once:

```bash
npm create vue@latest -- . --ts --router --pinia --vitest --eslint --prettier
```

> **Pitfall:** if the folder isn't empty (and it isn't — `.devcontainer` is already there), the
> scaffolder asks whether it may **wipe** it. Say no and let it scaffold into a subfolder that
> you then empty out — otherwise your dev container configuration is gone:
> ```bash
> npm create vue@latest -- tmp-scaffold --ts --router --pinia --vitest --eslint --prettier
> cp -a tmp-scaffold/. . && rm -rf tmp-scaffold
> ```

Then install:

```bash
npm install
```

> **If `npm install` aborts with `ERESOLVE`:** the Vue template had a version conflict between
> `oxlint` and `eslint-plugin-oxlint` for a while. Two ways:
>
> - **Clean:** set both to the same minor version in `package.json` (e.g. both `~1.79.0`) and
>   repeat the command.
> - **Quick:** `npm install --legacy-peer-deps`. That skips the peer check for *all* packages
>   though, not just the broken one — the next real conflict won't be noticed.
>
> Conflicts like this in freshly generated projects are normal, not your mistake.

## Adding Tailwind

```bash
npm install -D tailwindcss @tailwindcss/vite
```

Tailwind 4 is added as a **Vite plugin** and configured **in CSS**. There is no
`tailwind.config.js` any more — if you come across a tutorial that creates one, it's for
version 3. Details in [chapter 12](12-styling-tailwind.md).

## Configuring Vite for the container

Open `vite.config.ts` and add:

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

Every line has a reason:

- **`host: '0.0.0.0'`** — by default Vite listens on `localhost` only, and *inside the
  container* that is the container itself. Nothing would reach it from outside, port forwarding
  or not. `0.0.0.0` means "on all network interfaces".
- **`port: 5173`** — fixed, so you always have the same address in the browser.
- **`strictPort: true`** — without it Vite quietly falls back to 5174 when the port is taken.
  The forwarding then points at nothing, and you look for the fault in the wrong place.
- **`watch.usePolling`** — no inotify events arrive through a bind mount from host to
  container. Without polling Vite **never** notices file changes: hot reload doesn't fire, and
  even a hard reload keeps serving the old version out of the module graph. It costs some CPU,
  but it's the difference between "works" and "I don't understand why nothing changes".

## Your task

1. Create the project folder, take `.devcontainer/devcontainer.json` and `post-create.sh` from
   [`vorlagen/`](../vorlagen/).
2. Start the container.
3. Scaffold the Vue project, add Tailwind, adjust `vite.config.ts`.
4. Run `npm run dev` and open <http://localhost:5173> in the browser on your machine.

## What the npm scripts do

| Script | Meaning |
| --- | --- |
| `dev` | Dev server with hot reload. No build — Vite serves your files directly as ES modules, which is why it starts in milliseconds. |
| `build` | Type check plus production build into `dist/`. Only that belongs on a server. |
| `preview` | Serves `dist/` so you can check the production state locally. |
| `type-check` | `vue-tsc`, the TypeScript compiler that understands `.vue` files. Checks only, produces nothing. |
| `lint` | oxlint + ESLint. Finds classes of bugs, not formatting. |
| `format` | Prettier. Formatting, not bugs. |
| `test:unit` | Vitest. |

> **Not what you're used to**
> `npm run dev` does **not build**. The browser gets your source files almost unchanged; only
> what it requests is transformed. That's why it doesn't matter how large the project gets.

## Pitfalls

| Symptom | Cause |
| --- | --- |
| *Reopen in Container* does nothing | `dev.containers.dockerPath` not set to `podman` |
| `Cannot connect to Podman` | forgot `podman machine start` |
| Files on the host don't belong to you | rootless machine without `--userns=keep-id` — check with `podman info --format '{{.Host.Security.Rootless}}'` |
| `EACCES` during `npm install` | volume still belongs to `root` — that's what `post-create.sh` is for |
| Browser can't reach 5173 | `host: '0.0.0.0'` missing — not even VS Code gets at `localhost` |
| `localhost:5173` works, `127.0.0.1:5173` hangs | two competing forwards — `appPort` alongside VS Code's own |
| Changes don't show up | `watch.usePolling` missing |
| `Cannot find module 'esbuild-linux-arm64'` | `node_modules` passed through from the host instead of a named volume |

## Self-check

- [ ] `npm run dev` runs in the container, the start page appears at <http://localhost:5173>
- [ ] <http://127.0.0.1:5173> answers **too** — otherwise you have two forwards
- [ ] `lsof -nP -iTCP:5173 -sTCP:LISTEN` shows exactly **one** line
- [ ] You change text in `src/App.vue` and the browser updates **without** a reload
- [ ] A file created in the container belongs to you on the host (`ls -l`)
- [ ] `npm run build` completes

## In the reference

- `.devcontainer/devcontainer.json`, `.devcontainer/post-create.sh`
- `reference/vite.config.ts`
- `reference/README.md` — the *Starten* section
