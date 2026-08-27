# Galactic Gradebook — Tutorial

Build a small but complete Vue 3 application from scratch: **Galactic Gradebook**, a training-records app
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
| `tutorial/` (this one) | the chapters, the concept pages, and the exercises |
| `reference/` | the finished app |

Plus **your own project**, which you create on the [Setup](concepts/00-setup.md) page — in a
*separate* repository next to this one, e.g. `~/projects/nodejs/my-gradebook`. Why separate:
your rebuild should have its own history, and you should be able to delete it and start over
without touching this repository.

The reference is **not a template to copy from**. It's a place to look things up: try it
yourself first, and when you get stuck or want to know how it could be done more cleanly, look
there. Every page ends with the relevant file paths — those start with `reference/` and
always mean the finished app, never your project.

> **A note on the code.** The reference implementation carries **German comments** — it was
> written by a German speaker for their own use. The code itself, all identifiers and file
> names, are English. The snippets in this English tutorial have English comments.

Every concept page follows the same shape:

1. **Goal** — what works at the end
2. **Concepts** — the new material, with examples
3. **Your task** — what you build
4. **Pitfalls** — what tends to go wrong here
5. **Self-check** — how you know it's right
6. **In the reference** — where to compare

## Two tracks

The pages in [`concepts/`](concepts/) are cut by **topic**: one page, one concept. That's good
for learning and good for looking things up — but it doesn't tell you in what order you
actually build the app. [The instructor view](concepts/10-instructor-view.md) demands draft
state, watchers, `isDirty`, and an access check all at once by the end.

That's why there's also the **[build track](build/README.md)**: 21 chapters that build the same
project step by step. Assessments start hardcoded in `App.vue`, then come from a seed, then
from a store. The sign-in button starts out only navigating and only later checks anything for
real. And there's just *one* academy for a long stretch.

| Track | Answers |
| --- | --- |
| [Concepts](concepts/) | **why and how** does this work |
| [Chapters](build/README.md) | **what, and in what order**, do I build now |

Both together: open a chapter, read the linked concept page, build, work through the review
list, commit. If you'd rather read straight through, you can ignore the build track — the
concept pages stand on their own.

> **A word on numbering.** Both tracks are numbered, but separately: *chapter 10* always means
> a page from `build/`. Concept pages are referred to by title.

## Order

**Fundamentals** — no Vue, but with runnable exercises in `playground/`:

| Page | Topic | Time |
| --- | --- | --- |
| [Setup](concepts/00-setup.md) | Dev container on Podman, creating the project, understanding the tools | 45–60 min |
| [JavaScript fundamentals](concepts/01-js-fundamentals.md) | values, objects and arrays, reference semantics, array methods | 2–3 h |
| [JavaScript, part two](concepts/02-js-advanced.md) | arrow functions, `this`, modules, promises, `async`/`await` | 2–3 h |
| [TypeScript](concepts/03-typescript.md) | types, unions, narrowing, **generics and generic classes** | 2–3 h |

**The application** — from here your project grows along; the last column says which chapter
that happens in:

| Page | Topic | Time | Chapters |
| --- | --- | --- | --- |
| [Vue reactivity](concepts/04-vue-reactivity.md) | SFCs, `ref`, `computed`, `watch`, template syntax | 1.5–2 h | [01](build/01-first-grades.md), [03](build/03-raw-input.md) |
| [Components](concepts/05-components.md) | props, emits, slots, `v-model` on your own components | 2–3 h | [02](build/02-first-component.md), [16](build/16-base-components.md) |
| [Domain model](concepts/06-domain-model.md) | types, fixtures, the four academies, Vue-free domain logic | 2–3 h | [04](build/04-seed-and-types.md), [05](build/05-subject-list.md), [15](build/15-four-academies.md) |
| [Router](concepts/07-router.md) | routes, params, guards, role protection | 1.5–2 h | [06](build/06-router-two-views.md), [07](build/07-login-mock.md), [09](build/09-router-guards.md) |
| [Pinia](concepts/08-pinia.md) | sign-in as a store, `storeToRefs` | 1.5–2 h | [08](build/08-auth-store.md), [10](build/10-grades-store-and-draft.md) |
| [Composables](concepts/09-composables.md) | your own composables, generic `useLocalStorage<T>` | 2–3 h | [12](build/12-localstorage-composable.md), [14](build/14-cohort-comparison-chart.md) |
| [The instructor view](concepts/10-instructor-view.md) | assessment table, draft vs. saved, random fill | 3–4 h | [10](build/10-grades-store-and-draft.md), [11](build/11-grade-input.md) |
| [The trainee view](concepts/11-trainee-view.md) | own assessments, comparison, bar chart | 3–4 h | [13](build/13-trainee-dashboard.md), [14](build/14-cohort-comparison-chart.md) |
| [Styling and theming](concepts/12-styling-tailwind.md) | Tailwind 4, design tokens, **four academies in one attribute** | 3–4 h | [17](build/17-tailwind-layout.md), [18](build/18-academy-themes.md) |
| [Tests](concepts/13-tests-vitest.md) | Vitest, store tests, component tests | 2–3 h | [19](build/19-tests-vitest.md) |
| [Build and deployment](concepts/14-build-deployment.md) | production build, Containerfile, nginx, CI | 1–1.5 h | [20](build/20-build-deployment.md) |
| [Internationalisation](concepts/15-i18n.md) | locale files, plurals, a test that guarantees extensibility | 2–3 h | [21](build/21-i18n.md) |
| [Cheat sheet](concepts/99-cheatsheet.md) | everything important on one page | | |

## How long does this take?

**Roughly 32–43 hours in total.** The estimates assume you type it yourself, look things up, do
the exercises — and do **not** copy from the reference.

| Part | Pages | Time |
| --- | --- | --- |
| Setup | Setup | ~1 h |
| Language fundamentals | JavaScript fundamentals through TypeScript | ~6–9 h |
| Understanding Vue | Vue reactivity, Components | ~3.5–5 h |
| Domain and structure | Domain model through Composables | ~7–10 h |
| The two views | Instructor, trainee | ~6–8 h |
| Polish and shipping | Styling through deployment | ~6–8.5 h |
| Extension | Internationalisation | ~2–3 h |
| **Total** | | **~32–43 h** |

At two evenings a week, two hours each, that's about **ten weeks**:

| Week | Chapters | What you have at the end of it |
| --- | --- | --- |
| 1 | Setup, 01 | project runs in the container, first screen up |
| 2 | — | playground fully green, TypeScript makes sense |
| 3 | 02–05 | your own components, subject list from the seed |
| 4 | 06–09 | routes work, sign-in works |
| 5 | 10–12 | recording and saving assessments, surviving a reload |
| 6 | 13–14 | own assessments and the comparison chart |
| 7 | 15 | four academies in the data model |
| 8 | 16–18 | the four academies genuinely look different |
| 9 | 19–20 | tests green, container built |
| 10 | 21 | the app speaks two languages |

> **Two sentences to take the pressure off.**
>
> Taking twice as long is normal and no bad sign — the numbers are there so you know whether a
> page still fits into tonight. They are not a target.
>
> And: time spent on "why doesn't this work" is not wasted time. That's where most of it
> sticks.

You can skip the three language pages if you already know JavaScript and TypeScript. If you're
unsure: do the exercises in `playground/`. If they go green, move on.

## The exercise playground

The fundamentals pages come with runnable code. The `playground/` folder holds tasks that
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

Start with [Setup](concepts/00-setup.md) — and then with
[chapter 01](build/01-first-grades.md).
