import client from './client'
import type { UserResponse } from '../types'

export function fetchCurrentUser() {
  return client.get<UserResponse>('/api/user/me').then((r) => r.data)
}
