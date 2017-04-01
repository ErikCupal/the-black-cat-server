import { Game } from './Game'
import { Player } from './Player'
import { Room } from './Room'

/**  Game state */
export interface State {
  readonly rooms: Room[]
  readonly players: Player[]
  readonly games: Game[]
}