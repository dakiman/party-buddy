# UI/UX Redesign ("Dark Lounge") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give party-buddy a deliberate dark-lounge/neon-violet identity and fix the structural UX problems (invitation-style event page, richer cards, full-page wizard) per `docs/superpowers/specs/2026-07-18-ui-ux-redesign-design.md`.

**Architecture:** Token-first restyle on PrimeVue 4 Lara: one `definePreset` (violet palette + violet-tinted dark surface ramp) plus `--pb-*` app custom properties in `src/assets/main.css`. Component templates change only where UX changes (EventDetails hero, EventCard, wizard Dialog→page). No new dependencies.

**Tech Stack:** Vue 3 `<script setup>` + TS, PrimeVue 4 (Lara preset, `--p-*` tokens), Pinia, Vitest (TZ-pinned Europe/Skopje), Vite 8.

## Global Constraints

- Dark-only; `darkModeSelector: ".my-app-dark"` stays; never add a light scheme.
- All component `<style>` blocks scoped; teleported-overlay rules (dialogs, popup menus, autocomplete panels, toast, confirm) go in `src/assets/main.css` (R3 rule).
- Only real PrimeVue v4 `--p-*` tokens (`--p-text-color`, `--p-text-muted-color`, `--p-content-background`, `--p-content-border-color`, `--p-content-hover-background`, `--p-primary-color`, `--p-primary-contrast-color`, `--p-surface-*`). App-level custom props use `--pb-*` prefix.
- Magenta `#ec4899` appears ONLY inside gradients/glows, never as a standalone interactive color.
- List views may use only `EventListResponse` fields: name/date/time/location/isPrivate/creatorUsername (collections arrive empty — slim-payload gotcha).
- Never use `Date.toISOString()` for wire formats (TZ gotcha in `src/utils/datetime.ts` header).
- Keep the 4 existing Vitest suites green; `npm run build` (vue-tsc) must pass at every commit.
- Commits per task, no Claude attribution of any kind.
- If host has no `node`: run npm via `sg docker -c 'docker run --rm -v ~/dev/party-buddy:/app -w /app node:22 npm …'`.
- Visual checks: playwright MCP against deployed :8094 after `cd /srv/dakis && sg docker -c 'docker compose build party-buddy-fe && docker compose up -d party-buddy-fe'`; delete screenshots afterwards.

---

### Task 1: Token foundation (preset, main.css, index.html, App.vue)

**Files:**
- Modify: `src/main.ts` (definePreset block, lines 16–82)
- Modify: `src/assets/main.css`
- Modify: `index.html` (viewport meta, font weights)
- Modify: `src/App.vue` (main-content spacing)

**Interfaces:**
- Produces: `--pb-accent-grad`, `--pb-glow`, `--pb-glow-soft`, `.pb-section-label`, `.pb-pill`, `.pb-popup-menu` (global classes/props all later tasks consume). Dark surface ramp via standard `--p-surface-*`.

- [ ] **Step 1: Replace the preset in `src/main.ts`** (delete all commented-out cruft):

```ts
const MyPreset = definePreset(Lara, {
  semantic: {
    primary: {
      50: "{violet.50}", 100: "{violet.100}", 200: "{violet.200}",
      300: "{violet.300}", 400: "{violet.400}", 500: "{violet.500}",
      600: "{violet.600}", 700: "{violet.700}", 800: "{violet.800}",
      900: "{violet.900}", 950: "{violet.950}",
    },
    focusRing: { width: "2px", style: "solid", color: "{primary.400}", offset: "2px" },
    colorScheme: {
      dark: {
        surface: {
          0: "#ffffff", 50: "#f5f4f9", 100: "#e9e7f1", 200: "#d4d0e3",
          300: "#b3adc9", 400: "#8d86a8", 500: "#6b6488", 600: "#4f4a68",
          700: "#39354e", 800: "#252136", 900: "#161326", 950: "#0b0a12",
        },
      },
    },
  },
})
```

