import { Link, useNavigate } from 'react-router-dom'
import { Ticket, Search, PlusCircle, LogOut, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import Button from '../ui/Button'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl shrink-0">
          <Ticket className="h-6 w-6" />
          <span>Ticketly</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shows..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-gray-50
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
          />
        </form>

        <div className="flex items-center gap-3">
          <Link
            to="/shows/past"
            className="text-sm text-gray-600 hover:text-gray-900 hidden md:block transition-colors"
          >
            Past Shows
          </Link>

          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <Link
                    to="/tickets"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Ticket className="h-4 w-4" />
                    My Tickets
                  </Link>
                  <Link
                    to="/shows/new"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create Show
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button size="sm" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
