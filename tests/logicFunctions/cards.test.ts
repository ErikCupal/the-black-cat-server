import { normalizePlayerIndex } from '../../src/logic/functions'
import {
  bestCardToPlay,
  cardEqual,
  cardIsIn,
  cardIsNotIn,
  cardIsOfSuit,
  cardNotEqual,
  compareByRank,
  compareBySuit,
  createDeck,
  getCardPoints,
  getHighestCardOnTable,
  getPenaltyPoints,
  getRankAsNumber,
  getSuitAsNumber,
  sortCardsByGreatestValue,
  sortCardsByLowestValue
} from '../../src/logic/functions/cards'
import { Card, Deck, Grills, Rank, Suit, Table } from '../../src/types/Cards'
import { Cards, FullDeck, TheBlackCat } from '../constants'

describe('validators', () => {
  test('cardEqual', () => {
    expect(cardEqual(Cards.Diamonds.King)({ suit: 'Diamonds', rank: 'King' })).toBeTruthy()
    expect(cardEqual(Cards.Diamonds.King)({ suit: 'Diamonds', rank: 'Queen' })).toBeFalsy()
    expect(cardEqual(Cards.Diamonds.King)({ suit: 'Hearts', rank: 'King' })).toBeFalsy()
  })

  test('cardNotEqual', () => {
    expect(cardNotEqual(Cards.Diamonds.King)({ suit: 'Diamonds', rank: 'King' })).toBeFalsy()
    expect(cardNotEqual(Cards.Diamonds.King)({ suit: 'Diamonds', rank: 'Queen' })).toBeTruthy()
    expect(cardNotEqual(Cards.Diamonds.King)({ suit: 'Hearts', rank: 'King' })).toBeTruthy()
  })

  test('cardIsIn', () => {
    expect(cardIsIn(FullDeck)({ suit: 'Diamonds', rank: 'King' })).toBeTruthy()
  })

  test('cardIsNotIn', () => {
    expect(cardIsNotIn(FullDeck)({ suit: 'Diamonds', rank: 'King' })).toBeFalsy()
  })

  test('cardIsOfSuit', () => {
    expect(cardIsOfSuit('Diamonds')({ suit: 'Diamonds', rank: 'King' })).toBeTruthy()
    expect(cardIsOfSuit('Hearts')({ suit: 'Diamonds', rank: 'King' })).toBeFalsy()
    expect(cardIsOfSuit('Clubs')({ suit: 'Diamonds', rank: 'King' })).toBeFalsy()
    expect(cardIsOfSuit('Spades')({ suit: 'Diamonds', rank: 'King' })).toBeFalsy()
  })
})

test('getRankAsNumber', () => {
  const parameters: {
    rank: Rank,
    result: number,
  }[] = [
      { rank: 'Seven', result: 0 },
      { rank: 'Eight', result: 1 },
      { rank: 'Nine', result: 2 },
      { rank: 'Ten', result: 3 },
      { rank: 'Jack', result: 4 },
      { rank: 'Queen', result: 5 },
      { rank: 'King', result: 6 },
      { rank: 'Ace', result: 7 },
    ]

  parameters.forEach(({ rank, result }) => {
    expect(getRankAsNumber(rank)).toBe(result)
  })
})

test('getSuitAsNumber', () => {
  const parameters: {
    suit: Suit,
    result: number,
  }[] = [
      { suit: 'Clubs', result: 0 },
      { suit: 'Diamonds', result: 1 },
      { suit: 'Spades', result: 2 },
      { suit: 'Hearts', result: 3 },
    ]

  parameters.forEach(({ suit, result }) => {
    expect(getSuitAsNumber(suit)).toBe(result)
  })
})

describe('comparing cards', () => {
  test('compareByRank', () => {
    expect(compareByRank(Cards.Diamonds.Eight, Cards.Diamonds.Seven)).toBe(1)
    expect(compareByRank(Cards.Diamonds.Eight, Cards.Diamonds.Eight)).toBe(0)
    expect(compareByRank(Cards.Diamonds.Eight, Cards.Diamonds.Jack)).toBe(-1)
  })

  test('compareBySuit', () => {
    expect(compareBySuit(Cards.Diamonds.Eight, Cards.Clubs.Seven)).toBe(1)
    expect(compareBySuit(Cards.Diamonds.Eight, Cards.Diamonds.Seven)).toBe(0)
    expect(compareBySuit(Cards.Diamonds.Eight, Cards.Hearts.Seven)).toBe(-1)
  })
})

