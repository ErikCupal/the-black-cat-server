import { Core, Dispatch } from '../core'
import { Logger, Seconds } from '../functions'
import {
  ADD_BOT,
  CONNECT,
  CREATE_ROOM,
  DECK_DEALT,
  DISCONNECT,
  GET_ROOMS,
  I_AM_READY,
  I_WANT_NEW_GAME,
  JOIN_ROOM,
  LEAVE_ROOM,
  PLAY_CARD,
  PLAY_GRILL,
  PLAY_HAND_OVER,
  REGISTER,
  SEND_CHAT_MESSAGE,
  TAKE_HANDOVER
} from '../types/messages/ClientMessage'
import {
  LOGIC_FINISH_ROUND,
  LOGIC_GAME_END,
  LOGIC_GAME_START,
  LOGIC_NEXT_ROUND,
  LOGIC_PLAYER_JOINED_ROOM,
  LOGIC_PLAYERS_READY,
  LOGIC_ROOM_END,
  LOGIC_ROOM_START
} from '../types/messages/LogicMessage'
import { Bot, Player } from '../types/Player'
import { createStateDependantFunctions, StateDependantFunctions } from './functions/stateDependantFunctions'
import { createCommonMessageHandlers } from './messageHandlers/common'
import { createConnectionMessageHandlers } from './messageHandlers/connection'
import { createGameMessageHandlers } from './messageHandlers/game'
import { createRoomMessageHandlers } from './messageHandlers/room'
import { createRoundMessageHandlers } from './messageHandlers/round'

/**
 * Dependency injection for message handlers
 */
export type MessageHandlersDI =
  StateDependantFunctions
  & {
    dispatch: Dispatch
    log: Logger
    seconds: Seconds,
    createBot: (player: Player) => Bot
  }

/**
 * Creates message handlers with dependency injection and attaches them
 * to corresponding message types
 */
export const configureMessageHandlers = (core: Core, log: Logger, seconds: Seconds) => {

  // Create dependency injection

  const { dispatch, getState, messageOfType } = core
  const stateDependantFunctions = createStateDependantFunctions(getState)
  const createBot = stateDependantFunctions.botCreatorFactory(dispatch, seconds, log)

  const di: MessageHandlersDI = {
    ...stateDependantFunctions,
    dispatch,
    log,
    seconds,
    createBot,
  }

  // Create message handlers with injected dependencies

  const handlers = {
    ...createCommonMessageHandlers(di),
    ...createConnectionMessageHandlers(di),
    ...createGameMessageHandlers(di),
    ...createRoomMessageHandlers(di),
    ...createRoundMessageHandlers(di),
  }

  // Subscribe the message handlers to corresponding message types

  const configuration = {
    [CONNECT]: handlers.onConnect,
    [DISCONNECT]: handlers.onDisconnect,
    [REGISTER]: handlers.onRegister,
    [GET_ROOMS]: handlers.onGetRooms,
    [CREATE_ROOM]: handlers.onCreateRoom,
    [JOIN_ROOM]: handlers.onJoinRoom,
    [LEAVE_ROOM]: handlers.onLeaveRoom,
    [ADD_BOT]: handlers.onAddBot,
    [SEND_CHAT_MESSAGE]: handlers.onSendChatMessage,

    [PLAY_HAND_OVER]: handlers.onPlayHandOver,
    [TAKE_HANDOVER]: handlers.onTakeHandOver,
    [PLAY_GRILL]: handlers.onPlayGrill,
    [PLAY_CARD]: handlers.onPlayCard,
    [DECK_DEALT]: handlers.onPlayerDeckDealt,
    [I_AM_READY]: handlers.onPlayerIsReady,
    [I_WANT_NEW_GAME]: handlers.onPlayerWantsNewGame,

    [LOGIC_PLAYER_JOINED_ROOM]: handlers.onPlayerJoinedRoom,
    [LOGIC_ROOM_START]: handlers.onRoomStart,
    [LOGIC_GAME_START]: handlers.onGameStart,
    [LOGIC_PLAYERS_READY]: handlers.onPlayersReady,
    [LOGIC_NEXT_ROUND]: handlers.onNextRound,
    [LOGIC_FINISH_ROUND]: handlers.onFinishRound,
    [LOGIC_GAME_END]: handlers.onGameEnd,
    [LOGIC_ROOM_END]: () => handlers.onLeaveRoom,
  }

  Object.entries(configuration)
    .forEach(([key, fn]) => {
      messageOfType(key).subscribe(fn)
    })
}