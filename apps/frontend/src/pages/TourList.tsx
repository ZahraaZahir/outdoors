import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Tour } from "../lib/types";

export default function TourList() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTours().then(setTours).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading tours...</div>;

  return (
    <div className="mx-auto max-w-6xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Upcoming Tours</h1>
      {tours.length === 0 ? (
        <p className="text-gray-500">No upcoming tours.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <Link key={tour.id} to={`/tours/${tour.id}`} className="block rounded-lg border p-4 hover:shadow-md">
              <h2 className="font-semibold">{tour.title}</h2>
              <p className="text-sm text-gray-600">{tour.destination}</p>
              <p className="text-sm text-gray-600">{new Date(tour.date).toLocaleDateString()}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-bold">{tour.priceIQD.toLocaleString()} IQD</span>
                <span className="text-sm text-gray-500">{tour.availableSeats} seats left</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
