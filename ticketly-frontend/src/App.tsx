import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/useAuthStore'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/layout/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ShowDetailPage from './pages/ShowDetailPage'
import PastShowsPage from './pages/PastShowsPage'
import SearchPage from './pages/SearchPage'
import MyTicketsPage from './pages/MyTicketsPage'
import TicketDetailPage from './pages/TicketDetailPage'
import CreateShowPage from './pages/CreateShowPage'
import Spinner from './components/ui/Spinner'

export default function App() {
  const { checkAuth, loading } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/shows/:id" element={<ShowDetailPage />} />
          <Route path="/shows/past" element={<PastShowsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <MyTicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute>
                <TicketDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shows/new"
            element={
              <ProtectedRoute>
                <CreateShowPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
