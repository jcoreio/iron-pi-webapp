// @flow

const SECOND = 1000
const MINUTE = SECOND * 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24

export default function formatUptime(uptimeMillis: number): string {
  const days = Math.floor(uptimeMillis / DAY)
  let remainder = uptimeMillis % DAY
  const hours = Math.floor(remainder / HOUR)
  remainder %= HOUR
  const minutes = Math.floor(remainder / MINUTE)
  remainder %= MINUTE
  const seconds = Math.floor(remainder / SECOND)

  const timeString = `${hours}:${minutes.toFixed().padStart(2, '0')}:${seconds.toFixed().padStart(2, '0')}`

  if (days) return `${days} ${days === 1 ? 'day' : 'days'} and ${timeString}`
  return timeString
}

