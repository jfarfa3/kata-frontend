import { FormatMovie } from "../enums/format.enum"

export type Movie = {
  id: number
  title: string
  genre: string
  duration: number
  classification: string
  format: FormatMovie
}

export type MovieForm = {
  title: string
  genre: string
  duration: number
  classification: string
  format: FormatMovie
}