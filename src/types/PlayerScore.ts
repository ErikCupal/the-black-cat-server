import { Name } from './Name'

/** Contains all player's points that he got since he joined room */
export interface PlayerScore {
  readonly player: Name
  readonly points: number[]
}