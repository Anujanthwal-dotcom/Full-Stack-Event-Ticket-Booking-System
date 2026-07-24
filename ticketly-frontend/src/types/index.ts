export interface User {
  id: number
  name: string
  email: string
  provider: 'GOOGLE' | 'FACEBOOK'
  avatarUrl: string | null
  createdAt: string
}

export interface Show {
  id: number
  title: string
  description: string | null
  showDateTime: string
  venue: string
  totalSeats: number
  availableSeats: number
  price: number
  createdById: number
  createdAt: string
}

export interface Ticket {
  id: number
  seatNumber: number
  status: 'BOOKED' | 'CANCELLED'
  bookedAt: string
  showId: number
  showTitle: string
  showDateTime: string
  showVenue: string
}

export interface CreateShowPayload {
  title: string
  description: string
  showDateTime: string
  venue: string
  totalSeats: number
  price: number
}

export interface PaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
}

export interface BookTicketPayload {
  showId: number
  paymentIntentId: string
}

export interface UserResponse {
  authenticated: boolean
  user: User | null
}
