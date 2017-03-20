/**
 * Custom array [polyfill](https://en.wikipedia.org/wiki/Polyfill).
 * I polyfilled generic array functions that I use often in this project,
 */

declare global {
  interface Array<T> {
    flatMap: <R>(this: T[], fn: (value: T) => R[]) => R[]
    flatten: <P extends T & any[]>(this: P[]) => P
    first: (this: T[]) => T
    last: (this: T[]) => T
    sum: (this: number[]) => number
    shuffle: (this: T[]) => T[]
  }
}

/**
 * @returns an array containing the concatenated results of calling the given transformation
 * with each element of this sequence.
 */
const flatMap = <T, R>(fn: (value: T) => R[], array: T[]) => array.map(fn).reduce((a, b) => a.concat(b), [])
/** Flattens array of arrays into single array */
const flatten = <T>(array: T[][]) => array.reduce((a, b) => a.concat(b), [])
/** @returns the first element of the array */
const first = <T>(array: T[]) => array[0]
/** @returns the last element of the array */
const last = <T>(array: T[]) => array[array.length - 1]
/** @returns a sum of numbers in the array */
const sum = (array: number[]) => array.reduce((a, b) => a + b, 0)
/** @returns new array with shuffled elements */
const shuffle = <T>(array: T[]) => {
  const tempArray = [...array]
  for (let i = tempArray.length; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    [tempArray[i - 1], tempArray[j]] = [tempArray[j], tempArray[i - 1]]
  }
  return tempArray
}

Array.prototype.flatMap = Array.prototype.flatMap || function <T, R>(this: T[], f: (value: T) => R[]) {
  return flatMap(f, this)
}
Array.prototype.flatten = Array.prototype.flatten || function <T>(this: T[][]) {
  return flatten(this)
}
Array.prototype.first = Array.prototype.first || function <T>(this: T[]) {
  return first(this)
}
Array.prototype.last = Array.prototype.last || function <T>(this: T[]) {
  return last(this)
}
Array.prototype.sum = Array.prototype.sum || function <T extends number>(this: T[]) {
  return sum(this)
}
Array.prototype.shuffle = Array.prototype.shuffle || function <T>(this: T[]) {
  return shuffle(this)
}

export { }