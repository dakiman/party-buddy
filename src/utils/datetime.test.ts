import { describe, expect, it } from 'vitest'
import { formatLocalDate, formatLocalTime } from './datetime'

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
