import { create } from 'zustand'
import type { Show, CreateShowPayload } from '../types'
import * as showsApi from '../api/shows'

interface ShowState {
  upcomingShows: Show[]
  pastShows: Show[]
  currentShow: Show | null
  searchResults: Show[]
  loading: boolean
  fetchUpcoming: () => Promise<void>
  fetchPast: () => Promise<void>
  fetchShow: (id: number) => Promise<void>
  searchShows: (q: string) => Promise<void>
  aiSearch: (q: string) => Promise<void>
  createShow: (data: CreateShowPayload) => Promise<Show>
  deleteShow: (id: number) => Promise<void>
}

export const useShowStore = create<ShowState>((set) => ({
  upcomingShows: [],
  pastShows: [],
  currentShow: null,
  searchResults: [],
  loading: false,
  fetchUpcoming: async () => {
    set({ loading: true })
    const data = await showsApi.getUpcomingShows()
    set({ upcomingShows: data, loading: false })
  },
  fetchPast: async () => {
    set({ loading: true })
    const data = await showsApi.getPastShows()
    set({ pastShows: data, loading: false })
  },
  fetchShow: async (id) => {
    set({ loading: true })
    const data = await showsApi.getShowById(id)
    set({ currentShow: data, loading: false })
  },
  searchShows: async (q) => {
    set({ loading: true })
    const data = await showsApi.searchShows(q)
    set({ searchResults: data, loading: false })
  },
  aiSearch: async (q) => {
    set({ loading: true })
    const data = await showsApi.aiSearchShows(q)
    set({ searchResults: data, loading: false })
  },
  createShow: async (payload) => {
    const show = await showsApi.createShow(payload)
    return show
  },
  deleteShow: async (id) => {
    await showsApi.deleteShow(id)
  },
}))
