import { Card, Grills, Hand, HandOver } from '../Cards'
import { Name } from '../Name'
import { PlayerScore } from '../PlayerScore'

/**
 * Contains all message types
 * that the server can send to clients
 */
type ServerMessage =

  | CONNECTION_CONFIRMATION
  | SERVER_FULL

  | REGISTERED
  | NAME_TAKEN

  | ROOM_CREATED
  | ROOM_NAME_TAKEN
  | ROOM_JOINED
  | ROOM_FULL
  | ROOM_LEFT
  | PLAYER_JOINED
  | PLAYER_REPLACED_WITH_BOT

  | GAME_STARTED
  | GAME_ENDED

  | NEXT_ROUND
  | NEXT_TURN

  | DEAL_DECK
  | DO_PASS_HANDOVER
  | DO_TAKE_HANDOVER

  | HAND_OVER_PLAYED
  | HAND_OVER_TAKEN
  | GRILL_PLAYED
  | CARD_PLAYED
  | TRICK_FINISHED

  | AVAILABLE_ROOMS
  | UPDATED_SCORES
  | CHAT_MESSAGE

export const CONNECTION_CONFIRMATION = 'CONNECTION_CONFIRMATION'
export const SERVER_FULL = 'SERVER_FULL'

export const REGISTERED = 'REGISTERED'
export const NAME_TAKEN = 'NAME_TAKEN'

export const ROOM_CREATED = 'ROOM_CREATED'
export const ROOM_NAME_TAKEN = 'ROOM_NAME_TAKEN'
export const ROOM_JOINED = 'ROOM_JOINED'
export const ROOM_FULL = 'ROOM_FULL'
export const ROOM_LEFT = 'ROOM_LEFT'
export const PLAYER_JOINED = 'PLAYER_JOINED'
export const PLAYER_REPLACED_WITH_BOT = 'PLAYER_REPLACED_WITH_BOT'

export const GAME_STARTED = 'GAME_STARTED'
export const GAME_ENDED = 'GAME_ENDED'

export const NEXT_ROUND = 'NEXT_ROUND'
export const NEXT_TURN = 'NEXT_TURN'

export const DEAL_DECK = 'DEAL_DECK'
export const DO_PASS_HANDOVER = 'DO_PASS_HANDOVER'
export const DO_TAKE_HANDOVER = 'DO_TAKE_HANDOVER'

export const HAND_OVER_PLAYED = 'HAND_OVER_PLAYED'
export const HAND_OVER_TAKEN = 'HAND_OVER_TAKEN'
export const GRILL_PLAYED = 'GRILL_PLAYED'
export const CARD_PLAYED = 'CARD_PLAYED'
export const TRICK_FINISHED = 'TRICK_FINISHED'

export const AVAILABLE_ROOMS = 'AVAILABLE_ROOMS'
export const UPDATED_SCORES = 'UPDATED_SCORES'
export const CHAT_MESSAGE = 'CHAT_MESSAGE'

export type CONNECTION_CONFIRMATION = { type: typeof CONNECTION_CONFIRMATION }
export type SERVER_FULL = { type: typeof SERVER_FULL }

export type REGISTERED = { type: typeof REGISTERED, name: Name }
export type NAME_TAKEN = { type: typeof NAME_TAKEN }

export type ROOM_CREATED = { type: typeof ROOM_CREATED, name: Name }
export type ROOM_NAME_TAKEN = { type: typeof ROOM_NAME_TAKEN }
export type ROOM_JOINED = { type: typeof ROOM_JOINED, name: Name, players: Name[] }
export type ROOM_FULL = { type: typeof ROOM_FULL }
export type ROOM_LEFT = { type: typeof ROOM_LEFT }
export type PLAYER_JOINED = { type: typeof PLAYER_JOINED, player: Name }
export type PLAYER_REPLACED_WITH_BOT = { type: typeof PLAYER_REPLACED_WITH_BOT, player: Name, bot: Name }

export type GAME_STARTED = { type: typeof GAME_STARTED }
export type GAME_ENDED = { type: typeof GAME_ENDED }

export type NEXT_ROUND = { type: typeof NEXT_ROUND }
export type NEXT_TURN = { type: typeof NEXT_TURN, playerOnTurn: Name }

export type DEAL_DECK = { type: typeof DEAL_DECK, hand: Hand }
export type DO_PASS_HANDOVER = { type: typeof DO_PASS_HANDOVER }
export type DO_TAKE_HANDOVER = { type: typeof DO_TAKE_HANDOVER, handOver: HandOver }

export type HAND_OVER_PLAYED = { type: typeof HAND_OVER_PLAYED, from: Name }
export type HAND_OVER_TAKEN = { type: typeof HAND_OVER_TAKEN, player: Name }
export type GRILL_PLAYED = { type: typeof GRILL_PLAYED, player: Name, grill: Grills }
export type CARD_PLAYED = { type: typeof CARD_PLAYED, player: Name, card: Card, cardFromGrill: boolean }
export type TRICK_FINISHED = { type: typeof TRICK_FINISHED, receiver: Name }

export type AVAILABLE_ROOMS = { type: typeof AVAILABLE_ROOMS, rooms: { name: Name, available: boolean }[] }
export type UPDATED_SCORES = { type: typeof UPDATED_SCORES, scores: { player: Name, points: number }[] }
export type CHAT_MESSAGE = { type: typeof CHAT_MESSAGE, text: string, player: Name }

export default ServerMessage