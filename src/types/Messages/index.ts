import { ClientMessage } from './ClientMessage'
import { ServerMessage } from './ServerMessage'
import { LogicMessage } from './LogicMessage'
import { StateMessage } from './StateMessage'

/**
 * Contains all message types
 */
export type Message =

  | ClientMessage
  | ServerMessage
  | LogicMessage
  | StateMessage