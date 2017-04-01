/* tslint:disable:class-name */
import { Name } from '../Name'

/**
 * Contains all message types
 * that can be dispatched for inner
 * game communication
 */
export type LogicMessage =

  | LOGIC_PLAYER_JOINED_ROOM
  | LOGIC_ROOM_START
  | LOGIC_GAME_START
  | LOGIC_PLAYERS_READY
  | LOGIC_NEXT_ROUND
  | LOGIC_FINISH_ROUND
  | LOGIC_GAME_END

export const LOGIC_PLAYER_JOINED_ROOM = 'LOGIC_PLAYER_JOINED_ROOM'
export const LOGIC_ROOM_START = 'LOGIC_ROOM_START'
export const LOGIC_GAME_START = 'LOGIC_GAME_START'
export const LOGIC_PLAYERS_READY = 'LOGIC_PLAYERS_READY'
export const LOGIC_NEXT_ROUND = 'LOGIC_NEXT_ROUND'
export const LOGIC_FINISH_ROUND = 'LOGIC_FINISH_ROUND'
export const LOGIC_GAME_END = 'LOGIC_GAME_END'

export interface LOGIC_PLAYER_JOINED_ROOM { type: typeof LOGIC_PLAYER_JOINED_ROOM, name: Name }
export interface LOGIC_ROOM_START { type: typeof LOGIC_ROOM_START, name: Name }
export interface LOGIC_GAME_START { type: typeof LOGIC_GAME_START, roomName: Name, newRoom?: boolean }
export interface LOGIC_PLAYERS_READY { type: typeof LOGIC_PLAYERS_READY, roomName: Name }
export interface LOGIC_NEXT_ROUND { type: typeof LOGIC_NEXT_ROUND, roomName: Name }
export interface LOGIC_FINISH_ROUND { type: typeof LOGIC_FINISH_ROUND, roomName: Name }
export interface LOGIC_GAME_END { type: typeof LOGIC_GAME_END, roomName: Name }