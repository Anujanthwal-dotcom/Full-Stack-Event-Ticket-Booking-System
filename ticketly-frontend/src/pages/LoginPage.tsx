import { Chrome, Facebook } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Ticketly</h1>
        <p className="text-sm text-gray-500 mb-8">Sign in to book tickets and manage your shows.</p>

        <div className="space-y-3">
          <a
            href={`${API_URL}/oauth2/authorization/google`}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 border border-gray-200 rounded-full
              text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Chrome className="h-5 w-5" />
            Continue with Google
          </a>

          <a
            href={`${API_URL}/oauth2/authorization/facebook`}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 border border-gray-200 rounded-full
              text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Facebook className="h-5 w-5 text-blue-600" />
            Continue with Facebook
          </a>
        </div>
      </div>
    </div>
  )
}
