import { Showtime, ShowtimeForm } from "../types/showtime.type";
import { request } from "../utils/request";

const URL = "http://localhost:8000/showtimes";

export async function getShowTimesByRoomId(room_id: number): Promise<Showtime[]> {
    return request<Showtime[]>(`${URL}/room/${room_id}`);
}

export async function getShowTimesByMovieId(movie_id: number): Promise<Showtime[]> {
  return request<Showtime[]>(`${URL}/movie/${movie_id}`);
}

export async function createShowtime(showtime: ShowtimeForm): Promise<Showtime> {
  return request<Showtime>(`${URL}/`, "POST", showtime);
}

export async function getShowtime(id: number): Promise<Showtime> {
  return request<Showtime>(`${URL}/${id}`);
}
