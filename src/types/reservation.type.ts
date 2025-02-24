import { Seat } from "./seats.type";

// PENDING = 'Pending'
// CREATED = 'Created'
// CONFIRMED = 'Confirmed'
// CANCELLED = 'Cancelled'

export enum ReservationState {
  PENDING = "pending",
  CREATED = "created",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
}

export enum ReservationStateSpanish {
  pending = "Pendiente",
  created = "Creada",
  confirmed = "Confirmada",
  cancelled = "Cancelada",
}

export type Reservation = {
  id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  showtime_id: number;
  state: ReservationState;
  seats: Seat[];
};

export type ReservationForm = {
  user_name: string;
  user_email: string;
  user_phone: string;
  showtime_id: number;
};
