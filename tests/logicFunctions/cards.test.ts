import { THE_BLACK_CAT_CARD } from '../../src/logic/constants'
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
  getPlayerHand,
  getRankAsNumber,
  getSuitAsNumber,
  sortCardsByGreatestValue,
  sortCardsByLowestValue,
} from '../../src/logic/functions/cards'
import { Card, Deck, Grills, Hand, Rank, Suit, Table } from '../../src/types/Cards'
import { CARDS, DECK } from '../constants'

describe('validators', () => {
  test('cardEqual', () => {
    expect(cardEqual(CARDS.DIAMONDS.KING)({ suit: 'Diamonds', rank: 'King' })).toBeTruthy()
    expect(cardEqual(CARDS.DIAMONDS.KING)({ suit: 'Diamonds', rank: 'Queen' })).toBeFalsy()
    expect(cardEqual(CARDS.DIAMONDS.KING)({ suit: 'Hearts', rank: 'King' })).toBeFalsy()
  })

  test('cardNotEqual', () => {
    expect(cardNotEqual(CARDS.DIAMONDS.KING)({ suit: 'Diamonds', rank: 'King' })).toBeFalsy()
    expect(cardNotEqual(CARDS.DIAMONDS.KING)({ suit: 'Diamonds', rank: 'Queen' })).toBeTruthy()
    expect(cardNotEqual(CARDS.DIAMONDS.KING)({ suit: 'Hearts', rank: 'King' })).toBeTruthy()
  })

  test('cardIsIn', () => {
    expect(cardIsIn(DECK)({ suit: 'Diamonds', rank: 'King' })).toBeTruthy()
  })

  test('cardIsNotIn', () => {
    expect(cardIsNotIn(DECK)({ suit: 'Diamonds', rank: 'King' })).toBeFalsy()
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
    expect(compareByRank(CARDS.DIAMONDS.EIGHT, CARDS.DIAMONDS.SEVEN)).toBe(1)
    expect(compareByRank(CARDS.DIAMONDS.EIGHT, CARDS.DIAMONDS.EIGHT)).toBe(0)
    expect(compareByRank(CARDS.DIAMONDS.EIGHT, CARDS.DIAMONDS.JACK)).toBe(-1)
  })

  test('compareBySuit', () => {
    expect(compareBySuit(CARDS.DIAMONDS.EIGHT, CARDS.CLUBS.SEVEN)).toBe(1)
    expect(compareBySuit(CARDS.DIAMONDS.EIGHT, CARDS.DIAMONDS.SEVEN)).toBe(0)
    expect(compareBySuit(CARDS.DIAMONDS.EIGHT, CARDS.HEARTS.SEVEN)).toBe(-1)
  })
})

