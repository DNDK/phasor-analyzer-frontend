/**
 * Lightweight fetch wrapper that:
 *  - Prefixes every request with the backend base URL via the Vite proxy (/api → http://localhost:8000)
 *  - Attaches the Authorization header when an access token is available
 *  - Attempts a silent token refresh (POST /auth/refresh) on 401 and retries once
 *  - Throws a structured ApiError with status code + detail message on failure
 */

import { useAuthStore } from '@/stores/auth'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const json = await res.json()
    return json?.detail ?? res.statusText
  } catch {
    return res.statusText
  }
}

async function doFetch(input: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const auth = useAuthStore()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }

  if (auth.accessToken) {
    headers['Authorization'] = `Bearer ${auth.accessToken}`
  }

  const res = await fetch(`/api${input}`, { ...init, headers })

  if (res.status === 401 && retry && auth.refreshToken) {
    // Attempt silent refresh
    const refreshRes = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: auth.refreshToken }),
    })

    if (refreshRes.ok) {
      const data = await refreshRes.json()
      auth.setAccessToken(data.access_token)
      return doFetch(input, init, false)
    } else {
      auth.clearTokens()
      window.location.href = '/login'
      throw new ApiError(401, 'Session expired. Please log in again.')
    }
  }

  return res
}

export async function apiFetch<T = unknown>(input: string, init: RequestInit = {}): Promise<T> {
  const res = await doFetch(input, init)

  if (!res.ok) {
    const detail = await parseError(res)
    throw new ApiError(res.status, detail)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: 'GET' })
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PATCH',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export async function apiDelete(path: string): Promise<void> {
  return apiFetch<void>(path, { method: 'DELETE' })
}
