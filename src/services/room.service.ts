import { Room, RoomForm } from "../types/room.type"
import { request } from "../utils/request"

const URL = 'http://localhost:8000/rooms'

export async function getRooms(): Promise<Room[]> {
  return request<Room[]>(`${URL}/`)
}

export async function getRoom(id: number): Promise<Room> {
  return request<Room>(`${URL}/${id}`)
}

export async function createRoom(room: RoomForm): Promise<Room> {
  return request<Room>(`${URL}/`, 'POST', room)
}

export async function updateRoom(room_id: number, room: RoomForm): Promise<Room> {
  return request<Room>(`${URL}/${room_id}`, 'PUT', room)
}

export async function deleteRoom(room_id: number): Promise<void> {
  return request<void>(`${URL}/${room_id}`, 'DELETE')
}