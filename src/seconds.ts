/**
 * A Promise wrapper for [setTimeout] function.
 * When used with `await` keyword, it is a consise way of
 * to pause function execution.
 * 
 * Example:
 * ```
 * const asyncFunction = async () => {
 *   console.log('Async function started')
 *   await seconds(1)
 *   console.log('One second passed')
 * }
 * ```
 */
const seconds = (seconds: number): Promise<void> => {
  return new Promise<void>((resolve, reject) => setTimeout(resolve, seconds * 1000))
}

export default seconds