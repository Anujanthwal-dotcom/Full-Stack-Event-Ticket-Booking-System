import client from './client'
import type { Show, CreateShowPayload } from '../types'

export function getUpcomingShows() {
  return client.get<Show[]>('/api/shows').then((r) => r.data)
}

export function getPastShows() {
  return client.get<Show[]>('/api/shows/past').then((r) => r.data)
}

export function getShowById(id: number) {
  return client.get<Show>(`/api/shows/${id}`).then((r) => r.data)
}

export function searchShows(q: string) {
  return client.get<Show[]>('/api/shows/search', { params: { q } }).then((r) => r.data)
}

export function aiSearchShows(q: string) {
  return client.get<Show[]>('/api/ai-search/search', { params: { q } }).then((r) => r.data)
}

export function createShow(payload: CreateShowPayload) {
  return client.post<Show>('/api/shows', payload).then((r) => r.data)
}

export function deleteShow(id: number) {
  return client.delete(`/api/shows/${id}`).then((r) => r.data)
}
