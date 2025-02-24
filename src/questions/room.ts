import { Question } from "../components/form";

export const roomQuestions: Question[] = [
  {
    id: "name",
    label: "Nombre",
    type: "text",
    placeholder: "Nombre de la sala",
    required: true,
    validation: (value) => {
      if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres';
      return undefined;
    }
  },
  {
    id: "capacity",
    label: "Capacidad",
    type: "number",
    placeholder: "Capacidad de la sala",
    required: true,
    validation: (value) => {
      if (parseInt(value) <= 0) return 'La capacidad debe ser mayor que 0';
      return
    }
  },
  {
    id: "break_time",
    label: "Tiempo de descanso",
    type: "number",
    placeholder: "Tiempo de descanso de la sala",
    required: true,
    validation: (value) => {
      if (parseInt(value) <= 0) return 'El tiempo de descanso debe ser mayor que 0';
      return
    }
  },
];