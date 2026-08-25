# Datapad — Tutorial

Build a small but complete Vue 3 application from scratch: **Datapad**, a training-records app
for four Star Wars academies. Instructors record assessments from 1 to 5; trainees see their
own results and an anonymous comparison with their cohort. Each academy — Jedi, Sith, Empire,
Rebels — has its own look.

The goal is not the app. The goal is that afterwards you can start your own projects in
JavaScript, TypeScript and Vue without searching for every second step.

## Who this is written for

Someone who **can program, but not in this ecosystem**: scripting, automation, containers and
CI are familiar; JavaScript, TypeScript and Vue are not.

So you won't find explanations of what a variable or a loop is. Instead there are thorough
explanations everywhere JavaScript **behaves differently from what you expect** — that's what
trips people up when they switch, not the basics. Those spots are marked:

> **Not what you're used to**
> A quick comparison with Python, Bash or Go.

## How to work with this

The repository has **two parts**:

| Folder | Role |
| --- | --- |
| `tutorial/` (this one) | the chapters and the exercises |
| `reference/` | the finished app |

Plus **your own project**, which you create in chapter 00 — in a *separate* repository next to
this one, e.g. `~/projects/nodejs/my-datapad`. Why separate: your rebuild should have its own
history, and you should be able to delete it and start over without touching this repository.

The reference is **not a template to copy from**. It's a place to look things up: try it
yourself first, and when you get stuck or want to know how it could be done more cleanly, look
there. Every chapter ends with the relevant file paths — those start with `reference/` and
always mean the finished app, never your project.

> **A note on the code.** The reference implementation carries **German comments** — it was
> written by a German speaker for their own use. The code itself, all identifiers and file
> names, are English. The snippets in this English tutorial have English comments.

Every chapter follows the same shape:

1. **Goal** — what works at the end
2. **Concepts** — the new material, with examples
3. **Your task** — what you build
4. **Pitfalls** — what tends to go wrong here
5. **Self-check** — how you know it's right
6. **In the reference** — where to compare

## Order

**Fundamentals** — no Vue, but with runnable exercises in `playground/`:

| Chapter | Topic | Time |
| --- | --- | --- |
| [00 — Setup](00-setup.md) | Dev container on Podman, creating the project, understanding the tools | 45–60 min |
| [01 — JavaScript fundamentals](01-js-fundamentals.md) | values, objects and arrays, reference semantics, array methods | 2–3 h |
| [02 — JavaScript, part two](02-js-advanced.md) | arrow functions, `this`, modules, promises, `async`/`await` | 2–3 h |
| [03 — TypeScript](03-typescript.md) | types, unions, narrowing, **generics and generic classes** | 2–3 h |

**The application** — from here your project grows chapter by chapter:

| Chapter | Topic | Time |
| --- | --- | --- |
| [04 — Vue reactivity](04-vue-reactivity.md) | SFCs, `ref`, `computed`, `watch`, template syntax | 1,5–2 h |
| [05 — Components](05-components.md) | props, emits, slots, `v-model` on your own components | 2–3 h |
| [06 — Domain model](06-domain-model.md) | types, fixtures, the four academies, Vue-free domain logic | 2–3 h |
| [07 — Router](07-router.md) | routes, params, guards, role protection | 1,5–2 h |
| [08 — Pinia](08-pinia.md) | sign-in as a store, `storeToRefs` | 1,5–2 h |
| [09 — Composables](09-composables.md) | your own composables, generic `useLocalStorage<T>` | 2–3 h |
| [10 — The instructor view](10-instructor-view.md) | assessment table, draft vs. saved, random fill | 3–4 h |
| [11 — The trainee view](11-trainee-view.md) | own assessments, comparison, bar chart | 3–4 h |
| [12 — Styling and theming](12-styling-tailwind.md) | Tailwind 4, design tokens, **four academies in one attribute** | 3–4 h |
| [13 — Tests](13-tests-vitest.md) | Vitest, store tests, component tests | 2–3 h |
| [14 — Build and deployment](14-build-deployment.md) | production build, Containerfile, nginx, CI | 1–1,5 h |
| [15 — Internationalisation](15-i18n.md) | locale files, plurals, a test that guarantees extensibility | 2–3 h |
| [99 — Cheat sheet](99-cheatsheet.md) | everything important on one page | |

You can skip chapters 01–03 if you already know JavaScript and TypeScript. If you're unsure:
do the exercises in `playground/`. If they go green, move on.

## How long does this take?

**Roughly 32–43 hours in total.** The estimates assume you type it yourself, look things up, do
the exercises — and do **not** copy from the reference.

| Part | Chapters | Time |
| --- | --- | --- |
| Setup | 00 | ~1 h |
| Language fundamentals | 01–03 | ~6–9 h |
| Understanding Vue | 04–05 | ~3,5–5 h |
| Domain and structure | 06–09 | ~7–10 h |
| The two views | 10–11 | ~6–8 h |
| Polish and shipping | 12–14 | ~6–8,5 h |
| Extension | 15 | ~2–3 h |
| **Total** | | **~32–43 h** |

At two evenings a week, two hours each, that's about **ten weeks**:

| Week | Chapters | What you have at the end of it |
| --- | --- | --- |
| 1 | 00–01 | project runs in the container, array exercises green |
| 2 | 02–03 | playground fully green, TypeScript makes sense |
| 3 | 04–05 | your first components on screen |
| 4 | 06–07 | domain model in place, routes working |
| 5 | 08–09 | sign-in works, data survives a reload |
| 6 | 10 | recording and saving assessments |
| 7 | 11 | own assessments and the comparison chart |
| 8 | 12 | the four academies genuinely look different |
| 9 | 13–14 | tests green, container built |
| 10 | 15 | the app speaks two languages |

> **Two sentences to take the pressure off.**
>
> Taking twice as long is normal and no bad sign — the numbers are there so you know whether a
> chapter still fits into tonight. They are not a target.
>
> And: time spent on "why doesn't this work" is not wasted time. That's where most of it
> sticks.

## The exercise playground

The fundamentals chapters come with runnable code. The `playground/` folder holds tasks that
all start with `throw new Error('TODO: ...')`, plus tests that check your solution.

```bash
cd tutorial/playground
npm install           # already done inside the dev container
npm test              # checks your code in uebungen/
npm run test:watch    # keeps running, checks on every save
npm run test:loesungen # checks the reference solutions in loesungen/
```

> The folders are named in German (`uebungen` = exercises, `loesungen` = solutions) because
> the exercises are shared between both language versions. The task descriptions inside are
> in German; the code and the tests are language-neutral.

`loesungen/` holds the reference solutions. Only look there after you've tried something
yourself — reading feels like understanding, but it isn't.

## What you need

- **Podman** (tested with 6.0) and a running machine: `podman machine start`
- **VS Code** with the *Dev Containers* extension — plus this, once, in your user settings:
  ```json
  "dev.containers.dockerPath": "podman"
  ```
- You do **not** need Node on your machine. Everything runs in the container.

## A word about the theme

The academies are more than decoration: they are a real dimension in the data model. A Padawan
must not see Imperial subjects, and the comparison only counts their own cohort. That's what
teaches you how to put such a separation into the *data structure* rather than into careful
programming — and how four completely different designs come out of a single HTML attribute.

Start with [chapter 00](00-setup.md).
