import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Tour } from "../lib/types";

function TourDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl p-8 animate-pulse">
      <div className="mb-2 h-8 w-64 rounded bg-gray-200" />
      <div className="mb-1 h-5 w-40 rounded bg-gray-200" />
      <div className="mb-1 h-5 w-32 rounded bg-gray-200" />
      <div className="mb-2 mt-4 h-7 w-36 rounded bg-gray-200" />
      <div className="mb-6 h-4 w-44 rounded bg-gray-200" />
      <div className="rounded border border-gray-200 p-4">
        <div className="mb-4 h-5 w-32 rounded bg-gray-200" />
        <div className="mb-3 h-10 w-full rounded bg-gray-200" />
        <div className="mb-3 h-10 w-full rounded bg-gray-200" />
        <div className="mb-4 h-10 w-24 rounded bg-gray-200" />
        <div className="h-10 w-full rounded bg-gray-200" />
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
  if (!tour) return <div className="p-8 text-center">Tour not found.</div>;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-2 text-2xl font-bold">{tour.title}</h1>
      <p className="text-gray-600">{tour.destination}</p>
      <p className="text-gray-600">{new Date(tour.date).toLocaleDateString()}</p>
      <p className="mt-2 text-xl font-bold">{tour.priceIQD.toLocaleString()} IQD</p>
      <p className="text-sm text-gray-500">{tour.availableSeats} / {tour.maxSeats} seats available</p>

      {user ? (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded border p-4">
          <h2 className="font-semibold">Book this tour</h2>
          {error && <div className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</div>}
          {success && <div className="rounded bg-green-50 p-2 text-sm text-green-600">{success}</div>}
          <input placeholder="Passenger name" required value={form.passengerName} onChange={(e) => setForm((p) => ({ ...p, passengerName: e.target.value }))} className="rounded border p-2" />
          <input placeholder="Phone number" required value={form.phoneNumber} onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))} className="rounded border p-2" />
          <div className="flex items-center gap-2">
            <label className="text-sm">Seats:</label>
            <input type="number" min={1} max={4} required value={form.seatsBooked} onChange={(e) => setForm((p) => ({ ...p, seatsBooked: Number(e.target.value) }))} className="w-20 rounded border p-2" />
          </div>
          <button type="submit" className="rounded bg-black p-2 text-white hover:bg-gray-800">Book Now</button>
        </form>
      ) : (
        <p className="mt-6 text-gray-500">
          <a href="/login" className="underline">Login</a> to book this tour.
        </p>
      )}
    </div>
  );
}
