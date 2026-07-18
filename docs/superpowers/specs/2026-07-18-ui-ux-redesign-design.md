# UI/UX Redesign — "Dark Lounge" identity + usability rework

**Date:** 2026-07-18
**Scope decisions (made with dakiman):** full visual identity + UX rework · dark-lounge/neon-accent personality · full-page wizard (kill the modal-on-page create flow) · dark-only (Phase 9 light-mode toggle dropped) · approach A: token-first phased restyle on top of PrimeVue 4 Lara.

## Goal

The app currently looks like a default PrimeVue admin dashboard (Lara + indigo swap) and the event page reads like a database record. Give it a deliberate party-at-night identity and fix the structural UX problems, without leaving PrimeVue or adding dependencies.

## Design language

One token layer, defined once, consumed everywhere:

- **Palette:** near-black base surfaces with a subtle blue-violet tint (roughly `#0b0a12` app background → elevated card tiers), primary **violet** (`#8b5cf6` family via `definePreset` palette swap from indigo → violet), secondary **magenta** (`#ec4899`) used only in gradients/glows — never as a standalone interactive color.
- **Accent gradient:** violet→magenta, used sparingly: page-title underline/text accent, primary CTA buttons, active stepper node, active chips.
- **Glow:** soft violet box-shadow on primary buttons and active/selected chips (`--pb-glow`). Subtle — lounge, not cyberpunk.
- **Background:** fixed, very subtle radial gradient vignette (violet tint top, fading to base) on `body` — kills the flat black void.
- **Typography:** keep Outfit (fits the identity; only family loaded). Headings go heavier (700–800) and tighter; section labels become small uppercase-tracked text. Friendly date formatting everywhere: "Fri, Jul 18 · 8:00 PM", "Tonight · 8:00 PM" — never `7/14/2026`.
- **Shape:** cards 14–16px radius, chips/buttons pill-shaped where already chip-like, consistent 1px borders using a violet-tinted border token.
- **App-level CSS custom properties** (prefix `--pb-*`) live in `src/assets/main.css` next to the existing token usage; PrimeVue component-level overrides continue to use `--p-*` tokens via `definePreset` where possible, `main.css` for teleported overlays (existing R3 convention).

## Surfaces (what changes where)

### 1. Foundation + header
- `main.ts` preset: violet palette, surface scale, larger border radius, focus-ring token.
- `main.css`: `--pb-*` props, body background vignette, heading/type scale, shared `.pb-section-label` utility class.
- `AppHeader.vue`: translucent blur sticky header (`backdrop-filter`), proper wordmark ("Party Buddy" text next to the emoji-derived logo), active-route indication on nav links, restyled user menu. Mobile hamburger stays.
- `index.html`: drop `maximum-scale=1.0, user-scalable=no` from the viewport meta (a11y).

### 2. Event page = invitation (`EventDetails.vue`, plus `EventTeaser.vue`)
- **Hero block:** big event name (gradient text accent), one friendly date-time line ("Friday, Jul 18 · 8:00 PM"), host line ("Hosted by dakiman"), private/public pill.
- **Info as icon rows,** not `Label: value` colon pairs. "When & Where" card: calendar icon row + location row + existing map when shared.
- **Sections keep current data:** Music (artist chips), Cocktails (cards, existing layout restyled), Bar & Food ("Alcohols on hand" + food chips), Attendees (Going/Maybe/Declined with initial-avatars instead of dash placeholders; empty → single friendly line, not three columns of zeros).
- **Action row:** Share = primary CTA, Edit = secondary outline. **Delete moves out of the row** into the "…" overflow menu (PrimeVue Menu) with the existing ConfirmDialog flow.
- `EventTeaser.vue` and the SharedEvent panels (`RequestToJoinPanel`, `PublicRsvpPanel`, pending/declined branches) get the same hero treatment and tokens — guests are the primary audience.

### 3. Home + Discover cards & empty states
- `EventCard.vue` becomes the single card used by both Home and Discover (Home currently has its own bare markup): date badge block (weekday + day number), name, time, location description, private/public pill, host (Discover). Hover lift + border glow.
- `Home.vue`: group into **Upcoming** / **Past** (past collapsed/dimmed). Empty state: icon + "No parties yet" + CTA button.
- `Discover.vue`: same cards in a responsive grid, restyled search input + past-events toggle, friendly empty state.
- Slim-list gotcha respected: cards only use fields present in `EventListResponse` (name/date/time/location/isPrivate/creatorUsername).

### 4. Full-page wizard (`/create`, `/events/:id/edit`)
- `EventWizard.vue` stops being a `Dialog`; it becomes a full-page component rendered directly by `CreateEvent.vue` and `EditEvent.vue`. `EventTypeSelector.vue` is deleted; event type (Private/Public) + optional-step toggles fold into step 1 as pill toggles.
- **Step-key refactor** (the long-flagged Phase 1 brittleness): steps identified by named keys `'details' | 'music' | 'drinks' | 'review'`, with a computed visible-steps array; no more stringified magic numbers. Unit-test the visible-steps/navigation logic (colocated `*.test.ts`).
- Stepper restyle: compact numbered nodes with gradient active state; on mobile show numbers + current-step label only (no truncated labels).
- `ReviewStep.vue`: mirror of the invitation layout in miniature (same icon rows/sections), not a label:value dump.
- Dialog-specific chrome (`event-wizard-dialog` class rules in `main.css`) is removed with the dialog. Edit mode, store seeding, and `handleFinish` branching are unchanged.
- Login/Register modals stay modals, restyled with the new tokens.

### 5. Polish pass
- Focus-visible rings everywhere (token-driven), `prefers-reduced-motion` guard on transitions/glow animations, toast styling to match, button loading states preserved.
- Datetime formatting helper: extend `src/utils/datetime.ts` with `formatFriendlyDate(date, time)` (+ tests, TZ-pinned suite already exists).

## Data flow / architecture impact

No API or store-shape changes. `useWizardStore` gains the event-type/enabled-steps fields it already holds — only the step-navigation representation changes. Routing unchanged except `/create` renders the wizard directly. `EventWizard`'s `defineExpose({ show })` pattern is dropped for create/edit (page-rendered); modals that remain (`LoginModal`, `RegisterModal`, `ShareDialog`, `RequestDialog`) keep the pattern.

## Error handling

Unchanged — `getApiErrorMessage` + toasts remain the contract. Empty/error states get styled but keep the same triggers.

## Testing / verification

- Keep the four existing Vitest suites green; add tests for wizard step-key logic and `formatFriendlyDate`.
- `npm run build` (type-check) must pass per phase.
- Visual verification via headless playwright screenshots against the dev build at desktop (1280) and iPhone (390) widths for: Home (empty + populated), Discover, wizard steps, event detail, shared-event guest view.

## Phases (each ships/commits independently)

1. Foundation: preset + tokens + background + typography + header + viewport fix.
2. Event page invitation redesign (EventDetails, EventTeaser, shared panels, attendees).
3. Cards + Home/Discover + empty states + friendly dates.
4. Full-page wizard + step-key refactor + review step + delete EventTypeSelector.
5. Polish: focus/motion/toasts, modals restyle, final sweep.

## Out of scope

Light mode, BE changes, new routes, PWA/manifest work, notification push (Phase 5 BE item), attendee counts on list cards (BE payload lacks them).
