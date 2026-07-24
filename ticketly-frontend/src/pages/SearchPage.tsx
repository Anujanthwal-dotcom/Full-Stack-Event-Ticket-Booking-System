import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Sparkles, Search } from 'lucide-react'
import { useShowStore } from '../stores/useShowStore'
import ShowGrid from '../components/shows/ShowGrid'

type SearchMode = 'keyword' | 'ai'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const { searchResults, loading, searchShows, aiSearch } = useShowStore()
  const [mode, setMode] = useState<SearchMode>('keyword')
  const [input, setInput] = useState(q)

  useEffect(() => {
    if (q) {
      setInput(q)
      if (mode === 'keyword') searchShows(q)
      else aiSearch(q)
    }
  }, [q, mode, searchShows, aiSearch])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim()) {
      setSearchParams({ q: input.trim() })
    }
  }

  function handleModeChange(newMode: SearchMode) {
    setMode(newMode)
    if (q) {
      if (newMode === 'keyword') searchShows(q)
      else aiSearch(q)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Shows</h1>

      <form onSubmit={handleSearch} className="max-w-xl mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by title, venue, or description..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full bg-gray-50
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => handleModeChange('keyword')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${mode === 'keyword'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Search className="h-4 w-4 inline mr-1.5" />
          Keyword Search
        </button>
        <button
          onClick={() => handleModeChange('ai')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${mode === 'ai'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Sparkles className="h-4 w-4 inline mr-1.5" />
          AI Search
        </button>
      </div>

      {mode === 'ai' && q && (
        <p className="text-sm text-gray-500 mb-6">
          Using AI to understand your query &mdash; try natural language like &ldquo;cheap shows this weekend&rdquo;
        </p>
      )}

      <ShowGrid
        shows={searchResults}
        loading={loading}
        emptyTitle={q ? `No results for "${q}"` : 'Enter a search term'}
        emptyDescription={q ? 'Try adjusting your search or switching modes.' : 'Type something in the search bar above.'}
      />
    </div>
  )
}
