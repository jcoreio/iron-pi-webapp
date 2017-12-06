export default async function waitUntil(condition, timeout = 500, timeoutMsg = 'timed out waiting for condition to be true', interval) {
  const startTime = Date.now()
  const endTime = startTime + timeout
  if (interval == null) interval = timeout < 500 ? 100 : 500
  let numTries = 0

  while (Date.now() < endTime) { // eslint-disable-line no-constant-condition
    if (numTries++ > 0) {
      await new Promise(resolve => setTimeout(resolve, Math.min(interval, Math.max(0, endTime - Date.now()))))
    }
    if (await Promise.resolve(condition())) return
  }
  throw new Error(timeoutMsg)
}