- [ ] **Step 2: `src/assets/main.css`** — prepend a `:root` block and body background; retarget hardcoded `#1E1E1E` dialog/user-menu colors to tokens; add utilities:

```css
:root {
  --pb-accent: #8b5cf6;
  --pb-accent-2: #ec4899;
  --pb-accent-grad: linear-gradient(120deg, #a78bfa 0%, #8b5cf6 45%, #ec4899 100%);
  --pb-glow: 0 0 24px rgba(139, 92, 246, 0.35);
  --pb-glow-soft: 0 0 16px rgba(139, 92, 246, 0.18);
  --pb-radius-card: 16px;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(1100px 520px at 50% -8%, rgba(139, 92, 246, 0.14), transparent 62%),
    radial-gradient(900px 500px at 100% 110%, rgba(236, 72, 153, 0.07), transparent 55%),
    var(--p-surface-950);
  background-attachment: fixed;
  color: var(--p-text-color);
}

h1, h2, h3 { letter-spacing: -0.02em; }

.pb-section-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--p-text-muted-color);
}

.pb-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid var(--p-content-border-color);
  color: var(--p-text-muted-color);
  background: var(--p-surface-900);
}

.pb-gradient-text {
  background: var(--pb-accent-grad);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
```

Also in the existing rules: `.p-dialog` background → `var(--p-surface-900)`, radius 16px, shadow `0 24px 64px rgb(0 0 0 / 0.5)`; `.user-menu` background → `var(--p-surface-900)`, radius 12px. Keep the `.event-wizard-dialog` rules for now (removed in Task 8).

- [ ] **Step 3: `index.html`** — viewport meta becomes `content="width=device-width, initial-scale=1.0"`; font link gains `;800` weight (`Outfit:wght@400;500;600;700;800`).
- [ ] **Step 4: `src/App.vue`** — `.main-content` padding `1.5rem 1rem 4rem`.
- [ ] **Step 5: Verify** — `npm run build` passes; `npm test` green.
- [ ] **Step 6: Commit** — `feat: dark-lounge token foundation (violet preset, surfaces, glow tokens)`

---

### Task 2: Friendly date helpers + tests

**Files:**
- Modify: `src/utils/datetime.ts`
- Test: `src/utils/datetime.test.ts` (extend existing suite)

**Interfaces:**
- Produces: `formatFriendlyDate(dateIso?: string, time?: string): string` — "Tonight · 8:00 PM", "Tomorrow · 8:00 PM", "Fri, Jul 24" (current year), "Fri, Jul 24, 2027" (other year); time segment appended as ` · h:mm AM/PM` only when `time` given; returns `"Date TBA"` for missing date. Also `formatDayBadge(dateIso: string): { month: string; day: string }` → `{ month: "JUL", day: "24" }`.

- [ ] **Step 1: Write failing tests** (use `vi.setSystemTime` for Tonight/Tomorrow cases; construct dates as local, matching existing suite conventions):

```ts
describe('formatFriendlyDate', () => {
  afterEach(() => vi.useRealTimers())
  it('says Tonight for today with time', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 18, 10, 0, 0))
    expect(formatFriendlyDate('2026-07-18', '20:00')).toBe('Tonight · 8:00 PM')
  })
  it('says Tomorrow', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 18, 10, 0, 0))
    expect(formatFriendlyDate('2026-07-19', '21:30')).toBe('Tomorrow · 9:30 PM')
  })
  it('formats same-year dates without year', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 18, 10, 0, 0))
    expect(formatFriendlyDate('2026-07-24')).toBe('Fri, Jul 24')
  })
  it('keeps year for other years', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 18, 10, 0, 0))
    expect(formatFriendlyDate('2027-01-09', '19:00')).toBe('Sat, Jan 9, 2027 · 7:00 PM')
  })
  it('handles missing date', () => {
    expect(formatFriendlyDate(undefined)).toBe('Date TBA')
  })
})
describe('formatDayBadge', () => {
  it('splits month/day', () => {
    expect(formatDayBadge('2026-07-24')).toEqual({ month: 'JUL', day: '24' })
  })
})
```

