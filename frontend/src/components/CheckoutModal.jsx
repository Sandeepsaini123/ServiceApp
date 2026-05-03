import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { createPaymentIntent, confirmBooking } from "../services/paymentApi";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Debug — remove after testing
if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
  console.error("❌ VITE_STRIPE_PUBLISHABLE_KEY is missing in frontend/.env — restart Vite!");
}

const elementStyle = {
  style: {
    base: {
      fontSize: "15px",
      color: "#1e293b",
      fontFamily: "system-ui, sans-serif",
      fontWeight: "500",
      "::placeholder": { color: "#cbd5e1" },
    },
    invalid: { color: "#ef4444" },
  },
};

// ── Payment Steps indicator ─────────────────────────────────
const Steps = ({ current }) => {
  const steps = ["Details", "Payment", "Confirmed"];
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${i < current ? "bg-green-500 text-white" :
                i === current ? "bg-violet-600 text-white" :
                "bg-slate-100 text-slate-400"}`}>
              {i < current ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-semibold hidden sm:block
              ${i === current ? "text-violet-600" : i < current ? "text-green-600" : "text-slate-400"}`}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 ${i < current ? "bg-green-400" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

// ── Success Screen ──────────────────────────────────────────
const SuccessScreen = ({ service, amount, onClose }) => (
  <div className="text-center py-4">
    <Steps current={2} />
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h3 className="text-xl font-extrabold text-slate-900 mb-1">Payment Successful!</h3>
    <p className="text-slate-500 text-sm mb-4">Your booking has been confirmed</p>

    <div className="bg-slate-50 rounded-xl p-4 text-left mb-6 border border-slate-100">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-slate-500 font-medium">Service</span>
        <span className="text-sm font-bold text-slate-800">{service}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500 font-medium">Amount Paid</span>
        <span className="text-sm font-extrabold text-green-600">₹{amount}</span>
      </div>
    </div>

    <button
      onClick={onClose}
      className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-colors"
    >
      Done
    </button>
  </div>
);

// ── Payment Form ────────────────────────────────────────────
const PaymentForm = ({ bookingData, selectedService, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cardName, setCardName] = useState("");
  const [done, setDone] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError("");
    setLoading(true);

    try {
      const { data } = await createPaymentIntent({
        serviceId: bookingData.service,
        date: bookingData.date,
        address: bookingData.address,
      });

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: {
            card: elements.getElement(CardNumberElement),
            billing_details: { name: cardName },
          },
        });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      const res = await confirmBooking({
        paymentIntentId: paymentIntent.id,
        serviceId: bookingData.service,
        date: bookingData.date,
        address: bookingData.address,
      });

      setDone(true);
      setTimeout(() => onSuccess(res.data), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Try again.");
      setLoading(false);
    }
  };

  if (done) {
    return <SuccessScreen service={selectedService?.name} amount={selectedService?.price} onClose={onClose} />;
  }

  const fieldWrap = "w-full px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 transition-all";

  return (
    <form onSubmit={handlePay}>
      <Steps current={1} />

      {/* Order Summary Card */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-4 mb-5 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-violet-200 text-xs font-medium mb-0.5">Booking Summary</p>
            <p className="font-bold text-base">{selectedService?.name}</p>
            <p className="text-violet-200 text-xs mt-1">📅 {bookingData.date}</p>
            <p className="text-violet-200 text-xs">📍 {bookingData.address?.slice(0, 35)}{bookingData.address?.length > 35 ? "..." : ""}</p>
          </div>
          <div className="text-right">
            <p className="text-violet-200 text-xs">Total</p>
            <p className="text-2xl font-extrabold">₹{selectedService?.price}</p>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div className="space-y-3 mb-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Card Details</p>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cardholder Name</label>
          <input
            type="text"
            placeholder="Name on card"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            required
            className="w-full px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-300"
          />
        </div>

        {/* Card Number */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Card Number</label>
          <div className={`${fieldWrap} flex items-center gap-3`}>
            <svg className="w-5 h-5 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <div className="flex-1">
              <CardNumberElement options={elementStyle} />
            </div>
          </div>
        </div>

        {/* Expiry + CVC */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expiry Date</label>
            <div className={fieldWrap}>
              <CardExpiryElement options={elementStyle} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">CVC</label>
            <div className={`${fieldWrap} flex items-center gap-2`}>
              <div className="flex-1">
                <CardCvcElement options={elementStyle} />
              </div>
              <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Accepted Cards */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-400">Accepted:</span>
        {["VISA", "MC", "AMEX"].map((c) => (
          <span key={c} className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{c}</span>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Pay Button */}
      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-lg shadow-violet-200"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pay ₹{selectedService?.price} Securely
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onClose}
        className="w-full mt-2 text-slate-400 hover:text-slate-600 text-sm py-2 transition-colors"
      >
        Cancel
      </button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          SSL Secured
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Powered by Stripe
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <svg className="w-3.5 h-3.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          256-bit Encrypted
        </div>
      </div>
    </form>
  );
};

// ── Modal Wrapper ───────────────────────────────────────────
const CheckoutModal = ({ bookingData, selectedService, onSuccess, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-900">Secure Checkout</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5">
          <Elements stripe={stripePromise}>
            <PaymentForm
              bookingData={bookingData}
              selectedService={selectedService}
              onSuccess={onSuccess}
              onClose={onClose}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
