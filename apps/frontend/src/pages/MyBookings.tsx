import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Booking } from "../lib/types";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

function BookingSkeleton() {
  return (
    <div className="flex items-center justify-between rounded border border-gray-200 p-4 animate-pulse">
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

  useEffect(() => {
    api.getBookings().then(setBookings).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="mb-6 h-8 w-40 rounded bg-gray-200 animate-pulse" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <BookingSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold">My Bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded border p-4">
              <div>
                <p className="font-semibold">{b.tour?.title ?? `Tour #${b.tourId}`}</p>
                <p className="text-sm text-gray-600">{b.tour?.destination}</p>
                <p className="text-sm text-gray-500">{b.seatsBooked} seat(s) &middot; {b.passengerName}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[b.status] ?? ""}`}>
                  {b.status}
                </span>
                <p className="mt-1 text-xs text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