describe('sorting cards', () => {
  const cards = [
    Cards.Hearts.Jack,
    Cards.Diamonds.Eight,
    Cards.Spades.Queen,
    Cards.Diamonds.Ten,
    Cards.Hearts.Ace,
    Cards.Clubs.Ace,
    Cards.Clubs.Queen,
    Cards.Diamonds.King,
  ]

  const sortedByGreatestValue = [
    Cards.Hearts.Ace,
    Cards.Clubs.Ace,
    Cards.Diamonds.King,
    Cards.Spades.Queen,
    Cards.Clubs.Queen,
    Cards.Hearts.Jack,
    Cards.Diamonds.Ten,
    Cards.Diamonds.Eight,
  ]
  const sortedByLowestValue = [...sortedByGreatestValue].reverse()

  test('sortCardsByGreatestValue', () => {
    const sortedCards = sortCardsByGreatestValue(cards)
    expect(sortedCards).toEqual(sortedByGreatestValue)
  })

  test('sortCardsByLowestValue', () => {
    const sortedCards = sortCardsByLowestValue(cards)
    expect(sortedCards).toEqual(sortedByLowestValue)
  })
})

describe('getCardPoints', () => {
  const getPointsWhenGrilled = {
    nothing: getCardPoints(1, false),
    hearts: getCardPoints(2, false),
    heartsTwice: getCardPoints(3, false),
    cat: getCardPoints(1, true),
    heartsAndCat: getCardPoints(2, true),
    heartsTwiceAndCat: getCardPoints(3, true),
  }

  test('works for no points cards', () => {
    const noPointCards = FullDeck.filter(card => {
      return card.suit !== 'Hearts'
        && (cardNotEqual(card)(TheBlackCat))
    })

    noPointCards.forEach(card => {
      Object.values(getPointsWhenGrilled).forEach(getPointsFunction => {
        expect(getPointsFunction(card)).toBe(0)
      })
    })
  })

  test('works for hearts', () => {
    const getPointWithHeartsNotGrilled = [
      getPointsWhenGrilled.nothing,
      getPointsWhenGrilled.cat,
    ]
    const getPointWithHeartsGrilled = [
      getPointsWhenGrilled.hearts,
      getPointsWhenGrilled.heartsAndCat,
    ]
    const getPointWithHeartsTwiceGrilled = [
      getPointsWhenGrilled.heartsTwice,
      getPointsWhenGrilled.heartsTwiceAndCat,
    ]

    getPointWithHeartsNotGrilled.forEach(getPointsFunction => {
      expect(getPointsFunction(Cards.Hearts.Seven)).toBe(1)
      expect(getPointsFunction(Cards.Hearts.Eight)).toBe(1)
      expect(getPointsFunction(Cards.Hearts.Nine)).toBe(1)
      expect(getPointsFunction(Cards.Hearts.Ten)).toBe(1)
      expect(getPointsFunction(Cards.Hearts.Jack)).toBe(2)
      expect(getPointsFunction(Cards.Hearts.Queen)).toBe(3)
      expect(getPointsFunction(Cards.Hearts.King)).toBe(4)
      expect(getPointsFunction(Cards.Hearts.Ace)).toBe(5)
    })

    getPointWithHeartsGrilled.forEach(getPointsFunction => {
      expect(getPointsFunction(Cards.Hearts.Seven)).toBe(1 * 2)
      expect(getPointsFunction(Cards.Hearts.Eight)).toBe(1 * 2)
      expect(getPointsFunction(Cards.Hearts.Nine)).toBe(1 * 2)
      expect(getPointsFunction(Cards.Hearts.Ten)).toBe(1 * 2)
      expect(getPointsFunction(Cards.Hearts.Jack)).toBe(2 * 2)
      expect(getPointsFunction(Cards.Hearts.Queen)).toBe(3 * 2)
      expect(getPointsFunction(Cards.Hearts.King)).toBe(4 * 2)
      expect(getPointsFunction(Cards.Hearts.Ace)).toBe(5 * 2)
    })

    getPointWithHeartsTwiceGrilled.forEach(getPointsFunction => {
      expect(getPointsFunction(Cards.Hearts.Seven)).toBe(1 * 3)
      expect(getPointsFunction(Cards.Hearts.Eight)).toBe(1 * 3)
      expect(getPointsFunction(Cards.Hearts.Nine)).toBe(1 * 3)
      expect(getPointsFunction(Cards.Hearts.Ten)).toBe(1 * 3)
      expect(getPointsFunction(Cards.Hearts.Jack)).toBe(2 * 3)
      expect(getPointsFunction(Cards.Hearts.Queen)).toBe(3 * 3)
      expect(getPointsFunction(Cards.Hearts.King)).toBe(4 * 3)
      expect(getPointsFunction(Cards.Hearts.Ace)).toBe(5 * 3)
    })
  })

  test('works for the black cat', () => {

    const getPointWithCatNotGrilled = [
      getPointsWhenGrilled.nothing,
      getPointsWhenGrilled.hearts,
      getPointsWhenGrilled.heartsTwice,
    ]

    const getPointWithCatGrilled = [
      getPointsWhenGrilled.cat,
      getPointsWhenGrilled.heartsAndCat,
      getPointsWhenGrilled.heartsTwiceAndCat,
    ]

    getPointWithCatNotGrilled.forEach(getPointsFunction => {
      expect(getPointsFunction(TheBlackCat)).toBe(11)
    })

    getPointWithCatGrilled.forEach(getPointsFunction => {
      expect(getPointsFunction(TheBlackCat)).toBe(22)
    })
  })

})