describe('sorting cards', () => {
  const cards = [
    CARDS.HEARTS.JACK,
    CARDS.DIAMONDS.EIGHT,
    CARDS.SPADES.QUEEN,
    CARDS.DIAMONDS.TEN,
    CARDS.HEARTS.ACE,
    CARDS.CLUBS.ACE,
    CARDS.CLUBS.QUEEN,
    CARDS.DIAMONDS.KING,
  ]

  const sortedByGreatestValue = [
    CARDS.HEARTS.ACE,
    CARDS.CLUBS.ACE,
    CARDS.DIAMONDS.KING,
    CARDS.SPADES.QUEEN,
    CARDS.CLUBS.QUEEN,
    CARDS.HEARTS.JACK,
    CARDS.DIAMONDS.TEN,
    CARDS.DIAMONDS.EIGHT,
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
    const noPointCards = DECK.filter(card => {
      return card.suit !== 'Hearts'
        && (cardNotEqual(card)(THE_BLACK_CAT_CARD))
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
      expect(getPointsFunction(CARDS.HEARTS.SEVEN)).toBe(1)
      expect(getPointsFunction(CARDS.HEARTS.EIGHT)).toBe(1)
      expect(getPointsFunction(CARDS.HEARTS.NINE)).toBe(1)
      expect(getPointsFunction(CARDS.HEARTS.TEN)).toBe(1)
      expect(getPointsFunction(CARDS.HEARTS.JACK)).toBe(2)
      expect(getPointsFunction(CARDS.HEARTS.QUEEN)).toBe(3)
      expect(getPointsFunction(CARDS.HEARTS.KING)).toBe(4)
      expect(getPointsFunction(CARDS.HEARTS.ACE)).toBe(5)
    })

    getPointWithHeartsGrilled.forEach(getPointsFunction => {
      expect(getPointsFunction(CARDS.HEARTS.SEVEN)).toBe(1 * 2)
      expect(getPointsFunction(CARDS.HEARTS.EIGHT)).toBe(1 * 2)
      expect(getPointsFunction(CARDS.HEARTS.NINE)).toBe(1 * 2)
      expect(getPointsFunction(CARDS.HEARTS.TEN)).toBe(1 * 2)
      expect(getPointsFunction(CARDS.HEARTS.JACK)).toBe(2 * 2)
      expect(getPointsFunction(CARDS.HEARTS.QUEEN)).toBe(3 * 2)
      expect(getPointsFunction(CARDS.HEARTS.KING)).toBe(4 * 2)
      expect(getPointsFunction(CARDS.HEARTS.ACE)).toBe(5 * 2)
    })

    getPointWithHeartsTwiceGrilled.forEach(getPointsFunction => {
      expect(getPointsFunction(CARDS.HEARTS.SEVEN)).toBe(1 * 3)
      expect(getPointsFunction(CARDS.HEARTS.EIGHT)).toBe(1 * 3)
      expect(getPointsFunction(CARDS.HEARTS.NINE)).toBe(1 * 3)
      expect(getPointsFunction(CARDS.HEARTS.TEN)).toBe(1 * 3)
      expect(getPointsFunction(CARDS.HEARTS.JACK)).toBe(2 * 3)
      expect(getPointsFunction(CARDS.HEARTS.QUEEN)).toBe(3 * 3)
      expect(getPointsFunction(CARDS.HEARTS.KING)).toBe(4 * 3)
      expect(getPointsFunction(CARDS.HEARTS.ACE)).toBe(5 * 3)
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
      expect(getPointsFunction(THE_BLACK_CAT_CARD)).toBe(13)
    })

    getPointWithCatGrilled.forEach(getPointsFunction => {
      expect(getPointsFunction(THE_BLACK_CAT_CARD)).toBe(26)
    })
  })

})

test('getPenaltyPoints works for full deck', () => {
  const heartsOne = [
    CARDS.HEARTS.SEVEN,
    CARDS.HEARTS.EIGHT,
    CARDS.HEARTS.NINE,
  ]
  const heartsTwo = [
    CARDS.HEARTS.JACK,
    CARDS.HEARTS.QUEEN,
    CARDS.HEARTS.KING,
  ]

  const emptyGrill: Grills = []
  const heartsGrilled = heartsOne
  const heartsDoubleGrilled = [...heartsOne, ...heartsTwo]
  const blackCatGrilled = [THE_BLACK_CAT_CARD]
  const blackCatAndHeartsGrilled = [THE_BLACK_CAT_CARD, ...heartsOne]
  const blackCatAndHeartsDoubleGrilled = [THE_BLACK_CAT_CARD, ...heartsOne, ...heartsTwo]

  const fullPile = DECK

  const getFullPilePoints = (grills: Grills) => getPenaltyPoints(grills)(fullPile)

  expect(getFullPilePoints(emptyGrill)).toBe(31)
  expect(getFullPilePoints(heartsGrilled)).toBe(49)
  expect(getFullPilePoints(heartsDoubleGrilled)).toBe(67)
  expect(getFullPilePoints(blackCatGrilled)).toBe(44)
  expect(getFullPilePoints(blackCatAndHeartsGrilled)).toBe(62)
  expect(getFullPilePoints(blackCatAndHeartsDoubleGrilled)).toBe(80)
})

test('createDeck', () => {
  expect(createDeck()).toEqual(DECK)
})

test('getPlayerHand', () => {
  const deck = DECK
  const hand1: Hand = Object.values(CARDS.SPADES)
  const hand2: Hand = Object.values(CARDS.HEARTS)
  const hand3: Hand = Object.values(CARDS.DIAMONDS)
  const hand4: Hand = Object.values(CARDS.CLUBS)

  expect(getPlayerHand(deck, 0)).toEqual(hand1)
  expect(getPlayerHand(deck, 1)).toEqual(hand2)
  expect(getPlayerHand(deck, 2)).toEqual(hand3)
  expect(getPlayerHand(deck, 3)).toEqual(hand4)
})

