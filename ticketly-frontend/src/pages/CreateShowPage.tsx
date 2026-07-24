import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import { useShowStore } from '../stores/useShowStore'
import Button from '../components/ui/Button'

export default function CreateShowPage() {
  const navigate = useNavigate()
  const { createShow } = useShowStore()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    showDateTime: '',
    venue: '',
    totalSeats: '',
    price: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const totalSeats = parseInt(form.totalSeats, 10)
    const price = parseFloat(form.price)

    if (!form.title || !form.showDateTime || !form.venue || !totalSeats || !price) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const show = await createShow({
        title: form.title,
        description: form.description,
        showDateTime: form.showDateTime,
        venue: form.venue,
        totalSeats,
        price,
      })
      navigate(`/shows/${show.id}`)
    } catch {
      setError('Failed to create show. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <PlusCircle className="h-6 w-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Create Show</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Show title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Describe the show..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
          <input
            type="datetime-local"
            name="showDateTime"
            value={form.showDateTime}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
          <input
            type="text"
            name="venue"
            value={form.venue}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Venue name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats *</label>
            <input
              type="number"
              name="totalSeats"
              value={form.totalSeats}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="29.99"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
        )}

        <Button type="submit" loading={submitting} className="w-full">
          <PlusCircle className="h-4 w-4" />
          Create Show
        </Button>
      </form>
    </div>
  )
}