- [ ] **Step 2: Run — expect FAIL** (functions not exported).
- [ ] **Step 3: Implement** in `datetime.ts` (parse `dateIso` as LOCAL date via `new Date(y, m-1, d)` split — `new Date('YYYY-MM-DD')` parses UTC and shifts in TZ± zones; use `en-US` locale explicitly so output is TZ-suite stable):

```ts
export function formatFriendlyDate(dateIso?: string, time?: string): string {
  if (!dateIso) return 'Date TBA'
  const [y, m, d] = dateIso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86_400_000)
  let day: string
  if (diffDays === 0) day = 'Tonight'
  else if (diffDays === 1) day = 'Tomorrow'
  else {
    const opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }
    if (date.getFullYear() !== now.getFullYear()) opts.year = 'numeric'
    day = date.toLocaleDateString('en-US', opts)
  }
  if (!time) return day
  const [hh, mm] = time.split(':').map(Number)
  const t = new Date(1970, 0, 1, hh, mm).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${day} · ${t}`
}

export function formatDayBadge(dateIso: string): { month: string; day: string } {
  const [y, m, d] = dateIso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return { month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(), day: String(d) }
}
```

- [ ] **Step 4: Run — expect PASS** (whole `npm test`).
- [ ] **Step 5: Commit** — `feat: friendly event date formatting helpers`

---

### Task 3: AppHeader restyle

**Files:**
- Modify: `src/components/AppHeader.vue`
- Modify: `src/assets/main.css` (`.user-menu` polish only if needed)

- [ ] **Step 1: Restyle.** Sticky translucent header: `position: sticky; top: 0; z-index: 100; background: color-mix(in srgb, var(--p-surface-950) 78%, transparent); backdrop-filter: blur(14px); border-bottom: 1px solid var(--p-content-border-color);`. Add a wordmark next to the logo image: `<span class="wordmark">Party <span class="pb-gradient-text">Buddy</span></span>` (weight 800, hide on <420px). Nav link active state: `router-link-active` gets `color: var(--p-text-color)` plus a 2px gradient underline (`background: var(--pb-accent-grad)` on an `::after` bar). Keep PendingBadge, mobile hamburger, avatar/menu behavior unchanged. Avatar gets `background: var(--pb-accent-grad); color: #fff;`.
- [ ] **Step 2: Verify** — build passes; screenshot desktop+390px: sticky blur, wordmark, active nav underline on /discover.
- [ ] **Step 3: Commit** — `feat: sticky blurred header with wordmark and active-nav accent`

---

### Task 4: EventCard redesign (shared card)

**Files:**
- Modify: `src/components/EventCard.vue`

