import { Search } from 'lucide-react'
import { useState } from 'react'

interface SearchBarProps {
  onSearch: (q: string) => void
  placeholder?: string
  large?: boolean
}

export default function SearchBar({ onSearch, placeholder = 'Search shows...', large = false }: SearchBarProps) {
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${large ? 'w-full max-w-2xl' : 'w-full'}`}>
      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${large ? 'h-5 w-5' : 'h-4 w-4'}`} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={`w-full border border-gray-200 rounded-full bg-gray-50
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors
          ${large ? 'pl-12 pr-6 py-3.5 text-base' : 'pl-10 pr-4 py-2 text-sm'}`}
      />
    </form>
  )
}
