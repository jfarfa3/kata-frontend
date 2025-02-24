import { Seat } from "./seats.type";

export type Showtime = {
  id: number
  movie_id: number
  room_id: number
  start_time: string
  end_time: string
  seats_sold: Seat[];
  
}

export type ShowtimeForm = {
  movie_id: number
  room_id: number
  start_time: string
  end_time: string
}