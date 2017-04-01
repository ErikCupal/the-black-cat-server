import { NonregisteredPlayer } from '../types/Player'
import { ClientMessage } from '../types/Messages/ClientMessage'

/** Checks whether socket message received from client is safe */
const isSafeMessage = (message: ClientMessage, player: NonregisteredPlayer) => {

  const isSafe =
    message
    && message.type
    && message.type.search(/^LOGIC_[\w]*$/) === -1
    && message.type.search(/^STATE_[\w]*$/) === -1
    && message.type.search(/^\$_[\w]*$/) === -1
    && (typeof player.name === 'string' || message.type === 'REGISTER')

  return isSafe
}

export default isSafeMessage