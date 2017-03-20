import '../../src/polyfill'
import { Card, Deck, Grills, Hand, Table } from '../../src/types/Cards'
import {
  bestCardToPlay,
  compareByRank,
  compareBySuit,
  getHighestCardOnTable,
  getPenaltyPoints,
  sortCardsByGreatestValue
} from '../../src/logic/functions/cards'
import {
  normalizePlayerIndex,
} from '../../src/logic/functions'

interface SuitOfCards {
  Seven: Card
  Eight: Card
  Nine: Card
  Ten: Card
  Jack: Card
  Queen: Card
  King: Card
  Ace: Card
}

interface Cards {
  Spades: SuitOfCards
  Hearts: SuitOfCards
  Diamonds: SuitOfCards
  Clubs: SuitOfCards
}

const Cards: Cards = {
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

const BlackCat = Cards.Spades.Queen

const FullDeck: Deck = Object.values(Cards)
  .flatMap(suit => Object.values(suit))

test('getHighestCardOnTable', () => {
  const table: Table = [
    Cards.Clubs.Ten,
    Cards.Clubs.Jack,
    Cards.Clubs.Nine,
    Cards.Clubs.Ace,
  ]
  expect(getHighestCardOnTable(table)).toBe(Cards.Clubs.Ace)
})

test('normalizePlayerIndex', () => {
  const indexes =
    [0, 1, 2, 3, 4, 5, 6, 7, 8]
  const normalizedIndexes =
    [0, 1, 2, 3, 0, 1, 2, 3, 0]
  expect(normalizedIndexes.map(normalizePlayerIndex))
    .toEqual(normalizedIndexes)
})

test('getPenaltyPoints', () => {
  const heartsOne = [
    Cards.Hearts.Seven,
    Cards.Hearts.Eight,
    Cards.Hearts.Nine,
  ]
  const heartsTwo = [
    Cards.Hearts.Jack,
    Cards.Hearts.Queen,
    Cards.Hearts.King,
  ]

  const emptyGrill: Grills = []
  const heartsGrilled = heartsOne
  const heartsDoubleGrilled = [...heartsOne, ...heartsTwo]
  const blackCatGrilled = [BlackCat]
  const blackCatAndHeartsGrilled = [BlackCat, ...heartsOne]
  const blackCatAndHeartsDoubleGrilled = [BlackCat, ...heartsOne, ...heartsTwo]

  const fullPile = FullDeck

  const getFullPilePoints = (grills: Grills) => getPenaltyPoints(grills)(fullPile)

  expect(getFullPilePoints(emptyGrill)).toBe(29)
  expect(getFullPilePoints(heartsGrilled)).toBe(47)
  expect(getFullPilePoints(heartsDoubleGrilled)).toBe(65)
  expect(getFullPilePoints(blackCatGrilled)).toBe(40)
  expect(getFullPilePoints(blackCatAndHeartsGrilled)).toBe(58)
  expect(getFullPilePoints(blackCatAndHeartsDoubleGrilled)).toBe(76)
})

test('Sorts cards by biggest value', () => {
  const cards: Card[] = [
    Cards.Hearts.Jack,
    Cards.Diamonds.Eight,
    Cards.Spades.Queen,
    Cards.Diamonds.Ten,
    Cards.Hearts.Ace,
    Cards.Clubs.Ace,
    Cards.Clubs.Queen,
    Cards.Diamonds.King,
  ]

  const sortedCards = sortCardsByGreatestValue(cards)

  const [first, second, third] = sortedCards

  expect(first).toBe(Cards.Hearts.Ace)
  expect(second).toBe(Cards.Clubs.Ace)
  expect(third).toBe(Cards.Diamonds.King)
})

test('bestCardToPlay', () => {
  const hand1 = [
    Cards.Clubs.Seven,
    Cards.Spades.Eight,
    Cards.Hearts.Jack,
    Cards.Spades.Queen,
  ]

  const hand2 = [
    Cards.Clubs.Seven,
    Cards.Diamonds.Ace,
    Cards.Hearts.Jack,
    Cards.Hearts.King,
  ]

  const hand3 = [
    Cards.Spades.Ace,
    Cards.Diamonds.Ace,
    Cards.Spades.Queen,
    Cards.Hearts.King,
  ]

  const table = [
    Cards.Spades.Nine,
    Cards.Hearts.King,
    Cards.Spades.Eight,
  ]

  const table2 = [
    Cards.Clubs.Nine,
    Cards.Hearts.King,
    Cards.Spades.Eight,
  ]

  const emptyTable: Table = []

  expect(bestCardToPlay(hand1, [], table)).toEqual(Cards.Spades.Eight)
  expect(bestCardToPlay(hand2, [], table)).toEqual(Cards.Diamonds.Ace)
  expect(bestCardToPlay(hand3, [], table2)).toEqual(Cards.Spades.Queen)
  expect(bestCardToPlay(hand1, [], emptyTable)).toEqual(Cards.Clubs.Seven)
  expect(bestCardToPlay(hand2, [], emptyTable)).toEqual(Cards.Clubs.Seven)
  expect(bestCardToPlay(hand3, [], emptyTable)).toEqual(Cards.Hearts.King)
})