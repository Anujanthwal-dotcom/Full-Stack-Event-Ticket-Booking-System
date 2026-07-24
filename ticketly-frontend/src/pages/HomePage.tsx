import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useShowStore } from '../stores/useShowStore'
import ShowGrid from '../components/shows/ShowGrid'
import SearchBar from '../components/shows/SearchBar'

export default function HomePage() {
  const { upcomingShows, loading, fetchUpcoming } = useShowStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchUpcoming()
  }, [fetchUpcoming])

  function handleSearch(q: string) {
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div>
      <section className="py-16 md:py-24 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Find your next experience
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Discover & book<br />amazing shows
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-lg mx-auto">
            From concerts to theater — find tickets for the best live events in your city.
          </p>
          <div className="max-w-md mx-auto">
            <SearchBar onSearch={handleSearch} large />
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Shows</h2>
          <ShowGrid
            shows={upcomingShows}
            loading={loading}
            emptyTitle="No upcoming shows"
            emptyDescription="Check back later for new shows."
          />
        </div>
      </section>
    </div>
  )
}
