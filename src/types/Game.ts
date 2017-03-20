import { Name } from './Name'
import { Grills, Table } from './Cards'

export interface Game {
  readonly room: Name
  readonly table: Table
  readonly round: number
  readonly grillsSnapshot: Grills
  readonly playerOnTurn: Name
}