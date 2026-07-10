/**
 * Local-time serializers for the BE wire format.
 *
 * Never use Date.toISOString() for these: it converts to UTC, so a
 * local-midnight date in a UTC+ timezone lands on the previous day.
 * Likewise toLocaleTimeString('en-US', { hour12: false }) renders the
 * midnight hour as "24:xx", which the BE's HH:mm LocalTime rejects.
 */
export function formatLocalDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatLocalTime(d: Date): string {
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}
