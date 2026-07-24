import { Link } from 'react-router-dom'
import { Calendar, MapPin, Ticket as TicketIcon } from 'lucide-react'
import type { Ticket } from '../../types'
import Badge from '../ui/Badge'

interface TicketCardProps {
  ticket: Ticket
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })
}

export default function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{ticket.showTitle}</h3>
            <p className="text-sm text-gray-500 mt-0.5">Seat #{ticket.seatNumber}</p>
          </div>
          <Badge variant={ticket.status === 'BOOKED' ? 'success' : 'error'}>
            {ticket.status}
          </Badge>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
            <span>{formatDate(ticket.showDateTime)} at {formatTime(ticket.showDateTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
            <span>{ticket.showVenue}</span>
          </div>
          <div className="flex items-center gap-2">
            <TicketIcon className="h-4 w-4 text-gray-400 shrink-0" />
            <span>Booked on {formatDate(ticket.bookedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
