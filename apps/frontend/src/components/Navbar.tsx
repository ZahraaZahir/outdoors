import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold">Outdoors</Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm hover:underline">Tours</Link>
          {user ? (
            <>
              <Link to="/my-bookings" className="text-sm hover:underline">My Bookings</Link>
              {user.role === "ADMIN" && (
                <>
                  <Link to="/admin" className="text-sm hover:underline">Admin</Link>
                  <Link to="/admin/tours/new" className="text-sm hover:underline">New Tour</Link>
                </>
              )}
              <span className="text-xs text-gray-500">{user.email}</span>
              <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm hover:underline">Login</Link>
              <Link to="/register" className="rounded bg-black px-3 py-1 text-sm text-white hover:bg-gray-800">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
