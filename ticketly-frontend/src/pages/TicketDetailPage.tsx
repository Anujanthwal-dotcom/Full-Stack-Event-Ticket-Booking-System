import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Download, ArrowLeft, Ticket as TicketIcon } from 'lucide-react'
import { useTicketStore } from '../stores/useTicketStore'
import { downloadTicket } from '../api/tickets'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

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

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentTicket: ticket, loading, fetchTicket } = useTicketStore()
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (id) fetchTicket(Number(id))
  }, [id, fetchTicket])

  async function handleDownload() {
    if (!ticket) return
    setDownloading(true)
    try {
      const blob = await downloadTicket(ticket.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ticket-${ticket.id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silently fail — user can retry
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Ticket not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/tickets')}>
          Back to My Tickets
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        My Tickets
      </button>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TicketIcon className="h-5 w-5 text-indigo-600" />
                <span className="text-sm text-gray-500 font-medium">Ticket #{ticket.id}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{ticket.showTitle}</h1>
            </div>
            <Badge variant={ticket.status === 'BOOKED' ? 'success' : 'error'}>
              {ticket.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Seat Number</p>
              <p className="text-xl font-bold text-gray-900">#{ticket.seatNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Booked On</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(ticket.bookedAt)}</p>
            </div>
          </div>

          <div className="space-y-3 text-gray-600 mb-8">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span>{formatDate(ticket.showDateTime)} at {formatTime(ticket.showDateTime)}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span>{ticket.showVenue}</span>
            </div>
          </div>

          {ticket.status === 'BOOKED' && (
            <Button onClick={handleDownload} loading={downloading} className="w-full">
              <Download className="h-4 w-4" />
              Download PDF Ticket
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
