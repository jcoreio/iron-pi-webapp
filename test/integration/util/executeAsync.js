// @flow

declare var browser: Object

/**
 * A better interface than browser.executeAsync
 */
export default async function executeAsync(fn: Function, ...args: Array<any>): Promise<any> {
  const {value: {error, result}} = await browser.executeAsync(function () {
    /* eslint-disable object-shorthand */
    /* eslint-disable flowtype/require-parameter-type */
    var callback = arguments[arguments.length - 1]
    try {
      eval('var fn = ' + arguments[0])
      var args = Array.prototype.slice.call(arguments, 1, arguments.length - 1)
      fn.apply(undefined, args.concat(function done(error, result) {
        if (error) {
          callback({error: {message: error.message, stack: error.stack}})
          return
        }
        callback({result: result})
      }))
    } catch (error) {
      callback({error: {message: error.message, stack: error.stack}})
    }
    /* eslint-enable object-shorthand */
    /* eslint-enable flowtype/require-parameter-type */
  }, fn.toString(), ...args)

  if (error) {
    const realError = new Error('executeAsync failed: ' + error.message + '\nCaused by: ' + error.stack)
    return Promise.reject(realError)
  }
  return Promise.resolve(result)
}

