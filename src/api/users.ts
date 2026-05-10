import { apiGet } from './client'
import type { User } from '@/types/user'

export async function getMe(): Promise<User> {
  return apiGet<User>('/users/me')
}
