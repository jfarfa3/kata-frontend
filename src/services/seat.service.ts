import { Seat } from "../types/seats.type";
import { request } from "../utils/request";

const URL = "http://localhost:8000"

export async function addSeatsToRoom(roomId: number, seats: Seat[]): Promise<boolean> {
  return request<boolean>(`${URL}/rooms/${roomId}/seats`, "PATCH", {seats});
}

export async function addSeatsToReservation(reservationId: number, seats: Seat[]): Promise<boolean> {
  return request<boolean>(`${URL}/reservations/${reservationId}/seats`, "PATCH", {seats});
}

export async function addSeatsToShowtime(showtimeId: number, seats: Seat[]): Promise<boolean> {
  return request<boolean>(`${URL}/showtimes/${showtimeId}/seats`, "PATCH", {seats});
}
