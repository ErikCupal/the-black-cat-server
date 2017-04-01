import { PlayerScore } from '../../src/types/PlayerScore'
import { Room } from '../../src/types/Room'
// tslint:disable-next-line:max-file-line-count
import {
  ClientMessage,
  DECK_DEALT,
  I_AM_READY,
  I_WANT_NEW_GAME,
  PLAY_CARD,
  PLAY_HAND_OVER,
  TAKE_HANDOVER,
} from '../../src/types/Messages/ClientMessage'
import {
  AVAILABLE_ROOMS,
  DEAL_DECK,
  DO_PASS_HANDOVER,
  DO_TAKE_HANDOVER,
  GAME_ENDED,
  NEXT_TURN,
} from '../../src/types/Messages/ServerMessage'
import { THE_BLACK_CAT_CARD } from '../../src/logic/constants'
import { Game } from '../../src/types/Game'
import { CARDS } from '../constants'
import { Card, Hand, HandOver, Table } from '../../src/types/Cards'
import { Player } from '../../src/types/Player'
import {
  createLatestScores,
  getBotResponse,
  getPlayersGrills,
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
  playersHaveDeckDealt,
  playersWantNewGame,
  roomIsFull,
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

const roomTemplate: Room = {
  name: 'someRoom',
  gameStartingPlayer: 'johny',
  scores: [],
  players: [],
  game: () => undefined,
  send: throwNotNeeded,
}

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

  test('playersHaveDeckDealt', () => {
    const player1 = playerTemplate
    const player2 = { ...player1, waitForMe: true }
    const player3 = { ...player2, hand: handTemplate }
    const player4 = { ...player3, handOver: [CARDS.CLUBS.ACE] }
    const player5 = { ...player4, handOver: [] }
    const player6 = { ...player5, waitForMe: false }

    const players1 = [player6, player1, player1, player1]
    const players2 = [player6, player2, player2, player2]
    const players3 = [player6, player3, player3, player3]
    const players4 = [player6, player4, player4, player4]
    const players5 = [player6, player5, player5, player5]
    const players6 = [player6, player6, player6, player6]

    expect(playersHaveDeckDealt(players1)).toBeFalsy()
    expect(playersHaveDeckDealt(players2)).toBeFalsy()
    expect(playersHaveDeckDealt(players3)).toBeFalsy()
    expect(playersHaveDeckDealt(players4)).toBeFalsy()
    expect(playersHaveDeckDealt(players5)).toBeFalsy()
    expect(playersHaveDeckDealt(players6)).toBeTruthy()
  })

  test('playersWantNewGame', () => {
    const player1 = playerTemplate
    const player2 = { ...player1, wantsNewGame: true }

    const players1 = [player2, player1, player1, player1]
    const players2 = [player2, player2, player2, player2]

    expect(playersWantNewGame(players1)).toBeFalsy()
    expect(playersWantNewGame(players2)).toBeTruthy()
  })

  test('roomIsFull', () => {
    const room1: Room = { ...roomTemplate }
    const room2: Room = {
      ...room1,
      players: ['player1', 'player2', 'player3', 'player4'],
    }

    expect(roomIsFull(room1)).toBeFalsy()
    expect(roomIsFull(room2)).toBeTruthy()
  })

  test('createLatestScores', () => {
    const scores: PlayerScore[] = [
      { player: 'player1', points: [1, 2, 3] },
      { player: 'player2', points: [0, 5, 6] },
      { player: 'player3', points: [14, 8, 20] },
      { player: 'player4', points: [9, 7, 4] },
    ]
    const expectedLatestScores = [
      { player: 'player1', points: 3 },
      { player: 'player2', points: 6 },
      { player: 'player3', points: 20 },
      { player: 'player4', points: 4 },
    ]

    expect(createLatestScores(scores)).toEqual(expectedLatestScores)
  })

  test('getPlayersGrills', () => {
    const player1 = playerTemplate
    const player2 = { ...player1 }
    const player3 = { ...player1, grills: [THE_BLACK_CAT_CARD] }
    const player4 = { ...player1, grills: [CARDS.HEARTS.EIGHT, CARDS.HEARTS.NINE, CARDS.HEARTS.JACK] }

    const players = [player1, player2, player3, player4]

    const expectedGrills = [THE_BLACK_CAT_CARD, CARDS.HEARTS.EIGHT, CARDS.HEARTS.NINE, CARDS.HEARTS.JACK]

    expect(getPlayersGrills(players)).toEqual(expectedGrills)
  })
})

