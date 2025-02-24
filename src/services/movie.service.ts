import { Movie, MovieForm } from "../types/movie.type"
import { request } from "../utils/request"

const URL = 'http://localhost:8000/movies'

export async function getMovies(): Promise<Movie[]> {
  return request<Movie[]>(`${URL}/`)
}

export async function getMovie(id: number): Promise<Movie> {
  return request<Movie>(`${URL}/${id}`)
}

export async function createMovie(movie: MovieForm): Promise<Movie> {
  return request<Movie>(`${URL}/`, 'POST', movie)
}

export async function updateMovie(movie_id: number, movie: MovieForm): Promise<Movie> {
  return request<Movie>(`${URL}/${movie_id}`, 'PUT', movie)
}

export async function deleteMovie(movie_id: number): Promise<void> {
  return request<void>(`${URL}/${movie_id}`, 'DELETE')
}