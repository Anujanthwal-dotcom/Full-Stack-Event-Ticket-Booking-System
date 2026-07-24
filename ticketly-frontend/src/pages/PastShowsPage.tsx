import { useEffect } from 'react'
import { useShowStore } from '../stores/useShowStore'
import ShowGrid from '../components/shows/ShowGrid'

export default function PastShowsPage() {
  const { pastShows, loading, fetchPast } = useShowStore()

  useEffect(() => {
    fetchPast()
  }, [fetchPast])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Past Shows</h1>
      <ShowGrid
        shows={pastShows}
        loading={loading}
        emptyTitle="No past shows"
        emptyDescription="There are no past shows to display."
      />
    </div>
  )
}
