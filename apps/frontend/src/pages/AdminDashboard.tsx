import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Tour } from "../lib/types";
import ConfirmModal from "../components/ConfirmModal";

function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6 animate-pulse">
      <div className="mb-3 h-4 w-24 rounded bg-gray-200" />
      <div className="h-8 w-16 rounded bg-gray-200" />
    </div>
  );
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tour | null>(null);

  const { data: tours = [], isLoading: toursLoading } = useQuery({
    queryKey: ["tours"],
    queryFn: api.getTours,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["bookings", "all"],
    queryFn: api.getAllBookings,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteTour(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      setDeleteTarget(null);
      setDeletingId(null);
    },
    onError: () => {
      setDeletingId(null);
    },
  });

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    deleteMutation.mutate(deleteTarget.id);
  };

  const loading = toursLoading || bookingsLoading;

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

  const activeBookings = bookings.filter(
    (b) => b.status === "PENDING" || b.status === "CONFIRMED",
  );

  const totalRevenue = activeBookings.reduce((sum, b) => {
    const tour = tours.find((t) => t.id === b.tourId);
    return sum + (tour ? tour.priceIQD * b.seatsBooked : 0);
  }, 0);

  const stats = [
    {
      label: "Total Tours",
      value: tours.length,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      ),
    },
    {
      label: "Total Bookings",
      value: activeBookings.length,
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-dark">Admin Dashboard</h1>
            <p className="mt-2 text-muted">Overview of your tour operations</p>
          </div>
          <Link to="/admin/tours/new" className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700">
            New Tour
          </Link>
        </div>

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

        <div className="mt-12">
          <h2 className="font-heading text-xl font-semibold text-dark">Tours</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-primary-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-primary-100 bg-primary-50/50">
                <tr>
                  <th className="px-5 py-3 font-medium text-dark">Title</th>
                  <th className="px-5 py-3 font-medium text-dark">Date</th>
                  <th className="px-5 py-3 font-medium text-dark">Price</th>
                  <th className="px-5 py-3 font-medium text-dark">Seats</th>
                  <th className="px-5 py-3 font-medium text-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((tour) => (
                  <tr key={tour.id} className="border-b border-primary-50 last:border-0">
                    <td className="px-5 py-3">
                      <Link to={`/tours/${tour.id}`} className="font-medium text-dark hover:text-primary-600">{tour.title}</Link>
                    </td>
                    <td className="px-5 py-3 text-muted">{new Date(tour.date).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-muted">{tour.priceIQD.toLocaleString()} IQD</td>
                    <td className="px-5 py-3 text-muted">{tour.availableSeats}/{tour.maxSeats}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/tours/${tour.id}/edit`} className="rounded-lg bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100">
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(tour)}
                          disabled={deletingId === tour.id}
                          className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          {deletingId === tour.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete tour"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
