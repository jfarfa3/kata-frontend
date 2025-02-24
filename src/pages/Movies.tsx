import { useEffect, useState } from "react"
import { Movie, MovieForm } from "../types/movie.type"
import { getMovies, createMovie, updateMovie, deleteMovie } from "../services/movie.service"
import { Form, Question } from "../components/form";
import { movieQuestions } from "../questions/movie";
import { FormatMovie } from "../enums/format.enum";
import { useNavigate } from "react-router-dom";

export default function MoviesPage() {
  const navigate = useNavigate()
  const [movies, setMovies] = useState<Movie[]>([])
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null)
  const [formQuestions, setFormQuestions] = useState<Question[]>(movieQuestions)
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    getMovies().then((data) => setMovies(data))
  }, [])

  const handleCreateMovie = (answers: { [key: string]: string }) => {
    const newMovie: MovieForm = {
      title: answers.title,
      genre: answers.genre,
      duration: parseInt(answers.duration),
      classification: answers.classification,
      format: answers.format as FormatMovie,
    }
    createMovie(newMovie).then((data) => {
      setMovies([...movies, data])
    })
  }

  const handleUpdateMovie = (answers: { [key: string]: string }) => {
    if (!currentMovie) return

    const updatedMovie: MovieForm = {
      title: answers.title,
      genre: answers.genre,
      duration: parseInt(answers.duration),
      classification: answers.classification,
      format: answers.format as FormatMovie,
    }
    updateMovie(currentMovie.id, updatedMovie).then((data) => {
      const updatedMovies = movies.map((movie) => (movie.id === data.id ? data : movie))
      setMovies(updatedMovies)
      setFormQuestions(movieQuestions)
      setFormValues({})
      setCurrentMovie(null)
    })
  }

  const handleDeleteMovie = (id: number) => {
    deleteMovie(id).then(() => {
      const remainingMovies = movies.filter((movie) => movie.id !== id)
      setMovies(remainingMovies)
    })
  }

  const goToMovie = (id: number) => {
    navigate(`/movies/${id}`)
  }

  const handleEditMovie = (movie: Movie) => {
    const values = {
      title: movie.title,
      genre: movie.genre,
      duration: movie.duration.toString(),
      classification: movie.classification,
      format: movie.format,
    }
    setFormQuestions(movieQuestions)
    setFormValues(values)
    setCurrentMovie(movie)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Películas</h1>
      {movies.length > 0 && (
        <ul className="space-y-4">
          {movies.map((movie) => (
            <li key={movie.id} className="bg-white p-4 shadow rounded-lg">
              <div>
                <h2 className="text-lg font-bold">{movie.title}</h2>
                <p className="text-gray-500">
                  {movie.genre
                    .split(",")
                    .map((genre) => genre.trim())
                    .map((genre) => genre.charAt(0).toUpperCase() + genre.slice(1))
                    .join(" - ")}
                </p>
                <p className="text-gray-500">{movie.duration} minutos</p>
                <p className="text-gray-500">{movie.classification}</p>
                <p className="text-gray-500">{movie.format}</p>
                {currentMovie && currentMovie.id === movie.id && (
                  <span className="text-sm text-gray-500">Editando...</span>
                )}
              </div>
              <div className="space-x-2">
                {currentMovie && currentMovie.id === movie.id ? (
                  <button
                    onClick={() => {
                      setFormQuestions(movieQuestions)
                      setFormValues({})
                      setCurrentMovie(null)
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                ) : (
                  <button
                    onClick={() => handleEditMovie(movie)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Editar
                  </button>
                )}
                <button
                  onClick={() => handleDeleteMovie(movie.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => goToMovie(movie.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Ver
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Form
        title={currentMovie ? "Editar Película" : "Nueva Película"}
        description={currentMovie
          ? "Por favor, complete el formulario a continuación para editar la película seleccionada"
          : "Por favor, complete el formulario a continuación para crear una nueva película"
        }
        questions={formQuestions}
        onSubmit={currentMovie ? handleUpdateMovie : handleCreateMovie}
        initialValues={formValues}
      />
    </div>
  )
}