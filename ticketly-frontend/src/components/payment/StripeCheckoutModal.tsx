import { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { X } from 'lucide-react'
import Button from '../ui/Button'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

interface StripeCheckoutModalProps {
  clientSecret: string
  amount: number
  onSuccess: () => void
  onCancel: () => void
}

function CheckoutForm({ onSuccess, onCancel, amount }: Omit<StripeCheckoutModalProps, 'clientSecret'>) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? 'Payment failed')
      setSubmitting(false)
      return
    }

    const { error: payError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    })

    if (payError) {
      setError(payError.message ?? 'Payment failed')
      setSubmitting(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={submitting} disabled={!stripe || !elements} className="flex-1">
          Pay ${amount}
        </Button>
      </div>
    </form>
  )
}

export default function StripeCheckoutModal(props: StripeCheckoutModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 relative">
        <button
          onClick={props.onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-1">Complete Payment</h2>
        <p className="text-sm text-gray-500 mb-6">Enter your card details to book the ticket.</p>

        {props.clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret: props.clientSecret }}>
            <CheckoutForm {...props} />
          </Elements>
        )}
      </div>
    </div>
  )
}
