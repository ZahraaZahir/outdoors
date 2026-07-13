import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getAvatarColor(name: string): string {
  const first = name.charAt(0).toUpperCase();
  if (first <= "C") return "bg-rose-500";
  if (first <= "F") return "bg-amber-500";
  if (first <= "I") return "bg-sky-500";
  if (first <= "L") return "bg-violet-500";
  if (first <= "O") return "bg-pink-500";
  if (first <= "R") return "bg-indigo-500";
  if (first <= "U") return "bg-teal-500";
  return "bg-orange-500";
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setProfileOpen(false);
    setMobileOpen(false);
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const avatarColor = user?.name ? getAvatarColor(user.name) : "bg-dark";
  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";

  useEffect(() => {
    if (!profileOpen) return;
    const handleDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = desktopRef.current?.contains(target);
      const insideMobile = mobileRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) {
        setProfileOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleDown);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [profileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const toggleProfile = () => {
    setProfileOpen((p) => !p);
    setMobileOpen(false);
  };

  const profileDropdown = (
    <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-primary-100 bg-white py-1 shadow-lg">
      <div className="border-b border-primary-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${avatarColor}`}>
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-dark">{user?.name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
              <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              {user?.phoneNumber}
            </p>
          </div>
        </div>
      </div>
      <button
        onMouseDown={(e) => { e.stopPropagation(); handleLogout(); }}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
        Logout
      </button>
    </div>
  );

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-primary-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
        <Link to="/" className="font-heading text-xl font-bold text-primary-700">
          Outdoors
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${isActive("/") ? "text-primary-600" : "text-dark opacity-70 hover:opacity-100"}`}
          >
            Tours
          </Link>
          {user && (
            <Link
              to="/my-bookings"
              className={`text-sm font-medium transition-colors ${isActive("/my-bookings") ? "text-primary-600" : "text-dark opacity-70 hover:opacity-100"}`}
            >
              My Bookings
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <>
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors ${isActive("/admin") ? "text-primary-600" : "text-dark opacity-70 hover:opacity-100"}`}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/tours/new"
                className="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
              >
                New Tour
              </Link>
            </>
          )}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <div ref={desktopRef} className="relative">
              <button
                onClick={toggleProfile}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-primary-50"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white ${avatarColor}`}>
                  {initial}
                </span>
                <span className="text-sm font-medium text-dark">{user.name}</span>
                <svg className={`h-4 w-4 text-muted transition-transform ${profileOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {profileOpen && profileDropdown}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-dark opacity-70 transition-opacity hover:opacity-100">
                Login
              </Link>
              <Link to="/register" className="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-700">
                Register
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          {user && (
            <div ref={mobileRef} className="relative">
              <button
                onClick={toggleProfile}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white ${avatarColor}`}
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                {initial}
              </button>
              {profileOpen && profileDropdown}
            </div>
          )}
          <button
            type="button"
            className="grid gap-y-1.5"
            onClick={() => { setMobileOpen(!mobileOpen); setProfileOpen(false); }}
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-6 bg-dark transition-all duration-300 ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-6 bg-dark transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 bg-dark transition-all duration-300 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-primary-100 bg-white px-4 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link to="/" onClick={() => setMobileOpen(false)} className={`text-sm font-medium transition-colors ${isActive("/") ? "text-primary-600" : "text-dark opacity-70 hover:opacity-100"}`}>
              Tours
            </Link>
            {user && (
              <Link to="/my-bookings" onClick={() => setMobileOpen(false)} className={`text-sm font-medium transition-colors ${isActive("/my-bookings") ? "text-primary-600" : "text-dark opacity-70 hover:opacity-100"}`}>
                My Bookings
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <>
                <Link to="/admin" onClick={() => setMobileOpen(false)} className={`text-sm font-medium transition-colors ${isActive("/admin") ? "text-primary-600" : "text-dark opacity-70 hover:opacity-100"}`}>
                  Dashboard
                </Link>
                <Link to="/admin/tours/new" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-dark opacity-70 transition-opacity hover:opacity-100">
                  New Tour
                </Link>
              </>
            )}
            {!user && (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-dark opacity-70 transition-opacity hover:opacity-100">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="rounded-full bg-primary-600 px-4 py-1.5 text-center text-sm font-medium text-white transition-colors hover:bg-primary-700">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
