const BASE = import.meta.env.VITE_API_URL || "/api";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();
const STALE_MS = 60_000;

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem("token", data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401 && token) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = doRefresh();
    }
    const newToken = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${BASE}${path}`, { ...options, headers });
    }
  }

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
  register: (data: { name: string; password: string; phoneNumber: string }) =>
    request<{ id: number; name: string; phoneNumber: string; role: string; verified: boolean }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyPhone: (data: { phoneNumber: string; code: string }) =>
    request<{ message: string }>("/auth/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resendOtp: (phoneNumber: string) =>
    request<{ message: string }>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
    }),

  login: (data: { phoneNumber: string; password: string }) =>
    request<{ accessToken: string; refreshToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  refresh: (refreshToken: string) =>
    request<{ accessToken: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  getTours: () => cachedRequest<import("./types").Tour[]>("/tours"),
  getTour: (id: number) => cachedRequest<import("./types").Tour>(`/tours/${id}`),

  createTour: (data: { title: string; description?: string; destination: string; date: string; priceIQD: number; maxSeats?: number; imageUrl?: string; latitude?: number; longitude?: number }) =>
    request<import("./types").Tour>("/tours", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((tour) => { invalidate("/tours"); return tour; }),

  updateTour: (id: number, data: { title?: string; description?: string; destination?: string; date?: string; priceIQD?: number; maxSeats?: number; imageUrl?: string; latitude?: number; longitude?: number }) =>
    request<import("./types").Tour>(`/tours/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).then((tour) => { invalidate("/tours"); return tour; }),

  deleteTour: (id: number) =>
    request<void>(`/tours/${id}`, { method: "DELETE" })
      .then(() => { invalidate("/tours"); }),

  getBookings: () => cachedRequest<import("./types").Booking[]>("/bookings"),

  createBooking: (data: { tourId: number; passengerName: string; seatsBooked: number }) =>
    request<import("./types").Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((booking) => { invalidate("/bookings"); invalidate("/tours"); return booking; }),

  cancelBooking: (id: number) =>
    request<{ message: string }>(`/bookings/${id}/cancel`, { method: "PATCH" })
      .then((res) => { invalidate("/bookings"); invalidate("/tours"); return res; }),

  prefetchTour: (id: number) => {
    const path = `/tours/${id}`;
    const key = `GET:${path}`;
    if (cache.has(key)) return;
    request<import("./types").Tour>(path).then((data) => {
      cache.set(key, { data, timestamp: Date.now() });
    }).catch(() => {});
  },
};
