import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import CheckoutModal from "../components/CheckoutModal";
import { getServices } from "../services/serviceApi";
import { getUserBookings } from "../services/bookingApi";
import { useAuth } from "../context/AuthContext";

const statusStyles = {
  confirmed: "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
  pending:    "bg-yellow-100 text-yellow-700",
};

const paymentStyles = {
  paid:     "bg-green-100 text-green-700",
  unpaid:   "bg-slate-100 text-slate-500",
  refunded: "bg-orange-100 text-orange-600",
};

const Booking = () => {
  const [services, setServices]       = useState([]);
  const [myBookings, setMyBookings]   = useState([]);
  const [form, setForm]               = useState({ service: "", date: "", address: "" });
  const [showCheckout, setShowCheckout] = useState(false);
  const [success, setSuccess]         = useState("");
  const { user }                      = useAuth();
  const navigate                      = useNavigate();
  const [searchParams]                = useSearchParams();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const preSelected = searchParams.get("service");
    if (preSelected) setForm((f) => ({ ...f, service: preSelected }));
    getServices().then((res) => setServices(res.data));
    getUserBookings().then((res) => setMyBookings(res.data));
  }, [user, navigate, searchParams]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Form submit → open checkout modal
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess("");
    setShowCheckout(true);
  };

  // Called after successful Stripe payment + booking created
  const handlePaymentSuccess = async (newBooking) => {
    setShowCheckout(false);
    setSuccess(`🎉 Booking confirmed & payment received for ${newBooking.service?.name}!`);
    setForm({ service: "", date: "", address: "" });
    const res = await getUserBookings();
    setMyBookings(res.data);
  };

  const selectedService = services.find((s) => s._id === form.service);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white py-14 px-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Book a Service</h1>
        <p className="text-slate-400">Fill in the details and pay securely via Stripe</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* ── Booking Form ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7">
          <h2 className="text-lg font-bold text-slate-900 mb-6">New Booking</h2>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-5 font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Select Service
              </label>
              <select
                name="service"
                value={form.service}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-violet-500 focus:bg-white transition-colors"
              >
                <option value="">-- Choose a service --</option>
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} — ₹{s.price}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Preferred Date
              </label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-violet-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Service Address
              </label>
              <textarea
                name="address"
                placeholder="Enter your full address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-violet-500 focus:bg-white transition-colors resize-none"
              />
            </div>

            {/* Price preview */}
            {selectedService && (
              <div className="flex items-center justify-between bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
                <span className="text-sm text-slate-600 font-medium">Total Amount</span>
                <span className="text-xl font-extrabold text-violet-600">₹{selectedService.price}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              🔒 Proceed to Payment
            </button>
          </form>
        </div>

        {/* ── My Bookings ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7">
          <h2 className="text-lg font-bold text-slate-900 mb-6">My Bookings</h2>

          {myBookings.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm">No bookings yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map((b) => (
                <div
                  key={b._id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-bold text-slate-900">
                      {b.service?.name || "Service"}
                    </p>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusStyles[b.status] || statusStyles.pending}`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-500">📅 {b.date}</p>
                      <p className="text-xs text-slate-500">📍 {b.address}</p>
                    </div>
                    <div className="text-right space-y-1">
                      {b.amountPaid > 0 && (
                        <p className="text-sm font-extrabold text-violet-600">₹{b.amountPaid}</p>
                      )}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${paymentStyles[b.paymentStatus] || paymentStyles.unpaid}`}>
                        {b.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Stripe Checkout Modal ── */}
      {showCheckout && (
        <CheckoutModal
          bookingData={form}
          selectedService={selectedService}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
};

export default Booking;
