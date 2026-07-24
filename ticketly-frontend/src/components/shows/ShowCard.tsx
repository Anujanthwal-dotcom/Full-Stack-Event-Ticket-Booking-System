import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users } from 'lucide-react'
import type { Show } from '../../types'
import Badge from '../ui/Badge'

interface ShowCardProps {
  show: Show
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function ShowCard({ show }: ShowCardProps) {
  const soldOut = show.availableSeats === 0
  const lowSeats = show.availableSeats > 0 && show.availableSeats <= 10

  return (
    <Link
      to={`/shows/${show.id}`}
      className="block bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{show.title}</h3>
          <span className="text-lg font-bold text-indigo-600 whitespace-nowrap">${show.price}</span>
        </div>

        {show.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{show.description}</p>
        )}

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
            <span>
              {formatDate(show.showDateTime)} at {formatTime(show.showDateTime)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
            <span>{show.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400 shrink-0" />
            {soldOut ? (
              <Badge variant="error">Sold Out</Badge>
            ) : lowSeats ? (
              <Badge variant="warning">{show.availableSeats} left</Badge>
            ) : (
              <span>{show.availableSeats} / {show.totalSeats} seats</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
