import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-[#0f0c29]/95 backdrop-blur-md border-b border-white/5">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-xl tracking-tight">
        🏠 ServiceApp
      </Link>

      {/* Links */}
      <div className="flex items-center gap-6">
        <Link to="/" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
          Home
        </Link>
        <Link to="/services" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
          Services
        </Link>

        {user ? (
          <>
            <Link to="/booking" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
              My Bookings
            </Link>

            {user.role === "admin" && (
              <Link
                to="/admin"
                className="text-violet-400 text-sm font-semibold px-3 py-1 rounded-md bg-violet-400/10 border border-violet-400/20 hover:bg-violet-400/20 transition-colors"
              >
                Admin
              </Link>
            )}

            {/* Settings Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                {/* Avatar circle */}
                <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {/* Gear icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-90" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-slate-500 text-xs capitalize">{user.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      to="/booking"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-white/5 hover:text-white text-sm transition-colors"
                    >
                      <span>📋</span> My Bookings
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-white/5 hover:text-white text-sm transition-colors"
                      >
                        <span>⚙️</span> Admin Panel
                      </Link>
                    )}

                    <div className="border-t border-white/10 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 text-sm transition-colors cursor-pointer"
                      >
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
