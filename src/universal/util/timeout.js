// @flow

import ExtendableError from 'es6-error'

export class TimeoutError extends ExtendableError {
}

const timeout = <R: any>(promise: Promise<R> | () => Promise<R>, delay: number) => new Promise(
  (resolve: (value: R) => void, reject: (reason: Error) => void) => {
    let timedOut = false
    const timeoutId = setTimeout(() => {
      timedOut = true
      reject(new TimeoutError("timed out"))
    }, delay)

    if (typeof promise === 'function') promise = promise()

    promise.then(
      (value: R) => {
        if (timedOut) return
        clearTimeout(timeoutId)
        resolve(value)
      },
      (reason: Error) => {
        if (timedOut) return
        clearTimeout(timeoutId)
        reject(reason)
      }
    )
  }
)

export default timeout

