import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('./api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

import api from './api'
import { listMyEvents, listPublicEvents } from './events'

const apiGet = vi.mocked(api.get)

beforeEach(() => {
  apiGet.mockReset()
})

// The BE list endpoints return the slim EventListResponse (R2): no
// artists/drinks/ingredients/food. normalizeEvent must default them to [].
const slimRawEvent = {
  id: 7,
  name: 'Slim Fiesta',
  date: '2026-08-01',
  time: '20:00',
  location: { latitude: 1, longitude: 2, description: 'Rooftop' },
  isPrivate: false,
  createdAt: '2026-07-11T10:00:00',
  updatedAt: '2026-07-11T10:00:00',
  creatorUsername: 'carol',
}

describe('slim list payload normalization', () => {
  it('listMyEvents defaults the missing collections to empty arrays', async () => {
    apiGet.mockResolvedValue({ data: [slimRawEvent] })

    const [event] = await listMyEvents()

    expect(event.name).toBe('Slim Fiesta')
    expect(event.artists).toEqual([])
    expect(event.drinks).toEqual([])
    expect(event.ingredients).toEqual([])
    expect(event.food).toEqual([])
  })

  it('listPublicEvents defaults the missing collections to empty arrays', async () => {
    apiGet.mockResolvedValue({
      data: { content: [slimRawEvent], totalElements: 1, number: 0, size: 12 },
    })

    const page = await listPublicEvents({ page: 0, size: 12 })

    expect(page.content[0].artists).toEqual([])
    expect(page.content[0].drinks).toEqual([])
  })
})
