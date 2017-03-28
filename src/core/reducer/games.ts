import { Game } from '../../types/Game'
import {
  default as StateMessage,
  STATE_CREATE_GAME,
  STATE_CREATE_GRILLS_SNAPSHOT,
  STATE_NEXT_ROUND,
  STATE_NEXT_TURN,
  STATE_PASS_TRICK,
  STATE_PLAY_CARD,
  STATE_REMOVE_GAME,
  STATE_REPLACE_PLAYER_WITH_BOT
} from '../../types/Messages/StateMessage'
import { Name } from '../../types/Name'

/**
 * Games reducer
 */
const games = (state: Game[] = [], message: StateMessage): Game[] => {
  switch (message.type) {
    case STATE_PASS_TRICK: {
      const room = message.receiver.room()
      const roomName = room && room.name

      return state.map(game => {
        if (game.room === roomName) {
          return { ...game, table: [] }
        }

        return game
      })
    }
    case STATE_PLAY_CARD: {
      const room = message.player.room()
      const roomName = room && room.name

      return state.map(game => {
        if (game.room === roomName) {
          return { ...game, table: [...game.table, message.card] }
        }

        return game
      })
    }
    case STATE_CREATE_GAME: {
      return [
        ...state,
        {
          room: message.room,
          table: [],
          round: 0,
          grillsSnapshot: [],
          playerOnTurn: message.playerOnTurn
        }
      ]
    }
    case STATE_REMOVE_GAME: {
      return state
        .filter(game => game.room !== message.room)
    }
    case STATE_NEXT_ROUND: {
      return state.map(game => {
        if (message.room.name === game.room) {
          return {
            ...game,
            round: game.round + 1,
            playerOnTurn: message.playerOnTurn || message.room.gameStartingPlayer,
          }
        }

        return game
      })
    }
    case STATE_NEXT_TURN: {
      return state.map(game => {
        if (message.room === game.room) {
          return {
            ...game,
            playerOnTurn: message.playerOnTurn,
          }
        }

        return game
      })
    }
    case STATE_CREATE_GRILLS_SNAPSHOT: {
      return state.map(game => {
        if (message.roomName === game.room) {
          return {
            ...game,
            grillsSnapshot: message.grills
          }
        }

        return game
      })
    }
    case STATE_REPLACE_PLAYER_WITH_BOT: {
      return state.map(game => {
        if (message.player === game.playerOnTurn) {
          return {
            ...game,
            playerOnTurn: message.bot.name
          }
        }
        
        return game
      })
    }
    default:
      return state
  }
}

export default games