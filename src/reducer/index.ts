import { State } from '../types/State'
import { Reducer, combineReducers } from 'redux'
import players from './players'
import rooms from './rooms'
import games from './games'

/**
 * The game state [reducer](http://redux.js.org/docs/basics/Reducers.html).
 * 
 * The reducer is combined of rooms, players and games reducers
 * in order to make it less verbose.
 */
const reducer: Reducer<State> = combineReducers<State>({
  rooms,
  players,
  games,
})

export default reducer