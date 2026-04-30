import api from './api'
import type { Artist, CreateEventPayload, EventResponse, Ingredient, Location, UpdateEventPayload } from '@/types'

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
  // The BE also sends a `drinks` array (legacy field, always empty from FE).
  // Type as unknown — we don't read it on the FE.
  drinks?: unknown
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
