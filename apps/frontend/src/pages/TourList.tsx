import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Tour } from "../lib/types";

function TourCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white animate-pulse">
      <div className="h-56 bg-primary-100/50" />
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

function getDurationLabel(tour: Tour): string {
  const now = new Date();
  const tourDate = new Date(tour.date);
  const diffMs = tourDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return "Tomorrow";
  if (diffDays <= 7) return `${diffDays} days`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks`;
  return "Upcoming";
}

function getLocationShort(destination: string): string {
  const parts = destination.split(",");
  return parts[0].trim();
}

export default function TourList() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    api.getTours().then(setTours).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return tours.filter((tour) => {
      const matchesSearch =
        !search ||
        tour.title.toLowerCase().includes(search.toLowerCase()) ||
        tour.destination.toLowerCase().includes(search.toLowerCase());
      const matchesDate =
        !dateFilter || new Date(tour.date).toLocaleDateString('sv-SE') === dateFilter;
      return matchesSearch && matchesDate;
    });
  }, [tours, search, dateFilter]);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 pt-28 pb-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary-300 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-primary-400 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 lg:px-6">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl font-bold leading-tight text-white lg:text-5xl">
              Explore the beauty of Iraq & Kurdistan
            </h1>
            <p className="mt-4 text-lg text-primary-200">
              Discover dream destinations, plan trips with like-minded adventurers. Outdoor experiences that create real connections.
            </p>
          </div>

          <div className="mt-10 rounded-2xl bg-white/10 p-2 backdrop-blur-sm">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3">
                <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Where to?"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-dark placeholder-muted focus:outline-none"
                />
              </div>
              <div className="flex flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3">
                <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-transparent text-sm text-dark placeholder-muted focus:outline-none"
                />
              </div>
              <a
                href="#tours"
                className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Search
              </a>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-6 text-sm text-primary-200">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
Iraq & Kurdistan
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
              </svg>
              {tours.length} tours
            </span>
          </div>
        </div>
      </section>

      <section id="tours" className="py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold text-dark">Popular Destinations</h2>
              <p className="mt-2 text-muted">Handpicked adventures for you</p>
            </div>
            {(search || dateFilter) && (
              <button
                onClick={() => { setSearch(""); setDateFilter(""); }}
                className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
              >
                Clear filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <TourCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-16 flex flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-primary-50 p-4">
                <svg className="h-10 w-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-dark">
                {search || dateFilter ? "No tours match your filters" : "No tours available yet"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {search || dateFilter ? "Try adjusting your search." : "Check back soon for new adventures."}
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((tour) => (
                <Link
                  key={tour.id}
                  to={`/tours/${tour.id}`}
                  className="group overflow-hidden rounded-2xl border border-primary-100 bg-white transition-all hover:shadow-xl hover:shadow-primary-100/40"
                  onMouseEnter={() => api.prefetchTour(tour.id)}
                >
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800">
                    {tour.imageUrl ? (
                      <img src={tour.imageUrl} alt={tour.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="h-20 w-20 text-white/20 transition-transform duration-500 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute left-4 top-4 flex gap-2">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary-700 backdrop-blur-sm">
                        {getDurationLabel(tour)}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-1.5 text-white/90">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span className="text-sm font-medium">{getLocationShort(tour.destination)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading text-lg font-semibold text-dark group-hover:text-primary-700 transition-colors">
                      {tour.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted">
                      {new Date(tour.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-primary-100 pt-4">
                      <div>
                        <span className="font-heading text-xl font-bold text-primary-700">
                          {tour.priceIQD.toLocaleString()}
                        </span>
                        <span className="ml-1 text-sm text-muted">IQD</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">{tour.availableSeats} seats</span>
                        <span className="rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors group-hover:bg-primary-700">
                          Book Now
                        </span>
                      </div>
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
