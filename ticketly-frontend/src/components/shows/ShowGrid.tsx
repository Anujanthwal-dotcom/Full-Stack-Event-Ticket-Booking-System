import { SearchX } from 'lucide-react'
import type { Show } from '../../types'
import ShowCard from './ShowCard'
import Spinner from '../ui/Spinner'
import EmptyState from '../ui/EmptyState'

interface ShowGridProps {
  shows: Show[]
  loading: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export default function ShowGrid({
  shows,
  loading,
  emptyTitle = 'No shows found',
  emptyDescription = 'There are no shows to display right now.',
}: ShowGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (shows.length === 0) {
    return <EmptyState icon={SearchX} title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {shows.map((show) => (
        <ShowCard key={show.id} show={show} />
      ))}
    </div>
  )
}
