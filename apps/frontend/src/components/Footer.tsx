import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-primary-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <Link to="/" className="font-heading text-lg font-bold text-primary-700">
              Outdoors
            </Link>
            <p className="mt-1 text-sm text-muted">Discover the beauty of Kurdistan</p>
          </div>
          <div className="flex gap-6">
            <Link to="/" className="text-sm text-muted transition-colors hover:text-primary-600">Tours</Link>
            <Link to="/my-bookings" className="text-sm text-muted transition-colors hover:text-primary-600">My Bookings</Link>
          </div>
        </div>
        <div className="mt-8 border-t border-primary-100 pt-6 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} Outdoors. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
