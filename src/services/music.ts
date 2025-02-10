import api from './api'
import type { Artist } from '@/stores/wizard'

export async function searchArtists(name: string): Promise<Artist[]> {
  const response = await api.get('/music/artists', {
    params: { name }
  })
  return response.data.artists
} 