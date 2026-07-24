import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users, ArrowLeft, Trash2 } from 'lucide-react'
import { useShowStore } from '../stores/useShowStore'
import { useAuthStore } from '../stores/useAuthStore'
import { usePaymentStore } from '../stores/usePaymentStore'
import { useTicketStore } from '../stores/useTicketStore'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import StripeCheckoutModal from '../components/payment/StripeCheckoutModal'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ShowDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentShow: show, loading, fetchShow, deleteShow } = useShowStore()
  const { user, isAuthenticated } = useAuthStore()
  const { clientSecret, loading: paymentLoading, createIntent, reset: resetPayment } = usePaymentStore()
  const { bookTicket } = useTicketStore()

  const [showModal, setShowModal] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (id) fetchShow(Number(id))
  }, [id, fetchShow])

  async function handleStartBooking() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/shows/${id}` } })
      return
    }
    if (!show) return

    setError(null)
    try {
      await createIntent(show.id)
      setShowModal(true)
    } catch {
      setError('Failed to initiate payment. Please try again.')
    }
  }

  async function handlePaymentSuccess() {
    if (!show || !usePaymentStore.getState().paymentIntentId) return

    try {
      const ticket = await bookTicket(show.id, usePaymentStore.getState().paymentIntentId!)
      setShowModal(false)
      setBookingSuccess(true)
      resetPayment()
      navigate(`/tickets/${ticket.id}`)
    } catch {
      setError('Booking failed. Your payment was processed — please contact support.')
    }
  }

  function handleCancelPayment() {
    setShowModal(false)
    resetPayment()
  }

  async function handleDelete() {
    if (!show) return
    if (!window.confirm('Are you sure you want to delete this show? This cannot be undone.')) return
    setDeleting(true)
    try {
      await deleteShow(show.id)
      navigate('/', { replace: true })
    } catch {
      setError('Failed to delete show.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (!show) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Show not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    )
  }

  const soldOut = show.availableSeats === 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{show.title}</h1>
            <div className="flex items-center gap-3 shrink-0">
              {isAuthenticated && user && show.createdById === user.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  loading={deleting}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
              <span className="text-2xl font-bold text-indigo-600 whitespace-nowrap">${show.price}</span>
            </div>
          </div>

          {show.description && (
            <p className="text-gray-600 mb-6 leading-relaxed">{show.description}</p>
          )}

          <div className="space-y-3 text-gray-600 mb-8">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span>{formatDate(show.showDateTime)} at {formatTime(show.showDateTime)}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span>{show.venue}</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              {soldOut ? (
                <Badge variant="error">Sold Out</Badge>
              ) : (
                <span>{show.availableSeats} of {show.totalSeats} seats available</span>
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 mb-4">{error}</p>
          )}

          {bookingSuccess ? (
            <div className="bg-green-50 text-green-700 rounded-xl px-5 py-4 text-sm font-medium">
              Ticket booked successfully! Redirecting...
            </div>
          ) : (
            <Button
              size="lg"
              onClick={handleStartBooking}
              disabled={soldOut || paymentLoading}
              loading={paymentLoading}
              className="w-full"
            >
              {soldOut ? 'Sold Out' : isAuthenticated ? 'Book Ticket' : 'Login to Book'}
            </Button>
          )}
        </div>
      </div>

      {showModal && clientSecret && (
        <StripeCheckoutModal
          clientSecret={clientSecret}
          amount={show.price}
          onSuccess={handlePaymentSuccess}
          onCancel={handleCancelPayment}
        />
      )}
    </div>
  )
}
