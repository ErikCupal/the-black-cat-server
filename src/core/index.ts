import { Name } from '../types/Name'
import { Id } from '../types/Id'
import { STATE_CREATE_NEW_PLAYER } from '../types/messages/StateMessage'
import ServerMessage from '../types/messages/ServerMessage'
import StateMessage from '../types/messages/StateMessage'
import { State } from '../types/State'
import { LogicMessage } from '../types/messages/LogicMessage'
import { CONNECT, default as ClientMessage, DISCONNECT } from '../types/messages/ClientMessage'
import { Subject, Observable } from 'rxjs'
import { createStore, Store, Reducer } from 'redux'
import isSafeMessage from './isSafeMessage'
import devToolsEnhancer from 'remote-redux-devtools'
import reducer from './reducer'

/** 
 * It is responsible for sending and receiving internal and socket messages and for providing current game state.
 * 
 * All game state is managed by [Redux](http://redux.js.org/).
 * Calling [[getState]] function returns the current version of game state.
 * This version of state is an immutable object. It means that you are guaranteed that the object
 * will not change (and you are not supposed to change it either!).
 * The only way to get new version of state is to call [[getState]] again.
 * A new version of state can be created by dispatching a message prefixed with `STATE_` via [[dispatch]].
 * This message is processed by so called `reducer`. A reducer is simply a pure function that
 * takes state and message and returns new version of state,
 * which can be then obtained via [[getState]] function.
 * Basically, it behaves like polling database. Read more about Redux architecture [here](http://redux.js.org/).
 */
export interface Core {
  /** @returns current version of state */
  getState: () => State
  /**
   * @param type Message type to filter.
   * @returns An [Observable](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html) of filtered messages.
   */
  messageOfType: (type: string) => Observable<ClientMessage | LogicMessage>
  /** Dispatches game, state and bot messages. */
  dispatch: Dispatch & DispatchForBot
}

export type Dispatch = (message: LogicMessage | StateMessage) => void
export type DispatchForBot = (message: ClientMessage) => void

/** An event type used for [Socket.IO](https://socket.io/) communication betweeen server and client */
const MESSAGE = 'MESSAGE'

/**
 * Creates game core
 * 
 * @param io The SocketIO object responsible for socket communication.
 * @param reducer A pure function that takes current state and message and returns a new version of state.
 */
export const createCore = (io: SocketIO.Server): Core => {

  /**
   * A plain [RxJS Subject](https://github.com/ReactiveX/rxjs/blob/master/doc/subject.md) used
   * for sending and receiving all game, state and socket messages.
   */
  const subject = new Subject<ClientMessage | LogicMessage | StateMessage>()

  /**
   * Game state [store](http://redux.js.org/docs/basics/Store.html)
   * In development enviroment the state can be
   * observed by [Redux Remote DevTools](https://github.com/zalmoxisus/remote-redux-devtools).
   * This is very useful for debugging.
   */
  const store = createStore(reducer, devToolsEnhancer({
    name: 'The Black Cat',
    realtime: true,
  }) as object) as Store<State>

  /**
   * The store can be used for logging all sorts of messages.
   * When used with [Redux Remote DevTools](https://github.com/zalmoxisus/remote-redux-devtools),
   * it eases debugging a lot.
   */
  const logMessageByRedux = store.dispatch

  // Log all incoming messages
  subject.subscribe(logMessageByRedux)

  /** see [Core.messageOfType] */
  const messageOfType = <T>(type: string): Observable<T> => {
    // tslint:disable-next-line:no-any
    return subject.filter(message => message.type === type) as any
  }

  const dispatch = (message: LogicMessage | StateMessage | ClientMessage) => {
    subject.next(message)
  }

  // Create new player when a socket connects and configure it
  io.on(CONNECT, socket => {

    const send = (message: ServerMessage, noLogging = false) => {
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

  })

  return {
    getState: store.getState,
    messageOfType,
    dispatch,
  }
}