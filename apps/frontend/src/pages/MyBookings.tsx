import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Booking } from "../lib/types";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-yellow-50", text: "text-yellow-700" },
  CONFIRMED: { bg: "bg-primary-50", text: "text-primary-700" },
  CANCELLED: { bg: "bg-gray-50", text: "text-gray-500" },
  FAILED: { bg: "bg-red-50", text: "text-red-700" },
};

function BookingSkeleton() {
  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-4 h-5 w-40 rounded bg-gray-200" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-48 rounded bg-gray-200" />
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="h-4 w-20 rounded bg-gray-200" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-6 w-20 rounded-full bg-gray-200" />
          <div className="h-3 w-16 rounded bg-gray-200" />
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

  useEffect(() => {
    api.getBookings().then(setBookings).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: number) => {
    if (!confirm("Cancel this booking? Your seats will be released.")) return;
    setCancellingId(id);
    try {
      await api.cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" as const } : b))
      );
    } catch (err: any) {
      alert(err.message);
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
            <p className="text-lg font-medium text-dark">
              {filter === "active" ? "No active bookings" : filter === "cancelled" ? "No cancelled bookings" : "No bookings yet"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {filter === "active" ? "All your current bookings will appear here." : filter === "cancelled" ? "Your cancelled bookings will appear here." : "Browse tours and make your first reservation."}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {filtered.map((b) => {
              const style = STATUS_STYLES[b.status] ?? STATUS_STYLES.PENDING;
              const total = (b.tour?.priceIQD ?? 0) * b.seatsBooked;
              return (
                <div key={b.id} className="flex flex-col rounded-2xl border border-primary-100 bg-white p-5 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <p className="font-heading text-lg font-semibold text-dark leading-snug">{b.tour?.title ?? `Tour #${b.tourId}`}</p>
                    <span className={`ml-3 shrink-0 rounded-full px-3 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {b.tour?.destination}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {b.tour?.date ? new Date(b.tour.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "Date TBD"}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      {b.passengerName}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                      </svg>
                      {b.seatsBooked} {b.seatsBooked === 1 ? "seat" : "seats"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-primary-50 pt-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-dark">
                        {total.toLocaleString()} IQD
                      </span>
                      <span className="text-xs text-muted">
                        ({b.seatsBooked} x {(b.tour?.priceIQD ?? 0).toLocaleString()})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="flex items-center gap-1 text-xs text-muted">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(b.createdAt).toLocaleDateString()}
                      </p>
                      {canCancel(b) && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={cancellingId === b.id}
                          className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                        >
                          {cancellingId === b.id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
