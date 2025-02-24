import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoom } from '../services/room.service';
import { Room } from '../types/room.type';
import { Seat } from "../types/seats.type";
import { Showtime, ShowtimeForm } from "../types/showtime.type";
import { addSeatsToRoom } from "../services/seat.service";
import { createShowtime, getShowTimesByRoomId } from "../services/showtimes.service";
import { SeatsGrid } from '../components/seats';
import { Movie } from '../types/movie.type';
import { getMovies } from '../services/movie.service';
import { addHour, addMinute, format, isAfter } from "@formkit/tempo"

export default function RoomPage() {
  const todayAtMidnight = new Date();
  todayAtMidnight.setHours(0, 0, 0, 0);
  const navigate = useNavigate();
  const { id } = useParams();
  const [room, setRoom] = useState<Room>();
  const [isEditing, setIsEditing] = useState(false);
  const [seats, setSeats] = useState<boolean[][]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [gridDimensions, setGridDimensions] = useState<{ capacity: number, rows: number, cols: number }>({ capacity: 0, rows: 0, cols: 0 });
  const [allShowtimes, setAllShowtimes] = useState<Showtime[]>([]);
  const [filteredShowtimes, setFilteredShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [date, setDate] = useState<{
    date: Date
    startHour: Date
    endHour: Date
  }>({
    date: todayAtMidnight,
    startHour: addHour(todayAtMidnight, 11),
    endHour: addHour(todayAtMidnight, 22)
  });

  const fetchRoomData = useCallback(async () => {
    if (!id) return;
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      navigate('/rooms');
      return;
    }
    const roomData = await getRoom(numericId);
    setRoom(roomData);
    const dimensions = calculateGridDimensions(roomData.capacity * 2);
    setGridDimensions(dimensions);
    setSeats(Array(dimensions.rows).fill(null).map(() => Array(dimensions.cols).fill(false)));
    setSelectedSeats(roomData.seats.map(seat => ({
      row: seat.row,
      number: seat.number
    })));
  }, [id, navigate]);

  const fetchShowtimes = useCallback(async () => {
    if (!id) return;
    const numericId = parseInt(id);
    const showtimes = await getShowTimesByRoomId(numericId);
    setAllShowtimes(showtimes);
    setFilteredShowtimes(filterShowtimes(showtimes, date.date));
  }, [id, date.date]);

  const fetchMovies = useCallback(async () => {
    const moviesData = await getMovies();
    setMovies(moviesData);
  }, []);

  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  useEffect(() => {
    fetchShowtimes();
  }, [fetchShowtimes]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    setFilteredShowtimes(filterShowtimes(allShowtimes, date.date));
  }, [allShowtimes, date.date]);

  const filterShowtimes = (showtimes: Showtime[], date: Date) => {
    return showtimes.filter(({ start_time }) => {
      const dateShowtime = format(new Date(start_time), "YYYY-MM-DD", 'en');
      const dateShowtime2 = format(date, "YYYY-MM-DD", 'en');
      return dateShowtime === dateShowtime2;
    });
  };

  const calculateGridDimensions = (capacity: number) => {
    const sqrt = Math.sqrt(capacity) * 2;
    const cols = Math.ceil(sqrt);
    const rows = Math.ceil(capacity / cols);
    return { capacity, rows, cols };
  };

  const toggleSeat = (row: number, col: number, isSelected: boolean) => {
    if (!isEditing) return;
    const isCapacityFull = selectedSeats.length >= (room?.capacity ?? 0);

    if (isSelected) {
      setSeats((prevSeats) =>
        prevSeats.map((r, i) =>
          i === row ? r.map((seat, j) => (j === col ? !seat : seat)) : r
        )
      );

      setSelectedSeats((prevSelectedSeats) =>
        prevSelectedSeats.filter((seat) => seat.row !== row || seat.number !== col)
      );
      return;
    }
    if (isCapacityFull) return;

    setSeats((prevSeats) =>
      prevSeats.map((r, i) =>
        i === row ? r.map((seat, j) => (j === col ? !seat : seat)) : r
      )
    );

    setSelectedSeats((prevSelectedSeats) => [
      ...prevSelectedSeats,
      { row, number: col },
    ]);
  };

  const onHandleSave = () => {
    if (!room) return;
    addSeatsToRoom(room.id, selectedSeats).then(() => {
      setIsEditing(false);
    });
  };

  const onChangeDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateString = format({ date: e.target.value, format: "YYYY-MM-DDTHH:mm:ssZ", locale: 'en' });
    const newDate = new Date(newDateString);
    setDate({
      date: newDate,
      startHour: addHour(newDate, 11),
      endHour: addHour(newDate, 22)
    });
  };

  const addShowtime = (movieId: number) => {
    const movie = movies.find(movie => movie.id === movieId);
    if (!movie || !room) return;
    const lastShowtime = filteredShowtimes.length > 0 ? new Date(filteredShowtimes[filteredShowtimes.length - 1].end_time) : date.startHour;
    const validate = isAfter(lastShowtime, date.endHour);
    if (validate) return;
    const endHour = addMinute(lastShowtime, movie.duration + room.break_time);
    const newShowtime: ShowtimeForm = {
      movie_id: movieId,
      room_id: room.id,
      start_time: format(lastShowtime, "YYYY-MM-DDTHH:mm:ssZ", 'en'),
      end_time: format(endHour, "YYYY-MM-DDTHH:mm:ssZ", 'en')
    };
    createShowtime(newShowtime).then((data) => {
      setAllShowtimes([...allShowtimes, data]);
    });
  };
  const goToMovie = (id: number) => {
    navigate(`/movies/${id}`);
  }

  if (!id) {
    return null;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Sala {id}</h1>
      <p className="mb-2">{room?.name}</p>
      <p className="mb-4">
        Capacidad: {room?.capacity} / Configuradas {selectedSeats.length}
      </p>
      <div className="mb-4">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 cursor-pointer"
        >
          {isEditing ? 'Cancelar Edición' : 'Editar Sillas'}
        </button>
        <button
          onClick={() => navigate('/rooms')}
          className="bg-gray-500 text-white px-4 py-2 rounded cursor-pointer"
        >
          Volver
        </button>
        {isEditing && (
          <button
            onClick={onHandleSave}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Guardar Cambios
          </button>
        )}
      </div>

      <div className="p-4 rounded-lg bg-gray-100">
        <h3>Películas</h3>
        <ul>
          {movies.map((movie) => (
            <div className="flex flex-row gap-3" key={movie.id}>
              <li>
                {movie.title}
              </li>
              <button
                onClick={() => addShowtime(movie.id)}
                className="bg-blue-500 text-white rounded cursor-pointer px-2"
              >
                +
              </button>
            </div>
          ))}
        </ul>
      </div>

      <div className="flex flex-row gap-3 p-4 rounded-lg">
        <SeatsGrid
          gridDimensions={gridDimensions}
          seats={seats}
          activeSeats={selectedSeats}
          isEditing={isEditing}
          onSeatToggle={toggleSeat}
        />
        <div className="w-1/3 p-4 rounded-lg flex flex-col bg-gray-100">
          <p>
            Horario  {format(date.startHour, { time: "short" })} - {format(date.endHour, { time: "short" })}
          </p>
          <input
            type="date"
            value={date.date.toISOString().split('T')[0]}
            onChange={onChangeDate}
          />
          <br />
          <ul className='flex flex-col gap-3'>
            {filteredShowtimes.length === 0 && <li>No hay horarios</li>}
            {filteredShowtimes.map((showtime) => (
              <div key={showtime.id}>
                <div className='flex flex-row gap-3 justify-between shadow-2xl p-2 bg-white rounded-lg'>
                  <li key={showtime.id}>
                    pelicula: {movies.find(movie => movie.id === showtime.movie_id)?.title}
                    <br />
                    inicio: {format(showtime.start_time, { time: "short" })} - fin: {format(showtime.end_time, { time: "short" })}
                  </li>
                  <button
                    onClick={() => goToMovie(showtime.movie_id)}
                    className="rounded cursor-pointer px-2 py-1 w-fit h-fit"
                  >
                    👁️
                  </button>
                </div>
              </div>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}