**Interfaces:**
- Consumes: `formatFriendlyDate`, `formatDayBadge` (Task 2). Props stay `{ event: EventResponse }`; add optional `hideHost?: boolean` (Home passes it — own events don't need "by me").

- [ ] **Step 1: Rebuild template**: horizontal layout — left date-badge block (month over day number, violet-tinted panel `background: var(--p-surface-900); border: 1px solid var(--p-content-border-color)`, month in `.pb-section-label` style), right column: name (1.05rem/700, single line ellipsis), meta line `{{ formatFriendlyDate(event.date, event.time) }}`, location line (pi-map-marker + description, only if present), footer row: `.pb-pill` "Private"/"Public" (private gets `pi-lock` icon) + `by {{ creatorUsername }}` unless `hideHost`. "Date TBA" badge case: render `?` day. Card: `border-radius: var(--pb-radius-card)`, hover `transform: translateY(-2px); border-color: var(--p-primary-color); box-shadow: var(--pb-glow-soft)`, `:focus-visible` same ring.
- [ ] **Step 2: Commit** — `feat: richer event card (date badge, friendly date, privacy pill)`

---

### Task 5: Home — grouping, empty states, welcome hero

**Files:**
- Modify: `src/views/Home.vue`

**Interfaces:**
- Consumes: `EventCard` (Task 4) with `hide-host`; `formatLocalDate` for today-comparison.

- [ ] **Step 1: Replace inline card markup with `EventCard`,** split events: `upcoming` (date ≥ today, sorted asc; undated events count as upcoming, at the end) and `past` (desc). Render "Upcoming" section; if past events exist render a "Past" section (`.pb-section-label` heading, cards at `opacity: 0.6`) collapsed behind a text toggle button "Show N past events" / "Hide past events" (plain `ref<boolean>`).
- [ ] **Step 2: Empty state** (authed, zero events): centered block with `pi pi-sparkles` icon in a gradient-bordered circle, `h2` "No parties yet", muted line "Your next great night starts here.", primary Button "Create your first event". Error state keeps retry but matches the same centered layout.
- [ ] **Step 3: Welcome (unauthenticated) hero:** big headline `Plan the party.<br>We've got the rest.` with the second line in `.pb-gradient-text`, subline mentioning music/cocktails/RSVPs, buttons: primary "Join us" + text "Login", plus a link-button to `/discover` ("Browse public events"). Remove the dead `.header button` indigo overrides.
- [ ] **Step 4: Page header** — "My Events" 2rem/800; create Button gets `box-shadow: var(--pb-glow)`.
- [ ] **Step 5: Verify** — screenshots: welcome (logged out), empty state, populated with a past event (create one via API if needed). Both widths.
- [ ] **Step 6: Commit** — `feat: home upcoming/past grouping, empty states, welcome hero`

---

### Task 6: Discover polish

**Files:**
- Modify: `src/views/Discover.vue`

- [ ] **Step 1:** Title 800 weight. Controls row: search InputText pill-shaped (`border-radius: 999px`) with a `pi-search` icon (wrap in `.p-iconfield`/IconField+InputIcon from primevue), ToggleButton pill-shaped. Empty state matches Home's pattern (icon `pi pi-compass`, heading "Nothing here yet", the existing q-aware message as subline). Skeleton cards get `--pb-radius-card`. Grid gap 1.25rem.
- [ ] **Step 2: Verify** — screenshot both widths (empty + with the test event public? create one public via API for the shot).
- [ ] **Step 3: Commit** — `feat: discover search/empty-state polish`

---

### Task 7: Event page = invitation (EventDetails, EventTeaser, AttendeeList)

**Files:**
- Modify: `src/components/EventDetails.vue`
- Modify: `src/components/EventTeaser.vue`
- Modify: `src/components/AttendeeList.vue` (read first — not yet surveyed)
- Modify: `src/assets/main.css` (share `.user-menu` popup styling as `.pb-popup-menu` — add alias selector)

**Interfaces:**
- Consumes: `formatFriendlyDate` (Task 2). Emits stay `edit` / `delete`; `EventView.vue` needs no changes.

- [ ] **Step 1: Hero block** replacing `.event-title` + info-field dump: `.pb-pill` type pill (`pi-lock` Private / `pi-globe` Public), `h1` 2.6rem/800 with `.pb-gradient-text` on the name, meta line `pi-calendar` + `formatFriendlyDate(event.date, event.time)` (1.1rem), host line "Hosted by {{ event.creatorUsername }}" muted.
- [ ] **Step 2: Action row (creator only):** Share = primary with `pi-share-alt` and `--pb-glow` shadow; Edit = `outlined` secondary; Delete moves into an overflow `⋯` icon Button (`pi-ellipsis-h`, text severity secondary) toggling a PrimeVue `Menu` (`appendTo="body"`, class `pb-popup-menu`) with single item `Delete event` (icon `pi-trash`, `command: () => emit('delete')`, styled red via `.pb-popup-menu .danger-item` rule in main.css). In main.css duplicate `.user-menu` selectors to also match `.pb-popup-menu` (comma-join) and add `.pb-popup-menu .danger-item .p-menu-item-label, .pb-popup-menu .danger-item .p-menu-item-icon { color: var(--p-red-400); }`.
- [ ] **Step 3: "When & Where" card** (replaces "Time & Place" label/colon rows): icon rows — each row is a muted round icon tile (`pi-calendar`, `pi-map-marker`) + primary text (friendly date / location description) + secondary text (weekday full date / lat,lng small). Drop the "Event Type:" row (pill covers it). Section headings become `.pb-section-label`. Card radius `--pb-radius-card`.
- [ ] **Step 4: Music / Cocktails / Bar & Food restyle:** keep data logic identical; chips become neutral (`background: var(--p-surface-800); color: var(--p-text-color); border: 1px solid var(--p-content-border-color)`) — the all-violet chip wall goes away; cocktail cards keep layout, radius 12px, thumb 3.5rem with subtle glow border.
- [ ] **Step 5: `EventTeaser.vue`** — same hero treatment in miniature (pill if `isPrivate` knowable, gradient name, friendly date via helper, host line); card styling matches sections.
- [ ] **Step 6: `AttendeeList.vue`** — read it; restyle: heading `.pb-section-label`; per-status groups render initial-avatars (first letter, gradient background circles) + name; when all groups empty render single muted line "No RSVPs yet — be the first!" instead of three zero columns. Keep the silent-403 behavior untouched.
- [ ] **Step 7: Verify** — screenshots of an event with full data (artists/ingredients/cocktails/food via wizard or API) + the bare test event, both widths; guest view via share link (`/shared/:token`).
- [ ] **Step 8: Commit** — `feat: invitation-style event page (hero, icon rows, demoted delete)`

---

### Task 8: Full-page wizard

**Files:**
- Modify: `src/components/EventWizard.vue` (Dialog → page)
- Modify: `src/components/steps/TimeAndPlaceStep.vue` (fold in type + includes)
- Modify: `src/views/CreateEvent.vue` (render wizard directly)
- Modify: `src/views/EditEvent.vue` (drop show()/nextTick dance)
- Delete: `src/components/EventTypeSelector.vue`
- Modify: `src/assets/main.css` (remove `.event-wizard-dialog` rules)

**Interfaces:**
- `EventWizard` new contract: props `{ initialEvent?: EventResponse }`, NO `defineExpose`, NO `@hide`. Seeds store from `initialEvent` in `onMounted`; resets store in `onUnmounted`. Emits `cancel` (parent navigates). `activeSteps`/`nextStep`/`prevStep`/`handleFinish` logic unchanged (step keys already named — CLAUDE.md's "magic numbers" note is stale).

- [ ] **Step 1: `EventWizard.vue`:** remove Dialog import/wrapper; template root becomes `<div class="wizard-page">` with a header row (title `h1` "Create New Event"/"Edit Event" + text Button "Cancel" emitting `cancel`), then the existing `Stepper` (keep `linear`, id, pt number hack). Replace `show()`/`close()` with:

```ts
onMounted(() => { if (props.initialEvent) seedStoreFromEvent(props.initialEvent) })
onUnmounted(() => wizardStore.resetForm())
```

`handleFinish` drops `close()` calls (navigation + unmount reset covers it). Step-change watcher scrolls `window.scrollTo({ top: 0 })` instead of dialog content. Max width 800px centered. Stepper mobile CSS (scoped, `:deep()` on steplist): below 640px hide `.p-step-title` for non-active steps.
- [ ] **Step 2: `TimeAndPlaceStep.vue`:** add at top a "What are we throwing?" block: two pill toggle buttons Private Party (`pi-lock`) / Public Event (`pi-globe`) bound to `wizardStore.formData.isPrivate` (selected = filled violet + glow), and an "Include:" row of two pill checkboxes (Music, Drinks & Food) bound to `enabledSteps.music`/`enabledSteps.drinksAndFood` via `wizardStore.updateFormData`. Unchecking a step whose panel is later is safe (activeSteps computed re-derives; current step is always `timeAndPlace` when toggling here).
- [ ] **Step 3: `CreateEvent.vue`** becomes:

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import EventWizard from '@/components/EventWizard.vue'
const router = useRouter()
</script>
<template>
  <EventWizard @cancel="router.push('/')" />
</template>
```

- [ ] **Step 4: `EditEvent.vue`:** keep fetch + creator guard; replace wizardRef/nextTick/show()/onWizardClose with `<EventWizard v-if="event" :initial-event="event" @cancel="router.replace(`/events/${event.id}`)" />`.
- [ ] **Step 5: Delete `EventTypeSelector.vue`;** remove `.event-wizard-dialog` block from `main.css`. `rg -n 'EventTypeSelector|event-wizard-dialog'` must return nothing.
- [ ] **Step 6: Verify** — build; full create flow via playwright on :8094 (create with music+drinks, land on Home, event appears); edit flow (change name, save, detail shows change); cancel flows; mobile 390px screenshots of steps 1 and review.
- [ ] **Step 7: Commit** — `feat: full-page event wizard, fold type selection into step 1`

---

### Task 9: Review step = invitation preview

**Files:**
- Modify: `src/components/steps/ReviewStep.vue`

- [ ] **Step 1:** Restructure to mirror Task 7's layout in miniature: top preview card — type `.pb-pill`, event name in gradient text (1.6rem/800), `formatFriendlyDate(formatLocalDate(formData.date), formatLocalTime(formData.time))` line (guard nulls; reuse existing wire formatters to convert the store's `Date` objects), location line. Below: sections with `.pb-section-label` headings ("Music", "Cocktails", "Bar", "Food & Snacks") using the neutral chip style from Task 7. Empty optional sections hidden (existing v-ifs stay).
- [ ] **Step 2: Verify** — walk wizard to review with data; screenshot.
- [ ] **Step 3: Commit** — `feat: review step mirrors invitation layout`

---

### Task 10: Overlay/modal polish + final sweep

**Files:**
- Modify: `src/assets/main.css` (toast, confirm dialog)
- Modify: `src/components/LoginModal.vue`, `src/components/RegisterModal.vue` (read first; restyle headers/CTAs only)
- Modify: `CLAUDE.md` (repo doc refresh)

- [ ] **Step 1: main.css:** `.p-toast .p-toast-message { border-radius: 12px; backdrop-filter: blur(10px); }`; ConfirmDialog inherits `.p-dialog` chrome already — verify accept button renders danger.
- [ ] **Step 2: Login/Register modals:** titles 700, primary submit buttons full-width with `--pb-glow`, links between the two modals styled as violet text links. No logic changes.
- [ ] **Step 3: CLAUDE.md refresh:** styling section (violet preset, `--pb-*` props, dark-only decision — light-mode Phase 9 item dropped, viewport fixed); wizard section (full-page, no Dialog, no `show()`, EventTypeSelector deleted, stale magic-number note removed); gotchas list updated accordingly.
- [ ] **Step 4: Full verification:** `npm test` + `npm run build`; rebuild container; screenshot tour (welcome, home populated, discover, wizard steps 1/2/3/4, event detail, shared guest view) at 1280 & 390; delete all screenshots; delete the "UI Review Test Party" event (id 54) and any other test events created along the way.
- [ ] **Step 5: Commit** — `feat: overlay polish; docs: refresh CLAUDE.md for redesign`

---

## Self-review notes

- Spec coverage: foundation→T1, header→T3, invitation→T7, cards/home/discover→T4–6, wizard→T8, review→T9, polish/a11y→T1(viewport)+T10, friendly dates→T2, dark-only+glow tokens→T1. Spec's "step-key refactor" was found already implemented (named keys in EventWizard since R-era commits) — T8 notes it; spec updated.
- Type consistency: `formatFriendlyDate(dateIso?, time?)` used in T4/T5/T7/T9; `formatDayBadge` only T4. `EventWizard` new contract consumed in T8 steps 3–4 only.
- AttendeeList/LoginModal/RegisterModal are read-before-modify tasks (not yet in context) — flagged in their steps.
