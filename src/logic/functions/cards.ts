import { THE_BLACK_CAT_CARD } from '../constants'
import _ from 'lodash'
import { Card, Deck, Grills, Hand, Pile, Rank, Suit, Table } from '../../types/Cards'

export const cardEqual = (a: Card) => (b: Card): boolean => {
  return a.suit === b.suit && a.rank === b.rank
}

export const cardNotEqual = (a: Card) => (b: Card): boolean => {
  return !cardEqual(a)(b)
}

export const cardIsIn = (container: Card[]) => (card: Card): boolean => {
  return !!container
    .find(({ suit, rank }) => card.suit === suit && card.rank === rank)
}

export const cardIsNotIn = (container: Card[]) => (card: Card): boolean => {
  return !cardIsIn(container)(card)
}

export const cardIsOfSuit = (suit: Suit) => (card: Card): boolean => {
  return card.suit === suit
}

export const getRankAsNumber = (rank: Rank): number => {
  switch (rank) {
    case 'Seven': return 0
    case 'Eight': return 1
    case 'Nine': return 2
    case 'Ten': return 3
    case 'Jack': return 4
    case 'Queen': return 5
    case 'King': return 6
    case 'Ace': return 7
  }
}

export const getSuitAsNumber = (suit: Suit): number => {
  switch (suit) {
    case 'Clubs': return 0
    case 'Diamonds': return 1
    case 'Spades': return 2
    case 'Hearts': return 3
  }
}

export const compareByRank = (a: Card, b: Card): -1 | 0 | 1 => {
  const rankA = getRankAsNumber(a.rank)
  const rankB = getRankAsNumber(b.rank)
  if (rankA > rankB) return 1
  if (rankA < rankB) return -1
  return 0
}

export const compareBySuit = (a: Card, b: Card): -1 | 0 | 1 => {
  const suitA = getSuitAsNumber(a.suit)
  const suitB = getSuitAsNumber(b.suit)
  if (suitA > suitB) return 1
  if (suitA < suitB) return -1
  return 0
}

export const sortCardsByLowestValue = (cards: Card[]): Card[] => {
  return [...cards]
    .sort(compareBySuit)
    .sort(compareByRank)
}

export const sortCardsByGreatestValue = (cards: Card[]): Card[] => {
  return sortCardsByLowestValue(cards).reverse()
}

export const getCardPoints = (heartsGrillCoeficient: number, blackCatGrilled: boolean) => (card: Card): number => {
  switch (card.suit) {
    case 'Hearts': {
      const basePoints = (() => {
        switch (card.rank) {
          case 'Seven': return 1
          case 'Eight': return 1
          case 'Nine': return 1
          case 'Ten': return 1
          case 'Jack': return 2
          case 'Queen': return 3
          case 'King': return 4
          case 'Ace': return 5
        }
      })()

      return basePoints * heartsGrillCoeficient
    }
    case 'Spades': {
      switch (card.rank) {
        case 'Queen': return 13 * (blackCatGrilled ? 2 : 1)
        default: return 0
      }
    }
    default: return 0
  }
}

export const getPenaltyPoints = (grilledCards: Grills) => (pile: Pile): number => {
  const heartsGrillCoeficient = (() => {
    const heartsCount = grilledCards
      .filter(({ suit }) => suit === 'Hearts')
      .length

    switch (heartsCount) {
      case 3: return 2
      case 6: return 3
      default: return 1
    }
  })()

  const blackCatGrilled = !!grilledCards.find(cardEqual(THE_BLACK_CAT_CARD))

  const points = _(pile)
    .map(getCardPoints(heartsGrillCoeficient, blackCatGrilled))
    .sum()

  return points
}

export const createDeck = (): Deck => {
  const suits: Suit[] = [
    'Spades', 'Hearts', 'Diamonds', 'Clubs',
  ]
  const ranks: Rank[] = [
    'Seven', 'Eight', 'Nine', 'Ten',
    'Jack', 'Queen', 'King', 'Ace',
  ]
  const deck =
    suits.reduce((cards, suit) => {
      const completeSuit = ranks.reduce((cardsOfSuit, rank) => {
        cardsOfSuit.push({ suit, rank })
        return cardsOfSuit
      }, [] as Card[])

      return [...cards, ...completeSuit]
    }, [] as Card[])

  return deck
}

export const getPlayerHand = (deck: Deck, playerIndex: number): Hand => {
  const cardsRange = {
    low: playerIndex * 8,
    high: playerIndex * 8 + 8,
  }
  const hand = deck
    .filter((card, cardIndex) => cardIndex >= cardsRange.low && cardIndex < cardsRange.high)

  return hand
}

export const getHighestCardOnTable = (table: Table): Card => {
  const [firstCard] = table
  const highestCard = _(table)
    .filter(cardIsOfSuit(firstCard.suit))
    .sort(compareByRank)
    .last()
  return highestCard
}

export const bestCardToPlay = (hand: Hand, grill: Grills, table: Table): Card => {

  const playableCards = [...hand, ...grill]
  const [firstCardOnTable] = table

  if (!firstCardOnTable) {
    const [lowestCard, secondLowestCard] = sortCardsByLowestValue(playableCards)
    if (cardNotEqual(lowestCard)(THE_BLACK_CAT_CARD)) {
      return lowestCard
    } else {
      if (secondLowestCard) {
        return secondLowestCard
      } else {
        return THE_BLACK_CAT_CARD
      }
    }
  }

  const tableSuit = firstCardOnTable.suit

  const playableCardsOfTableSuit = playableCards.filter(cardIsOfSuit(tableSuit))
  if (playableCardsOfTableSuit.length === 0) {
    if (tableSuit !== 'Spades' && playableCards.find(cardEqual(THE_BLACK_CAT_CARD))) {
      return THE_BLACK_CAT_CARD
    }

    const [worstCard] = sortCardsByGreatestValue(playableCards)
    return worstCard
  }

  const tableCardsOfTableSuit = table.filter(cardIsOfSuit(tableSuit))
  const [greatestCardOnTable] = sortCardsByGreatestValue(tableCardsOfTableSuit)

  const sortedPlayableCardsOfTableSuit = sortCardsByGreatestValue(playableCardsOfTableSuit)

  const lowerCard = sortedPlayableCardsOfTableSuit
    .find(card => compareByRank(card, greatestCardOnTable) === -1)

  const cardToPlay = lowerCard || _([...sortedPlayableCardsOfTableSuit]).reverse().first()

  return cardToPlay
}
