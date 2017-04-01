import { shuffle, last, flatMap } from 'lodash'
import { MessageHandlersDI } from '../'
import { Name } from '../../types/Name'
import {
  DECK_DEALT,
  I_AM_READY,
  I_WANT_NEW_GAME,
  PLAY_GRILL,
  PLAY_HAND_OVER,
  TAKE_HANDOVER
} from '../../types/Messages/ClientMessage'
import {
  LOGIC_GAME_END,
  LOGIC_GAME_START,
  LOGIC_NEXT_ROUND,
  LOGIC_PLAYERS_READY
} from '../../types/Messages/LogicMessage'
import {
  DEAL_DECK,
  DO_PASS_HANDOVER,
  DO_TAKE_HANDOVER,
  GAME_ENDED,
  GAME_STARTED,
  GRILL_PLAYED,
  HAND_OVER_PLAYED,
  HAND_OVER_TAKEN,
  UPDATED_SCORES
} from '../../types/Messages/ServerMessage'
import {
  STATE_ADD_SCORES,
  STATE_CARDS_TO_HAND,
  STATE_CREATE_GAME,
  STATE_CREATE_GRILLS_SNAPSHOT,
  STATE_NEXT_ROUND,
  STATE_PASS_GRILL,
  STATE_PASS_HANDOVER,
  STATE_REMOVE_GAME,
  STATE_REMOVE_PLAYER_CARDS,
  STATE_SET_GAME_STARTING_PLAYER,
  STATE_SET_PLAYER_PASSED_HANDOVER,
  STATE_SET_PLAYER_SHOULD_PASS_HANDOVER,
  STATE_SET_PLAYER_WAIT_FOR_ME,
  STATE_SET_PLAYER_WANTS_NEW_GAME,
  STATE_TAKE_HANDOVER
} from '../../types/Messages/StateMessage'
import { Player } from '../../types/Player'
import { Room } from '../../types/Room'
import {
  playersAreReadyToPlay,
  createLatestScores,
  getPlayersGrills,
  grillIsValid,
  handOverIsValid,
  playerCanBeReady,
  playerCanHaveDealtDeck,
  playerCanTakeHandOver,
  playerHasExactSpaceForHandOver,
  playerHasHandover,
  playersHaveDeckDealt
} from '../functions'
import { createDeck, getPlayerHand } from '../functions/cards'

