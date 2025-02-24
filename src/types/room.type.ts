import { Seat } from "./seats.type";
export type Room = {
  id: number;
  name: string;
  capacity: number;
  break_time: number;
  seats: Seat[];
};

export type RoomForm = {
  name: string;
  capacity: number;
  break_time: number;
};
