import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Tour } from "../lib/types";

function TourDetailSkeleton() {
  return (
    <div className="pt-24 pb-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-6 animate-pulse">
        <div className="mb-4 h-4 w-32 rounded bg-gray-200" />
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="aspect-[16/9] rounded-2xl bg-gray-200" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 w-64 rounded bg-gray-200" />
            <div className="h-5 w-40 rounded bg-gray-200" />
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="mt-6 h-10 w-36 rounded bg-gray-200" />
            <div className="h-5 w-44 rounded bg-gray-200" />
            <div className="mt-8 rounded-2xl border border-gray-200 p-6 space-y-4">
              <div className="h-5 w-32 rounded bg-gray-200" />
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
  const [form, setForm] = useState({ passengerName: "", phoneNumber: "", seatsBooked: 1 });

  useEffect(() => {
    api.getTour(Number(id)).then(setTour).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.createBooking({ tourId: Number(id), ...form });
      setSuccess("Booking created! Check your SMS for confirmation.");
      setTimeout(() => navigate("/my-bookings"), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <TourDetailSkeleton />;
  if (!tour) return <div className="pt-24 pb-20 text-center text-muted">Tour not found.</div>;

  return (
    <div className="pt-24 pb-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted">
          <Link to="/" className="transition-colors hover:text-primary-600">Home</Link>
          <span>/</span>
          <span className="text-dark">{tour.title}</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200/60">
              <div className="flex h-full items-center justify-center">
                <svg className="h-24 w-24 text-primary-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21" />
                </svg>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h1 className="font-heading text-3xl font-bold text-dark">{tour.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {tour.destination}
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                {new Date(tour.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>

            <div className="mt-6 border-t border-primary-100 pt-6">
              <p className="font-heading text-3xl font-bold text-primary-700">{tour.priceIQD.toLocaleString()} IQD</p>
              <p className="mt-1 text-sm text-muted">{tour.availableSeats} of {tour.maxSeats} seats available</p>
            </div>

            {user ? (
              <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-primary-100 bg-white p-6">
                <h2 className="font-heading text-lg font-semibold text-dark">Book this tour</h2>
                {error && (
                  <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
                )}
                {success && (
                  <div className="mt-3 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-700">{success}</div>
                )}
                <div className="mt-4 flex flex-col gap-4">
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
                    <label className="mb-1.5 block text-sm font-medium text-dark">Phone number</label>
                    <input
                      placeholder="07701234567"
                      required
                      value={form.phoneNumber}
                      onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
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
                  <button type="submit" className="mt-2 w-full rounded-full bg-primary-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700">
                    Book Now
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-8 rounded-2xl border border-primary-100 bg-primary-50 p-6 text-center">
                <p className="text-muted">
                  <Link to="/login" className="font-medium text-primary-600 transition-colors hover:text-primary-700">Login</Link> to book this tour.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
