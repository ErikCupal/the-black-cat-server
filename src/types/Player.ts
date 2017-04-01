import { ServerMessage } from '../types/Messages/ServerMessage'
import { Game } from './Game'
import { Room } from './Room'
import { Grills, Hand, HandOver, Pile } from './Cards'
import { Name } from './Name'
import { Id } from './Id'

/** Player without name */
export interface NonregisteredPlayer {
  readonly id: Id
  readonly name?: Name

  readonly hand: Hand
  readonly handOver: HandOver
  readonly grills: Grills
  readonly pile: Pile

  readonly isBot?: boolean

  readonly waitForMe?: boolean
  readonly shouldPassHandOver?: boolean
  readonly didPassedHandOver?: boolean
  readonly wantsNewGame?: boolean

  /** Returns the player's room or undefined if there is none */
  readonly room: () => Room | undefined
  /** Returns the player's game or undefined if there is none */
  readonly game: () => Game | undefined

  /** Send socket message to the client */
  readonly send: (message: ServerMessage) => void
  /** Send socket message to other clients in the same room */
  readonly sendToOthers: (message: ServerMessage) => void
  /** Send socket message to the client and to other clients in the same room */  
  readonly sendToAll: (message: ServerMessage) => void
}

/** Registered player with name */
export interface Player extends NonregisteredPlayer {
  readonly name: Name
}

/** Acts as registered player. */
export interface Bot extends Player {
  readonly isBot: true
  /**
   * Hooks the bot into current game.
   * It makes the bot recognize in which stage the game is
   * and act accordingly.
   */
  readonly hookIntoGame: () => void
}