import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Booking } from "../lib/types";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBookings().then(setBookings).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading bookings...</div>;

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
