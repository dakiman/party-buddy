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

/**
 * Display formatters for the UI (not the wire). Parse "YYYY-MM-DD" manually —
 * new Date('YYYY-MM-DD') parses as UTC midnight, which shifts the calendar
 * day in UTC- zones. Locale is pinned to en-US so tests are TZ-suite stable.
 */
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
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: String(d),
  }
}
