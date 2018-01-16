// @flow

import * as React from 'react'

export type Props = {
}

const Coolness = (props: Props): React.Node => (
  <svg viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid meet">
    <path
      d={createCoolness(10000)}
      fill="none"
      stroke="black"
      strokeWidth={0.1}
    />
  </svg>
)

export default Coolness

function createCoolness(iterations: number): string {
  const visited: Set<string> = new Set()
  let x = 0, y = 0
  const commands = ['M0,0']
  for (let i = 0; i < iterations; i++) {
    let dx = 0, dy = 0
    switch (Math.floor(Math.random() * 4)) {
    case 0:
      dx = 1
      break
    case 1:
      dx = -1
      break
    case 2:
      dy = 2
      break
    case 3:
      dy = -2
      break
    }

    let nx = x + dx
    let ny = y + dy

    while (visited.has(`${nx},${ny}`)) {
      nx += dx * 0.4
      ny += dy * 0.4
    }
    if (dx === 0 && Math.random() >= 0.93) {
      ny = y = dy
    }
    commands.push(`${Math.random() >= 0.8 ? 'M' : 'L'}${nx},${ny}`)
    visited.add(`${nx},${ny}`)
    x = nx
    y = ny
  }

  return commands.join(' ')
}

