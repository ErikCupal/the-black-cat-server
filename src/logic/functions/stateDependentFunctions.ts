import { shuffle } from 'lodash'
import { botNicks } from '../constants'
import returnof from 'returnof'
import ServerMessage from '../../types/Messages/ServerMessage'
import { getBotResponse, normalizePlayerIndex } from '.'
import { DispatchForBot } from '../../core'
import { Game } from '../../types/Game'
import { Id } from '../../types/Id'
import { I_WANT_NEW_GAME } from '../../types/Messages/ClientMessage'
import { DEAL_DECK, DO_PASS_HANDOVER, DO_TAKE_HANDOVER, NEXT_TURN } from '../../types/Messages/ServerMessage'
import { Name } from '../../types/Name'
import { Bot, NonregisteredPlayer, Player } from '../../types/Player'
import { Room } from '../../types/Room'
import { State } from '../../types/State'
import { getHighestCardOnTable, getPenaltyPoints } from './cards'

export const createStateDependentFunctions = (getState: () => State) => {

  const findPlayer = (playerName: string | undefined): Player | undefined => {
    const { players } = getState()
    return players.find(p => p.name === playerName)
  }

  const findRoom = (roomName: string | undefined): Room | undefined => {
    const { rooms } = getState()
    return rooms.find(r => r.name === roomName)
  }

  const findGame = (roomName: string | undefined): Game | undefined => {
    const { games } = getState()
    return games.find(g => g.room === roomName)
  }

  const getPlayersInRoom = (roomName: string | undefined): Player[] => {
    const room = findRoom(roomName)
    if (room) {
      const playersInRoom = room.players
        .map(playerName => findPlayer(playerName))
        .filter(player => player !== undefined) as Player[]

      return playersInRoom
    }
    return []
  }

  const findPlayerInRoom = (player: Name, room: Name): Player | undefined => {
    const playersInRoom = getPlayersInRoom(room)
    return playersInRoom.find(p => p.name === player)
  }

  const getAllRooms = (): Room[] => getState().rooms

  const getRoomNamesAndAvailability = (): { name: Name, available: boolean }[] => {
    return getAllRooms()
      .map(({ name, players }) => ({ name, available: players.length < 4 }))
  }

  const getAllPlayers = (): Player[] => getState().players

  const getPlayerOnLeftName = (playerName: string): string => {
    const player = findPlayer(playerName) as Player
    const room = player.room() as Room
    const playerIndex = room.players.findIndex(player => player === playerName)

    const playerOnLeftIndex = normalizePlayerIndex(playerIndex + 1)
    const playerOnLeftName = room.players[playerOnLeftIndex]
    return playerOnLeftName
  }

  const getPlayerOnLeft = (playerName: string): Player => {
    const playerOnLeftName = getPlayerOnLeftName(playerName)
    return findPlayer(playerOnLeftName) as Player
  }

  const getRandomPlayer = (roomName: Name, randomNumberGenerator: () => number): Name => {
    const players = getPlayersInRoom(roomName)
    const randomIndex = Math.floor(randomNumberGenerator() * players.length)
    return players[randomIndex].name
  }

  const getGameStartingPlayer = (roomName: Name, randomNumberGenerator: () => number, newRoom?: boolean): Name => {
    const room = findRoom(roomName) as Room
    const gameStartingPlayer = newRoom
      ? getRandomPlayer(roomName, randomNumberGenerator)
      : getPlayerOnLeftName(room.gameStartingPlayer as string)

    return gameStartingPlayer
  }

  const getPlayerWithHighestCard = (room: Room): Player => {
    const game = findGame(room.name) as Game
    const highestCard = getHighestCardOnTable(game.table)
    const highestCardIndex = game.table.indexOf(highestCard)

    const currentPlayerOnTurn = game.playerOnTurn as string
    const startingPlayerIndex = normalizePlayerIndex(room.players.indexOf(currentPlayerOnTurn) + 1)

    const highestCardPlayerIndex = normalizePlayerIndex(startingPlayerIndex + highestCardIndex)
    const highestCardPlayerName = room.players[highestCardPlayerIndex]
    const highestCardPlayer = findPlayer(highestCardPlayerName) as Player

    return highestCardPlayer
  }

  const getGameScores = (roomName: Name) => {
    const game = findGame(roomName) as Game
    const grilledCards = game.grillsSnapshot

    return getPlayersInRoom(roomName)
      .map(player => ({
        player: player.name,
        points: getPenaltyPoints(grilledCards)(player.pile)
      }))
  }

  const getRandomNick = (shuffleArray: typeof shuffle): Name => {
    const possibleBotNicks = botNicks
      .filter(nick => !getAllPlayers().find(p => p.name === nick))
    const [nick] = shuffleArray(possibleBotNicks)
    return nick
  }

  // validators

  const playerExists = (name: string | undefined): boolean => !!findPlayer(name)

  const roomExists = (name: string | undefined): boolean => !!findRoom(name)

  const playerCanCreateRoom = (name: Name, player: Player): boolean => {
    const playerCanCreateRoom =
      name.length <= 100
      && !findPlayerInRoom(player.name, name)
      && !roomExists(name)
      && !player.room()
      && getAllRooms().length < 4

    return playerCanCreateRoom
  }

  const playerCanJoinRoom = (name: Name, player: Player): boolean => {
    const room = findRoom(name)

    const playerCanJoinRoom =
      !findPlayerInRoom(player.name, name)
      && !player.game()
      && !!room
      && room.players.length < 4

    return playerCanJoinRoom
  }

  const playerCanRegister = (player: NonregisteredPlayer, name: Name): boolean => {
    const playerCanRegister =
      name.length <= 100
      && !playerExists(name)
      && !player.name

    return playerCanRegister
  }

  // creators

  const createRoom = (name: Name, player: Name): Room => {
    const room = {
      name,
      players: [player],
      scores: [{
        player,
        points: []
      }],
      send: (message: ServerMessage) => {
        getPlayersInRoom(name).forEach(player => {
          player.send(message)
        })
      },
      game: () => findGame(name)
    }

    return room
  }

  const botCreatorFactory = (
    dispatch: DispatchForBot,
    seconds: (seconds: number) => Promise<void>,
    shuffleArray: typeof shuffle
  ) => {

    const createBot = (player?: NonregisteredPlayer): Bot => {

      const nick = getRandomNick(shuffleArray)

      const room = () => {
        const room = getState().rooms.find(r => !!r.players.find(player => player === nick))
        return room
      }

      const game = () => {
        const _room = room()
        const game = _room && _room.game()
        return game
      }

      const getPlayer = () => findPlayer(nick)

      const send = async (message: ServerMessage) => {
        await seconds(0)

        const player = getPlayer()
        if (player) {
          const botMessages = await getBotResponse(message, seconds, getPlayer)
          const player = getPlayer()
          if (player && botMessages) {
            botMessages.forEach(message => {
              dispatch({ ...message, player: getPlayer() })
            })
          }
        }
      }

      const hookIntoGame = () => {
        const bot = getPlayer() as Bot
        const room = bot.room() as Room

        const game = bot.game()
        if (game) {
          if (game.round === 0) {
            if (bot.waitForMe && !bot.didPassedHandOver && bot.hand.length === 8) {
              if (bot.shouldPassHandOver) {
                bot.send({ type: DO_PASS_HANDOVER })
              } else {
                bot.send({ type: DEAL_DECK, hand: bot.hand })
              }
            } else if (bot.didPassedHandOver && bot.handOver.length === 3) {
              bot.send({ type: DO_TAKE_HANDOVER, handOver: bot.handOver })
            }
          } else if (game.playerOnTurn === bot.name && bot.hand.length > 0) {
            bot.send({ type: NEXT_TURN, playerOnTurn: bot.name })
          }
        } else {
          if (!bot.wantsNewGame) {
            dispatch({ type: I_WANT_NEW_GAME, player: bot })
          }
        }
      }

      const bot: Bot = {
        id: nick,
        name: nick,

        hand: player ? player.hand : [],
        handOver: player ? player.handOver : [],
        grills: player ? player.grills : [],
        pile: player ? player.pile : [],

        isBot: true,

        waitForMe: player ? player.waitForMe : undefined,
        didPassedHandOver: player ? player.didPassedHandOver : undefined,
        wantsNewGame: player ? player.wantsNewGame : true,
        shouldPassHandOver: player ? player.shouldPassHandOver : undefined,

        room,
        game,

        send,
        sendToOthers: (message: ServerMessage) => {
          const _room = room()
          const roomName = _room && _room.name
          getPlayersInRoom(roomName).forEach(player => {
            player.send(message)
          })
        },
        sendToAll: (message: ServerMessage) => {
          send(message)

          const _room = room()
          const roomName = _room && _room.name
          getPlayersInRoom(roomName).forEach(player => {
            player.send(message)
          })
        },

        hookIntoGame,
      }

      return bot
    }

    return createBot
  }


  return {

    findPlayer,
    findRoom,
    findGame,
    getPlayersInRoom,
    getRoomNamesAndAvailability,
    getAllPlayers,
    getPlayerOnLeftName,
    getPlayerOnLeft,
    getGameStartingPlayer,
    getPlayerWithHighestCard,
    getGameScores,

    // validators
    playerCanCreateRoom,
    playerCanJoinRoom,
    playerCanRegister,

    // creators
    createRoom,
    botCreatorFactory,
  }
}

const createFunctionsReturnValue = returnof(createStateDependentFunctions)

/**
 * Object of functions, which can read
 * the current version of state via injected [getState] function,
 * but do not produce any other side effects.
 */
export type StateDependantFunctions = typeof createFunctionsReturnValue