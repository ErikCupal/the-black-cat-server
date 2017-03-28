import { MessageHandlersDI } from '../'
import { CONNECT, CREATE_ROOM, DISCONNECT, JOIN_ROOM, LEAVE_ROOM, REGISTER } from '../../types/Messages/ClientMessage'
import { LOGIC_PLAYER_JOINED_ROOM } from '../../types/Messages/LogicMessage'
import {
  AVAILABLE_ROOMS,
  NAME_TAKEN,
  PLAYER_JOINED,
  PLAYER_REPLACED_WITH_BOT,
  REGISTERED,
  ROOM_CREATED,
  ROOM_JOINED,
  ROOM_NAME_TAKEN
} from '../../types/Messages/ServerMessage'
import {
  STATE_ADD_PLAYER_TO_ROOM,
  STATE_ADD_ROOM,
  STATE_PLAYER_CHANGE_NAME,
  STATE_REMOVE_GAME,
  STATE_REMOVE_PLAYER,
  STATE_REMOVE_PLAYER_CARDS,
  STATE_REMOVE_ROOM,
  STATE_REPLACE_PLAYER_WITH_BOT,
  STATE_SET_PLAYER_PASSED_HANDOVER,
  STATE_SET_PLAYER_SHOULD_PASS_HANDOVER,
  STATE_SET_PLAYER_WAIT_FOR_ME,
  STATE_SET_PLAYER_WANTS_NEW_GAME
} from '../../types/Messages/StateMessage'
import { Bot, Player } from '../../types/Player'
import { Room } from '../../types/Room'

export const createConnectionMessageHandlers = (di: MessageHandlersDI) => {

  const {
    log,
    dispatch,
    playerCanRegister,
    getRoomNames,
    playerCanCreateRoom,
    createRoom,
    getAllPlayers,
    playerCanJoinRoom,
    findRoom,
    getPlayersInRoom,
    createBot,
    findPlayer,
  } = di

  const onConnect = ({ player }: CONNECT) => {
    log(`🐵 New player with id ${player.id}.`)
  }

  const onDisconnect = ({ player }: DISCONNECT) => {
    log(`🙉 Player ${player.name ? player.name : 'without name and'} with id ${player.id} disconnected.`)

    const room = player.room()
    if (room) {
      // Player is in room
      const realPlayersInRoom = getPlayersInRoom(room.name).filter(p => !p.isBot)
      if (realPlayersInRoom.length > 1) {
        // Replace player with bot
        const bot: Bot = createBot(player as Player)
        dispatch({ type: STATE_REPLACE_PLAYER_WITH_BOT, player: player.name as string, bot })
        dispatch({ type: STATE_REMOVE_PLAYER, id: player.id })
        room.send({ type: PLAYER_REPLACED_WITH_BOT, player: player.name as string, bot: bot.name })

        bot.hookIntoGame()
      } else {
        // After the player leaves this room, there would be only bots
        // Therefore it is necessary to remove the room and all its bots
        getPlayersInRoom(room.name).forEach(player => {
          dispatch({ type: STATE_REMOVE_PLAYER, id: player.id })
        })
        dispatch({ type: STATE_REMOVE_GAME, room: room.name })
        dispatch({ type: STATE_REMOVE_ROOM, room: room.name })

        log(`❌🎮 Room ${room.name} removed.`)

        const roomNames = getRoomNames()
        getAllPlayers().forEach(player => {
          player.send({ type: AVAILABLE_ROOMS, roomNames })
        })
      }
    } else {
      dispatch({ type: STATE_REMOVE_PLAYER, id: player.id })
    }
  }

  const onRegister = ({ player, name }: REGISTER) => {
    if (playerCanRegister(player, name)) {
      dispatch({ type: STATE_PLAYER_CHANGE_NAME, player: player as Player, name })
      player.send({ type: REGISTERED, name })
      const roomNames = getRoomNames()
      player.send({ type: AVAILABLE_ROOMS, roomNames })
      log(`🐲 Player ${player.id} registered under name ${name}.`)
    } else {
      player.send({ type: NAME_TAKEN })
    }
  }

  const onCreateRoom = ({ player, name }: CREATE_ROOM) => {
    if (playerCanCreateRoom(name, player)) {
      const room = createRoom(name, player.name)
      dispatch({ type: STATE_ADD_ROOM, room })

      log(`🎮👌 Player ${player.name} created room ${name}.`)
      player.send({ type: ROOM_CREATED, name })

      const roomNames = getRoomNames()
      getAllPlayers().forEach(player => {
        player.send({ type: AVAILABLE_ROOMS, roomNames })
      })
    } else {
      player.send({ type: ROOM_NAME_TAKEN })
    }
  }

  const onJoinRoom = ({ player, name }: JOIN_ROOM) => {
    if (playerCanJoinRoom(name, player)) {
      dispatch({ type: STATE_ADD_PLAYER_TO_ROOM, name: player.name, room: name })
      log(`👌 Player ${player.name} joined room ${name}.`)

      const room = findRoom(name) as Room
      player.send({ type: ROOM_JOINED, name, players: room.players })
      player.sendToOthers({ type: PLAYER_JOINED, player: player.name })

      dispatch({ type: LOGIC_PLAYER_JOINED_ROOM, roomName: room, name })
    }
  }

  const onLeaveRoom = ({ player }: LEAVE_ROOM) => {
    const room = player.room()
    if (room) {
      const realPlayersInRoom = getPlayersInRoom(room.name).filter(p => !p.isBot)
      if (realPlayersInRoom.length > 1) {
        const bot: Bot = createBot(player)
        dispatch({ type: STATE_REPLACE_PLAYER_WITH_BOT, player: player.name as string, bot })

        dispatch({ type: STATE_REMOVE_PLAYER_CARDS, player: player.name })
        dispatch({ type: STATE_SET_PLAYER_PASSED_HANDOVER, player: player.name, value: false })
        dispatch({ type: STATE_SET_PLAYER_SHOULD_PASS_HANDOVER, player: player.name, value: false })
        dispatch({ type: STATE_SET_PLAYER_WANTS_NEW_GAME, player: player.name, value: true })
        dispatch({ type: STATE_SET_PLAYER_WAIT_FOR_ME, player: player.name, value: false })

        room.send({ type: PLAYER_REPLACED_WITH_BOT, player: player.name as string, bot: bot.name })

        bot.hookIntoGame()
      } else {
        getPlayersInRoom(room.name)
          .filter(({ name }) => name !== player.name)
          .forEach(player => {
            dispatch({ type: STATE_REMOVE_PLAYER, id: player.id })
          })
        dispatch({ type: STATE_REMOVE_GAME, room: room.name })
        dispatch({ type: STATE_REMOVE_ROOM, room: room.name })

        log(`❌🎮 Room ${room.name} removed.`)

        const roomNames = getRoomNames()
        getAllPlayers().forEach(player => {
          player.send({ type: AVAILABLE_ROOMS, roomNames })
        })
      }
    }
  }

  return {
    onConnect,
    onDisconnect,
    onRegister,
    onCreateRoom,
    onJoinRoom,
    onLeaveRoom,
  }
}