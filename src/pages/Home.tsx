import { useEffect, useState } from 'react';
import { Movie } from '../types/movie.type';
import { Room } from '../types/room.type';
import { Reservation } from '../types/reservation.type';
import { Showtime } from '../types/showtime.type';
import { getMovies } from '../services/movie.service';
import { getRooms } from '../services/room.service';
import { getReservations, completeReservation, deleteReservation } from '../services/reservation.service';
import { getShowtime } from '../services/showtimes.service';
import { format } from '@formkit/tempo';
import { ReservationStateSpanish, ReservationState } from '../types/reservation.type';

interface ReservationInfo extends Reservation {
  showtime?: Showtime;
  movie?: Movie;
  room?: Room;
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<ReservationInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterState, setFilterState] = useState('');

  useEffect(() => {
    Promise.all([
      getMovies(),
      getRooms(),
      getReservations()
    ]).then(async ([moviesData, roomsData, reservationsData]) => {
      setMovies(moviesData);
      setRooms(roomsData);

      const reservationsWithInfo = await Promise.all(
        reservationsData.map(async (reservation) => {
          const showtime = await getShowtime(reservation.showtime_id);
          return {
            ...reservation,
            showtime,
            movie: moviesData.find(m => m.id === showtime.movie_id),
            room: roomsData.find(r => r.id === showtime.room_id)
          };
        })
      );

      setReservations(reservationsWithInfo);
    });
  }, []);

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || (reservation.showtime &&
      format(new Date(reservation.showtime.start_time), "YYYY-MM-DD") === filterDate);
    const matchesState = !filterState || reservation.state === filterState;
    return matchesSearch && matchesDate && matchesState;
  });

  const onCompleteReservation = async (reservation: ReservationInfo) => {
    const response = await completeReservation(reservation.id);
    const updatedReservations = reservations.map(r => r.id === response.id ? { ...r, state: response.state } : r);
    setReservations(updatedReservations);
  }

  const onCancelReservation = async (reservation: ReservationInfo) => {
    const response = await deleteReservation(reservation.id);
    const updatedReservations = reservations.map(r => r.id === response.id ? { ...r, state: response.state } : r);
    setReservations(updatedReservations);
  }

  return (
    <div className="container mx-auto p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Películas</h2>
          <p className="text-3xl">{movies.length === 0 ? 'No hay películas' : movies.length}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Salas</h2>
          <p className="text-3xl">{rooms.length === 0 ? 'No hay salas' : rooms.length}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Reservaciones</h2>
          <p className="text-3xl">{reservations.length === 0 ? 'No hay reservaciones' : reservations.length}</p>
        </div>
      </div>

      {/* Reservations Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Reservaciones</h2>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="p-2 border rounded flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="date"
            className="p-2 border rounded"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <select
            className="p-2 border rounded"
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {Object.entries(ReservationStateSpanish).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>

        {/* Reservations Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Usuario</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Teléfono</th>
                <th className="p-2 text-left">Película</th>
                <th className="p-2 text-left">Sala</th>
                <th className="p-2 text-left">Asientos</th>
                <th className="p-2 text-left">Fecha y Hora</th>
                <th>
                  Estado
                </th>
                <th className='p-2 text-left'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="border-b">
                  <td className="p-2">{reservation.user_name}</td>
                  <td className="p-2">{reservation.user_email}</td>
                  <td className="p-2">{reservation.user_phone}</td>
                  <td className="p-2">{reservation.movie?.title}</td>
                  <td className="p-2">{reservation.room?.name}</td>
                  <td className="p-2">{reservation.seats.length}</td>
                  <td className="p-2">
                    {reservation.showtime && format(new Date(reservation.showtime.start_time), { date: 'short', time: 'short' })}
                  </td>
                  <td>
                    {ReservationStateSpanish[reservation.state]}
                  </td>
                  <td>
                    {reservation.state !== ReservationState.CONFIRMED &&
                      reservation.state !== ReservationState.CANCELLED && (
                        <>
                          <button
                            className="text-blue-500 p-2 rounded-lg"
                            onClick={() => onCompleteReservation(reservation)}
                          >
                            ✅
                          </button>
                          <button
                            className="text-red-500 p-2 rounded-lg"
                            onClick={() => onCancelReservation(reservation)}
                          >
                            ❌
                          </button>
                        </>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}