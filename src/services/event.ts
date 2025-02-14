import api from './api'

export async function createEvent(eventData: any) {
  const response = await api.post('/events', eventData)
  return response.data
}