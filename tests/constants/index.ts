import '../../src/polyfill'
import { Card, Deck } from '../../src/types/Cards'

export interface SuitOfCards {
  Seven: Card
  Eight: Card
  Nine: Card
  Ten: Card
  Jack: Card
  Queen: Card
  King: Card
  Ace: Card
}

export interface Cards {
  Spades: SuitOfCards
  Hearts: SuitOfCards
  Diamonds: SuitOfCards
  Clubs: SuitOfCards
}

export const Cards: Cards = {
  Spades: {
    Seven: { suit: 'Spades', rank: 'Seven' },
    Eight: { suit: 'Spades', rank: 'Eight' },
    Nine: { suit: 'Spades', rank: 'Nine' },
    Ten: { suit: 'Spades', rank: 'Ten' },
    Jack: { suit: 'Spades', rank: 'Jack' },
    Queen: { suit: 'Spades', rank: 'Queen' },
    King: { suit: 'Spades', rank: 'King' },
    Ace: { suit: 'Spades', rank: 'Ace' },
  },
  Hearts: {
    Seven: { suit: 'Hearts', rank: 'Seven' },
    Eight: { suit: 'Hearts', rank: 'Eight' },
    Nine: { suit: 'Hearts', rank: 'Nine' },
    Ten: { suit: 'Hearts', rank: 'Ten' },
    Jack: { suit: 'Hearts', rank: 'Jack' },
    Queen: { suit: 'Hearts', rank: 'Queen' },
    King: { suit: 'Hearts', rank: 'King' },
    Ace: { suit: 'Hearts', rank: 'Ace' },
  },
  Diamonds: {
    Seven: { suit: 'Diamonds', rank: 'Seven' },
    Eight: { suit: 'Diamonds', rank: 'Eight' },
    Nine: { suit: 'Diamonds', rank: 'Nine' },
    Ten: { suit: 'Diamonds', rank: 'Ten' },
    Jack: { suit: 'Diamonds', rank: 'Jack' },
    Queen: { suit: 'Diamonds', rank: 'Queen' },
    King: { suit: 'Diamonds', rank: 'King' },
    Ace: { suit: 'Diamonds', rank: 'Ace' },
  },
  Clubs: {
    Seven: { suit: 'Clubs', rank: 'Seven' },
    Eight: { suit: 'Clubs', rank: 'Eight' },
    Nine: { suit: 'Clubs', rank: 'Nine' },
    Ten: { suit: 'Clubs', rank: 'Ten' },
    Jack: { suit: 'Clubs', rank: 'Jack' },
    Queen: { suit: 'Clubs', rank: 'Queen' },
    King: { suit: 'Clubs', rank: 'King' },
    Ace: { suit: 'Clubs', rank: 'Ace' },
  },
}

export const TheBlackCat = Cards.Spades.Queen
export const FullDeck: Deck = Object.values(Cards).flatMap(suit => Object.values(suit))