export const createGameMessageHandlers = (injection: MessageHandlersDI) => {

  const {
    dispatch,
    findRoom,
    getPlayersInRoom,
    seconds,
    getGameScores,
    getPlayerOnLeft,
    getGameStartingPlayer,
  } = injection

  const dealCards = (room: Name) => {
    const deck = shuffle(createDeck())
    getPlayersInRoom(room).forEach((player, index) => {
      const hand = getPlayerHand(deck, index)
      dispatch({ type: STATE_CARDS_TO_HAND, player: player.name, cards: hand })
      dispatch({
        type: STATE_SET_PLAYER_WAIT_FOR_ME,
        player: player.name,
        value: true
      })
      player.send({
        type: DEAL_DECK,
        hand,
      })
    })
  }

  const onGameStart = async ({ roomName, newRoom }: LOGIC_GAME_START) => {

    getPlayersInRoom(roomName).forEach(player => {
      dispatch({ type: STATE_SET_PLAYER_WANTS_NEW_GAME, player: player.name, value: false })
    })

    const gameStartingPlayer = getGameStartingPlayer(roomName, Math.random, newRoom)
    dispatch({ type: STATE_SET_GAME_STARTING_PLAYER, room: roomName, player: gameStartingPlayer })

    dispatch({ type: STATE_CREATE_GAME, room: roomName, playerOnTurn: gameStartingPlayer })
    await seconds(1)

    const room = findRoom(roomName)
    if (room) {
      room.send({ type: GAME_STARTED })
      dealCards(roomName)
    }
  }

  const onGameEnd = ({ roomName }: LOGIC_GAME_END) => {
    const gameScores = getGameScores(roomName)
    dispatch({ type: STATE_ADD_SCORES, room: roomName, gameScores })

    const room = findRoom(roomName) as Room
    const latestScores = createLatestScores(room.scores)
    room.send({ type: UPDATED_SCORES, scores: latestScores })

    dispatch({ type: STATE_REMOVE_GAME, room: roomName })
    getPlayersInRoom(roomName).forEach(player => {
      dispatch({ type: STATE_REMOVE_PLAYER_CARDS, player: player.name })
    })
    getPlayersInRoom(roomName).forEach(player => {
      dispatch({ type: STATE_SET_PLAYER_PASSED_HANDOVER, player: player.name, value: false })
    })

    room.send({ type: GAME_ENDED })
  }

  const onPlayerDeckDealt = ({ player }: DECK_DEALT) => {
    if (playerCanHaveDealtDeck(player)) {
      const room = player.room() as Room
      dispatch({ type: STATE_SET_PLAYER_WAIT_FOR_ME, player: player.name, value: false })

      const players = getPlayersInRoom(room.name)
      if (playersHaveDeckDealt(players)) {
        players.forEach(player => {
          dispatch({ type: STATE_SET_PLAYER_WAIT_FOR_ME, player: player.name, value: true })
          dispatch({ type: STATE_SET_PLAYER_SHOULD_PASS_HANDOVER, player: player.name, value: true })

          player.send({ type: DO_PASS_HANDOVER })
        })
      }
    }
  }

  const onPlayHandOver = ({ player, handOver }: PLAY_HAND_OVER) => {
    if (handOverIsValid(handOver, player)) {
      const leftPlayer = getPlayerOnLeft(player.name) as Player

      dispatch({ type: STATE_PASS_HANDOVER, handOver, from: player.name, to: leftPlayer.name })
      dispatch({ type: STATE_SET_PLAYER_SHOULD_PASS_HANDOVER, player: player.name, value: false })
      player.sendToOthers({ type: HAND_OVER_PLAYED, from: player.name })

      if (playerHasHandover(player)) {
        player.send({ type: DO_TAKE_HANDOVER, handOver: player.handOver })
      }
      if (playerHasExactSpaceForHandOver(leftPlayer)) {
        leftPlayer.send({ type: DO_TAKE_HANDOVER, handOver })
      }
    }
  }

  const onTakeHandOver = ({ player }: TAKE_HANDOVER) => {
    if (playerCanTakeHandOver(player)) {
      dispatch({ type: STATE_TAKE_HANDOVER, player: player.name })
      player.sendToOthers({ type: HAND_OVER_TAKEN, player: player.name })
    }
  }

  const onPlayGrill = ({ player, grill }: PLAY_GRILL) => {
    if (grillIsValid(grill, player)) {
      dispatch({ type: STATE_PASS_GRILL, player: player.name, grill })
      player.sendToOthers({ type: GRILL_PLAYED, player: player.name, grill })
    }
  }

  const resetPassedHandOverFlag = (player: Player) => {
    dispatch({ type: STATE_SET_PLAYER_PASSED_HANDOVER, player: player.name, value: false })
  }

  const onPlayerIsReady = ({ player }: I_AM_READY) => {
    if (playerCanBeReady(player)) {
      const room = player.room() as Room
      dispatch({ type: STATE_SET_PLAYER_WAIT_FOR_ME, player: player.name, value: false })

      const players = getPlayersInRoom(room.name)
      if (playersAreReadyToPlay(players)) {
        players.forEach(p => resetPassedHandOverFlag(p))
        dispatch({ type: LOGIC_PLAYERS_READY, roomName: room.name })
      }
    }
  }

  const onPlayersReady = ({ roomName }: LOGIC_PLAYERS_READY) => {
    const room = findRoom(roomName) as Room
    const roomGrills = getPlayersGrills(getPlayersInRoom(roomName))

    dispatch({ type: STATE_CREATE_GRILLS_SNAPSHOT, roomName, grills: roomGrills })
    dispatch({ type: STATE_NEXT_ROUND, room })
    dispatch({ type: LOGIC_NEXT_ROUND, roomName })
  }

  return {
    onGameStart,
    onGameEnd,
    onPlayerDeckDealt,
    onPlayHandOver,
    onTakeHandOver,
    onPlayGrill,
    onPlayerIsReady,
    onPlayersReady,
  }
}