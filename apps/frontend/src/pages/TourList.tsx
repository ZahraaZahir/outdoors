import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Tour } from "../lib/types";

function TourCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white animate-pulse">
      <div className="h-48 bg-primary-100/50" />
      <div className="p-5">
        <div className="mb-2 h-5 w-3/4 rounded bg-gray-200" />
        <div className="mb-2 h-4 w-1/2 rounded bg-gray-200" />
        <div className="mb-4 h-4 w-2/3 rounded bg-gray-200" />
        <div className="flex items-center justify-between">
          <div className="h-6 w-28 rounded bg-gray-200" />
          <div className="h-6 w-20 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function TourList() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTours().then(setTours).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-primary-50 pt-24 pb-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h1 className="font-heading text-4xl font-bold leading-tight text-dark lg:text-5xl">
                Discover the beauty of Kurdistan
              </h1>
              <p className="mt-4 text-lg text-muted">
                Outdoor experiences. Real connections. Book your next adventure through mountains, valleys, and hidden gems.
              </p>
              <div className="mt-8 flex gap-3">
                <a href="#tours" className="rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700">
                  Browse Tours
                </a>
                <a href="#tours" className="rounded-full border border-primary-200 px-6 py-3 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100">
                  View All
                </a>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-primary-200/40">
                <div className="flex h-full items-center justify-center text-primary-600">
                  <svg className="h-24 w-24 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-2xl bg-primary-200/60" />
            </div>
          </div>
        </div>
      </section>

      <section id="tours" className="py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <h2 className="font-heading text-3xl font-bold text-dark">Upcoming Tours</h2>
          <p className="mt-2 text-muted">Find your next outdoor experience</p>

          {loading ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <TourCardSkeleton key={i} />
              ))}
            </div>
          ) : tours.length === 0 ? (
            <div className="mt-16 flex flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-primary-50 p-4">
                <svg className="h-10 w-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-dark">No tours available yet</p>
              <p className="mt-1 text-sm text-muted">Check back soon for new adventures.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <Link
                  key={tour.id}
                  to={`/tours/${tour.id}`}
                  className="group overflow-hidden rounded-2xl border border-primary-100 bg-white transition-all hover:shadow-lg hover:shadow-primary-100/50"
                  onMouseEnter={() => api.prefetchTour(tour.id)}
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200/60">
                    <div className="flex h-full items-center justify-center">
                      <svg className="h-16 w-16 text-primary-400/50 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading text-lg font-semibold text-dark">{tour.title}</h3>
                    <p className="mt-1 text-sm text-muted">{tour.destination}</p>
                    <p className="mt-1 text-sm text-muted">
                      {new Date(tour.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-primary-100 pt-4">
                      <span className="font-heading text-lg font-bold text-primary-700">
                        {tour.priceIQD.toLocaleString()} IQD
                      </span>
                      <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                        {tour.availableSeats} seats left
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
