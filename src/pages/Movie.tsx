import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMovie } from '../services/movie.service';
import { getShowTimesByMovieId } from '../services/showtimes.service';
import { Movie } from '../types/movie.type';
import { Showtime } from '../types/showtime.type';
import { format } from "@formkit/tempo";

export default function MoviePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie>();
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);

  const fetchMovieData = useCallback(async () => {
    if (!id) return;
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      navigate('/movies');
      return;
    }
    const movieData = await getMovie(numericId);
    setMovie(movieData);
  }, [id, navigate]);

  const fetchShowtimes = useCallback(async () => {
    if (!id) return;
    const numericId = parseInt(id);
    const showtimesData = await getShowTimesByMovieId(numericId);
    setShowtimes(showtimesData);
  }, [id]);

  const groupShowtimesByDate = (showtimes: Showtime[]) => {
    return showtimes.reduce((acc, showtime) => {
      const date = format(showtime.start_time, { date: "short" });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(showtime);
      return acc;
    }, {} as Record<string, Showtime[]>);
  };

  useEffect(() => {
    fetchMovieData();
    fetchShowtimes();
  }, [fetchMovieData, fetchShowtimes]);

  if (!id) {
    return null;
  }

  const groupedShowtimes = groupShowtimesByDate(showtimes);

  const goToReservation = (showtime: Showtime) => {
    navigate(`/reservation/${showtime.movie_id}/${showtime.room_id}/${showtime.id}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Película {id}</h1>
      <p className="mb-2">{movie?.title}</p>
      <p className="mb-4">Duración: {movie?.duration} minutos</p>
      <div className="mb-4">
        <button
          onClick={() => navigate('/movies')}
          className="bg-gray-500 text-white px-4 py-2 rounded cursor-pointer"
        >
          Volver
        </button>
      </div>

      <div className="p-4 rounded-lg bg-gray-100">
        <h3>Funciones</h3>
        {Object.keys(groupedShowtimes).length === 0 && <p>No hay funciones</p>}
        {Object.keys(groupedShowtimes).map((date) => (
          <div key={date} className='mb-4 flex flex-col gap-4'>
            <h4 className="font-bold">{date}</h4>
            <ul className='flex flex-col gap-3'>
              {groupedShowtimes[date].map((showtime) => (
                <div key={showtime.id} className="flex flex-row gap-3 justify-between shadow-2xl p-2 bg-white rounded-lg">
                  <li>
                    Sala: {showtime.room_id}
                    <br />
                    Inicio: {format(showtime.start_time, { time: "short" })} - Fin: {format(showtime.end_time, { time: "short" })}
                  </li>
                  <button
                    onClick={() => goToReservation(showtime)}
                    className="rounded cursor-pointer px-2 py-1 w-fit h-fit"
                  >
                    👁️
                  </button>
                </div>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}