import isSafeMessage from './isSafeMessage'
import { LogicMessage } from '../types/Messages/LogicMessage'
import { State } from '../types/State'
import ClientMessage, { CONNECT, DISCONNECT } from '../types/Messages/ClientMessage'
import { STATE_CREATE_NEW_PLAYER } from '../types/Messages/StateMessage'
import { Name } from '../types/Name'
import { Id } from '../types/Id'
import ServerMessage from '../types/Messages/ServerMessage'
import { Store } from 'redux'
import { Subject } from 'rxjs'

/** An event type used for [Socket.IO](https://socket.io/) communication betweeen server and client */
const MESSAGE = 'MESSAGE'

const onSocketConnect = (
  socket: SocketIO.Socket,
  store: Store<State>,
  subject: Subject<ClientMessage>
) => {

  const send = (message: ServerMessage) => {
    socket.emit(MESSAGE, message)
  }

  const getPlayerById = (id: Id) => store.getState().players.find(player => player.id === id)
  const getPlayerByName = (name: Name) => store.getState().players.find(player => player.name === name)
  const getRoomByPlayerName = (name: Name) => store.getState().rooms
    .find(room => !!room.players.find(playerName => playerName === name))
  const getGameByRoomName = (name: Name) => store.getState().games.find(game => game.room === name)

  const sendToOthers = (message: ServerMessage) => {
    const player = getPlayerById(socket.id)
    if (player) {
      const room = getRoomByPlayerName(player.name)
      if (room) {
        room.players.forEach(playerName => {
          if (player.name !== playerName) {
            const _player = getPlayerByName(playerName)
            _player && _player.send(message)
          }
        })
      }
    }
  }

  const sendToAll = (message: ServerMessage) => {
    const player = getPlayerById(socket.id)
    if (player) {
      const room = getRoomByPlayerName(player.name)
      if (room) {
        room.players.forEach(playerName => {
          const _player = getPlayerByName(playerName)
          _player && _player.send(message)
        })
      }
    }
  }

  const room = () => {
    const _player = getPlayerById(socket.id)
    if (_player) {
      const room = getRoomByPlayerName(_player.name)
      return room
    }
    return undefined
  }

  const game = () => {
    const _player = getPlayerById(socket.id)
    if (_player) {
      const room = getRoomByPlayerName(_player.name)
      if (room) {
        const game = getGameByRoomName(room.name)
        return game
      }
    }
    return undefined
  }

  const createdPlayer = {
    id: socket.id,
    hand: [],
    handOver: [],
    grills: [],
    pile: [],

    wantsNewGame: true,

    room,
    game,

    send,
    sendToOthers,
    sendToAll,
  }

  store.dispatch({
    type: STATE_CREATE_NEW_PLAYER,
    player: createdPlayer,
  })

  socket.on(MESSAGE, (stringifiedMessage: string | object | undefined) => {
    if (typeof stringifiedMessage === 'string' && stringifiedMessage.length <= 20000) {
      const player = store.getState().players.find(player => player.id === socket.id)
      if (player) {
        const message = JSON.parse(stringifiedMessage)

        if (isSafeMessage(message, player)) {
          subject.next({
            player,
            ...message
          })
        }
      }
    }
  })

  socket.on(DISCONNECT, () => {
    const player = store.getState().players.find(player => player.id === socket.id)
    if (player) {
      subject.next({ type: DISCONNECT, player })
    }
  })

  subject.next({
    type: CONNECT,
    player: createdPlayer,
  })

}

export default onSocketConnect