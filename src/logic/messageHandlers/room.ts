import { Seconds } from '../../functions'
import { PLAYER_JOINED } from '../../types/messages/ServerMessage'
import { Bot } from '../../types/Player'
import { STATE_ADD_BOT, STATE_SET_PLAYER_WANTS_NEW_GAME } from '../../types/messages/StateMessage'
import { ADD_BOT, I_WANT_NEW_GAME } from '../../types/messages/ClientMessage'
import { MessageHandlersDI } from '../'
import { LOGIC_GAME_START, LOGIC_PLAYER_JOINED_ROOM, LOGIC_ROOM_START } from '../../types/messages/LogicMessage'
import { Room } from '../../types/Room'

export const createRoomMessageHandlers = (di: MessageHandlersDI) => {

  const { dispatch, findRoom, log, getPlayersInRoom, createBot, seconds } = di

  const onRoomStart = ({ name }: LOGIC_ROOM_START) => {
    dispatch({ type: LOGIC_GAME_START, roomName: name, newRoom: true })
  }

  const onPlayerWantsNewGame = ({ player }: I_WANT_NEW_GAME) => {
    const room = player.room()
    if (room) {
      dispatch({ type: STATE_SET_PLAYER_WANTS_NEW_GAME, player: player.name, value: true })

      const playersInRoom = getPlayersInRoom(room.name)
      if (playersInRoom.filter(p => p.wantsNewGame).length === 4) {
        playersInRoom.forEach(player => {
          dispatch({ type: STATE_SET_PLAYER_WANTS_NEW_GAME, player: player.name, value: false })
        })
        dispatch({ type: LOGIC_GAME_START, roomName: room.name })
      }
    }
  }

  const onPlayerJoinedRoom = ({ name }: LOGIC_PLAYER_JOINED_ROOM) => {
    const room = findRoom(name) as Room
    log(`👌 New player in ${name}! Total players: ${room.players.length}`)

    if (room.players.length === 4) {
      dispatch({ type: LOGIC_ROOM_START, name: room.name })
    }
  }

  const onAddBot = async ({ player }: ADD_BOT) => {
    const room = player.room()
    if (room && room.players.length < 4) {
      const bot: Bot = createBot(player)
      dispatch({ type: STATE_ADD_BOT, bot, room: room.name })
      room.send({ type: PLAYER_JOINED, player: bot.name })

      bot.hookIntoGame()

      await seconds(0)
      dispatch({ type: LOGIC_PLAYER_JOINED_ROOM, name: room.name })
    }
  }

  return {
    onRoomStart,
    onPlayerWantsNewGame,
    onPlayerJoinedRoom,
    onAddBot,
  }
}