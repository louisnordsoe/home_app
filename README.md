# Home App

A household management app for people sharing a home. Multiple users join a shared "home" via invite code, then coordinate daily life together: tracking chores, keeping a shared to-do list, planning meals for the week, and seeing who's been doing what.

Built with SvelteKit (full-stack, no separate backend) and MongoDB. Real-time updates across all open browsers via Server-Sent Events.

---

## Features

- **Tasks** — Daily task list with date navigation. Tasks can be one-off or recurring (daily / specific weekdays). Counter tasks track how many times something was done. Overdue tasks surface automatically on today's view. Tasks can be assigned to a specific home member.
- **Todos** — Persistent to-do list not tied to a date. Assignable to home members.
- **Meal plan** — Weekly meal planner. Navigate between weeks and set a meal for each day.
- **Stats** — Activity summary showing who completed what, filterable by day / week / month.
- **Dashboard** — Live feed of recent task completions across the home, with a real-time indicator.
- **Homes** — Users belong to a shared home. New members join via a 6-character invite code shown on the dashboard.
- **Auth** — Email + password accounts with 30-day sessions. New users go through a setup step to create or join a home.

---

## File tree

```
home_app/
├── docker-compose.yml          # MongoDB replica set + SvelteKit app
├── Dockerfile                  # Production image for the SvelteKit app
├── docker.env                  # Env vars injected into the Docker service
├── .env.example                # Template — copy to .env before running
├── package.json                # Dependencies and npm scripts
├── package-lock.json           # Lockfile
├── svelte.config.js            # SvelteKit config (runes mode enforced globally)
├── vite.config.ts              # Vite config (Tailwind v4 plugin)
├── tsconfig.json               # TypeScript config
├── playwright.config.ts        # Playwright e2e test config
├── eslint.config.js            # ESLint (zero-warnings policy)
├── knip.json                   # Dead code / unused export checker
├── .prettierrc                 # Prettier formatting config
├── .prettierignore
├── .npmrc
├── .gitignore
├── .dockerignore
├── .secretlintrc.json          # Prevents secrets from being committed
├── .husky/
│   └── pre-commit              # Runs type-check, lint, and Playwright before each commit
├── .vscode/
│   └── extensions.json         # Recommended VS Code extensions
├── static/
│   └── robots.txt
├── tests/
│   └── auth.test.ts            # Playwright e2e tests covering login / signup flow
└── src/
    ├── app.html                # HTML shell — loads Material Symbols font from Google Fonts
    ├── app.css                 # Global CSS entry point (@import "tailwindcss")
    ├── app.d.ts                # SvelteKit ambient types (locals.user shape)
    ├── hooks.server.ts         # Server hook — reads session cookie, populates locals.user
    ├── lib/
    │   ├── stores.ts           # Svelte store: connected (SSE connection status)
    │   ├── useLiveReload.ts    # Composable: mounts /api/watch EventSource, calls invalidateAll() on change
    │   ├── enhance.ts          # Thin wrapper around SvelteKit's enhance for form progressive enhancement
    │   ├── md3.ts              # Registers @material/web (Material Design 3) custom elements
    │   ├── userColor.ts        # Derives a stable avatar background colour from a user ID
    │   ├── assets/
    │   │   └── favicon.svg
    │   ├── components/
    │   │   └── UserAvatar.svelte   # Circular avatar showing initials with a colour derived from user ID
    │   └── server/             # Server-only — never imported by .svelte files
    │       ├── db.ts           # MongoDB singleton (globalThis._mongoClient, survives HMR)
    │       ├── auth.ts         # Session management: createSession, getSessionUser, deleteSession
    │       └── users.ts        # User management: createUser, verifyUser (bcryptjs)
    └── routes/
        ├── +layout.server.ts   # Runs on every request — resolves user + home name from session
        ├── +layout.svelte      # Root layout — nav bar, MD3 components, Tailwind
        ├── +page.server.ts     # Dashboard data: recent task_log entries across the home
        ├── +page.svelte        # Dashboard: live activity feed + invite code display
        ├── login/
        │   ├── +page.server.ts # Handles login form — verifies credentials, sets session cookie
        │   └── +page.svelte    # Login form
        ├── logout/
        │   └── +server.ts      # Deletes session, clears cookie, redirects to /login
        ├── setup/
        │   ├── +page.server.ts # Create a new home or join one via invite code
        │   └── +page.svelte    # Setup form (shown after registration, before app access)
        ├── tasks/
        │   ├── +page.server.ts # Daily task list with date nav; actions: add/toggle/edit/delete/counter
        │   └── +page.svelte    # Task UI — single/recurring task forms, overdue section, counter controls
        ├── todos/
        │   ├── +page.server.ts # Persistent todos; actions: add/toggle/edit/delete
        │   └── +page.svelte    # Todo list UI
        ├── meal-plan/
        │   ├── +page.server.ts # Weekly meal plan with week navigation; save action upserts by date
        │   └── +page.svelte    # 7-day grid with inline meal editing
        ├── stats/
        │   ├── +page.server.ts # Aggregates task_logs by user for a day/week/month period
        │   └── +page.svelte    # Stats UI with period selector and per-user breakdown
        ├── settings/
        │   ├── +page.server.ts # User profile and home settings actions
        │   └── +page.svelte    # Settings form
        └── api/
            └── watch/
                └── +server.ts  # SSE endpoint — watches entire DB, streams {coll, op} on every change
```

---

## Running the app

Requires Docker and Docker Compose.

```bash
cp .env.example .env        # fill in MONGODB_URI, MONGODB_DB
docker compose up           # starts MongoDB + SvelteKit at http://localhost:5173
```

Other commands (run on the host, requires Node):

```bash
npm run check       # type-check with svelte-check
npm test            # run Playwright e2e tests
npm run lint        # ESLint
npm run format      # Prettier
```
