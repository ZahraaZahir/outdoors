import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setOpen(false);
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-primary-100">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
        <Link to="/" className="font-heading text-xl font-bold text-primary-700">
          Outdoors
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm font-medium text-dark opacity-70 transition-opacity hover:opacity-100">
            Tours
          </Link>
          {user ? (
            <>
              <Link to="/my-bookings" className="text-sm font-medium text-dark opacity-70 transition-opacity hover:opacity-100">
                My Bookings
              </Link>
              {user.role === "ADMIN" && (
                <>
                  <Link to="/admin" className="text-sm font-medium text-dark opacity-70 transition-opacity hover:opacity-100">
                    Dashboard
                  </Link>
                  <Link to="/admin/tours/new" className="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-700">
                    New Tour
                  </Link>
                </>
              )}
              <span className="text-xs text-muted">{user.email}</span>
              <button onClick={handleLogout} className="text-sm font-medium text-dark opacity-70 transition-opacity hover:opacity-100">
                Logout
              </button>
            </>
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

        <button
          type="button"
          className="grid gap-y-1.5 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-dark transition-all duration-300 ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-dark transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-dark transition-all duration-300 ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="border-t border-primary-100 bg-white px-4 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link to="/" onClick={() => setOpen(false)} className="text-sm font-medium text-dark opacity-70 transition-opacity hover:opacity-100">
              Tours
            </Link>
            {user ? (
              <>
                <Link to="/my-bookings" onClick={() => setOpen(false)} className="text-sm font-medium text-dark opacity-70 transition-opacity hover:opacity-100">
                  My Bookings
                </Link>
                {user.role === "ADMIN" && (
                  <>
                    <Link to="/admin" onClick={() => setOpen(false)} className="text-sm font-medium text-dark opacity-70 transition-opacity hover:opacity-100">
                      Dashboard
                    </Link>
                    <Link to="/admin/tours/new" onClick={() => setOpen(false)} className="text-sm font-medium text-dark opacity-70 transition-opacity hover:opacity-100">
                      New Tour
                    </Link>
                  </>
                )}
                <span className="text-xs text-muted">{user.email}</span>
                <button onClick={handleLogout} className="text-left text-sm font-medium text-dark opacity-70 transition-opacity hover:opacity-100">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-dark opacity-70 transition-opacity hover:opacity-100">
                  Login
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="rounded-full bg-primary-600 px-4 py-1.5 text-center text-sm font-medium text-white transition-colors hover:bg-primary-700">
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
