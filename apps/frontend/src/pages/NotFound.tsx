import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-heading text-7xl font-bold text-primary-600">404</p>
      <h1 className="mt-4 font-heading text-2xl font-bold text-dark">Page not found</h1>
      <p className="mt-2 text-muted">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
      >
        Back to home
      </Link>
    </div>
  );
}
