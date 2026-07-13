import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Booking } from "../lib/types";
import ConfirmModal from "../components/ConfirmModal";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  CANCELLED: { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
  FAILED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

function BookingSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white animate-pulse">
      <div className="flex flex-col sm:flex-row">
        <div className="h-40 w-full bg-primary-100/50 sm:h-auto sm:w-48" />
        <div className="flex-1 p-5">
          <div className="mb-3 h-5 w-40 rounded bg-gray-200" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-48 rounded bg-gray-200" />
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="h-4 w-28 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

type Filter = "all" | "active" | "cancelled";

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("active");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    api.getBookings().then(setBookings).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: number) => {
    setConfirmId(null);
    setCancellingId(id);
    try {
      await api.cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" as const } : b))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Cancel failed";
      alert(message);
    } finally {
      setCancellingId(null);
    }
  };

  const canCancel = (b: Booking) =>
    (b.status === "PENDING" || b.status === "CONFIRMED") &&
    new Date(b.tour?.date ?? b.createdAt) > new Date();

  const activeCount = bookings.filter(
    (b) => b.status === "PENDING" || b.status === "CONFIRMED"
  ).length;
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED" || b.status === "FAILED").length;

  const filtered = filter === "active"
    ? bookings.filter((b) => b.status === "PENDING" || b.status === "CONFIRMED")
    : filter === "cancelled"
      ? bookings.filter((b) => b.status === "CANCELLED" || b.status === "FAILED")
      : bookings;

  return (
    <div className="pt-24 pb-20">
      <div className="mx-auto max-w-4xl px-4 lg:px-6">
        <h1 className="font-heading text-3xl font-bold text-dark">My Bookings</h1>
        <p className="mt-2 text-muted">Track your tour reservations</p>

        {!loading && bookings.length > 0 && (
          <div className="mt-6 flex gap-2">
            {(["active", "all", "cancelled"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-primary-500 text-white"
                    : "bg-primary-50 text-primary-700 hover:bg-primary-100"
                }`}
              >
                {f === "active" && `Active (${activeCount})`}
                {f === "all" && `All (${bookings.length})`}
                {f === "cancelled" && `Cancelled (${cancelledCount})`}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="mt-10 flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <BookingSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-primary-50 p-4">
              <svg className="h-10 w-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-dark">
              {filter === "active" ? "No active bookings" : filter === "cancelled" ? "No cancelled bookings" : "No bookings yet"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {filter === "active" ? "All your current bookings will appear here." : filter === "cancelled" ? "Your cancelled bookings will appear here." : "Browse tours and make your first reservation."}
            </p>
            {filter === "all" && (
              <Link to="/" className="mt-4 rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700">
                Browse Tours
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {filtered.map((b) => {
              const style = STATUS_STYLES[b.status] ?? STATUS_STYLES.PENDING;
              const total = (b.tour?.priceIQD ?? 0) * b.seatsBooked;
              const tourDate = b.tour?.date ? new Date(b.tour.date) : null;
              const isPast = tourDate ? tourDate <= new Date() : false;

              return (
                <div key={b.id} className={`overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-md ${isPast ? "border-gray-200 opacity-75" : "border-primary-100"}`}>
                  <div className="flex flex-col sm:flex-row">
                    {/* Tour image */}
                    <Link to={`/tours/${b.tourId}`} className="relative h-40 shrink-0 overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 sm:h-auto sm:w-48">
                      {b.tour?.imageUrl ? (
                        <img src={b.tour.imageUrl} alt={b.tour.title} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <svg className="h-12 w-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                          </svg>
                        </div>
                      )}
                      {isPast && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-dark">Completed</span>
                        </div>
                      )}
                    </Link>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link to={`/tours/${b.tourId}`} className="font-heading text-lg font-semibold text-dark transition-colors hover:text-primary-600">
                            {b.tour?.title ?? `Tour #${b.tourId}`}
                          </Link>
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                            <svg className="h-4 w-4 shrink-0 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            <span className="truncate">{b.tour?.destination}</span>
                          </div>
                        </div>
                        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {b.status}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
                        <span className="flex items-center gap-1.5">
                          <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          {tourDate ? tourDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "TBD"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          {b.passengerName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                          </svg>
                          {b.seatsBooked} {b.seatsBooked === 1 ? "seat" : "seats"}
                        </span>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-primary-50 pt-3">
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-lg font-bold text-primary-700">
                            {total.toLocaleString()}
                          </span>
                          <span className="text-sm text-muted">IQD</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="flex items-center gap-1 text-xs text-muted">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Booked {new Date(b.createdAt).toLocaleDateString()}
                          </p>
                          {canCancel(b) && (
                            <button
                              onClick={() => setConfirmId(b.id)}
                              disabled={cancellingId === b.id}
                              className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                            >
                              {cancellingId === b.id ? "Cancelling..." : "Cancel"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmId !== null}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? Your seats will be released and this action cannot be undone."
        confirmLabel="Yes, Cancel"
        cancelLabel="Keep Booking"
        onConfirm={() => confirmId && handleCancel(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