test('getHighestCardOnTable', () => {
  const table1: Table = [
    CARDS.CLUBS.TEN,
    CARDS.CLUBS.JACK,
    CARDS.CLUBS.NINE,
    CARDS.CLUBS.ACE,
  ]
  expect(getHighestCardOnTable(table1)).toBe(CARDS.CLUBS.ACE)
})

test('bestCardToPlay returns correct card', () => {
  const hand1 = [
    CARDS.CLUBS.SEVEN,
    CARDS.SPADES.EIGHT,
    CARDS.HEARTS.JACK,
    CARDS.SPADES.QUEEN,
  ]

  const hand2 = [
    CARDS.CLUBS.SEVEN,
    CARDS.DIAMONDS.ACE,
    CARDS.HEARTS.JACK,
    CARDS.HEARTS.KING,
  ]

  const hand3 = [
    CARDS.SPADES.ACE,
    CARDS.DIAMONDS.ACE,
    CARDS.SPADES.QUEEN,
    CARDS.HEARTS.KING,
  ]

  const hand4 = [THE_BLACK_CAT_CARD]
  const hand5 = [...hand4, CARDS.HEARTS.KING]
  const hand6 = [...hand4, CARDS.SPADES.KING]

  const grill1 = [
    CARDS.HEARTS.SEVEN,
    CARDS.HEARTS.TEN,
    CARDS.HEARTS.NINE,
  ]

  const table1 = [
    CARDS.SPADES.NINE,
    CARDS.HEARTS.KING,
    CARDS.SPADES.EIGHT,
  ]

  const table2 = [
    CARDS.CLUBS.NINE,
    CARDS.HEARTS.KING,
    CARDS.SPADES.EIGHT,
  ]

  const emptyTable: Table = []

  expect(bestCardToPlay(hand1, [], table1)).toEqual(CARDS.SPADES.EIGHT)
  expect(bestCardToPlay(hand2, [], table1)).toEqual(CARDS.DIAMONDS.ACE)
  expect(bestCardToPlay(hand3, [], table2)).toEqual(CARDS.SPADES.QUEEN)
  expect(bestCardToPlay(hand4, [], table2)).toEqual(CARDS.SPADES.QUEEN)
  expect(bestCardToPlay(hand1, [], emptyTable)).toEqual(CARDS.CLUBS.SEVEN)
  expect(bestCardToPlay(hand2, [], emptyTable)).toEqual(CARDS.CLUBS.SEVEN)
  expect(bestCardToPlay(hand3, [], emptyTable)).toEqual(CARDS.HEARTS.KING)
  expect(bestCardToPlay(hand4, [], emptyTable)).toEqual(CARDS.SPADES.QUEEN)

  expect(bestCardToPlay(hand1, grill1, table1)).toEqual(CARDS.SPADES.EIGHT)
  expect(bestCardToPlay(hand2, grill1, table1)).toEqual(CARDS.DIAMONDS.ACE)
  expect(bestCardToPlay(hand3, grill1, table2)).toEqual(CARDS.SPADES.QUEEN)
  expect(bestCardToPlay(hand4, grill1, table2)).toEqual(CARDS.SPADES.QUEEN)
  expect(bestCardToPlay(hand1, grill1, emptyTable)).toEqual(CARDS.CLUBS.SEVEN)
  expect(bestCardToPlay(hand2, grill1, emptyTable)).toEqual(CARDS.CLUBS.SEVEN)
  expect(bestCardToPlay(hand3, grill1, emptyTable)).toEqual(CARDS.HEARTS.SEVEN)
  expect(bestCardToPlay(hand4, grill1, emptyTable)).toEqual(CARDS.HEARTS.SEVEN)

  expect(bestCardToPlay(hand5, [], emptyTable)).toEqual(CARDS.HEARTS.KING)
  expect(bestCardToPlay(hand6, [], emptyTable)).toEqual(CARDS.SPADES.KING)
})