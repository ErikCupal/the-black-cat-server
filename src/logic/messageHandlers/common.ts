import { MessageHandlersDI } from '../'
import { GET_ROOMS, SEND_CHAT_MESSAGE } from '../../types/messages/ClientMessage'
import { AVAILABLE_ROOMS, CHAT_MESSAGE } from '../../types/messages/ServerMessage'

export const createCommonMessageHandlers = ({ getRoomNames }: MessageHandlersDI) => {

  const onGetRooms = ({ player }: GET_ROOMS) => {
    const roomNames = getRoomNames()
    player.send({ type: AVAILABLE_ROOMS, roomNames })
  }

  const onSendChatMessage = ({ player, text }: SEND_CHAT_MESSAGE) => {
    if (text.length <= 3000) {
      player.sendToAll({ type: CHAT_MESSAGE, text, player: player.name })
    }
  }

  return {
    onGetRooms,
    onSendChatMessage,
  }
}