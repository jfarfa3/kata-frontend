import { useEffect, useState } from "react"
import { Room, RoomForm } from "../types/room.type"
import { getRooms, createRoom, updateRoom, deleteRoom } from "../services/room.service"
import { Form, Question } from "../components/form";
import { roomQuestions } from "../questions/room";
import { useNavigate } from "react-router-dom";

export default function RoomsPage() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [formQuestions, setFormQuestions] = useState<Question[]>(roomQuestions)
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    getRooms().then((data) => setRooms(data))
  }, [])

  const handleViewRoom = (id: number) => {
    navigate(`/rooms/${id}`)
  }

  const handleCreateRoom = (answers: { [key: string]: string }) => {
    const newRoom: RoomForm = {
      name: answers.name,
      capacity: parseInt(answers.capacity),
      break_time: parseInt(answers.break_time),
    }
    createRoom(newRoom).then((data) => {
      setRooms([...rooms, data])
    })
  }

  const handleUpdateRoom = (answers: { [key: string]: string }) => {
    if (!currentRoom) return

    const updatedRoom: RoomForm = {
      name: answers.name,
      capacity: parseInt(answers.capacity),
      break_time: parseInt(answers.break_time),
    }
    updateRoom(currentRoom.id, updatedRoom).then((data) => {
      const updatedRooms = rooms.map((room) => (room.id === data.id ? data : room))
      setRooms(updatedRooms)
      setFormQuestions(roomQuestions)
      setFormValues({})
      setCurrentRoom(null)
    })
  }

  const handleDeleteRoom = (id: number) => {
    deleteRoom(id).then(() => {
      const remainingRooms = rooms.filter((room) => room.id !== id)
      setRooms(remainingRooms)
    })
  }

  const handleEditRoom = (room: Room) => {
    const values = {
      name: room.name,
      capacity: room.capacity.toString(),
      break_time: room.break_time.toString(),
    }
    setFormQuestions(roomQuestions)
    setFormValues(values)
    setCurrentRoom(room)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Salas</h1>
      {rooms.length > 0 && (
        <ul className="space-y-4">
          {rooms.map((room) => (
            <li key={room.id} className="bg-white p-4 shadow rounded-lg">
              <div>
                <h2 className="text-lg font-bold">{room.name}</h2>
                <p>Capacidad: {room.capacity}</p>
                <p>Tiempo de descanso: {room.break_time}</p>
                {currentRoom && currentRoom.id === room.id && (
                  <span className="text-sm text-gray-500">Editando...</span>
                )}
              </div>
              <div className="space-x-2">
                {currentRoom && currentRoom.id === room.id ? (
                  <button
                    onClick={() => {
                      setFormQuestions(roomQuestions)
                      setFormValues({})
                      setCurrentRoom(null)
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer"
                  >
                    Cancelar
                  </button>
                ) : (
                  <button
                    onClick={() => handleEditRoom(room)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
                  >
                    Editar
                  </button>
                )}
                <button
                  onClick={() => handleDeleteRoom(room.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 cursor-pointer"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => handleViewRoom(room.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer"
                >
                  Ver sala
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Form
        title={currentRoom ? "Editar Sala" : "Crear Sala"}
        description={currentRoom
          ? "Por favor, complete el formulario a continuación para editar la sala"
          : "Por favor, complete el formulario a continuación para crear una nueva sala"
        }
        questions={formQuestions}
        onSubmit={currentRoom ? handleUpdateRoom : handleCreateRoom}
        initialValues={formValues}
      />
    </div>
  )
}