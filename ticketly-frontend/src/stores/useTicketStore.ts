import { create } from 'zustand'
import type { Ticket } from '../types'
import * as ticketsApi from '../api/tickets'

interface TicketState {
  tickets: Ticket[]
  currentTicket: Ticket | null
  loading: boolean
  fetchMyTickets: () => Promise<void>
  fetchTicket: (id: number) => Promise<void>
  bookTicket: (showId: number, paymentIntentId: string) => Promise<Ticket>
}

export const useTicketStore = create<TicketState>((set) => ({
  tickets: [],
  currentTicket: null,
  loading: false,
  fetchMyTickets: async () => {
    set({ loading: true })
    const data = await ticketsApi.getMyTickets()
    set({ tickets: data, loading: false })
  },
  fetchTicket: async (id) => {
    set({ loading: true })
    const data = await ticketsApi.getTicketById(id)
    set({ currentTicket: data, loading: false })
  },
  bookTicket: async (showId, paymentIntentId) => {
    const ticket = await ticketsApi.bookTicket({ showId, paymentIntentId })
    return ticket
  },
}))
