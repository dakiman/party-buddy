import api from './api'
import type { Artist } from '@/types'

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
