import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Tour, Booking } from "../lib/types";

export default function AdminDashboard() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getTours(), api.getBookings()])
      .then(([t, b]) => { setTours(t); setBookings(b); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const totalRevenue = bookings.reduce((sum, b) => {
    const tour = tours.find((t) => t.id === b.tourId);
    return sum + (tour ? tour.priceIQD * b.seatsBooked : 0);
  }, 0);

  return (
    <div className="mx-auto max-w-6xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded border p-4">
          <p className="text-sm text-gray-500">Total Tours</p>
          <p className="text-2xl font-bold">{tours.length}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-gray-500">Total Bookings</p>
          <p className="text-2xl font-bold">{bookings.length}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-2xl font-bold">{totalRevenue.toLocaleString()} IQD</p>
        </div>
      </div>
    </div>
  );
}
