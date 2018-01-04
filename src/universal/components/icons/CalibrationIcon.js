// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles} from 'material-ui/styles'
import type {Theme} from '../../theme'

const styles = (theme: Theme) => ({
  root: {
    width: '2.5rem',
    height: '2.5rem',
    '& rect': {
      fill: 'none',
      stroke: 'currentcolor',
    },
    '& line': {
      stroke: 'currentcolor',
    },
    '& circle': {
      fill: 'currentcolor',
    },
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  className: string,
}

const CalibrationIcon = withStyles(styles, {withTheme: true})(
  ({classes, className}: Props) => (
    <svg viewBox="0 0 40 22" preserveAspectRatio="xMidYMid meet" className={classNames(classes.root, className)}>
      <rect x={0.5} y={0.5} width={39} height={21} />
      <line x1={3} y1={22} x2={37} y2={0} />
      <circle cx={9} cy={18} r={2} />
      <circle cx={31} cy={4} r={2} />
    </svg>
  )
)

export default CalibrationIcon

