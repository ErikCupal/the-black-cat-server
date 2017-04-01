import { flatMap } from 'lodash'
import { Card, Deck } from '../../src/types/Cards'

export interface SuitOfCards {
  SEVEN: Card
  EIGHT: Card
  NINE: Card
  TEN: Card
  JACK: Card
  QUEEN: Card
  KING: Card
  ACE: Card
}

export interface Cards {
  SPADES: SuitOfCards
  HEARTS: SuitOfCards
  DIAMONDS: SuitOfCards
  CLUBS: SuitOfCards
}

export const CARDS: Cards = {
  SPADES: {
    SEVEN: { suit: 'Spades', rank: 'Seven' },
    EIGHT: { suit: 'Spades', rank: 'Eight' },
    NINE: { suit: 'Spades', rank: 'Nine' },
    TEN: { suit: 'Spades', rank: 'Ten' },
    JACK: { suit: 'Spades', rank: 'Jack' },
    QUEEN: { suit: 'Spades', rank: 'Queen' },
    KING: { suit: 'Spades', rank: 'King' },
    ACE: { suit: 'Spades', rank: 'Ace' },
  },
  HEARTS: {
    SEVEN: { suit: 'Hearts', rank: 'Seven' },
    EIGHT: { suit: 'Hearts', rank: 'Eight' },
    NINE: { suit: 'Hearts', rank: 'Nine' },
    TEN: { suit: 'Hearts', rank: 'Ten' },
    JACK: { suit: 'Hearts', rank: 'Jack' },
    QUEEN: { suit: 'Hearts', rank: 'Queen' },
    KING: { suit: 'Hearts', rank: 'King' },
    ACE: { suit: 'Hearts', rank: 'Ace' },
  },
  DIAMONDS: {
    SEVEN: { suit: 'Diamonds', rank: 'Seven' },
    EIGHT: { suit: 'Diamonds', rank: 'Eight' },
    NINE: { suit: 'Diamonds', rank: 'Nine' },
    TEN: { suit: 'Diamonds', rank: 'Ten' },
    JACK: { suit: 'Diamonds', rank: 'Jack' },
    QUEEN: { suit: 'Diamonds', rank: 'Queen' },
    KING: { suit: 'Diamonds', rank: 'King' },
    ACE: { suit: 'Diamonds', rank: 'Ace' },
  },
  CLUBS: {
    SEVEN: { suit: 'Clubs', rank: 'Seven' },
    EIGHT: { suit: 'Clubs', rank: 'Eight' },
    NINE: { suit: 'Clubs', rank: 'Nine' },
    TEN: { suit: 'Clubs', rank: 'Ten' },
    JACK: { suit: 'Clubs', rank: 'Jack' },
    QUEEN: { suit: 'Clubs', rank: 'Queen' },
    KING: { suit: 'Clubs', rank: 'King' },
    ACE: { suit: 'Clubs', rank: 'Ace' },
  },
}

export const DECK: Deck =  flatMap(Object.values(CARDS), suit => Object.values(suit))