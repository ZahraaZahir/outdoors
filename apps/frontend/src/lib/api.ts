const BASE = "/api";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();
const STALE_MS = 60_000;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

function isGET(options?: RequestInit): boolean {
  return !options || !options.method || options.method === "GET";
}

async function cachedRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const key = `${options?.method ?? "GET"}:${path}`;

  if (isGET(options)) {
    const entry = cache.get(key) as CacheEntry<T> | undefined;
    if (entry && Date.now() - entry.timestamp < STALE_MS) {
      return entry.data;
    }

    const existing = inflight.get(key) as Promise<T> | undefined;
    if (existing) return existing;

    const promise = request<T>(path, options).then((data) => {
      cache.set(key, { data, timestamp: Date.now() });
      inflight.delete(key);
      return data;
    });
    inflight.set(key, promise);
    return promise;
  }

  return request<T>(path, options);
}

function invalidate(pattern?: string) {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key);
  }
}

export const api = {
  register: (data: { name: string; email: string; password: string; phoneNumber: string }) =>
    request<{ id: number; name: string; email: string; role: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getTours: () => cachedRequest<import("./types").Tour[]>("/tours"),
  getTour: (id: number) => cachedRequest<import("./types").Tour>(`/tours/${id}`),

  createTour: (data: { title: string; description?: string; destination: string; date: string; priceIQD: number; maxSeats?: number; imageUrl?: string }) =>
    request<import("./types").Tour>("/tours", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((tour) => { invalidate("/tours"); return tour; }),

  getBookings: () => cachedRequest<import("./types").Booking[]>("/bookings"),

  createBooking: (data: { tourId: number; passengerName: string; seatsBooked: number }) =>
    request<import("./types").Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((booking) => { invalidate("/bookings"); invalidate("/tours"); return booking; }),

  prefetchTour: (id: number) => {
    const path = `/tours/${id}`;
    const key = `GET:${path}`;
    if (cache.has(key)) return;
    request<import("./types").Tour>(path).then((data) => {
      cache.set(key, { data, timestamp: Date.now() });
    }).catch(() => {});
  },
};
