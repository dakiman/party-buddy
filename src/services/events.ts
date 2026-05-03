import api from './api'
import type { Artist, Cocktail, CreateEventPayload, EventResponse, Ingredient, Location, UpdateEventPayload, PaginatedEvents, ShareLink, RsvpStatus } from '@/types'

// Wire-level shape of an Event as returned by the BE — pre-normalization.
// Differs from EventResponse only in the `artists[].spotifyId` field name.
interface RawEventArtist {
  spotifyId: string
  name: string
  images: { url: string; height: number; width: number }[]
  genres: string[]
  spotifyUrl: string
  followers?: number
  popularity?: number
}

interface RawEventResponse {
  id: number
  name: string
  date: string
  time?: string
  location?: Location
  artists: RawEventArtist[]
  ingredients: Ingredient[]
  food: string[]
  isPrivate: boolean
  createdAt: string
  updatedAt: string
  creatorUsername: string
  drinks?: Cocktail[]
}

function normalizeArtist(raw: RawEventArtist): Artist {
  return {
    id: raw.spotifyId,
    name: raw.name,
    images: raw.images,
    genres: raw.genres,
    spotifyUrl: raw.spotifyUrl,
    followers: raw.followers,
    popularity: raw.popularity,
  }
}

function normalizeEvent(raw: RawEventResponse): EventResponse {
  return {
    id: raw.id,
    name: raw.name,
    date: raw.date,
    time: raw.time,
    location: raw.location,
    artists: (raw.artists ?? []).map(normalizeArtist),
    ingredients: raw.ingredients ?? [],
    drinks: raw.drinks ?? [],
    food: raw.food ?? [],
    isPrivate: raw.isPrivate,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    creatorUsername: raw.creatorUsername,
  }
}

export async function createEvent(payload: CreateEventPayload): Promise<EventResponse> {
  const { data } = await api.post<RawEventResponse>('/events', payload)
  return normalizeEvent(data)
}

export async function getEvent(id: number): Promise<EventResponse> {
  const { data } = await api.get<RawEventResponse>(`/events/${id}`)
  return normalizeEvent(data)
}

export async function listMyEvents(): Promise<EventResponse[]> {
  const { data } = await api.get<RawEventResponse[]>('/events', {
    params: { createdBy: 'ME' },
  })
  return data.map(normalizeEvent)
}

export async function updateEvent(id: number, payload: UpdateEventPayload): Promise<EventResponse> {
  const { data } = await api.put<RawEventResponse>(`/events/${id}`, payload)
  return normalizeEvent(data)
}

export async function deleteEvent(id: number): Promise<void> {
  await api.delete(`/events/${id}`)
}

interface RawPaginatedEvents {
  content: RawEventResponse[]
  totalElements: number
  number: number  // Spring's "current page index"
  size: number
}

export async function issueShareLink(id: number): Promise<ShareLink> {
  const { data } = await api.post<ShareLink>(`/events/${id}/share`)
  return data
}

export async function rotateShareLink(id: number): Promise<ShareLink> {
  const { data } = await api.post<ShareLink>(`/events/${id}/share/rotate`)
  return data
}

export async function getEventByShareToken(token: string): Promise<EventResponse> {
  const { data } = await api.get<RawEventResponse>(`/events/share/${encodeURIComponent(token)}`)
  return normalizeEvent(data)
}

export async function listPublicEvents(params: {
  page?: number
  size?: number
  q?: string
  includePast?: boolean
}): Promise<PaginatedEvents> {
  const { data } = await api.get<RawPaginatedEvents>('/events/public', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 20,
      q: params.q || undefined,
      includePast: params.includePast ?? false,
    },
  })
  return {
    content: data.content.map(normalizeEvent),
    totalElements: data.totalElements,
    page: data.number,
    size: data.size,
  }
}

// ─── Phase 3.5 ────────────────────────────────────────────────────────────

export interface ShareViewerState {
  state: 'not_requested' | 'pending' | 'approved' | 'declined' | 'attending'
  attendeeStatus?: RsvpStatus
  requestDecidedAt?: string
  isCreator?: boolean
  eventIsPrivate: boolean
}

export interface JoinRequestResult {
  guestToken?: string
  state: 'pending' | 'attending' | 'already_pending' | 'already_attending' | 'already_declined'
}

export interface PendingRequest {
  id: number
  requester: {
    kind: 'USER' | 'GUEST'
    displayName: string
    discriminator?: string
    contactNote?: string
    username?: string
  }
  createdAt: string
}

export interface Attendee {
  id: number
  identity: { kind: 'USER' | 'GUEST'; displayName: string; discriminator?: string; username?: string }
  status: RsvpStatus
}

const GUEST_TOKEN_KEY = 'partyapp.guest_token'

export async function getViewerState(shareToken: string): Promise<ShareViewerState> {
  const { data } = await api.get<ShareViewerState>(`/share/${encodeURIComponent(shareToken)}/me`)
  return data
}

export async function submitJoinRequest(
  shareToken: string,
  body?: { displayName: string; contactNote?: string },
): Promise<JoinRequestResult> {
  const { data } = await api.post<JoinRequestResult>(
    `/share/${encodeURIComponent(shareToken)}/request`,
    body ?? {},
  )
  if (data.guestToken) {
    localStorage.setItem(GUEST_TOKEN_KEY, data.guestToken)
  }
  return data
}

export async function listPendingRequests(eventId: number): Promise<PendingRequest[]> {
  const { data } = await api.get<PendingRequest[]>(`/events/${eventId}/requests`)
  return data
}

export async function approveRequest(eventId: number, requestId: number): Promise<Attendee> {
  const { data } = await api.post<Attendee>(`/events/${eventId}/requests/${requestId}/approve`)
  return data
}

export async function declineRequest(eventId: number, requestId: number): Promise<void> {
  await api.post(`/events/${eventId}/requests/${requestId}/decline`)
}

export async function listAttendees(eventId: number): Promise<Attendee[]> {
  const { data } = await api.get<Attendee[]>(`/events/${eventId}/attendees`)
  return data
}

export async function setMyAttendeeStatus(eventId: number, status: RsvpStatus): Promise<Attendee> {
  const { data } = await api.put<Attendee>(`/events/${eventId}/attendees/me`, { status })
  return data
}

export async function pendingRequestCountForMyEvents(): Promise<number> {
  const { data } = await api.get<{ count: number }>('/events/requests/count')
  return data.count
}
