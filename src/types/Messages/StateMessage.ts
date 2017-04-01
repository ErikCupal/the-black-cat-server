/* tslint:disable:class-name */
import { Card, Grills, HandOver, Trick } from '../Cards'
import { Id } from '../Id'
import { Name } from '../Name'
import { NonregisteredPlayer, Player } from '../Player'
import { Room } from '../Room'

/**
 * Contains all message types
 * that can be dispatched in order to create
 * a new version of the game state
 */
export type StateMessage =

  | STATE_CREATE_NEW_PLAYER
  | STATE_REMOVE_PLAYER
  | STATE_ADD_ROOM
  | STATE_REMOVE_ROOM
  | STATE_ADD_PLAYER_TO_ROOM
  | STATE_REPLACE_PLAYER_WITH_BOT
  | STATE_ADD_BOT
  | STATE_CREATE_GAME
  | STATE_REMOVE_GAME
  | STATE_REMOVE_PLAYER_CARDS
  | STATE_CARDS_TO_HAND
  | STATE_PLAYER_CHANGE_NAME
  | STATE_SET_GAME_STARTING_PLAYER

  | STATE_SET_PLAYER_WAIT_FOR_ME
  | STATE_SET_PLAYER_SHOULD_PASS_HANDOVER
  | STATE_SET_PLAYER_PASSED_HANDOVER
  | STATE_SET_PLAYER_WANTS_NEW_GAME

  | STATE_PASS_HANDOVER
  | STATE_TAKE_HANDOVER
  | STATE_PASS_GRILL
  | STATE_PLAY_CARD
  | STATE_PASS_TRICK

  | STATE_NEXT_ROUND
  | STATE_NEXT_TURN
  | STATE_CREATE_GRILLS_SNAPSHOT
  | STATE_ADD_SCORES

export const STATE_CREATE_NEW_PLAYER = 'STATE_CREATE_NEW_PLAYER'
export const STATE_REMOVE_PLAYER = 'STATE_REMOVE_PLAYER'
export const STATE_ADD_ROOM = 'STATE_ADD_ROOM'
export const STATE_REMOVE_ROOM = 'STATE_REMOVE_ROOM'
export const STATE_ADD_PLAYER_TO_ROOM = 'STATE_ADD_PLAYER_TO_ROOM'
export const STATE_REPLACE_PLAYER_WITH_BOT = 'STATE_REPLACE_PLAYER_WITH_BOT'
export const STATE_ADD_BOT = 'STATE_ADD_BOT'
export const STATE_CREATE_GAME = 'STATE_CREATE_GAME'
export const STATE_REMOVE_GAME = 'STATE_REMOVE_GAME'
export const STATE_REMOVE_PLAYER_CARDS = 'STATE_REMOVE_PLAYER_CARDS'
export const STATE_CARDS_TO_HAND = 'STATE_CARDS_TO_HAND'
export const STATE_PLAYER_CHANGE_NAME = 'STATE_PLAYER_CHANGE_NAME'
export const STATE_SET_GAME_STARTING_PLAYER = 'STATE_SET_GAME_STARTING_PLAYER'

export const STATE_SET_PLAYER_WAIT_FOR_ME = 'STATE_SET_PLAYER_WAIT_FOR_ME'
export const STATE_SET_PLAYER_SHOULD_PASS_HANDOVER = 'STATE_SET_PLAYER_SHOULD_PASS_HANDOVER'
export const STATE_SET_PLAYER_PASSED_HANDOVER = 'STATE_SET_PLAYER_PASSED_HANDOVER'
export const STATE_SET_PLAYER_WANTS_NEW_GAME = 'STATE_SET_PLAYER_WANTS_NEW_GAME'

export const STATE_PASS_HANDOVER = 'STATE_PASS_HANDOVER'
export const STATE_PASS_GRILL = 'STATE_PASS_GRILL'
export const STATE_TAKE_HANDOVER = 'STATE_TAKE_HANDOVER'
export const STATE_PLAY_CARD = 'STATE_PLAY_CARD'
export const STATE_PASS_TRICK = 'STATE_PASS_TRICK'

