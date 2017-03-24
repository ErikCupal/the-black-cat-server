import { Cards } from '../constants'
import { Card } from '../../src/types/Cards'
import { Player } from '../../src/types/Player'
import '../../src/polyfill'
import { handOverIsValid, normalizePlayerIndex } from '../../src/logic/functions'

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

    const throwNotNeeded = (...args: any[]): never => { throw 'the function does not need this' }

    const playerTemplate: Player = {
      name: 'player',
      id: '1234',

      hand: [],
      handOver: [],
      grills: [],
      pile: [],

      isBot: false,

      waitForMe: true,
      shouldPassHandOver: true,

      game: throwNotNeeded,
      room: throwNotNeeded,
      send: throwNotNeeded,
      sendToOthers: throwNotNeeded,
      sendToAll: throwNotNeeded,
    }

    const hand1 = [
      Cards.Clubs.Jack,
      Cards.Clubs.King,
      Cards.Diamonds.Queen,
      Cards.Hearts.Ace,
      Cards.Hearts.King,
      Cards.Hearts.Seven,
      Cards.Spades.Jack,
      Cards.Clubs.Nine,
    ]

    const player1: Player = {
      ...playerTemplate,
      hand: hand1,
    }

    const handOver1 = [
      Cards.Diamonds.Queen,
      Cards.Hearts.Ace,
    ]

    const handOver2 = [
      ...handOver1,
      Cards.Hearts.King,
    ]

    const handOver3 = [
      ...handOver2,
      Cards.Spades.Jack,
    ]

    const handOver4 = [
      ...handOver1,
      Cards.Clubs.Ace,
    ]

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
})