test('getPenaltyPoints works for full deck', () => {
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
  const blackCatGrilled = [TheBlackCat]
  const blackCatAndHeartsGrilled = [TheBlackCat, ...heartsOne]
  const blackCatAndHeartsDoubleGrilled = [TheBlackCat, ...heartsOne, ...heartsTwo]

  const fullPile = FullDeck

  const getFullPilePoints = (grills: Grills) => getPenaltyPoints(grills)(fullPile)

  expect(getFullPilePoints(emptyGrill)).toBe(29)
  expect(getFullPilePoints(heartsGrilled)).toBe(47)
  expect(getFullPilePoints(heartsDoubleGrilled)).toBe(65)
  expect(getFullPilePoints(blackCatGrilled)).toBe(40)
  expect(getFullPilePoints(blackCatAndHeartsGrilled)).toBe(58)
  expect(getFullPilePoints(blackCatAndHeartsDoubleGrilled)).toBe(76)
})

test('createDeck', () => {
  expect(createDeck()).toEqual(FullDeck)
})

test('getHighestCardOnTable', () => {
  const table1: Table = [
    Cards.Clubs.Ten,
    Cards.Clubs.Jack,
    Cards.Clubs.Nine,
    Cards.Clubs.Ace,
  ]
  expect(getHighestCardOnTable(table1)).toBe(Cards.Clubs.Ace)
})

test('bestCardToPlay returns correct card', () => {
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

  const hand4 = [TheBlackCat]

  const grill1 = [
    Cards.Hearts.Seven,
    Cards.Hearts.Ten,
    Cards.Hearts.Nine,
  ]

  const table1 = [
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

  expect(bestCardToPlay(hand1, [], table1)).toEqual(Cards.Spades.Eight)
  expect(bestCardToPlay(hand2, [], table1)).toEqual(Cards.Diamonds.Ace)
  expect(bestCardToPlay(hand3, [], table2)).toEqual(Cards.Spades.Queen)
  expect(bestCardToPlay(hand4, [], table2)).toEqual(Cards.Spades.Queen)
  expect(bestCardToPlay(hand1, [], emptyTable)).toEqual(Cards.Clubs.Seven)
  expect(bestCardToPlay(hand2, [], emptyTable)).toEqual(Cards.Clubs.Seven)
  expect(bestCardToPlay(hand3, [], emptyTable)).toEqual(Cards.Hearts.King)
  expect(bestCardToPlay(hand4, [], emptyTable)).toEqual(Cards.Spades.Queen)

  expect(bestCardToPlay(hand1, grill1, table1)).toEqual(Cards.Spades.Eight)
  expect(bestCardToPlay(hand2, grill1, table1)).toEqual(Cards.Diamonds.Ace)
  expect(bestCardToPlay(hand3, grill1, table2)).toEqual(Cards.Spades.Queen)
  expect(bestCardToPlay(hand4, grill1, table2)).toEqual(Cards.Spades.Queen)
  expect(bestCardToPlay(hand1, grill1, emptyTable)).toEqual(Cards.Clubs.Seven)
  expect(bestCardToPlay(hand2, grill1, emptyTable)).toEqual(Cards.Clubs.Seven)
  expect(bestCardToPlay(hand3, grill1, emptyTable)).toEqual(Cards.Hearts.Seven)
  expect(bestCardToPlay(hand4, grill1, emptyTable)).toEqual(Cards.Hearts.Seven)
})