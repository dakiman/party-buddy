// ─── User ──────────────────────────────────────────────────────────────────

export interface User {
  id: number
  email: string
  username: string
}

// ─── Spotify ───────────────────────────────────────────────────────────────

export interface SpotifyImage {
  url: string
  height: number
  width: number
}

/**
 * A Spotify artist as seen by the FE.
 *
 * Wire-level note: the BE returns `id` from `/music/artists` (search) but
 * `spotifyId` from `/events/{id}` (event read). The events API client in
 * `services/events.ts` normalizes the latter to `id` so consumers see one
 * shape everywhere.
 */
export interface Artist {
  id: string
  name: string
  images: SpotifyImage[]
  genres: string[]
  spotifyUrl: string
  followers?: number
  popularity?: number
}

export interface Track {
  id: string
  name: string
  albumImageUrl: string | null
  durationMs: number | null
}

// ─── Drinks & Ingredients ──────────────────────────────────────────────────

export interface Drink {
  id: number
  name: string
  recipe?: string
  externalId?: number
  isAlcoholic: boolean
  thumbnail?: string
}

export interface Ingredient {
  id: number
  name: string
  abv?: string
  isAlcoholic?: boolean
  description?: string
}

// ─── Location ──────────────────────────────────────────────────────────────

/**
 * Location as returned in EventResponse (BE `EventResponse.LocationResponse`).
 * The POST request body uses a different shape (`lat`/`lng`/`locationDescription`)
 * captured in `CreateEventPayload` below.
 */
export interface Location {
  latitude: number
  longitude: number
  description?: string
}

// ─── Event ─────────────────────────────────────────────────────────────────

/**
 * Event read shape (response from GET /events/* — already normalized by the
 * events API client to use `Artist` with `id`, not `spotifyId`).
 */
export interface EventResponse {
  id: number
  name: string
  date: string         // ISO date "YYYY-MM-DD"
  time?: string        // "HH:mm"
  location?: Location
  artists: Artist[]
  ingredients: Ingredient[]
  food: string[]
  isPrivate: boolean
  createdAt: string
  updatedAt: string
  creatorUsername: string
}

/** Legacy alias retained so existing imports of `Event` keep working. */
export type Event = EventResponse

/**
 * Event create payload — the body of POST /events.
 * Mirrors the BE `PostEventRequest` shape (note the request-side `lat`/`lng`).
 */
export interface CreateEventPayload {
  name: string
  date: string         // ISO date "YYYY-MM-DD"
  time?: string        // "HH:mm"
  location?: {
    lat: number
    lng: number
    locationDescription?: string
  }
  artists: Artist[]
  drinks?: number[]
  ingredients?: number[]
  food?: string[]
  isPrivate?: boolean
}

/**
 * Event update payload — the body of PUT /events/{id}.
 * Structurally identical to CreateEventPayload today. Kept as a separate type
 * so future phases can make certain fields optional on edit without touching
 * the create flow.
 */
export interface UpdateEventPayload {
  name: string
  date: string         // ISO date "YYYY-MM-DD"
  time?: string        // "HH:mm"
  location?: {
    lat: number
    lng: number
    locationDescription?: string
  }
  artists: Artist[]
  drinks?: number[]
  ingredients?: number[]
  food?: string[]
  isPrivate?: boolean
}

// ─── Sharing & discovery (Phase 3) ─────────────────────────────────────────

export interface ShareLink {
  token: string
  url: string
}

/**
 * Response shape for paginated event listings (e.g. GET /events/public).
 * Mirrors the relevant fields from Spring's Page<T>.
 */
export interface PaginatedEvents {
  content: EventResponse[]
  totalElements: number
  page: number
  size: number
}

// ─── Phase 3.5: RSVP & Join Requests ────────────────────────────────────────

export type RsvpStatus = 'GOING' | 'MAYBE' | 'DECLINED'
export type JoinRequestStatus = 'PENDING' | 'APPROVED' | 'DECLINED'
