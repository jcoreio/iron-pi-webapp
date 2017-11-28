// @flow

declare var browser: Object

/**
 * A better interface than browser.execute
 */
export default async function execute<A: Array<any>, R>(fn: (...args: A) => R, ...args: A): Promise<R> {
  const {value: {error, result}} = await browser.execute(function (): any {
    try {
      eval('var fn = ' + arguments[0])
      var args: A = (Array.prototype.slice.call(arguments, 1): any)
      try {
        return {result: fn.apply(undefined, args)}
      } catch (error) {
        return {error: {message: error.message, stack: error.stack}}
      }
    } catch (error) {
      return {error: {message: error.message, stack: error.stack}}
    }
  }, fn.toString(), ...args)

  if (error) {
    const realError = new Error('execute failed: ' + error.message)
    if (error.stack) realError.stack += '\nCaused by: ' + error.stack
    return Promise.reject(realError)
  }
  return Promise.resolve(result)
}