export const STATE_NEXT_ROUND = 'STATE_NEXT_ROUND'
export const STATE_NEXT_TURN = 'STATE_NEXT_TURN'
export const STATE_CREATE_GRILLS_SNAPSHOT = 'STATE_CREATE_GRILLS_SNAPSHOT'
export const STATE_ADD_SCORES = 'STATE_ADD_SCORES'

export interface STATE_CREATE_NEW_PLAYER { type: typeof STATE_CREATE_NEW_PLAYER, player: NonregisteredPlayer }
export interface STATE_REMOVE_PLAYER { type: typeof STATE_REMOVE_PLAYER, id: Id }
export interface STATE_ADD_ROOM { type: typeof STATE_ADD_ROOM, room: Room }
export interface STATE_REMOVE_ROOM { type: typeof STATE_REMOVE_ROOM, room: Name }
export interface STATE_ADD_PLAYER_TO_ROOM { type: typeof STATE_ADD_PLAYER_TO_ROOM, name: Name, room: Name }
export interface STATE_REPLACE_PLAYER_WITH_BOT { type: typeof STATE_REPLACE_PLAYER_WITH_BOT, player: Name, bot: Player }
export interface STATE_ADD_BOT { type: typeof STATE_ADD_BOT, bot: Player, room: Name }
export interface STATE_CREATE_GAME { type: typeof STATE_CREATE_GAME, room: Name, playerOnTurn: Name }
export interface STATE_REMOVE_GAME { type: typeof STATE_REMOVE_GAME, room: Name }
export interface STATE_REMOVE_PLAYER_CARDS { type: typeof STATE_REMOVE_PLAYER_CARDS, player: Name }
export interface STATE_CARDS_TO_HAND { type: typeof STATE_CARDS_TO_HAND, player: Name, cards: Card[] }
export interface STATE_PLAYER_CHANGE_NAME { type: typeof STATE_PLAYER_CHANGE_NAME, player: Player, name: Name }
export interface STATE_SET_GAME_STARTING_PLAYER {
  type: typeof STATE_SET_GAME_STARTING_PLAYER,
  room: Name,
  player: Name,
}

export interface STATE_SET_PLAYER_WAIT_FOR_ME {
  type: typeof STATE_SET_PLAYER_WAIT_FOR_ME,
  player: Name,
  value: boolean,
}
export interface STATE_SET_PLAYER_SHOULD_PASS_HANDOVER {
  type: typeof STATE_SET_PLAYER_SHOULD_PASS_HANDOVER,
  player: Name, value: boolean,
}
export interface STATE_SET_PLAYER_PASSED_HANDOVER {
  type: typeof STATE_SET_PLAYER_PASSED_HANDOVER,
  player: Name, value: boolean,
}
export interface STATE_SET_PLAYER_WANTS_NEW_GAME {
  type: typeof STATE_SET_PLAYER_WANTS_NEW_GAME,
  player: Name, value: boolean,
}

export interface STATE_PASS_HANDOVER { type: typeof STATE_PASS_HANDOVER, handOver: HandOver, from: Name, to: Name }
export interface STATE_PASS_GRILL { type: typeof STATE_PASS_GRILL, grill: Grills, player: Name }
export interface STATE_TAKE_HANDOVER { type: typeof STATE_TAKE_HANDOVER, player: Name }
export interface STATE_PLAY_CARD { type: typeof STATE_PLAY_CARD, player: Player, card: Card }
export interface STATE_PASS_TRICK { type: typeof STATE_PASS_TRICK, receiver: Player, trick: Trick }

export interface STATE_NEXT_ROUND { type: typeof STATE_NEXT_ROUND, room: Room, playerOnTurn?: Name }
export interface STATE_NEXT_TURN { type: typeof STATE_NEXT_TURN, room: Name, playerOnTurn: Name }
export interface STATE_CREATE_GRILLS_SNAPSHOT {
  type: typeof STATE_CREATE_GRILLS_SNAPSHOT,
  roomName: Name, grills: Grills,
}
export interface STATE_ADD_SCORES {
  type: typeof STATE_ADD_SCORES,
  room: Name, gameScores: { player: Name, points: number }[],
}