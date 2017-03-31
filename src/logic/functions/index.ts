import { Card, HandOver } from '../../types/Cards'
import { first } from 'lodash'
import { Game } from '../../types/Game'
import ClientMessage, {
  DECK_DEALT,
  I_AM_READY,
  I_WANT_NEW_GAME,
  PLAY_CARD,
  PLAY_HAND_OVER,
  TAKE_HANDOVER
} from '../../types/Messages/ClientMessage'
import ServerMessage, {
  DEAL_DECK,
  DO_PASS_HANDOVER,
  DO_TAKE_HANDOVER,
  GAME_ENDED,
  NEXT_TURN
} from '../../types/Messages/ServerMessage'
import { Player } from '../../types/Player'
import { bestCardToPlay, cardEqual, cardIsIn, cardIsOfSuit, sortCardsByGreatestValue } from './cards'

export const normalizePlayerIndex = (index: number): number => {
  return index >= 4 ? index - 4 : index
}

export const handOverIsValid = (handOver: HandOver, player: Player): boolean => {
  const { shouldPassHandOver } = player
  const matchingCards = player.hand.filter(cardIsIn(handOver))

  return matchingCards.length === 3
    && handOver.length === 3
    && player.hand.length === 8
}

export const grillIsValid = (grill: Card[], player: Player): boolean => {
  const game = player.game()
  const matchingCards = player.hand.filter(cardIsIn(grill))

  const isBlackCatGrill = (): boolean => (
    matchingCards.length === 1 &&
    grill.length === 1 &&
    grill.find(cardEqual({ suit: 'Spades', rank: 'Queen' })) !== undefined
  )

  const isHeartsGrill = (): boolean => (
    matchingCards.length === 3 &&
    grill.length === 3 &&
    matchingCards.filter(cardIsOfSuit('Hearts')).length === 3
  )

  return !!game
    && game.round === 0
    && !player.shouldPassHandOver
    && !!player.waitForMe
    && (isBlackCatGrill() || isHeartsGrill())
}

export const playedCardIsValid = (card: Card, player: Player): boolean => {
  const game = player.game()

  const cardMatchesPlayersCard = (): boolean => (
    !!player.hand.find(cardEqual(card)) ||
    !!player.grills.find(cardEqual(card))
  )

  const isPlayable = (): boolean => {
    const firstTableCard = game && first(game.table)
    if (!firstTableCard || card.suit === firstTableCard.suit) {
      return true
    }
    const { hand, grills } = player
    const cardOfSameSuit = (hand.concat(grills)).find(cardIsOfSuit(firstTableCard.suit))
    if (!cardOfSameSuit) {
      return true
    }
    return false
  }

  return !!game
    && game.playerOnTurn === player.name
    && cardMatchesPlayersCard()
    && isPlayable()
}

export const playerCanHaveDealtDeck = (player: Player): boolean => {
  return player.game() !== undefined
    && player.waitForMe === true
    && player.hand.length === 8
    && player.handOver.length === 0
}

export const playerCanBeReady = (player: Player): boolean => {
  return player.game() !== undefined
    && player.didPassedHandOver === true
    && player.hand.concat(player.grills).length === 8
    && player.handOver.length === 0
}

export const playerHasHandover = (player: Player): boolean => player.handOver.length === 3

export const playerHasExactSpaceForHandOver = (player: Player): boolean => player.hand.length === 5

export const playerCanTakeHandOver = (player: Player): boolean => {
  return playerHasHandover(player) && playerHasExactSpaceForHandOver(player)
}

export const tableIsFull = (game: Game): boolean => game.table.length === 4

export const isLastRound = (round: number): boolean => round === 8

export const getBotResponse = async (
  message: ServerMessage,
  seconds: (seconds: number) => Promise<void>,
  getPlayer: () => Player | undefined,
): Promise<ClientMessage[] | undefined> => {

  switch (message.type) {
    case GAME_ENDED: {
      const player = getPlayer()
      if (player) {
        return [{ type: I_WANT_NEW_GAME, player }]
      }
      return undefined
    }
    case NEXT_TURN: {
      await seconds(0.8)

      const player = getPlayer()
      if (player && message.playerOnTurn === player.name) {
        const game = player.game()
        if (game) {
          const { table } = game
          const { hand, grills } = player

          const cardToPlay = bestCardToPlay(hand, grills, table)

          return [{ type: PLAY_CARD, card: cardToPlay, player }]
        }
      }

      return undefined
    }
    case DEAL_DECK: {
      const player = getPlayer()
      if (player) {
        return [{ type: DECK_DEALT, player }]
      }
      return undefined
    }
    case DO_PASS_HANDOVER: {
      await seconds(1)

      const player = getPlayer()
      if (player) {
        const hand = player.hand
        const sortedHand = sortCardsByGreatestValue(hand)
        const [first, second, third] = sortedHand
        const handOver = [first, second, third]

        return [{ type: PLAY_HAND_OVER, handOver, player }]
      }
      return undefined
    }
    case DO_TAKE_HANDOVER: {
      await seconds(1)

      const player = getPlayer()
      if (player) {
        return [
          { type: TAKE_HANDOVER, player },
          { type: I_AM_READY, player },
        ]
      }
      return undefined
    }
    default:
      return undefined
  }
}