import '../../src/polyfill'
import { normalizePlayerIndex } from '../../src/logic/functions'

test('normalizePlayerIndex works for values 0 - 8', () => {
  const indexes =
    [0, 1, 2, 3, 4, 5, 6, 7, 8]
  const normalizedIndexes =
    [0, 1, 2, 3, 0, 1, 2, 3, 0]
  expect(normalizedIndexes.map(normalizePlayerIndex))
    .toEqual(normalizedIndexes)
})