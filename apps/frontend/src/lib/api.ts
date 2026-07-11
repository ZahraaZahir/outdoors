const BASE = "/api";

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

  getTours: () => request<import("./types").Tour[]>("/tours"),
  getTour: (id: number) => request<import("./types").Tour>(`/tours/${id}`),

  createTour: (data: { title: string; destination: string; date: string; priceIQD: number; maxSeats?: number }) =>
    request<import("./types").Tour>("/tours", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getBookings: () => request<import("./types").Booking[]>("/bookings"),

  createBooking: (data: { tourId: number; passengerName: string; phoneNumber: string; seatsBooked: number }) =>
    request<import("./types").Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
