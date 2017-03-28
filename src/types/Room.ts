import { Game } from './Game'
import { PlayerScore } from './PlayerScore'
import { Name } from './Name'
import ServerMessage from '../types/Messages/ServerMessage'

export interface Room {
  readonly name: Name
  readonly players: Name[]
  readonly scores: PlayerScore[]
  readonly gameStartingPlayer?: Name

  /** Send socket message to all clients in the room */ 
  readonly send: (message: ServerMessage) => void
  /** @returns the current game of the room or undefined if there is none */
  readonly game: () => Game | undefined
}