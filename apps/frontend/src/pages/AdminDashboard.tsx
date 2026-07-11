import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Tour, Booking } from "../lib/types";

function StatSkeleton() {
  return (
    <div className="rounded border border-gray-200 p-4 animate-pulse">
      <div className="mb-2 h-4 w-24 rounded bg-gray-200" />
      <div className="h-8 w-16 rounded bg-gray-200" />
    </div>
  );
}

export default function AdminDashboard() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getTours(), api.getBookings()])
      .then(([t, b]) => { setTours(t); setBookings(b); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-8">
        <div className="mb-6 h-8 w-48 rounded bg-gray-200 animate-pulse" />
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

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
