# 14 — Build and deployment

> **Time:** about 1–1.5 hours · familiar ground for you

## Goal

Your project becomes a production build, that becomes a container image with nginx, and you
know why visiting a route directly gives a 404 without extra configuration.

Here you're back on familiar ground — so the focus is on what's different about an **SPA**
compared to what you usually roll out.

---

## The build

```bash
npm run build
```

That's `run-p type-check build-only`: type check and Vite build. **The type check is part of
the build** — the dev server checks no types (it only transpiles, which is why it's so fast).
So a type error only shows up here. If you're building a pipeline: `npm run build` covers both.

Result in `dist/`:

```
dist/
  index.html
  assets/
    index-Hyjej6kb.css
    index-y5iI8q_W.js
    GradeEntryView-C0EkdKlJ.js     ← its own chunk thanks to lazy loading
    vue-router-Hk5tZpEr.js
```

**The hash in the filename is the core of the delivery strategy.** If the content changes, the
name changes. That's why these files may be cached forever — there is never an "old version
under the same name".

`index.html`, by contrast, always has the same name and points at the hashed files. It must
**not** be cached, or users will keep seeing the old app after a deployment.

```bash
npm run preview     # serves dist/ on port 4173
```

Always do this once before rolling out. The production build behaves differently in a few
places from the dev server (minification, real tree shaking, `import.meta.env.PROD`).

## The SPA fallback

This is the thing you overlook once and then never again.

Your app knows `/dozent/faecher/f03`. That file doesn't exist on disk — the route is known only
to the router **in the browser**. When someone clicks there inside the app, nothing happens
server-side. But when someone opens the URL directly or reloads, the browser asks the server
for `/dozent/faecher/f03`, and it finds nothing.

The fix: send everything unknown to `index.html`.

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Other servers call it something else but do the same: Apache `FallbackResource /index.html`,
Caddy `try_files {path} /index.html`, Netlify/Vercel a rewrite rule `/* -> /index.html`.

> **Not what you're used to**
> With a classic server-rendered application every URL corresponds to an endpoint. Here **every**
> URL corresponds to the same file. The server always delivers the same shell; what happens
> inside it is decided by the router in the browser.

The alternative would be `createWebHashHistory()` (`/#/dozent/faecher/f03`) — works without
server configuration, but looks worse and is bad for search engines. Take the fallback.

## The Containerfile

```dockerfile
FROM docker.io/library/node:24-alpine AS build
WORKDIR /app

# Manifests only at first. If just the source changes, the npm-ci layer
# stays cached and the install is skipped.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM docker.io/library/nginx:1.29-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

The result is around **63 MB** — almost all of it nginx and Alpine. Node, `node_modules` and
your source stayed in the first stage and never reached the result.

`npm ci` instead of `npm install`: installs exactly according to `package-lock.json`, doesn't
modify the lockfile, and is faster. The reproducibility argument is the same one you use
everywhere else.

Plus a `.containerignore`:

```
node_modules
dist
coverage
.git
.devcontainer
.vscode
*.md
```

Without it, Podman sends your local `node_modules` along as build context — hundreds of
megabytes for nothing, and in the worst case it overwrites the image's own `npm ci`.

```bash
podman build -t datapad:1.0 -f Containerfile .
podman run --rm -p 8080:80 datapad:1.0
```

## Dev container and production image are two different things

| | Dev container | Production image |
| --- | --- | --- |
| Purpose | **developing** inside it | **serving** the built app |
| Contains | Node, npm, git, tools | nginx and `dist/` |
| Source | mounted from the host | compiled in |
| Size | ~1 GB | ~63 MB |

It's tempting to use the dev container for deployment too. Don't: you'd be shipping a compiler,
a shell and your source code.

## Configuration at build time

```ts
const base = import.meta.env.VITE_API_BASE
if (import.meta.env.PROD) { ... }
```

Only variables with the `VITE_` prefix end up in the result.

> **Important, and unlike everything else you deploy:** these values are substituted at **build
> time** and then sit in plain text in the shipped JavaScript. There are no "runtime
> environment variables" in the browser. **Never put a secret in a `VITE_` variable.** If it
> shouldn't be seen, it must not be in the browser — then you need a server in between.
>
> If you want to run the same image against different environments, read the configuration at
> runtime: a `config.json` next to `index.html`, loaded at startup.

## A pipeline

```yaml
# .github/workflows/ci.yml — a sketch, not a template
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

`cache: npm` caches based on `package-lock.json` and saves half the time on every run.

The order is deliberate: **fastest first**. Lint aborts in seconds, the build takes longest.

## If it should become a backend after all

What you'd have to touch — and what you wouldn't:

| What | Effort |
| --- | --- |
| `src/data/` | becomes the API layer |
| `src/stores/` | actions become `async` and call `fetch` |
| Loading states and error messages | new (`isLoading`, `error` per action) |
| Real authentication | a token from the server instead of a comparison in the browser |
| `src/views/`, `src/components/`, `src/lib/` | **nothing** |

That the last row looks like that is exactly the pay-off from the separation in
[chapter 06](06-domain-model.md). The views talk to stores, not to data sources.

---

## Your task

1. `npm run build`, then `npm run preview`, and click through the app at
   <http://localhost:4173>.
2. Create `Containerfile`, `nginx.conf` and `.containerignore`.
3. `podman build` and `podman run`.
4. **Prove the fallback:** open `http://localhost:8080/dozent/faecher/f03` directly. Then
   comment out `try_files`, rebuild — and look at the 404. This is a bug you want to have seen
   on purpose once.
5. Check the headers:
   ```bash
   curl -sI http://localhost:8080/assets/<file>.js | grep -i cache-control
   curl -sI http://localhost:8080/index.html | grep -i cache-control
   ```

## Self-check

- [ ] `npm run build` runs without errors or warnings
- [ ] `npm run preview` shows the complete app
- [ ] The image is under 100 MB
- [ ] Visiting a deep route directly works
- [ ] Assets: `max-age=31536000, immutable`; `index.html`: `no-cache`
- [ ] There's no `node_modules` in the image (`podman run --rm ... ls /usr/share/nginx/html`)

## In the reference

- `reference/Containerfile`, `reference/nginx.conf`, `reference/.containerignore`
- `reference/package.json` — the scripts
