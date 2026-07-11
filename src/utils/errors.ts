import { isAxiosError } from 'axios'

/**
 * Extract a user-facing message from an API error.
 *
 * The BE's unified error contract (party-starter R1) is
 * `{ message: string, errors?: { field: why } }` — `errors` only on
 * field-validation failures. Field errors are more specific than the
 * accompanying generic "Validation failed", so they win; keys are sorted
 * for a stable rendering order.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback
  const data: unknown = error.response?.data
  if (typeof data !== 'object' || data === null) return fallback

  const { message, errors } = data as { message?: unknown; errors?: unknown }

  if (typeof errors === 'object' && errors !== null) {
    const parts = Object.entries(errors as Record<string, unknown>)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
      .map(([field, why]) => `${field}: ${why}`)
      .sort()
    if (parts.length > 0) return parts.join('; ')
  }

  if (typeof message === 'string' && message.length > 0) return message
  return fallback
}
