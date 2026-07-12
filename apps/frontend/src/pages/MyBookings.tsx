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
    <div className="flex items-center justify-between rounded-2xl border border-primary-100 bg-white p-5 animate-pulse">
      <div>
        <div className="mb-2 h-5 w-40 rounded bg-gray-200" />
        <div className="mb-1 h-4 w-28 rounded bg-gray-200" />
        <div className="h-4 w-36 rounded bg-gray-200" />
      </div>
      <div className="text-right">
        <div className="mb-1 ml-auto h-6 w-20 rounded-full bg-gray-200" />
        <div className="ml-auto h-3 w-16 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="pt-24 pb-20">
      <div className="mx-auto max-w-4xl px-4 lg:px-6">
        <h1 className="font-heading text-3xl font-bold text-dark">My Bookings</h1>
        <p className="mt-2 text-muted">Track your tour reservations</p>

        {loading ? (
          <div className="mt-10 flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <BookingSkeleton key={i} />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-primary-50 p-4">
              <svg className="h-10 w-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-dark">No bookings yet</p>
            <p className="mt-1 text-sm text-muted">Browse tours and make your first reservation.</p>
          </div>
        ) : (
          <div className="mt-10 flex flex-col gap-4">
            {bookings.map((b) => {
              const style = STATUS_STYLES[b.status] ?? STATUS_STYLES.PENDING;
              return (
                <div key={b.id} className="flex items-center justify-between rounded-2xl border border-primary-100 bg-white p-5 transition-shadow hover:shadow-md">
                  <div>
                    <p className="font-heading font-semibold text-dark">{b.tour?.title ?? `Tour #${b.tourId}`}</p>
                    <p className="mt-0.5 text-sm text-muted">{b.tour?.destination}</p>
                    <p className="mt-1 text-xs text-muted">
                      {b.seatsBooked} {b.seatsBooked === 1 ? "seat" : "seats"} &middot; {b.passengerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {canCancel(b) && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={cancellingId === b.id}
                        className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                      >
                        {cancellingId === b.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                    <div className="text-right">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                        {b.status}
                      </span>
                      <p className="mt-1.5 text-xs text-muted">{new Date(b.createdAt).toLocaleDateString()}</p>
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
