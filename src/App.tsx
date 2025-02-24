// import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import RoomsPage from './pages/Rooms'
import MoviesPage from './pages/Movies'
import RoomPage from './pages/Room'
import MoviePage from './pages/Movie'
import NavBar from './components/navbar'
import ReservationPage from './pages/Reservation'

export default function App() {
  return (
    <BrowserRouter>
      <NavBar
        children={[
          { label: 'Home', to: '/' },
          { label: 'Salas', to: '/rooms' },
          { label: 'Peliculas', to: '/movies' },
        ]}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/rooms/:id" element={<RoomPage />} />
        <Route path="/movies/:id" element={<MoviePage />} />
        <Route path="/reservation/:movieId/:roomId/:showtimeId" element={<ReservationPage />} />
      </Routes>
    </BrowserRouter>
  )

}
