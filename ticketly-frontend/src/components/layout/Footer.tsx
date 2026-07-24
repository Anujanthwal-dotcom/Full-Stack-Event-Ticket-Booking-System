import { Ticket } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-indigo-600" />
          <span>Ticketly</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Ticketly. All rights reserved.</p>
      </div>
    </footer>
  )
}
