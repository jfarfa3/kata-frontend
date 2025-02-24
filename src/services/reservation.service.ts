import { request } from "../utils/request"
import { Reservation, ReservationForm} from "../types/reservation.type";
import { ReservationState } from "../types/reservation.type";

const URL = 'http://localhost:8000/reservations'

export async function getReservations(): Promise<Reservation[]> {
  return request<Reservation[]>(`${URL}/`)
}

export async function createReservation(reservation: ReservationForm): Promise<Reservation> {
  return request<Reservation>(`${URL}/`, 'POST', reservation)
}

export async function completeReservation(reservation_id: number): Promise<Reservation> {
  return request<Reservation>(`${URL}/${reservation_id}/${ReservationState.CONFIRMED}`, 'PUT')
}

export async function deleteReservation(reservation_id: number): Promise<Reservation> {
  return request<Reservation>(`${URL}/${reservation_id}/${ReservationState.CANCELLED}`, 'PUT')
}