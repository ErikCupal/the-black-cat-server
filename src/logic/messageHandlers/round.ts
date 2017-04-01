import { Player } from '../../types/Player'
import { Name } from '../../types/Name'
import { cardEqual } from '../functions/cards'
import { isLastRound, playedCardIsValid, tableIsFull } from '../functions'
import { MessageHandlersDI } from '../'
import { Game } from '../../types/Game'
import { PLAY_CARD } from '../../types/Messages/ClientMessage'
import { LOGIC_FINISH_ROUND, LOGIC_GAME_END, LOGIC_NEXT_ROUND } from '../../types/Messages/LogicMessage'
import { CARD_PLAYED, NEXT_ROUND, NEXT_TURN, TRICK_FINISHED } from '../../types/Messages/ServerMessage'
import {
  STATE_NEXT_ROUND,
  STATE_NEXT_TURN,
  STATE_PASS_TRICK,
  STATE_PLAY_CARD,
} from '../../types/Messages/StateMessage'
import { Room } from '../../types/Room'

export const createRoundMessageHandlers = (injection: MessageHandlersDI) => {

  const {
    findRoom,
    findGame,
    findPlayer,
    seconds,
    getPlayerWithHighestCard,
    dispatch,
    getPlayerOnLeftName,
  } = injection

  const onNextRound = async ({ roomName }: LOGIC_NEXT_ROUND) => {
    const room = findRoom(roomName) as Room
    room.send({ type: NEXT_ROUND })

    await seconds(2)

    const game = findGame(roomName) as Game
    if (game && game.playerOnTurn) {
      room.send({ type: NEXT_TURN, playerOnTurn: game.playerOnTurn })
    }
  }

  const afterTrickFinished = (game: Game, trickReceiverIndex: number) => {
    const room = findRoom(game.room) as Room
    if (!isLastRound(game.round)) {
      const playerOnTurn = room.players[trickReceiverIndex]
      dispatch({ type: STATE_NEXT_ROUND, room, playerOnTurn })
      dispatch({ type: LOGIC_NEXT_ROUND, roomName: room.name })
    } else {
      dispatch({ type: LOGIC_GAME_END, roomName: room.name })
    }
  }

  const onFinishRound = async ({ roomName }: LOGIC_FINISH_ROUND) => {
    const room = findRoom(roomName) as Room
    const game = findGame(roomName) as Game
    const trick = game.table
    const trickReceiver = getPlayerWithHighestCard(room)

    dispatch({ type: STATE_PASS_TRICK, receiver: trickReceiver, trick })
    trickReceiver.sendToAll({ type: TRICK_FINISHED, receiver: trickReceiver.name })

    const trickReceiverIndex = room.players.indexOf(trickReceiver.name)

    await seconds(2)

    const updatedGame = findGame(room.name)
    if (updatedGame) {
      afterTrickFinished(game, trickReceiverIndex)
    }
  }

  const afterCardPlayed = (game: Game, player: Player) => {
    if (!tableIsFull(game)) {
      const playerOnTurn = getPlayerOnLeftName(player.name)
      dispatch({ type: STATE_NEXT_TURN, room: game.room, playerOnTurn })
      player.sendToAll({ type: NEXT_TURN, playerOnTurn })
    } else {
      dispatch({ type: LOGIC_FINISH_ROUND, roomName: game.room })
    }
  }

  const onPlayCard = async ({ player, card }: PLAY_CARD) => {
    if (playedCardIsValid(card, player)) {
      const cardFromGrill: boolean = !!player.grills.find(cardEqual(card))

      dispatch({ type: STATE_PLAY_CARD, player, card })
      player.sendToOthers({ type: CARD_PLAYED, player: player.name, card, cardFromGrill })

      const room = player.room() as Room

      await seconds(1)

      const game = findGame(room.name)
      if (game) {
        const currentPlayerName = game.playerOnTurn
        const currentPlayer = findPlayer(currentPlayerName) as Player
        afterCardPlayed(game, currentPlayer)
      }
    }
  }

  return {
    onNextRound,
    onFinishRound,
    onPlayCard,
  }
}