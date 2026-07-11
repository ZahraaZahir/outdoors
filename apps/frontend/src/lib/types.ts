export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: "TRAVELER" | "ADMIN";
  createdAt: string;
}

export interface Tour {
  id: number;
  title: string;
  destination: string;
  date: string;
  priceIQD: number;
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
  status: "PENDING" | "CONFIRMED" | "FAILED";
  createdAt: string;
  tour?: Pick<Tour, "id" | "title" | "destination" | "date">;
}
