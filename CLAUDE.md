# CLAUDE.md

Guidance for Claude Code working in this repository.

## Commands

```bash
# Dev server (Vite, port 5173)
npm run dev

# Type-check + production build
npm run build

# Preview production build
npm run preview
```

There are currently no automated tests on the FE. Adding a runner is Phase 9 polish (or earlier per a feature's needs).

## Architecture

Vue 3 SPA. Single root layout (`App.vue`) with a persistent header + `router-view` + auth modals at the top level. State in Pinia stores. HTTP via a shared axios instance (`services/api.ts`) that injects the JWT from `localStorage`.

### Routing

```
/                Home.vue          Auth-gated event list; welcome view otherwise
/create          CreateEvent.vue   Renders EventTypeSelector → opens EventWizard modal
/events/:id      EventView.vue     Single event, read-only
/events/:id/edit  EditEvent.vue     Edit event; fetches event, guards creator, opens EventWizard in edit mode
```

### Wizard flow

`components/EventWizard.vue` is a PrimeVue `Dialog` containing a `Stepper` with up to 4 steps:

1. **Time & Place** (`steps/TimeAndPlaceStep.vue`) — required; Vuelidate validation
2. **Music** (`steps/MusicStep.vue`) — optional, toggleable in step 1
3. **Drinks & Food** (`steps/DrinksAndFoodStep.vue`) — optional, toggleable in step 1
4. **Review** (`steps/ReviewStep.vue`) — always shown; "Finish" calls `createEvent`

Step value strings (`"1"`, `"2"`, `"3"`, `"4"`) are computed dynamically based on which optional steps are enabled. **This logic is brittle** — Phase 1 refactors it to named step keys.

### Stores

- **`useAuthStore`** (`stores/auth.ts`) — JWT in `localStorage` under key `token`. `login()`/`register()` POST to `/auth/*`; `logout()` clears state and storage. On store init, a stored token triggers a `GET /auth/user` to rehydrate; if it 401s, logout.
- **`useWizardStore`** (`stores/wizard.ts`) — In-progress event form data; reset on dialog close. Holds the full `WizardData` shape (name, date, time, location, artists, ingredients, cocktails, food, isPrivate, enabledSteps). The Phase 7 rename split the old `drinks` field into `ingredients` (alcohols on hand, picked from `/ingredients`) and `cocktails` (recipes opted-into from `/drinks?ingredients=...` suggestions); they map back to `CreateEventPayload.ingredients` and `.drinks` respectively on submit.

### API services

`services/api.ts` is the shared axios instance. Base URL = `VITE_API_URL + VITE_API_PREFIX`. Request interceptor injects `Authorization: Bearer <token>` from `localStorage`. Response interceptor on 401 is currently empty — Phase 1 wires logout + toast + redirect.

`services/event.ts` and `services/music.ts` are sparse today — most API calls happen inline in components. Phase 1 extracts a typed client per resource (`events.ts`, `music.ts`, `drinks.ts`, `ingredients.ts`, `auth.ts`).

### Styling / theme

PrimeVue 4 with the `Lara` preset, primary palette swapped to indigo via `definePreset` in `main.ts`. Dark mode is **hardcoded on** via `<html class="my-app-dark">` in `index.html`. The PrimeVue dark mode selector matches that class. Global font: `Outfit` from Google Fonts.

## Key conventions

- **Component file naming:** PascalCase `.vue` files in `src/components/` and `src/views/`.
- **Composition API + `<script setup>`** for all new components.
- **Lazy route imports** (`() => import('@/views/X.vue')`) in `router/index.ts`.
- **PrimeVue components imported explicitly** at the file level — no auto-import plugin.
- **`@/` alias** points to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).
- **Toasts** via PrimeVue `useToast()`; the global `<Toast>` instance is mounted in `App.vue`.
- **Modals** use the PrimeVue `Dialog` + `defineExpose({ show })` pattern (see `LoginModal.vue`, `RegisterModal.vue`, `EventWizard.vue`).