describe('getBotResponse works', () => {
  const seconds = (seconds: number) => Promise.resolve()

  describe('works for AVAILABLE_ROOMS message', async () => {
    const player = playerTemplate

    expect(await getBotResponse({ type: AVAILABLE_ROOMS, rooms: [] }, seconds, () => undefined)).toBeUndefined()
  })

  describe('GAME_ENDED works', () => {
    const player = playerTemplate

    test('works when player exists', async () => {
      const response = await getBotResponse({ type: GAME_ENDED }, seconds, () => player) as ClientMessage[]
      expect(response.length).toBe(1)
      expect(response[0]).toEqual({ type: I_WANT_NEW_GAME, player })
    })

    test('works when player does not exist', async () => {
      expect(await getBotResponse({ type: GAME_ENDED }, seconds, () => undefined)).toBeUndefined()
    })
  })

  describe('NEXT_TURN works', () => {
    const table = [
      CARDS.DIAMONDS.JACK,
      CARDS.HEARTS.EIGHT,
    ]
    const game = { ...gameTemplate, table, playerOnTurn: 'bob' }
    const player = {
      ...playerTemplate,
      name: 'bob',
      hand: handTemplate,
      game: () => game,
    }

    const expectedCard = CARDS.DIAMONDS.QUEEN

    test('works when player and game exist and player is on turn', async () => {
      const response = await getBotResponse({
        type: NEXT_TURN,
        playerOnTurn: 'bob',
      }, seconds, () => player) as ClientMessage[]

      expect(response.length).toBe(1)
      expect(response[0]).toEqual({ type: PLAY_CARD, card: expectedCard, player })
    })

    test('works when player and game exist and player is not on turn', async () => {
      const response = await getBotResponse({
        type: NEXT_TURN,
        playerOnTurn: 'john',
      }, seconds, () => player) as ClientMessage[]

      expect(response).toBeUndefined()
    })

    test('works when player does not exist', async () => {
      const response = await getBotResponse({ type: NEXT_TURN, playerOnTurn: 'bob' }, seconds, () => undefined)
      expect(response).toBeUndefined()
    })

    test('works when game does not exist', async () => {
      const playerWithNoGame = { ...player, game: () => undefined }
      const response = await getBotResponse({ type: NEXT_TURN, playerOnTurn: 'bob' }, seconds, () => undefined)
      expect(response).toBeUndefined()
    })

    test('works when player was removed in the paused time', async () => {
      let mutablePlayer: Player | undefined = player
      const getPlayer = () => mutablePlayer

      const responsePromise = getBotResponse({ type: NEXT_TURN, playerOnTurn: 'bob' }, seconds, getPlayer)
      mutablePlayer = undefined
      const response = await responsePromise

      expect(response).toBeUndefined()
    })

    test('works when game was removed in the paused time', async () => {
      const playerWithMutableGame = player
      const getPlayer = () => playerWithMutableGame

      const responsePromise = getBotResponse({ type: NEXT_TURN, playerOnTurn: 'bob' }, seconds, getPlayer)
        // tslint:disable-next-line:no-any
        ; (playerWithMutableGame as any).game = () => undefined
      const response = await responsePromise

      expect(response).toBeUndefined()
    })
  })

  describe('DEAL_DECK works', () => {
    const player = playerTemplate

    test('works when player exists', async () => {
      const response = await getBotResponse({
        type: DEAL_DECK,
        hand: handTemplate,
      }, seconds, () => player) as ClientMessage[]

      expect(response.length).toBe(1)
      expect(response[0]).toEqual({ type: DECK_DEALT, player })
    })

    test('works when player does not exist', async () => {
      const response = await getBotResponse({
        type: DEAL_DECK,
        hand: handTemplate,
      }, seconds, () => undefined)

      expect(response).toBeUndefined()
    })
  })

  describe('DO_PASS_HANDOVER works', () => {
    const player = { ...playerTemplate, hand: handTemplate }
    const expectedHandOver = [
      CARDS.HEARTS.ACE,
      CARDS.HEARTS.KING,
      CARDS.CLUBS.KING,
    ]

    test('works when player exists', async () => {
      const response = await getBotResponse({ type: DO_PASS_HANDOVER }, seconds, () => player) as ClientMessage[]

      expect(response.length).toBe(1)
      expect(response[0]).toEqual({ type: PLAY_HAND_OVER, handOver: expectedHandOver, player })
    })

    test('works when player does not exist', async () => {
      const response = await getBotResponse({ type: DO_PASS_HANDOVER }, seconds, () => undefined)
      expect(response).toBeUndefined()
    })

    test('works when player was removed in the paused time', async () => {

      let mutablePlayer: Player | undefined = player
      const getPlayer = () => mutablePlayer

      const responsePromise = getBotResponse({ type: DO_PASS_HANDOVER }, seconds, getPlayer)
      mutablePlayer = undefined
      const response = await responsePromise

      expect(response).toBeUndefined()
    })
  })
  
  describe('DO_TAKE_HANDOVER works', () => {
    const player = playerTemplate

    test('works when player exists', async () => {
      const response = await getBotResponse({
        type: DO_TAKE_HANDOVER,
        handOver: handOverTemplate,
      }, seconds, () => player) as ClientMessage[]

      expect(response.length).toBe(2)
      expect(response[0]).toEqual({ type: TAKE_HANDOVER, player })
      expect(response[1]).toEqual({ type: I_AM_READY, player })
    })

    test('works when player does not exist', async () => {
      const response = await getBotResponse({
        type: DEAL_DECK,
        hand: handTemplate,
      }, seconds, () => undefined)

      expect(response).toBeUndefined()
    })
  })
})