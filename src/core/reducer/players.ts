import { cardEqual, cardNotEqual, cardIsNotIn } from '../../logic/functions/cards'
import {
  StateMessage,
  STATE_ADD_BOT,
  STATE_CARDS_TO_HAND,
  STATE_CREATE_NEW_PLAYER,
  STATE_PASS_GRILL,
  STATE_PASS_HANDOVER,
  STATE_PASS_TRICK,
  STATE_PLAY_CARD,
  STATE_PLAYER_CHANGE_NAME,
  STATE_REMOVE_PLAYER,
  STATE_REMOVE_PLAYER_CARDS,
  STATE_REPLACE_PLAYER_WITH_BOT,
  STATE_SET_PLAYER_PASSED_HANDOVER,
  STATE_SET_PLAYER_SHOULD_PASS_HANDOVER,
  STATE_SET_PLAYER_WAIT_FOR_ME,
  STATE_SET_PLAYER_WANTS_NEW_GAME,
  STATE_TAKE_HANDOVER,
} from '../../types/Messages/StateMessage'
import { Player } from '../../types/Player'

/**
 * Players reducer
 */
const players = (state: Player[] = [], message: StateMessage): Player[] => {
  switch (message.type) {
    case STATE_CARDS_TO_HAND: {
      return state.map(player => {
        if (message.player === player.name) {
          return {
            ...player,
            hand: [...player.hand, ...message.cards],
          }
        }

        return player
      })
    }
    case STATE_REMOVE_PLAYER_CARDS: {
      return state.map(player => {
        if (player.name === message.player) {
          return {
            ...player,
            hand: [],
            handOver: [],
            grills: [],
            pile: [],
          }
        }
        return player
      })
    }
    case STATE_CREATE_NEW_PLAYER: {
      return [...state, message.player as Player]
    }
    case STATE_ADD_BOT: {
      return [...state, message.bot]
    }
    case STATE_REMOVE_PLAYER: {
      return state
        .filter(player => player.id !== message.id)
    }
    case STATE_REPLACE_PLAYER_WITH_BOT: {
      return [...state, message.bot]
    }
    case STATE_SET_PLAYER_WAIT_FOR_ME: {
      return state.map(player => {
        if (player.name === message.player) {
          return {
            ...player,
            waitForMe: message.value,
          }
        }

        return player
      })
    }
    case STATE_SET_PLAYER_SHOULD_PASS_HANDOVER: {
      return state.map(player => {
        if (player.name === message.player) {
          return {
            ...player,
            shouldPassHandOver: message.value,
          }
        }

        return player
      })
    }
    case STATE_SET_PLAYER_PASSED_HANDOVER: {
      return state.map(player => {
        if (player.name === message.player) {
          return {
            ...player,
            didPassedHandOver: message.value,
          }
        }

        return player
      })
    }
    case STATE_SET_PLAYER_WANTS_NEW_GAME: {
      return state.map(player => {
        if (player.name === message.player) {
          return {
            ...player,
            wantsNewGame: message.value,
          }
        }

        return player
      })
    }
    case STATE_PASS_HANDOVER: {
      return state.map(player => {
        if (player.name === message.from) {
          return {
            ...player,
            hand: player.hand.filter(cardIsNotIn(message.handOver)),
            didPassedHandOver: true,
          }
        }

        if (player.name === message.to) {
          return {
            ...player,
            handOver: message.handOver,
          }
        }

        return player
      })
    }
    case STATE_TAKE_HANDOVER: {
      return state.map(player => {
        if (player.name === message.player) {
          return {
            ...player,
            hand: [...player.hand, ...player.handOver],
            handOver: [],
          }
        }

        return player
      })
    }
    case STATE_PASS_TRICK: {
      return state.map(player => {
        if (player.name === message.receiver.name) {
          return {
            ...player,
            pile: [...player.pile, ...message.trick],
          }
        }

        return player
      })
    }
    case STATE_PASS_GRILL: {
      return state.map(player => {
        if (player.name === message.player) {
          return {
            ...player,
            hand: player.hand.filter(card => {
              return !message.grill.find(cardEqual(card))
            }),
            grills: [...player.grills, ...message.grill],
          }
        }

        return player
      })
    }
    case STATE_PLAY_CARD: {
      return state.map(player => {
        if (player.name === message.player.name) {
          return {
            ...player,
            hand: player.hand.filter(cardNotEqual(message.card)),
            grills: player.grills.filter(cardNotEqual(message.card)),
          }
        }

        return player
      })
    }
    case STATE_PLAYER_CHANGE_NAME: {
      return state.map(player => {
        if (player.id === message.player.id) {
          return { ...player, name: message.name }
        }

        return player
      })
    }
    default:
      return state
  }
}

export default players