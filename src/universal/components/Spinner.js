// @flow

import * as React from 'react'
import injectSheet from 'react-jss'
import classNames from 'classnames'

const transition = {
  timingFunction: 'ease-out',
  duration: '400ms',
}

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
    transition: [
      {
        property: 'transform',
        ...transition,
      },
      {
        property: 'opacity',
        ...transition,
      },
      {
        property: 'visibility',
        ...transition,
      }
    ],
    transform: 'scale(1)',
    opacity: 1,
    visibility: 'visible',
    width: '1.2em',
    height: '1.2em',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  out: {
    transform: 'scale(0.01)',
    opacity: 0,
    visibility: 'hidden',
    '& > $spinner': {
      animation: 'none',
    },
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
  in?: boolean,
  sheet: Object,
}

const Spinner = ({
  classes, in: isIn, ...props
}: Props) => (
  <div {...props} className={classNames(classes.holder, {[classes.out]: isIn === false})}>
    <svg className={classes.spinner} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <path
        d="M 50,5 A 45,45 0 0,1 81.82,81.82"
        className={classes.path}
      />
    </svg>
  </div>
)

export default injectSheet(styles)(Spinner)
