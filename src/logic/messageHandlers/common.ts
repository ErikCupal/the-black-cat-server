import { MessageHandlersDI } from '../'
import { GET_ROOMS, SEND_CHAT_MESSAGE } from '../../types/Messages/ClientMessage'
import { AVAILABLE_ROOMS, CHAT_MESSAGE } from '../../types/Messages/ServerMessage'

export const createCommonMessageHandlers = ({ getRoomNamesAndAvailability }: MessageHandlersDI) => {

  const onGetRooms = ({ player }: GET_ROOMS) => {
    const rooms = getRoomNamesAndAvailability()
    player.send({ type: AVAILABLE_ROOMS, rooms })
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