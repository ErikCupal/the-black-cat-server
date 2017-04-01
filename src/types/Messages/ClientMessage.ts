/* tslint:disable:class-name interface-name */
import { Card, Grills, HandOver } from '../Cards'
import { Name } from '../Name'
import { NonregisteredPlayer, Player } from '../Player'

/**
 * Contains all message types
 * that client can send
 */
export type ClientMessage =

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

export interface CONNECT extends NONREGISTERED_PLAYER { type: typeof CONNECT }
export interface DISCONNECT extends NONREGISTERED_PLAYER { type: typeof DISCONNECT }
export interface REGISTER extends NONREGISTERED_PLAYER { type: typeof REGISTER, name: Name }

export interface CREATE_ROOM extends PLAYER { type: typeof CREATE_ROOM, name: Name }
export interface JOIN_ROOM extends PLAYER { type: typeof JOIN_ROOM, name: Name }
export interface LEAVE_ROOM extends PLAYER { type: typeof LEAVE_ROOM }
export interface ADD_BOT extends PLAYER { type: typeof ADD_BOT }

export interface PLAY_HAND_OVER extends PLAYER { type: typeof PLAY_HAND_OVER, handOver: HandOver }
export interface TAKE_HANDOVER extends PLAYER { type: typeof TAKE_HANDOVER }
export interface PLAY_GRILL extends PLAYER { type: typeof PLAY_GRILL, grill: Grills }
export interface PLAY_CARD extends PLAYER { type: typeof PLAY_CARD, card: Card }

export interface DECK_DEALT extends PLAYER { type: typeof DECK_DEALT }
export interface I_AM_READY extends PLAYER { type: typeof I_AM_READY }
export interface I_WANT_NEW_GAME extends PLAYER { type: typeof I_WANT_NEW_GAME }

export interface GET_ROOMS extends PLAYER { type: typeof GET_ROOMS }
export interface SEND_CHAT_MESSAGE extends PLAYER { type: typeof SEND_CHAT_MESSAGE, text: string }

/** Helper type. It guarantees that there is attached [Player] object to the message */
export interface PLAYER { player: Player }
/** Helper type. It guarantees that there is attached [NonregisteredPlayer] object to the message */
export interface NONREGISTERED_PLAYER { player: NonregisteredPlayer }