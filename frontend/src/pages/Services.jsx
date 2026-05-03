import { useEffect, useState } from "react";
import { getServices } from "../services/serviceApi";
import ServiceCard from "../components/ServiceCard";
import Navbar from "../components/Navbar";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getServices()
      .then((res) => setServices(res.data))
      .catch(() => setError("Failed to load services"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Page Header */}
      <div className="bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white py-14 px-6 text-center">
        <span className="inline-block bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
          All Services
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Our Services</h1>
        <p className="text-slate-400 max-w-md mx-auto text-base">
          Choose from our wide range of professional home services
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <div className="text-5xl mb-4">🛠</div>
            <p className="text-lg font-medium">No services available yet.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {services.map((s) => (
            <ServiceCard key={s._id} service={s} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