## Gotchas

- **`types/index.ts`** has the `Event` interface fully commented out and `User` is the only real type. Most components use `any` for event data — Phase 1 fixes this.
- **`EventWizard.vue` step values are stringified magic numbers** that branch on which optional steps are enabled. Fragile. Phase 1 refactors.
- **The 401 axios interceptor is empty** (`// Handle unauthorized` comment only). A token expiring silently leaves the user in a broken state until reload. Phase 1 wires it.
- **The `<meta viewport>` tag has `maximum-scale=1.0, user-scalable=no`** — accessibility issue. Phase 9 polish removes this.
- **Dark mode is forced** — no light toggle. Phase 9 adds one.
- **`PostEventRequest.drinks` carries cocktail IDs (not ingredient IDs)** as of Phase 7. The wizard's `cocktails: Cocktail[]` is mapped to `drinks: number[]` on submit; the old `drinks: []`-always behavior is gone.
- **`EventWizard` is dual-mode** — pass `:initialEvent="event"` to put it in edit mode. `show()` calls `seedStoreFromEvent()` internally before opening the dialog. `handleFinish` branches on `isEditMode`: edit mode calls `updateEvent(id, payload)` and navigates to `/events/:id`; create mode calls `createEvent(payload)` and navigates to `/`. The `close()` / store reset is mode-agnostic.
- **`ConfirmDialog` must be mounted in `App.vue`** — PrimeVue's `useConfirm()` composable requires a single `<ConfirmDialog />` instance in the component tree and `ConfirmationService` installed on the Vue app. Both are now present. Do not add a second `<ConfirmDialog />` or the confirm callbacks will fire twice.
- **`EventResponse.creatorUsername`** — the BE now includes `creatorUsername` on every event response. `EventView` and `EditEvent` use it to gate Edit/Delete visibility and to guard the edit route. The FE also relies on `authStore.user?.username` being populated (via `GET /auth/user` on store init).
- **`deleteEvent` cascades on the BE** — the BE uses `eventRepository.delete(entity)` (not `deleteById`) so join-table rows (`event_artists`, `event_drinks`, `event_ingredients`, `event_food_items`) are cleared before the parent row is removed. The FE just calls `DELETE /events/{id}` and handles 204.

## Where to add things

| What                    | Where                                                                                                                  |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------|
| New view (full page)    | `src/views/<Name>.vue` + add route in `router/index.ts`                                                              |
| New reusable component  | `src/components/<Name>.vue`                                                                                          |
| New global state        | `src/stores/<name>.ts` (Pinia composition style — `defineStore('name', () => { ... })`)                              |
| New API call            | Add a method to (or create) `src/services/<resource>.ts` using the shared `api` axios instance                       |
| New shared type         | `src/types/index.ts` (or split into focused files when it grows)                                                     |

### Phase 3 — Sharing & discovery (added 2026-05-01)

- New routes:
  - `/discover` — public events feed, no auth.
  - `/shared/:token` — token-keyed event view, no auth.
- `EventDetails.vue` was extracted from `EventView.vue` so it can be reused by `SharedEvent.vue`. Both views are thin loaders that hand the `EventResponse` to `EventDetails` along with a `canEdit` boolean. **When adding new event-detail UI, edit `EventDetails.vue`, not `EventView.vue`.**
- `ShareDialog.vue` lives behind a "Share" button in `EventDetails`'s creator-only action row. It calls `POST /events/{id}/share` lazily on first open; "Regenerate link" calls `POST /events/{id}/share/rotate`. QR is rendered client-side via the `qrcode` npm package into a `<canvas>`.
- `EventCard.vue` is the discovery-feed card. Cards link to `/events/:id` (which is public on the BE for non-private events).
- Discover URL state (search query, page, past-events toggle) is synced to the URL via `router.replace({ query })` — back-button + shareable-search work.

### Phase 3.5 — Guest identities, join requests, attendees (added 2026-05-01)

