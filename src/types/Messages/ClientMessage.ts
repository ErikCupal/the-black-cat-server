import { Card, Grills, HandOver } from '../Cards'
import { Name } from '../Name'
import { NonregisteredPlayer, Player } from '../Player'

/**
 * Contains all message types
 * that client can send
 */
type ClientMessage =

  | CONNECT
  | DISCONNECT
  | REGISTER
  
  | CREATE_ROOM
  | JOIN_ROOM
  | LEAVE_ROOM
  | ADD_BOT

  | PLAY_HAND_OVER
  | TAKE_HANDOVER
  | PLAY_GRILL
  | PLAY_CARD

  | DECK_DEALT
  | I_AM_READY
  | I_WANT_NEW_GAME

  | GET_ROOMS
  | SEND_CHAT_MESSAGE

export const CONNECT = 'connect'
export const DISCONNECT = 'disconnect'
export const REGISTER = 'REGISTER'

export const CREATE_ROOM = 'CREATE_ROOM'
export const JOIN_ROOM = 'JOIN_ROOM'
export const LEAVE_ROOM = 'LEAVE_ROOM'
export const ADD_BOT = 'ADD_BOT'

export const PLAY_HAND_OVER = 'PLAY_HAND_OVER'
export const TAKE_HANDOVER = 'TAKE_HANDOVER'
export const PLAY_GRILL = 'PLAY_GRILL'
export const PLAY_CARD = 'PLAY_CARD'

export const DECK_DEALT = 'DECK_DEALT'
export const I_AM_READY = 'I_AM_READY'
export const I_WANT_NEW_GAME = 'I_WANT_NEW_GAME'

export const GET_ROOMS = 'GET_ROOMS'
export const SEND_CHAT_MESSAGE = 'SEND_CHAT_MESSAGE'

export type CONNECT = NONREGISTERED_PLAYER & { type: typeof CONNECT }
export type DISCONNECT = NONREGISTERED_PLAYER & { type: typeof DISCONNECT }
export type REGISTER = NONREGISTERED_PLAYER & { type: typeof REGISTER, name: Name }

export type CREATE_ROOM = PLAYER & { type: typeof CREATE_ROOM, name: Name }
export type JOIN_ROOM = PLAYER & { type: typeof JOIN_ROOM, name: Name }
export type LEAVE_ROOM = PLAYER & { type: typeof LEAVE_ROOM }
export type ADD_BOT = PLAYER & { type: typeof ADD_BOT }

export type PLAY_HAND_OVER = PLAYER & { type: typeof PLAY_HAND_OVER, handOver: HandOver }
export type TAKE_HANDOVER = PLAYER & { type: typeof TAKE_HANDOVER }
export type PLAY_GRILL = PLAYER & { type: typeof PLAY_GRILL, grill: Grills }
export type PLAY_CARD = PLAYER & { type: typeof PLAY_CARD, card: Card }

export type DECK_DEALT = PLAYER & { type: typeof DECK_DEALT }
export type I_AM_READY = PLAYER & { type: typeof I_AM_READY }
export type I_WANT_NEW_GAME = PLAYER & { type: typeof I_WANT_NEW_GAME }

export type GET_ROOMS = PLAYER & { type: typeof GET_ROOMS }
export type SEND_CHAT_MESSAGE = PLAYER & { type: typeof SEND_CHAT_MESSAGE, text: string }

/** Helper type. It guarantees that there is attached [Player] object to the message */
export type PLAYER = { player: Player }
/** Helper type. It guarantees that there is attached [NonregisteredPlayer] object to the message */
export type NONREGISTERED_PLAYER = { player: NonregisteredPlayer }

export default ClientMessage