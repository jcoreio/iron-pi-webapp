// @flow

export default function sleep(sleepTime: number): Promise<void> {
  return new Promise((resolve: Function) => {
    setTimeout(resolve, sleepTime)
  })
}
