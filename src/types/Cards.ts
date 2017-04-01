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
export type HandOver = Card[]
export type Grills = Card[]
export type Trick = Card[]
export type Pile = Card[]