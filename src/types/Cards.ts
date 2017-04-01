export interface Card {
  readonly suit: Suit
  readonly rank: Rank
}

export type Suit =
  | 'Spades'
  | 'Hearts'
  | 'Diamonds'
  | 'Clubs'

export type Rank =
  | 'Seven'
  | 'Eight'
  | 'Nine'
  | 'Ten'
  | 'Jack'
  | 'Queen'
  | 'King'
  | 'Ace'

export type Deck = Card[]
export type Table = Card[]
export type Hand = Card[]
/**
 * After players got their hands, they have to pass 3 cards to their player on left.
 * I'am calling these cards HandOver because I couldn't come up with a better name.
 */
export type HandOver = Card[]
export type Grills = Card[]
export type Trick = Card[]
/** Pile of tricks */
export type Pile = Card[]