import { describe, expect, it } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import { getApiErrorMessage } from './errors'

function axios400(data: unknown): AxiosError {
  const error = new AxiosError('Request failed with status code 400')
  error.response = {
    data,
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: { headers: new AxiosHeaders() },
  }
  return error
}

describe('getApiErrorMessage', () => {
  it('returns the message field', () => {
    expect(getApiErrorMessage(axios400({ message: 'Username or email is already in use' }), 'fb'))
      .toBe('Username or email is already in use')
  })

  it('prefers joined field errors over the generic message', () => {
    const e = axios400({
      message: 'Validation failed',
      errors: { password: 'size must be between 8 and 72', email: 'must not be blank' },
    })
    expect(getApiErrorMessage(e, 'fb'))
      .toBe('email: must not be blank; password: size must be between 8 and 72')
  })

  it('falls back when the body has no usable fields', () => {
    expect(getApiErrorMessage(axios400({}), 'fb')).toBe('fb')
    expect(getApiErrorMessage(axios400('plain text'), 'fb')).toBe('fb')
  })

  it('falls back for network errors and non-axios errors', () => {
    expect(getApiErrorMessage(new AxiosError('Network Error'), 'fb')).toBe('fb')
    expect(getApiErrorMessage(new Error('boom'), 'fb')).toBe('fb')
    expect(getApiErrorMessage(undefined, 'fb')).toBe('fb')
  })
})
