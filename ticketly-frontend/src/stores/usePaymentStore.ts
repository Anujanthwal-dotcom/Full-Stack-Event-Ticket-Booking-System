import { create } from 'zustand'
import { createPaymentIntent } from '../api/payments'

interface PaymentState {
  clientSecret: string | null
  paymentIntentId: string | null
  loading: boolean
  createIntent: (showId: number) => Promise<void>
  reset: () => void
}

export const usePaymentStore = create<PaymentState>((set) => ({
  clientSecret: null,
  paymentIntentId: null,
  loading: false,
  createIntent: async (showId) => {
    set({ loading: true })
    const res = await createPaymentIntent(showId)
    set({ clientSecret: res.clientSecret, paymentIntentId: res.paymentIntentId, loading: false })
  },
  reset: () => set({ clientSecret: null, paymentIntentId: null, loading: false }),
}))
