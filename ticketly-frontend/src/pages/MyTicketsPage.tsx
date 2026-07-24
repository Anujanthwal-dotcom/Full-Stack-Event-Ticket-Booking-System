import { useEffect } from 'react'
import { Ticket as TicketIcon } from 'lucide-react'
import { useTicketStore } from '../stores/useTicketStore'
import TicketCard from '../components/tickets/TicketCard'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'

export default function MyTicketsPage() {
  const { tickets, loading, fetchMyTickets } = useTicketStore()

  useEffect(() => {
    fetchMyTickets()
  }, [fetchMyTickets])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Tickets</h1>

      {tickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No tickets yet"
          description="Book a show to see your tickets here."
        />
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  )
}
