import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatDayBadge, formatFriendlyDate, formatLocalDate, formatLocalTime } from './datetime'

// Runs under TZ=Europe/Skopje (UTC+2 in summer) via the npm script, so the
// old toISOString() bug (local midnight -> previous UTC day) would fail here.
describe('formatLocalDate', () => {
  it('serializes a local-midnight date as that calendar day', () => {
    expect(formatLocalDate(new Date(2026, 6, 15))).toBe('2026-07-15')
  })

  it('pads single-digit month and day', () => {
    expect(formatLocalDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('does not shift to the previous UTC day (toISOString regression)', () => {
    const localMidnight = new Date(2026, 6, 15)
    // Only meaningful in a UTC+ zone (npm test pins TZ=Europe/Skopje);
    // in UTC/UTC- the local and ISO dates legitimately coincide.
    if (localMidnight.getTimezoneOffset() >= 0) return
    expect(formatLocalDate(localMidnight)).not.toBe(localMidnight.toISOString().split('T')[0])
  })
})

describe('formatLocalTime', () => {
  it('serializes midnight-hour times as 00:xx, never 24:xx', () => {
    expect(formatLocalTime(new Date(2026, 6, 15, 0, 30))).toBe('00:30')
  })

  it('pads hours and minutes', () => {
    expect(formatLocalTime(new Date(2026, 6, 15, 9, 5))).toBe('09:05')
  })

  it('keeps 24h format in the evening', () => {
    expect(formatLocalTime(new Date(2026, 6, 15, 23, 45))).toBe('23:45')
  })
})

describe('formatFriendlyDate', () => {
  afterEach(() => vi.useRealTimers())

  it('says Tonight for today with time', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 18, 10, 0, 0))
    expect(formatFriendlyDate('2026-07-18', '20:00')).toBe('Tonight · 8:00 PM')
  })

  it('says Tomorrow', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 18, 10, 0, 0))
    expect(formatFriendlyDate('2026-07-19', '21:30')).toBe('Tomorrow · 9:30 PM')
  })

  it('formats same-year dates without year', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 18, 10, 0, 0))
    expect(formatFriendlyDate('2026-07-24')).toBe('Fri, Jul 24')
  })

  it('keeps year for other years', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 18, 10, 0, 0))
    expect(formatFriendlyDate('2027-01-09', '19:00')).toBe('Sat, Jan 9, 2027 · 7:00 PM')
  })

  it('handles missing date', () => {
    expect(formatFriendlyDate(undefined)).toBe('Date TBA')
  })
})

describe('formatDayBadge', () => {
  it('splits month/day', () => {
    expect(formatDayBadge('2026-07-24')).toEqual({ month: 'JUL', day: '24' })
  })
})
