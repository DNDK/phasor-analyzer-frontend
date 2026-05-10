import { apiFetch } from './client'

export interface RegisterPayload {
  email: string
  username: string
  password: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface AccessToken {
  access_token: string
  token_type: string
}

export async function register(payload: RegisterPayload): Promise<TokenPair> {
  return apiFetch<TokenPair>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function login(payload: LoginPayload): Promise<TokenPair> {
  return apiFetch<TokenPair>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function refreshAccessToken(refreshToken: string): Promise<AccessToken> {
  return apiFetch<AccessToken>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
}
