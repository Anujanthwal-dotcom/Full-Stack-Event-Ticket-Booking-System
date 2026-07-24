import client from './client'
import type { PaymentIntentResponse } from '../types'

export function createPaymentIntent(showId: number) {
  return client
    .post<PaymentIntentResponse>('/api/payments/create-intent', { showId })
    .then((r) => r.data)
}
