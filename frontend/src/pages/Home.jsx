import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ServiceCard from "../components/ServiceCard";
import { getServices } from "../services/serviceApi";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const [services, setServices] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    getServices()
      .then((res) => setServices(res.data.slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white py-24 px-6 text-center overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
            ⭐ Trusted by 10,000+ customers
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-5">
            Home Services,{" "}
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              Booked in Minutes
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Professional cleaning, plumbing, electrical repairs and more —
            verified experts at your doorstep, on your schedule.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-14">
            <Link
              to="/services"
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors"
            >
              Explore Services
            </Link>
            {!user && (
              <Link
                to="/register"
                className="border border-white/20 hover:border-white/40 text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors"
              >
                Create Free Account
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-10 border-t border-white/10 pt-10">
            {[
              { value: "10K+", label: "Happy Customers" },
              { value: "500+", label: "Expert Professionals" },
              { value: "50+", label: "Services Available" },
              { value: "4.9★", label: "Average Rating" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-white tracking-tight">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Services ── */}
      {services.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <span className="inline-block bg-violet-100 text-violet-600 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-3">
              Top Picks
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Popular Services</h2>
            <p className="text-slate-500 max-w-md mx-auto">Most booked services by our customers this week</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mb-10">
            {services.map((s) => (
              <ServiceCard key={s._id} service={s} />
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/services"
              className="border-2 border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white font-bold px-8 py-3 rounded-xl transition-colors"
            >
              View All Services →
            </Link>
          </div>
        </section>
      )}

      {/* ── How It Works ── */}
      <section className="bg-gradient-to-b from-slate-50 to-violet-50 py-20 px-6">
        <div className="text-center mb-12">
          <span className="inline-block bg-violet-100 text-violet-600 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-3">
            Simple Process
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">How It Works</h2>
          <p className="text-slate-500 max-w-md mx-auto">Book a professional service in just 3 easy steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
          {[
            { step: "1", title: "Choose a Service", desc: "Browse our wide range of home services and pick what you need." },
            { step: "2", title: "Book a Slot", desc: "Select your preferred date and enter your address. Done in seconds." },
            { step: "3", title: "Expert Arrives", desc: "A verified professional shows up on time and gets the job done." },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-extrabold mx-auto mb-4 shadow-lg shadow-violet-300">
                {item.step}
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="inline-block bg-violet-100 text-violet-600 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-3">
            Why Us
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Why Customers Love Us</h2>
          <p className="text-slate-500 max-w-md mx-auto">We make home services stress-free, reliable, and affordable</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "🛡️", bg: "bg-violet-100", title: "Verified Professionals", desc: "Every expert is background-checked, trained, and rated by real customers." },
            { icon: "⚡", bg: "bg-green-100", title: "Quick Booking", desc: "Book any service in under 2 minutes, 24/7 from your phone or laptop." },
            { icon: "💰", bg: "bg-yellow-100", title: "Transparent Pricing", desc: "No hidden charges. See the full price before you confirm your booking." },
            { icon: "🔄", bg: "bg-red-100", title: "Easy Rescheduling", desc: "Plans changed? Reschedule or cancel your booking anytime, hassle-free." },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-7 text-center border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4`}>
                {f.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      {!user && (
        <section className="bg-gradient-to-r from-violet-600 to-purple-600 py-20 px-6 text-center text-white">
          <h2 className="text-4xl font-extrabold mb-3 tracking-tight">Ready to Get Started?</h2>
          <p className="text-white/75 text-lg mb-8 max-w-md mx-auto">
            Join thousands of happy customers who trust us for their home service needs.
          </p>
          <Link
            to="/register"
            className="bg-white text-violet-600 hover:bg-slate-100 font-bold px-10 py-3.5 rounded-xl text-base transition-colors"
          >
            Sign Up for Free
          </Link>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="bg-[#0f0c29] border-t border-white/5 text-slate-500 text-sm">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <p className="text-white font-extrabold text-lg mb-2">🏠 ServiceApp</p>
            <p className="text-slate-500 text-sm leading-relaxed">
              Professional home services at your doorstep. Trusted by thousands of customers across India.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Quick Links</p>
            <ul className="space-y-2">
              {[
                { label: "Home", to: "/" },
                { label: "Services", to: "/services" },
                { label: "Book a Service", to: "/booking" },
                { label: "Login", to: "/login" },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-slate-500 hover:text-violet-400 transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Contact</p>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>📧 support@serviceapp.in</li>
              <li>📞 +91 98765 43210</li>
              <li>📍 New Delhi, India</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 px-6 py-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-600">
            <p>© 2026 <span className="text-violet-400 font-semibold">ServiceApp</span>. All rights reserved.</p>
            <p>Built with ❤️ in India</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
