// @flow

import * as React from 'react'
import injectSheet from 'react-jss'

const styles = {
  '@keyframes spinner-rotation': {
    from: {transform: 'rotate(0deg)'},
    to: {transform: 'rotate(360deg)'},
  },
  spinner: {
    animation: [
      'spinner-rotation linear infinite 1s',
    ],
    display: 'inline-block',
    width: '1.2em',
    height: '1.2em',
    lineHeight: '1em',
    verticalAlign: 'middle',
    marginBottom: '0.25em',
  },
  holder: {
    display: 'inline-block',
    width: '1.2em',
    height: '1.2em',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  path: {
    fill: 'none',
    opacity: 0.5,
    strokeWidth: 10,
    stroke: 'currentColor',
    strokeLinecap: 'round',
  },
}

export type Props = {
  classes: {[name: $Keys<typeof styles>]: string},
  sheet: Object,
}

const Spinner = ({
  classes, ...props
}: Props) => (
  <div {...props} className={classes.holder}>
    <svg className={classes.spinner} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <path
        d="M 50,5 A 45,45 0 0,1 81.82,81.82"
        className={classes.path}
      />
    </svg>
  </div>
)

export default injectSheet(styles)(Spinner)
