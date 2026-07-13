export interface User {
  id: number;
  name: string;
  phoneNumber: string;
  role: "TRAVELER" | "ADMIN";
  verified: boolean;
  createdAt: string;
}

export interface Tour {
  id: number;
  title: string;
  description: string;
  destination: string;
  latitude: number | null;
  longitude: number | null;
  date: string;
  priceIQD: number;
  imageUrl: string | null;
  maxSeats: number;
  availableSeats: number;
}

export interface Booking {
  id: number;
  tourId: number;
  userId: number;
  passengerName: string;
  phoneNumber: string;
  seatsBooked: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "FAILED";
  createdAt: string;
  tour?: Pick<Tour, "id" | "title" | "destination" | "date" | "priceIQD" | "imageUrl">;
}
