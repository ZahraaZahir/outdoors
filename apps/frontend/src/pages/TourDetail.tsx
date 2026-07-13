import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Tour } from "../lib/types";

function TourDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-72 bg-primary-800" />
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-4">
            <div className="h-8 w-64 rounded bg-gray-200" />
            <div className="h-5 w-40 rounded bg-gray-200" />
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="h-5 w-44 rounded bg-gray-200" />
          </div>
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 p-6 space-y-4">
              <div className="h-10 w-36 rounded bg-gray-200" />
              <div className="h-10 w-full rounded bg-gray-200" />
              <div className="h-10 w-full rounded bg-gray-200" />
              <div className="h-10 w-24 rounded bg-gray-200" />
              <div className="h-12 w-full rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TourDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ passengerName: "", seatsBooked: 1 });

  useEffect(() => {
    api.getTour(Number(id)).then(setTour).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.createBooking({ tourId: Number(id), ...form });
      setSuccess("Booking created! Confirmation would be sent via SMS in production.");
      setTimeout(() => navigate("/my-bookings"), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <TourDetailSkeleton />;
  if (!tour) return <div className="pt-24 pb-20 text-center text-muted">Tour not found.</div>;

  const diffMs = new Date(tour.date).getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const durationLabel = diffDays <= 1 ? "Tomorrow" : diffDays <= 7 ? `${diffDays} days` : "Upcoming";

  return (
    <div>
      <section className="relative h-72 overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary-300 blur-3xl" />
        </div>
        <div className="relative flex h-full items-end">
          <div className="mx-auto w-full max-w-6xl px-4 pb-8 lg:px-6">
            <div className="flex items-center gap-2 text-sm text-primary-300">
              <Link to="/" className="transition-colors hover:text-white">Home</Link>
              <span>/</span>
              <span className="text-white">{tour.title}</span>
            </div>
            <h1 className="mt-3 font-heading text-4xl font-bold text-white">{tour.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-primary-200">
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {tour.destination}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                {new Date(tour.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {durationLabel}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {tour.imageUrl ? (
              <div className="aspect-[16/9] overflow-hidden rounded-2xl">
                <img src={tour.imageUrl} alt={tour.title} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200/60">
                <div className="flex h-full items-center justify-center">
                  <svg className="h-24 w-24 text-primary-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21" />
                  </svg>
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="font-heading text-xl font-semibold text-dark">About this tour</h2>
              <p className="mt-3 leading-relaxed text-muted">
                {tour.description || `Join us for an unforgettable adventure to ${tour.destination}. This tour offers breathtaking views, authentic experiences, and lasting memories. Limited seats available — book now to secure your spot.`}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-primary-100 p-4 text-center">
                <svg className="mx-auto h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <p className="mt-2 text-sm font-medium text-dark">Destination</p>
                <p className="mt-0.5 text-xs text-muted">{tour.destination.split(",")[0]}</p>
              </div>
              <div className="rounded-xl border border-primary-100 p-4 text-center">
                <svg className="mx-auto h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <p className="mt-2 text-sm font-medium text-dark">Duration</p>
                <p className="mt-0.5 text-xs text-muted">{durationLabel}</p>
              </div>
              <div className="rounded-xl border border-primary-100 p-4 text-center">
                <svg className="mx-auto h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                <p className="mt-2 text-sm font-medium text-dark">Group Size</p>
                <p className="mt-0.5 text-xs text-muted">Max {tour.maxSeats}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
              <div>
                <span className="font-heading text-3xl font-bold text-primary-700">{tour.priceIQD.toLocaleString()}</span>
                <span className="ml-1 text-sm text-muted">IQD</span>
              </div>
              <p className="mt-1 text-sm text-muted">{tour.availableSeats} of {tour.maxSeats} seats available</p>

              {user ? (
                <form onSubmit={handleSubmit} className="mt-6">
                  {error && (
                    <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
                  )}
                  {success && (
                    <div className="mb-4 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-700">{success}</div>
                  )}
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-dark">Passenger name</label>
                      <input
                        placeholder="Full name"
                        required
                        value={form.passengerName}
                        onChange={(e) => setForm((p) => ({ ...p, passengerName: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-dark">Number of seats</label>
                      <select
                        value={form.seatsBooked}
                        onChange={(e) => setForm((p) => ({ ...p, seatsBooked: Number(e.target.value) }))}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? "seat" : "seats"}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="mt-2 w-full rounded-full bg-primary-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700">
                      Book Now
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-6 rounded-xl bg-primary-50 p-4 text-center">
                  <p className="text-sm text-muted">
                    <Link to="/login" className="font-medium text-primary-600 transition-colors hover:text-primary-700">Login</Link> to book this tour.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
