import { Game } from '../../src/types/Game'
import { Cards, TheBlackCat } from '../constants'
import { Card, Hand, Table } from '../../src/types/Cards'
import { Player } from '../../src/types/Player'
import '../../src/polyfill'
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
  tableIsFull
} from '../../src/logic/functions'

const returnUndefined = (...args: any[]) => undefined
const throwNotNeeded = (...args: any[]): never => { throw 'the function does not need this' }

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
  TheBlackCat,
  Cards.Clubs.King,
  Cards.Diamonds.Queen,
  Cards.Hearts.Ace,
  Cards.Hearts.King,
  Cards.Hearts.Seven,
  Cards.Spades.Jack,
  Cards.Clubs.Nine,
]

const handOverTemplate = [
  Cards.Diamonds.Queen,
  Cards.Hearts.Ace,
  Cards.Spades.Ace,
]

const gameTemplate: Game = {
  room: 'someRoom',
  round: 0,
  table: [],
  grillsSnapshot: [],
  playerOnTurn: 'someRandomGuy',
}

const tableTemplate: Table = [
  Cards.Diamonds.Jack,
  Cards.Hearts.Eight,
  Cards.Diamonds.Nine,
  Cards.Diamonds.Ace,
]

test('normalizePlayerIndex works for values 0 - 8', () => {
  const indexes =
    [0, 1, 2, 3, 4, 5, 6, 7, 8]
  const normalizedIndexes =
    [0, 1, 2, 3, 0, 1, 2, 3, 0]
  expect(normalizedIndexes.map(normalizePlayerIndex))
    .toEqual(normalizedIndexes)
})

describe('validators', () => {
  test('handOverIsValid', () => {

    const player1: Player = {
      ...playerTemplate,
      waitForMe: true,
      shouldPassHandOver: true,
      hand: handTemplate,
    }

    const handOver1 = [Cards.Diamonds.Queen, Cards.Hearts.Ace]
    const handOver2 = [...handOver1, Cards.Hearts.King]
    const handOver3 = [...handOver2, Cards.Spades.Jack]
    const handOver4 = [...handOver1, Cards.Clubs.Ace]

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

    const grill1 = [Cards.Hearts.Seven, Cards.Hearts.Ace]
    const grill2 = [...grill1, Cards.Hearts.King]
    const grill3 = [...grill2, Cards.Hearts.Jack]
    const grill4 = [TheBlackCat]

    const parameters = [
      { grill: grill1, result: false },
      { grill: grill2, result: true },
      { grill: grill3, result: false },
      { grill: grill4, result: true },
    ].map(({ grill, result }) => ({
      grill,
      result,
      player: player,
    }))

    parameters.forEach(({ player, grill, result }) => {
      expect(grillIsValid(grill, player)).toBe(result)
    })
  })

  // TODO: test('playedCardIsValid', () => { })

  test('playerCanHaveDealtDeck', () => {
    const player1: Player = playerTemplate
    const player2: Player = { ...playerTemplate, waitForMe: true }
    const player3: Player = { ...player2, hand: [Cards.Clubs.Ace] }
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
        Cards.Clubs.Eight,
        Cards.Diamonds.Eight,
        Cards.Hearts.Ace,
        Cards.Spades.Ten,
        Cards.Clubs.Nine,
      ]
    }
    const player3: Player = {
      ...playerTemplate,
      hand: [
        Cards.Clubs.Eight,
      ]
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
        Cards.Clubs.Eight,
        Cards.Diamonds.Eight,
        Cards.Hearts.Ace,
        Cards.Spades.Ten,
        Cards.Clubs.Nine,
      ]
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