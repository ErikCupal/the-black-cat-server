import { Name } from './Name'

export interface PlayerScore {
  readonly player: Name
  readonly points: number[]
}