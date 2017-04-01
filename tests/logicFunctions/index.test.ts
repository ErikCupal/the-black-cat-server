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
  playedCardIsValid,
  playerCanBeReady,
  playerCanHaveDealtDeck,
  playerCanTakeHandOver,
  playerHasExactSpaceForHandOver,
  playerHasHandover,
  playersAreReadyToPlay,
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

  test('playedCardIsValid', () => {
    const table = [
      CARDS.DIAMONDS.JACK,
      CARDS.HEARTS.EIGHT,
    ]
    const game1 = {
      ...gameTemplate,
      table,
      playerOnTurn: 'john',
    }
    const game2 = { ...game1, playerOnTurn: 'bob' }
    const player1 = { ...playerTemplate, name: 'bob' }
    const player2 = { ...player1, game: () => game1 }
    const player3 = { ...player2, game: () => game2 }
    const player4 = { ...player3, hand: handTemplate }

    expect(playedCardIsValid(CARDS.DIAMONDS.QUEEN, player1)).toBeFalsy()
    expect(playedCardIsValid(CARDS.DIAMONDS.QUEEN, player2)).toBeFalsy()
    expect(playedCardIsValid(CARDS.DIAMONDS.QUEEN, player3)).toBeFalsy()
    expect(playedCardIsValid(CARDS.HEARTS.SEVEN, player4)).toBeFalsy()
    expect(playedCardIsValid(CARDS.DIAMONDS.QUEEN, player4)).toBeTruthy()
  })

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

  test('playerCanBeReady', () => {
    const game1 = gameTemplate
    const player1 = { ...playerTemplate, name: 'bob' }
    const player2 = { ...player1, game: () => game1 }
    const player3 = { ...player2, didPassedHandOver: true }
    const player4 = { ...player3, hand: handTemplate }
    const player5 = { ...player4, handOver: [CARDS.CLUBS.ACE] }

    expect(playerCanBeReady(player1)).toBeFalsy()
    expect(playerCanBeReady(player2)).toBeFalsy()
    expect(playerCanBeReady(player3)).toBeFalsy()
    expect(playerCanBeReady(player4)).toBeTruthy()
    expect(playerCanBeReady(player5)).toBeFalsy()
  })

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

  test('playersAreReadyToPlay', () => {
    const player1 = playerTemplate
    const player2 = { ...player1, didPassedHandOver: true }
    const player3 = { ...player2, waitForMe: true }
    const player4 = { ...player3, hand: handTemplate }
    const player5 = { ...player4, handOver: [CARDS.CLUBS.ACE] }
    const player6 = { ...player5, handOver: [] }
    const player7 = { ...player6, waitForMe: false }

    const players1 = [player7, player1, player1, player1]
    const players2 = [player7, player2, player2, player2]
    const players3 = [player7, player3, player3, player3]
    const players4 = [player7, player4, player4, player4]
    const players5 = [player7, player5, player5, player5]
    const players6 = [player7, player6, player6, player6]
    const players7 = [player7, player7, player7, player7]

    expect(playersAreReadyToPlay(players1)).toBeFalsy()
    expect(playersAreReadyToPlay(players2)).toBeFalsy()
    expect(playersAreReadyToPlay(players3)).toBeFalsy()
    expect(playersAreReadyToPlay(players4)).toBeFalsy()
    expect(playersAreReadyToPlay(players5)).toBeFalsy()
    expect(playersAreReadyToPlay(players6)).toBeFalsy()
    expect(playersAreReadyToPlay(players7)).toBeTruthy()
  })

  // TODO:  test('playersHaveDeckDealt', () => {})
  // TODO:  test('playersWantNewGame', () => {})
  // TODO:  test('roomIsFull', () => {})
  // TODO:  test('createLatestScores', () => {})
  // TODO:  test('getPlayersGrills', () => {})
})

// TODO: describe('getBotResponse', () => {

// })