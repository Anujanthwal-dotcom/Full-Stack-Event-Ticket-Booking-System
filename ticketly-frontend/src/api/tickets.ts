import client from './client'
import type { Ticket, BookTicketPayload } from '../types'

export function getMyTickets() {
  return client.get<Ticket[]>('/api/tickets').then((r) => r.data)
}

export function getTicketById(id: number) {
  return client.get<Ticket>(`/api/tickets/${id}`).then((r) => r.data)
}

export function bookTicket(payload: BookTicketPayload) {
  return client.post<Ticket>('/api/tickets', payload).then((r) => r.data)
}

export function downloadTicket(id: number) {
  return client
    .get<Blob>(`/api/tickets/${id}/download`, { responseType: 'blob' })
    .then((r) => r.data)
}
