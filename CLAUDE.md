# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
docker compose up     # start everything (MongoDB + SvelteKit) at http://localhost:5173
docker compose up -d  # same, detached
npm run check         # type-check with svelte-check (run on host)
npm run check:watch   # type-check in watch mode (run on host)
npm test              # run Playwright e2e tests
npm run lint          # ESLint (zero warnings policy)
npm run format        # Prettier
```

## Environment

Copy `.env.example` to `.env` and fill in values before running:

```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=home_app
```

MongoDB runs via Docker Compose (`docker-compose.yml`) as a single-node replica set — required for Change Streams. The `mongo-init` service calls `rs.initiate()` automatically on first start. Data is persisted in the `mongo_data` Docker volume.

## Architecture

No separate backend. SvelteKit is the full stack. Real-time updates flow via SSE:

```
MongoDB Change Stream → /api/watch SSE endpoint → useLiveReload() → invalidateAll() → server load re-runs
```

**`src/lib/server/db.ts`** — MongoDB singleton. Uses `globalThis._mongoClient` to survive Vite HMR re-imports in dev without leaking connections. All server code imports `db` from here; never construct `MongoClient` elsewhere.

**`src/routes/api/watch/+server.ts`** — SSE endpoint (`GET /api/watch`). Watches the entire database (`db.watch()`), sending `{ coll, op }` on every change. The first message is `{ type: 'connected' }` as a handshake.

**`src/lib/useLiveReload.ts`** — Composable that mounts an `EventSource` to `/api/watch` and calls `invalidateAll()` on every non-handshake message. Call it in any page that needs live data — it handles setup and teardown automatically.

**`src/lib/stores.ts`** — Single writable store: `connected` (boolean). Components bind with `$connected`.

**`src/routes/+layout.server.ts`** — Runs on every request. Reads the session cookie, resolves the user and home name, and exposes them as layout data (`locals.user`, `data.homeName`).

## Auth

Session-based authentication with 30-day tokens stored in the `sessions` collection.

- **`src/lib/server/auth.ts`** — `createSession(userId)`, `getSessionUser(token)`, `deleteSession(token)`
- **`src/lib/server/users.ts`** — `createUser(...)`, `verifyUser(email, password)` (bcryptjs, cost 12)
- Unauthenticated requests redirect to `/login`; users without a `homeId` redirect to `/setup`

## Routes

| Route | Purpose |
|---|---|
| `/` | Dashboard / home |
| `/login` | Email + password login |
| `/logout` | DELETE session, redirect to `/login` |
| `/setup` | Create or join a home (required after registration) |
| `/tasks` | Task management |
| `/todos` | To-do list |
| `/meal-plan` | Meal planning |
| `/stats` | Activity statistics |
| `/settings` | User / home settings |

## Collections

| Collection | Contents |
|---|---|
| `users` | `email`, `passwordHash`, `firstName`, `lastName`, `homeId?` |
| `sessions` | `token`, `userId`, `expiresAt` |
| `homes` | `name`, `inviteCode` |
| `tasks` | Task definitions |
| `task_logs` | `taskTitle`, `userEmail`, `homeId`, `loggedAt`, `count` |
| `todos` | To-do items |
| `meal_plans` | Meal plan entries |

## Styling

**Tailwind v4** — utility classes only, no config file. The single entry point is `src/app.css` (`@import "tailwindcss"`), imported in `+layout.svelte`. The Vite plugin (`@tailwindcss/vite`) handles the rest.

**Material Design 3** — `@material/web` v2 component library (`md-button`, `md-card`, etc.). Registered in `src/lib/md3.ts`, which is imported in `+layout.svelte`.

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
- For live data on a new page, call `useLiveReload()` in the component script — it handles EventSource lifecycle and calls `invalidateAll()` to re-run the page's server load.

## Svelte 5 Props Convention

All components define props using `$props()` with a named `Props` interface and destructuring. Never use `export let` (Svelte 4 style).

```svelte
<script lang="ts">
	interface Props {
		name: string;
		count: number;
		optional?: string;
		onClose?: () => void;
	}

	let { name, count, optional = 'default', onClose }: Props = $props();
</script>
```

Rules:

- Always define a named `Props` interface — no inline types or `any`
- Apply the type on the destructure (`: Props = $props()`), not as a generic (`$props<Props>()`)
- Set defaults inline in the destructure, not in the interface
- Prefix event callbacks with `on` (e.g. `onClose`, `onSubmit`)
