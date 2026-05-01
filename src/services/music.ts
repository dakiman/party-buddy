import api from './api'
import type { Artist, Track } from '@/types'

interface SearchArtistsResponse {
  artists: Artist[]
}

export async function searchArtists(name: string): Promise<Artist[]> {
  const { data } = await api.get<SearchArtistsResponse>('/music/artists', {
    params: { name },
  })
  return data.artists
}

interface GenresResponse {
  genres: string[]
}

export async function getGenres(): Promise<string[]> {
  const { data } = await api.get<GenresResponse>('/music/genres')
  return data.genres
}

interface TopTracksResponse {
  tracks: Track[]
}

export async function getArtistTopTracks(artistId: string): Promise<Track[]> {
  const { data } = await api.get<TopTracksResponse>(`/music/artists/${encodeURIComponent(artistId)}/top-tracks`)
  return data.tracks
}

export async function getSimilarArtists(seedNames: string[]): Promise<Artist[]> {
  if (seedNames.length === 0) return []
  const { data } = await api.get<SearchArtistsResponse>('/music/artists/similar', {
    params: { seedNames: seedNames.join(',') },
  })
  return data.artists
}
