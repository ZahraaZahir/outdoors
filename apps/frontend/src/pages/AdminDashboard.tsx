import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Tour, Booking } from "../lib/types";

function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6 animate-pulse">
      <div className="mb-3 h-4 w-24 rounded bg-gray-200" />
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
      <div className="pt-24 pb-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mb-10 h-8 w-48 rounded bg-gray-200 animate-pulse" />
          <div className="grid gap-6 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <StatSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = bookings.reduce((sum, b) => {
    const tour = tours.find((t) => t.id === b.tourId);
    return sum + (tour ? tour.priceIQD * b.seatsBooked : 0);
  }, 0);

  const stats = [
    {
      label: "Total Tours",
      value: tours.length,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      ),
    },
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
        </svg>
      ),
    },
    {
      label: "Revenue",
      value: `${totalRevenue.toLocaleString()} IQD`,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="pt-24 pb-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <h1 className="font-heading text-3xl font-bold text-dark">Admin Dashboard</h1>
        <p className="mt-2 text-muted">Overview of your tour operations</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-primary-100 bg-white p-6 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted">{stat.label}</p>
                <div className="rounded-xl bg-primary-50 p-2 text-primary-600">
                  {stat.icon}
                </div>
              </div>
              <p className="mt-3 font-heading text-2xl font-bold text-dark">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
