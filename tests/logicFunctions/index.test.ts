import { THE_BLACK_CAT_CARD } from '../../src/logic/constants'
import { Game } from '../../src/types/Game'
import { CARDS } from '../constants'
import { Card, Hand, Table } from '../../src/types/Cards'
import { Player } from '../../src/types/Player'
import {
  grillIsValid,
  handOverIsValid,
  isLastRound,
  normalizePlayerIndex,
  playerCanBeReady,
  playerCanHaveDealtDeck,
  playerCanTakeHandOver,
  playerHasExactSpaceForHandOver,
  playerHasHandover,
  tableIsFull,
} from '../../src/logic/functions'

// tslint:disable-next-line:no-any
const returnUndefined = (...args: any[]) => undefined
// tslint:disable-next-line:no-any
const throwNotNeeded = (...args: any[]): never => { throw Error('the function does not need this') }

const playerTemplate: Player = {
  name: 'player',
  id: '1234',

  hand: [],
  handOver: [],
  grills: [],
  pile: [],

  game: returnUndefined,
  room: returnUndefined,
  send: throwNotNeeded,
  sendToOthers: throwNotNeeded,
  sendToAll: throwNotNeeded,
}

const handTemplate: Hand = [
  THE_BLACK_CAT_CARD,
  CARDS.CLUBS.KING,
  CARDS.DIAMONDS.QUEEN,
  CARDS.HEARTS.ACE,
  CARDS.HEARTS.KING,
  CARDS.HEARTS.SEVEN,
  CARDS.SPADES.JACK,
  CARDS.CLUBS.NINE,
]

const handOverTemplate = [
  CARDS.DIAMONDS.QUEEN,
  CARDS.HEARTS.ACE,
  CARDS.SPADES.ACE,
]

const gameTemplate: Game = {
  room: 'someRoom',
  round: 0,
  table: [],
  grillsSnapshot: [],
  playerOnTurn: 'someRandomGuy',
}

const tableTemplate: Table = [
  CARDS.DIAMONDS.JACK,
  CARDS.HEARTS.EIGHT,
  CARDS.DIAMONDS.NINE,
  CARDS.DIAMONDS.ACE,
]

test('normalizePlayerIndex works for values 0 - 8', () => {
  const indexes =
    [0, 1, 2, 3, 4, 5, 6, 7, 8]
  const normalizedIndexes =
    [0, 1, 2, 3, 0, 1, 2, 3, 0]
  expect(normalizedIndexes.map(normalizePlayerIndex))
    .toEqual(normalizedIndexes)
})

describe('validators work', () => {
  test('handOverIsValid', () => {

    const player1: Player = {
      ...playerTemplate,
      waitForMe: true,
      shouldPassHandOver: true,
      hand: handTemplate,
    }

    const handOver1 = [CARDS.DIAMONDS.QUEEN, CARDS.HEARTS.ACE]
    const handOver2 = [...handOver1, CARDS.HEARTS.KING]
    const handOver3 = [...handOver2, CARDS.SPADES.JACK]
    const handOver4 = [...handOver1, CARDS.CLUBS.ACE]

    const parameters = [
      { handOver: handOver1, result: false },
      { handOver: handOver2, result: true },
      { handOver: handOver3, result: false },
      { handOver: handOver4, result: false },
    ].map(({ handOver, result }) => ({
      handOver,
      result,
      player: player1,
    }))

    parameters.forEach(({ player, handOver, result }) => {
      expect(handOverIsValid(handOver, player)).toBe(result)
    })
  })

  test('grillIsValid', () => {

    const player: Player = {
      ...playerTemplate,
      waitForMe: true,
      hand: handTemplate,
      game: () => gameTemplate,
    }

    const grill1 = [CARDS.HEARTS.SEVEN, CARDS.HEARTS.ACE]
    const grill2 = [...grill1, CARDS.HEARTS.KING]
    const grill3 = [...grill2, CARDS.HEARTS.JACK]
    const grill4 = [THE_BLACK_CAT_CARD]

    const parameters = [
      { grill: grill1, result: false },
      { grill: grill2, result: true },
      { grill: grill3, result: false },
      { grill: grill4, result: true },
    ].map(({ grill, result }) => ({
      grill,
      result,
      player,
    }))

    parameters.forEach(({ player, grill, result }) => {
      expect(grillIsValid(grill, player)).toBe(result)
    })
  })

  // TODO: test('playedCardIsValid', () => { })

  test('playerCanHaveDealtDeck', () => {
    const player1: Player = playerTemplate
    const player2: Player = { ...playerTemplate, waitForMe: true }
    const player3: Player = { ...player2, hand: [CARDS.CLUBS.ACE] }
    const player4: Player = { ...player3, hand: handTemplate }
    const player5: Player = { ...player4, game: () => gameTemplate }

    const parameters = [
      { player: player1, result: false },
      { player: player2, result: false },
      { player: player3, result: false },
      { player: player4, result: false },
      { player: player5, result: true },
    ]
    parameters.forEach(({ player, result }) => {
      expect(playerCanHaveDealtDeck(player)).toBe(result)
    })
  })

  // TODO: test('playerCanBeReady', () => { })

  test('playerHasHandover', () => {
    const player1: Player = playerTemplate
    const player2: Player = { ...playerTemplate, handOver: handOverTemplate }

    expect(playerHasHandover(player1)).toBeFalsy()
    expect(playerHasHandover(player2)).toBeTruthy()
  })

  test('playerHasExactSpaceForHandOver', () => {
    const player1: Player = playerTemplate
    const player2: Player = {
      ...playerTemplate,
      hand: [
        CARDS.CLUBS.EIGHT,
        CARDS.DIAMONDS.EIGHT,
        CARDS.HEARTS.ACE,
        CARDS.SPADES.TEN,
        CARDS.CLUBS.NINE,
      ],
    }
    const player3: Player = {
      ...playerTemplate,
      hand: [
        CARDS.CLUBS.EIGHT,
      ],
    }

    expect(playerHasExactSpaceForHandOver(player1)).toBeFalsy()
    expect(playerHasExactSpaceForHandOver(player2)).toBeTruthy()
    expect(playerHasExactSpaceForHandOver(player3)).toBeFalsy()
  })

  test('playerCanTakeHandOver', () => {
    const player1: Player = playerTemplate
    const player2: Player = {
      ...playerTemplate,
      handOver: handOverTemplate,
      hand: [
        CARDS.CLUBS.EIGHT,
        CARDS.DIAMONDS.EIGHT,
        CARDS.HEARTS.ACE,
        CARDS.SPADES.TEN,
        CARDS.CLUBS.NINE,
      ],
    }

    expect(playerCanTakeHandOver(player1)).toBeFalsy()
    expect(playerCanTakeHandOver(player2)).toBeTruthy()
  })

  test('tableIsFull', () => {
    const game1 = { ...gameTemplate }
    const game2 = { ...game1, table: tableTemplate }

    expect(tableIsFull(game1)).toBeFalsy()
    expect(tableIsFull(game2)).toBeTruthy()
  })

  test('isLastRound', () => {
    expect(isLastRound(0)).toBeFalsy()
    expect(isLastRound(7)).toBeFalsy()
    expect(isLastRound(8)).toBeTruthy()
    expect(isLastRound(9)).toBeFalsy()
  })
})

// TODO: describe('getBotResponse', () => {

// })