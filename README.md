# Party Buddy

Vue 3 single-page frontend for the [Party Starter](https://github.com/dakiman/party-starter) backend. UI for planning parties — time/place, music, drinks, food.

## Stack

- Vue 3 + TypeScript + Vite
- PrimeVue 4 (Lara preset, indigo primary, dark mode forced)
- Pinia (state)
- Vue Router
- axios (HTTP)
- Vuelidate (form validation)
- @googlemaps/js-api-loader (location picker)

## Prerequisites

- Node 18+ and npm
- The Party Starter backend running (default `http://localhost:8080`) or accessible via `VITE_API_URL`

## Local development

```bash
npm install
npm run dev
```

Default port: `5173`. Open http://localhost:5173.

Production build:

```bash
npm run build
# Output: dist/
```

## Environment variables

| Variable          | Dev default                | Prod default | Notes                                                              |
|-------------------|----------------------------|--------------|--------------------------------------------------------------------|
| `VITE_API_URL`    | `http://localhost:8080`    | (empty)      | Backend base URL; in prod the FE uses same-origin via reverse proxy |
| `VITE_API_PREFIX` | (empty)                    | `/api`       | Path prefix appended to `VITE_API_URL`                             |

Copy `.env.example` to `.env.development.local` or `.env.production.local` to override locally.

## Deployment

Deployed on the user's personal server (`dakis-server`). The build artifact (`dist/`) is mounted into an `nginx:alpine` container declared in `/home/dakiman/dakis-server/docker-compose.yml`. See the roadmap spec for the full deploy story:
`/home/dakiman/projects/party-docs/specs/2026-04-28-party-app-roadmap-design.md`

The previous VPS deploy workflow in `.github/workflows/frontend-deploy.yml` has been removed.

## Project layout

```
src/
├── main.ts                     # App bootstrap (PrimeVue + theme + Pinia + router + Toast)
├── App.vue                     # Root layout (header + router-view + auth modals)
├── router/index.ts             # Routes: /, /create, /events/:id
├── views/
│   ├── Home.vue                # Lists user's events (auth-gated welcome screen otherwise)
│   ├── CreateEvent.vue         # Wraps EventTypeSelector
│   └── EventView.vue           # Single event display
├── components/
│   ├── AppHeader.vue
│   ├── EventTypeSelector.vue
│   ├── EventWizard.vue         # Multi-step modal (Time & Place → Music → Drinks & Food → Review)
│   ├── GoogleMapPicker.vue
│   ├── LoginModal.vue, RegisterModal.vue
│   └── steps/                  # The four wizard step components
├── stores/
│   ├── auth.ts                 # JWT in localStorage; user state
│   └── wizard.ts               # In-progress event form data
├── services/
│   ├── api.ts                  # axios instance with auth interceptor
│   ├── event.ts                # createEvent
│   └── music.ts
├── types/index.ts              # Shared TS types (sparse — being typed in Phase 1)
└── assets/                     # logo.webp, vue.svg
```

## Conventions and gotchas

See [`CLAUDE.md`](./CLAUDE.md).

## Roadmap

`/home/dakiman/projects/party-docs/specs/2026-04-28-party-app-roadmap-design.md`
