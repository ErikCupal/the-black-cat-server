import {
  StateMessage,
  STATE_ADD_BOT,
  STATE_ADD_PLAYER_TO_ROOM,
  STATE_ADD_ROOM,
  STATE_ADD_SCORES,
  STATE_PLAYER_CHANGE_NAME,
  STATE_REMOVE_ROOM,
  STATE_REPLACE_PLAYER_WITH_BOT,
  STATE_SET_GAME_STARTING_PLAYER,
} from '../../types/Messages/StateMessage'
import { Room } from '../../types/Room'

/**
 * Rooms reducer
 */
const rooms = (state: Room[] = [], message: StateMessage): Room[] => {
  switch (message.type) {
    case STATE_ADD_ROOM: {
      return [...state, message.room]
    }
    case STATE_REMOVE_ROOM: {
      return state
        .filter(room => room.name !== message.room)
    }
    case STATE_ADD_PLAYER_TO_ROOM: {
      return state.map(room => {
        if (message.room === room.name) {
          return {
            ...room,
            players: [
              ...room.players,
              message.name,
            ],
            scores: [
              ...room.scores,
              {
                player: message.name,
                points: [],
              },
            ],
          }
        }

        return room
      })
    }
    case STATE_ADD_BOT: {
      return state.map(room => {
        if (message.room === room.name) {
          return {
            ...room,
            players: [
              ...room.players,
              message.bot.name,
            ],
            scores: [
              ...room.scores,
              {
                player: message.bot.name,
                points: [],
              },
            ],
          }
        }

        return room
      })
    }
    case STATE_REPLACE_PLAYER_WITH_BOT: {
      return state.map(room => {
        if (room.players.find(p => p === message.player)) {
          return {
            ...room,
            players: room.players.map(player => {
              if (player === message.player) {
                return message.bot.name
              }

              return player
            }),
            scores: room.scores.map(scores => {
              if (scores.player === message.player) {
                return {
                  ...scores,
                  player: message.bot.name,
                }
              }

              return scores
            }),
            gameStartingPlayer: room.gameStartingPlayer === message.player
              ? message.bot.name
              : room.gameStartingPlayer,
          }
        }
        return room
      })
    }
    case STATE_ADD_SCORES: {
      return state.map(room => {
        if (message.room === room.name) {
          return {
            ...room,
            scores: room.scores
              .map(({ player, points }) => {
                const [playerScore] = message.gameScores
                  .filter(score => score.player === player)
                  .map(score => score.points)

                return {
                  player,
                  points: [...points, playerScore],
                }
              }),
          }
        }

        return room
      })
    }
    case STATE_PLAYER_CHANGE_NAME: {
      const playerRoom = message.player.room()
      const roomName = playerRoom && playerRoom.name

      return state.map(room => {
        if (roomName === room.name) {
          return {
            ...room,
            players: room.players.map(name => {
              if (name === message.player.name) {
                return message.name
              }
              return name
            }),
          }
        }

        return room
      })
    }
    case STATE_SET_GAME_STARTING_PLAYER: {
      return state.map(room => {
        if (message.room === room.name) {
          return {
            ...room,
            gameStartingPlayer: message.player,
          }
        }
        return room
      })
    }
    default:
      return state
  }
}

export default rooms