import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoom } from '../services/room.service';
import { getMovie } from '../services/movie.service';
import { getShowtime } from '../services/showtimes.service';
import { Room } from '../types/room.type';
import { Seat } from "../types/seats.type";
import { Showtime } from "../types/showtime.type";
import { SeatsGrid } from '../components/seats';
import { Movie } from '../types/movie.type';
import { Form, Question } from '../components/form';
import { createReservation } from '../services/reservation.service';
import { ReservationForm } from '../types/reservation.type';
import { addSeatsToReservation, addSeatsToShowtime } from '../services/seat.service';

export default function ReservationPage() {
  const navigate = useNavigate();
  const { movieId, roomId, showtimeId } = useParams();
  const [room, setRoom] = useState<Room>();
  const [movie, setMovie] = useState<Movie>();
  const [showtime, setShowtime] = useState<Showtime>();
  const [seats, setSeats] = useState<boolean[][]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [seatsSold, setSeatsSold] = useState<Seat[]>([]);
  const [seatsInCart, setSeatsInCart] = useState<Seat[]>([]);

  const [gridDimensions, setGridDimensions] = useState<{ capacity: number, rows: number, cols: number }>({ capacity: 0, rows: 0, cols: 0 });
  const [isValidForm, setIsValidForm] = useState<boolean>(false);


  const [maxQuantity, setMaxQuantity] = useState<number>(0);

  useEffect(() => {
    if (maxQuantity === 0) {
      setIsValidForm(false);
      return;
    }
    setIsValidForm(maxQuantity === seatsInCart.length);
  }, [maxQuantity, seatsInCart]);

  const fetchRoomData = useCallback(async () => {
    if (!roomId) return;
    const numericId = parseInt(roomId);
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
      number: seat.number,
    })));
  }, [roomId, navigate]);

  const fetchMovieData = useCallback(async () => {
    if (!movieId) return;
    const numericId = parseInt(movieId);
    if (isNaN(numericId)) {
      navigate('/movies');
      return;
    }
    const movieData = await getMovie(numericId);
    setMovie(movieData);
  }, [movieId, navigate]);

  const fetchShowtimes = useCallback(async () => {
    if (!showtimeId || isNaN(parseInt(showtimeId))) return;
    const showtimesData = await getShowtime(parseInt(showtimeId));
    setShowtime(showtimesData);
    setSeatsSold(showtimesData.seats_sold.map(seat => ({
      row: seat.row,
      number: seat.number,
    })));
  }, [showtimeId]);

  useEffect(() => {
    fetchRoomData();
    fetchMovieData();
    fetchShowtimes();
  }, [fetchRoomData, fetchMovieData, fetchShowtimes]);

  const calculateGridDimensions = (capacity: number) => {
    const sqrt = Math.sqrt(capacity) * 2;
    const cols = Math.ceil(sqrt);
    const rows = Math.ceil(capacity / cols);
    return { capacity, rows, cols };
  };

  const toggleSeat = (row: number, col: number, isSelected: boolean, isSold: boolean, isInCart: boolean) => {
    if (isSold) return;
    if (!isSelected || maxQuantity === 0) {
      setIsValidForm(false);
      return;
    }

    const isCapacityFull = seatsInCart.length >= maxQuantity;

    if (isInCart) {
      setSeats((prevSeats) =>
        prevSeats.map((r, i) =>
          i === row ? r.map((seat, j) => (j === col ? !seat : seat)) : r
        )
      );

      setSeatsInCart((prevSoldSeats) =>
        prevSoldSeats.filter((seat) => seat.row !== row || seat.number !== col)
      );
      return;
    }
    if (isCapacityFull) return;

    setSeats((prevSeats) =>
      prevSeats.map((r, i) =>
        i === row ? r.map((seat, j) => (j === col ? !seat : seat)) : r
      )
    );

    setSeatsInCart((prevSelectedSeats) => [
      ...prevSelectedSeats,
      { row, number: col },
    ]);

  };

  const questions: Question[] = [
    {
      id: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Ingrese su nombre',
      required: true,
      validation: (value) => {
        return value.length > 2 ? undefined : 'Nombre inválido';
      }
    },
    {
      id: 'email',
      label: 'Correo Electrónico',
      type: 'text',
      placeholder: 'Ingrese su correo electrónico',
      required: true,
      validation: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? undefined : 'Correo electrónico inválido';
      },
    },
    {
      id: 'phone',
      label: 'Número de Teléfono',
      type: 'text',
      placeholder: 'Ingrese su número de teléfono',
      required: false,
      validation: (value) => {
        if (!value) return undefined;
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(value) ? undefined : 'Número de teléfono inválido';
      },
    },
    {
      id: 'seats',
      label: 'Número de Asientos',
      type: 'number',
      placeholder: 'Ingrese el número de asientos',
      required: true,
    },
  ];

  const handleSubmit = async (answers: { [key: string]: string }) => {
    if (!showtime) return;
    console.log('Formulario enviado', answers);
    const newReservation: ReservationForm = {
      user_name: answers.name,
      user_email: answers.email,
      user_phone: answers.phone || '',
      showtime_id: showtime?.id,
    };

    const result = await createReservation(newReservation);
    Promise.all([
      addSeatsToReservation(result.id, seatsInCart),
      addSeatsToShowtime(showtime.id, [...seatsInCart, ...seatsSold]),
    ]).then(() => {
      navigate(`/home`);
    });
  };

  const handleBlur = (answers: { [key: string]: string }) => {
    const seats = isNaN(parseInt(answers.seats)) ? 0 : parseInt(answers.seats);
    setMaxQuantity(seats);
  };

  if (!movieId || !roomId) {
    return null;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Reserva para {movie?.title}</h1>
      <div className='flex flex-row gap-4'>
        <div className="p-4 rounded-lg bg-gray-100 mb-4">
          <p>Título: {movie?.title}</p>
          <p>Duración: {movie?.duration} minutos</p>
          <p>
            {movie?.classification} - {movie?.format}
          </p>
          <p>Generos: {movie?.genre.split(',')
            .map((genre) => genre.trim())
            .map((genre) => genre.charAt(0).toUpperCase() + genre.slice(1))
            .join(' - ')}</p>
        </div>
        <div className="p-4 rounded-lg bg-gray-100 mb-4">
          <h3>Sala</h3>
          <p>Nombre: {room?.name}</p>
          <p>
            Capacidad: {selectedSeats.length - seatsSold.length} / {selectedSeats.length}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-gray-100 mb-4">
          <h3>Función</h3>
          <p>Fecha y Hora: {showtime?.start_time}</p>
          <p>Asientos Vendidos: {seatsSold.length}</p>
        </div>
        <div className="p-4 rounded-lg bg-gray-100 mb-4">
          <h3>Venta</h3>
          <p>Asiendos a vender: {maxQuantity}</p>
          <p>Asientos en carrito: {seatsInCart.length}</p>
        </div>
      </div>
      <div className="flex flex-row gap-3 p-4 rounded-lg">
        <SeatsGrid
          gridDimensions={gridDimensions}
          seats={seats}
          activeSeats={selectedSeats}
          seatsSold={seatsSold}
          seatsInCart={seatsInCart}
          onSeatToggle={toggleSeat}
          isSelling={true}
        />
        <div className="w-1/3 p-4 rounded-lg flex flex-col bg-gray-100">
          <Form
            questions={questions}
            onSubmit={handleSubmit}
            onBlur={handleBlur}
            title="Formulario de Reserva"
            description="Complete el formulario para reservar sus asientos"
            wigth='full'
            isValidForm={isValidForm}
          />
        </div>
      </div>
    </div >
  );
}
