import { Question } from "../components/form";
import { FormatMovie } from "../enums/format.enum";

const movieClassifications: { value: string; label: string }[] = [
  { value: "A", label: "A - Apta para todo público" },
  { value: "7", label: "7 - Apta para mayores de 7 años" },
  { value: "12", label: "12 - Apta para mayores de 12 años" },
  { value: "15", label: "15 - Apta para mayores de 15 años" },
  { value: "18", label: "18 - Apta para mayores de 18 años" },
  { value: "X", label: "X - Contenido exclusivamente para adultos" },
];

const formatMovieOptions: { value: string; label: string }[] = Object.values(
  FormatMovie
).map((format) => ({
  value: format,
  label: format,
}));

export const movieQuestions: Question[] = [
  {
    id: "title",
    label: "Titulo",
    type: "text",
    placeholder: "Titulo de la pelicula",
    required: true,
    validation: (value) => {
      if (value.length < 3) return "El titulo debe tener al menos 3 caracteres";
      return undefined;
    },
  },
  {
    id: "genre",
    label: "Genero",
    type: "textarea",
    placeholder: "Generos de la pelicula, separados por coma",
    required: true,
    validation: (value) => {
      if (value.length < 3) return "El genero debe tener al menos 3 caracteres";
      return undefined;
    },
  },
  {
    id: "duration",
    label: "Duracion",
    type: "number",
    placeholder: "Duracion de la pelicula",
    required: true,
    validation: (value) => {
      if (parseInt(value) <= 0) return "La duracion debe ser mayor que 0";
      return;
    },
  },
  {
    id: "classification",
    label: "Clasificacion",
    type: "select",
    placeholder: "Clasificacion de la pelicula",
    options: movieClassifications,
    required: true,
  },
  {
    id: "format",
    label: "Formato",
    type: "select",
    placeholder: "Formato de la pelicula",
    options: formatMovieOptions,
    required: true,
  },
];