- **localStorage convention:** key `partyapp.guest_token` carries the guest identity. `api.ts` injects it as `X-Guest-Token: <uuid>` on every outgoing request alongside the existing `Authorization: Bearer` header.
- **`SharedEvent.vue` is now state-branched** based on `GET /share/{token}/me`. Five branches: `not_requested` → `<RequestToJoinPanel>` or `<PublicRsvpPanel>` (via `eventIsPrivate`); `pending` → "your request is pending" + refresh button; `approved` / `attending` → full `<EventDetails>` + `<AttendeeRsvpToggle>` + `<AttendeeList>`; `declined` → frozen message.
- **`EventTeaser.vue`** renders a stripped-down event card (name, date, location, host) for not-yet-approved guests. Distinct from `EventDetails`.
- **`<RequestDialog>` is shared** between request flow (private events) and public-event RSVP claim flow via a `mode` prop.
- **`<AttendeeList>`** silently renders nothing on 403 (private event, non-attendee viewer). The 403 is the visibility gate from `AttendeeService` (BE §4.6).
- **`<PendingBadge>`** in `AppHeader` polls `GET /events/requests/count` on auth state change and on route change. Phase 5 will replace polling with push.
- **No new routes.** Phase 3.5 lives entirely on the existing `/shared/:token` and `/events/:id` routes.

### Phase 7 — Drink recipe surfacing (added 2026-05-02)

- **Wizard store rename:** `WizardData.drinks` (which always held *ingredient* picks, not drinks — a long-standing UX lie) was renamed to `ingredients`. A new `cocktails: Cocktail[]` field holds the actual cocktails picked from the suggestions panel. On submit, `cocktails.map(c => c.id)` flows into `CreateEventPayload.drinks`. Internal-only — no API change.
- **`IngredientPick`** (the wizard-side ingredient shape with `id: string`) is exported from both `@/types` and `@/stores/wizard` (the latter re-exports from the former). Always import from `@/types` in new code.
- **`EventResponse.drinks: Cocktail[]`** is now plumbed through the FE — `services/events.ts#normalizeEvent` populates it from the BE response. Previously the FE typed it as `unknown` and ignored it.
- **`getDrinksByIngredients` axios serialization gotcha:** default axios array-param encoding is `?ingredients[]=foo` (PHP brackets), which Spring's `@RequestParam List<String>` silently ignores. The service comma-joins the array (`?ingredients=foo,bar`) so Spring parses it. If you add another endpoint that takes a list param, do the same.
- **`DrinksAndFoodStep.vue`** below the alcohols-on-hand picker: a "Suggested cocktails" panel debounces 300 ms on alcoholic-ingredient changes, calls `/drinks?ingredients=...`, and renders rows as compact-with-recipe-preview. Click a row header (not the Add button) to expand inline → full recipe + ingredient amounts. The `expandedCocktailIds: Set<number>` reactivity uses the new-Set-on-mutation idiom (Vue 3 doesn't track `Set.add` in place).
- **`EventDetails.vue`** has two new sections: a **Cocktails** section (always-expanded cards with thumbnail + recipe + ingredient amounts), and the old "Drinks & Food" chip section relabeled to **"Bar & Food"** with sub-label "Alcohols on hand:" — the old "Drinks" header was the same UX lie the wizard rename addresses.
- **`fullyMakeable` / `missingAlcoholicIngredients`** are still on the wire from the BE but currently unused on the FE (we dropped the Tag pills during smoke-test iteration). Keep the data path open — a future inline "you don't have this" indicator on missing ingredients is cheap to add without a BE change.
- **TheCocktailDB seed has both generic and branded ingredient rows** (e.g. "Vodka" matches 20 cocktails, "Absolut Vodka" matches 1). The picker autocomplete shows both; users picking the brand variant get sparse suggestions. Not a code bug — a data-quality artifact of the upstream source.

## Roadmap

`/home/dakiman/projects/party-docs/specs/2026-04-28-party-app-roadmap-design.md`
