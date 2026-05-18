# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
docker compose up     # start everything (MongoDB + SvelteKit) at http://localhost:5173
docker compose up -d  # same, detached
npm run check         # type-check with svelte-check (run on host)
npm run check:watch   # type-check in watch mode (run on host)
```

## Environment

Copy `.env.example` to `.env` and fill in values before running:

```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=home_app
MONGODB_WATCH_COLLECTION=events        # collection to watch for changes
```

MongoDB runs via Docker Compose (`docker-compose.yml`) as a single-node replica set — required for Change Streams. The `mongo-init` service calls `rs.initiate()` automatically on first start. Data is persisted in the `mongo_data` Docker volume.

## Architecture

No separate backend. SvelteKit is the full stack. Data flows in one direction:

```
MongoDB Change Stream → +server.ts SSE endpoint → Browser EventSource → Svelte store → UI
```

**`src/lib/server/db.ts`** — MongoDB singleton. Uses `globalThis._mongoClient` to survive Vite HMR re-imports in dev without leaking connections. All server code imports `db` (the database handle) from here; never construct `MongoClient` elsewhere.

**`src/routes/api/changes/+server.ts`** — SSE endpoint (`GET /api/changes`). Opens a MongoDB Change Stream on `MONGODB_WATCH_COLLECTION` and pushes each event as an SSE message. The first message is `{ type: 'connected' }` as a handshake. Cleanup on stream cancel closes the change stream.

**`src/lib/stores.ts`** — Two writable stores: `changes` (array of `ChangeEvent`, capped at 50) and `connected` (boolean). These are the only shared UI state; components bind to them with `$changes` / `$connected`.

**`src/routes/+page.svelte`** — Mounts `EventSource` in `onMount`, feeds events into the stores, tears down in `onDestroy`.

## Styling

**Tailwind v4** — utility classes only, no config file. The single entry point is `src/app.css` (`@import "tailwindcss"`), imported in `+layout.svelte`. The Vite plugin (`@tailwindcss/vite`) handles the rest.

**Material Symbols Outlined** — loaded from Google Fonts in `src/app.html`. Use as:
```svelte
<span class="material-symbols-outlined">home</span>
```
Icon names: [fonts.google.com/icons](https://fonts.google.com/icons)

## Conventions

- Svelte 5 **runes mode** is enforced project-wide (`svelte.config.js`). Use `$state`, `$derived`, `$effect` — not the legacy Options API or `$:` reactive statements.
- Server-only code lives under `src/lib/server/`. SvelteKit enforces the boundary: anything imported from `$lib/server/*` in a `.svelte` file will error at build time.
- Environment variables accessed via `$env/static/private` (build-time typed, never exposed to the client). Add new variables to `.env.example` alongside `.env`.
- No ORM. Use the native `mongodb` driver directly. Collections are typed by passing a generic to `db.collection<MyType>(name)`.
- To add a new SSE stream for a different collection, duplicate `src/routes/api/changes/+server.ts` and adjust the collection reference. The `db` import and streaming boilerplate stay the same.

## Svelte 5 Props Convention

All components define props using `$props()` with a named `Props` interface and destructuring. Never use `export let` (Svelte 4 style).

```svelte
<script lang="ts">
  interface Props {
    name: string
    count: number
    optional?: string
    onClose?: () => void
  }

  let {
    name,
    count,
    optional = 'default',
    onClose
  }: Props = $props()
</script>
```

Rules:
- Always define a named `Props` interface — no inline types or `any`
- Apply the type on the destructure (`: Props = $props()`), not as a generic (`$props<Props>()`)
- Set defaults inline in the destructure, not in the interface
- Prefix event callbacks with `on` (e.g. `onClose`, `onSubmit`)
