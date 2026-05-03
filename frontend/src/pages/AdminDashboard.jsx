import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getAllBookings, updateBookingStatus } from "../services/bookingApi";
import { getServices, createService, updateService, deleteService } from "../services/serviceApi";
import { useAuth } from "../context/AuthContext";

const EMPTY = { name: "", description: "", price: "", image: "" };

const statusStyles = {
  confirmed: "text-green-600",
  cancelled: "text-red-500",
  pending: "text-yellow-600",
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") { navigate("/"); return; }
    fetchAll();
  }, [user, navigate]);

  const fetchAll = async () => {
    const [bRes, sRes] = await Promise.all([getAllBookings(), getServices()]);
    setBookings(bRes.data);
    setServices(sRes.data);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(""); setFormSuccess(""); setLoading(true);
    try {
      if (editingId) {
        await updateService(editingId, form);
        setFormSuccess("Service updated.");
      } else {
        await createService(form);
        setFormSuccess("Service created.");
      }
      setForm(EMPTY); setEditingId(null);
      const res = await getServices();
      setServices(res.data);
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s) => {
    setEditingId(s._id);
    setForm({ name: s.name, description: s.description, price: s.price, image: s.image || "" });
    setFormError(""); setFormSuccess("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    await deleteService(id);
    setServices(services.filter((s) => s._id !== id));
  };

  const handleStatusChange = async (id, status) => {
    await updateBookingStatus(id, status);
    setBookings(bookings.map((b) => (b._id === id ? { ...b, status } : b)));
  };

  const inputCls = "w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-violet-500 focus:bg-white transition-colors";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white py-14 px-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">Manage your services and customer bookings</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit mb-8 shadow-sm">
          <button
            onClick={() => setTab("bookings")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "bookings" ? "bg-violet-600 text-white shadow" : "text-slate-500 hover:text-slate-800"}`}
          >
            📋 Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setTab("services")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "services" ? "bg-violet-600 text-white shadow" : "text-slate-500 hover:text-slate-800"}`}
          >
            🛠 Services ({services.length})
          </button>
        </div>

        {/* ── Bookings Tab ── */}
        {tab === "bookings" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">All Bookings</h2>
            </div>
            {bookings.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <div className="text-4xl mb-3">📋</div>
                <p>No bookings yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                    <tr>
                      {["Customer", "Service", "Date", "Address", "Payment", "Status", "Action"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-slate-800">{b.user?.name || "—"}</td>
                        <td className="px-5 py-3.5 text-slate-600">{b.service?.name || "—"}</td>
                        <td className="px-5 py-3.5 text-slate-600">{b.date}</td>
                        <td className="px-5 py-3.5 text-slate-600 max-w-[160px] truncate">{b.address}</td>
                        <td className="px-5 py-3.5">
                          <div className="space-y-0.5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize block w-fit ${
                              b.paymentStatus === "paid" ? "bg-green-100 text-green-700" :
                              b.paymentStatus === "refunded" ? "bg-orange-100 text-orange-600" :
                              "bg-slate-100 text-slate-500"
                            }`}>
                              {b.paymentStatus || "unpaid"}
                            </span>
                            {b.amountPaid > 0 && (
                              <p className="text-xs font-bold text-violet-600">₹{b.amountPaid}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`font-bold capitalize ${statusStyles[b.status] || ""}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <select
                            value={b.status}
                            onChange={(e) => handleStatusChange(b._id, e.target.value)}
                            className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-violet-500 cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Services Tab ── */}
        {tab === "services" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-bold text-slate-900 mb-5">
                {editingId ? "✏️ Edit Service" : "➕ Add New Service"}
              </h2>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-lg mb-4">{formError}</div>
              )}
              {formSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2.5 rounded-lg mb-4">✅ {formSuccess}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Service Name</label>
                  <input name="name" placeholder="e.g. Home Cleaning" value={form.name} onChange={handleChange} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
                  <textarea name="description" placeholder="Brief description..." value={form.description} onChange={handleChange} rows={3} required className={`${inputCls} resize-none`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Price (₹)</label>
                  <input name="price" type="number" placeholder="e.g. 499" value={form.price} onChange={handleChange} min="0" required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Image URL (optional)</label>
                  <input name="image" placeholder="https://..." value={form.image} onChange={handleChange} className={inputCls} />
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={loading} className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
                    {loading ? "Saving..." : editingId ? "Update" : "Add Service"}
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY); setFormError(""); setFormSuccess(""); }}
                      className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold py-2.5 rounded-xl transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Services List */}
            <div className="lg:col-span-3 space-y-3">
              <h2 className="font-bold text-slate-900 mb-4">Existing Services ({services.length})</h2>
              {services.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
                  <div className="text-4xl mb-3">🛠</div>
                  <p className="text-sm">No services yet. Add one!</p>
                </div>
              ) : (
                services.map((s) => (
                  <div key={s._id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-start justify-between gap-4 hover:border-violet-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{s.description}</p>
                      <span className="text-violet-600 font-extrabold text-sm mt-1 block">₹{s.price}</span>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button onClick={() => handleEdit(s)} className="border border-slate-200 text-slate-600 hover:border-violet-400 hover:text-violet-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(s._id)} className="bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
