import { create } from 'zustand'
import type { User } from '../types'
import { fetchCurrentUser } from '../api/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  checkAuth: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  checkAuth: async () => {
    try {
      const res = await fetchCurrentUser()
      if (res.authenticated && res.user) {
        set({ user: res.user, isAuthenticated: true, loading: false })
      } else {
        set({ user: null, isAuthenticated: false, loading: false })
      }
    } catch {
      set({ user: null, isAuthenticated: false, loading: false })
    }
  },
  logout: () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/logout`
  },
}))
