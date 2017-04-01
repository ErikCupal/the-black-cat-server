import { MessageHandlersDI } from '../'
import {
  CONNECT,
  CREATE_ROOM,
  DISCONNECT,
  GET_ROOMS,
  JOIN_ROOM,
  LEAVE_ROOM,
  REGISTER
} from '../../types/Messages/ClientMessage'
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
import { Name } from '../../types/Name'
import { Bot, Player } from '../../types/Player'
import { Room } from '../../types/Room'

export const createConnectionMessageHandlers = (di: MessageHandlersDI) => {

  const {
    log,
    dispatch,
    playerCanRegister,
    getRoomNamesAndAvailability,
    getAllPlayers,
    playerCanCreateRoom,
    createRoom,
    playerCanJoinRoom,
    findRoom,
    getPlayersInRoom,
    createBot,
    isRealPlayerInRoom,
  } = di

  const sendAllPlayersRoomsList = () => {
    const rooms = getRoomNamesAndAvailability()
    getAllPlayers().forEach(player => {
      player.send({ type: AVAILABLE_ROOMS, rooms })
    })
  }

  const replacePlayerWithBot = (player: Player, room: Room) => {
    const bot: Bot = createBot(player as Player)
    dispatch({ type: STATE_REPLACE_PLAYER_WITH_BOT, player: player.name as string, bot })

    room.send({ type: PLAYER_REPLACED_WITH_BOT, player: player.name as string, bot: bot.name })

    bot.hookIntoGame()
  }

  const resetPlayerCardsAndFlags = (playerName: string) => {
    dispatch({ type: STATE_REMOVE_PLAYER_CARDS, player: playerName })
    dispatch({ type: STATE_SET_PLAYER_PASSED_HANDOVER, player: playerName, value: false })
    dispatch({ type: STATE_SET_PLAYER_SHOULD_PASS_HANDOVER, player: playerName, value: false })
    dispatch({ type: STATE_SET_PLAYER_WANTS_NEW_GAME, player: playerName, value: true })
    dispatch({ type: STATE_SET_PLAYER_WAIT_FOR_ME, player: playerName, value: false })
  }

  const removeRoom = (roomName: Name) => {
    const botsInRoom = getPlayersInRoom(roomName)
      .filter(p => p.isBot)
    botsInRoom.forEach(player => {
      dispatch({ type: STATE_REMOVE_PLAYER, id: player.id })
    })
    dispatch({ type: STATE_REMOVE_GAME, room: roomName })
    dispatch({ type: STATE_REMOVE_ROOM, room: roomName })

    log(`❌🎮 Room ${roomName} removed.`)

    sendAllPlayersRoomsList()
  }

  const onConnect = ({ player }: CONNECT) => {
    log(`🐵 New player with id ${player.id}.`)
  }

  const onDisconnect = ({ player }: DISCONNECT) => {
    log(`🙉 Player ${player.name ? player.name : 'without name and'} with id ${player.id} disconnected.`)

    const room = player.room()
    if (room) {
      if (isRealPlayerInRoom(room.name)) {
        replacePlayerWithBot(player as Player, room)
      } else {
        removeRoom(room.name)
      }
    }

    dispatch({ type: STATE_REMOVE_PLAYER, id: player.id })
  }

  const onRegister = ({ player, name }: REGISTER) => {
    if (playerCanRegister(player, name)) {
      dispatch({ type: STATE_PLAYER_CHANGE_NAME, player: player as Player, name })
      player.send({ type: REGISTERED, name })
      const rooms = getRoomNamesAndAvailability()
      player.send({ type: AVAILABLE_ROOMS, rooms })
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

      sendAllPlayersRoomsList()
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

      sendAllPlayersRoomsList()

      dispatch({ type: LOGIC_PLAYER_JOINED_ROOM, roomName: room, name })
    }
  }

  const onLeaveRoom = ({ player }: LEAVE_ROOM) => {
    const room = player.room()
    if (room) {
      if (isRealPlayerInRoom(room.name)) {
        replacePlayerWithBot(player as Player, room)
      } else {
        removeRoom(room.name)
      }

      resetPlayerCardsAndFlags(player.name)
    }
  }

  const onGetRooms = ({ player }: GET_ROOMS) => {
    const rooms = getRoomNamesAndAvailability()
    player.send({ type: AVAILABLE_ROOMS, rooms })
  }

  return {
    onConnect,
    onDisconnect,
    onRegister,
    onCreateRoom,
    onJoinRoom,
    onLeaveRoom,
    onGetRooms,
  }
}