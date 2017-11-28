// @flow

import * as React from 'react';
import injectSheet from 'react-jss'

const styles = {
  '@keyframes spinner-rotation': {
    from: {transform: 'rotate(0deg)'},
    to: {transform: 'rotate(360deg)'},
  },
  '@keyframes spinner-wobbling': {
    from: {width: '0.4em'},
    '50%': {width: '1.2em'},
    to: {width: '0.4em'},
  },
  spinner: {
    animation: [
      'spinner-rotation linear infinite 0.79s',
      'spinner-wobbling ease infinite 0.37s',
    ],
    display: 'inline-block',
    width: '1.2em',
    height: '1.2em',
    borderRadius: '50%',
    border: '0.2em solid',
    borderBottom: '0.2em solid',
    lineHeight: '1em',
    verticalAlign: 'middle',
  },
  holder: {
    display: 'inline-block',
    width: '1.2em',
    height: '1.2em',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
}

export type Props = {
  classes: {
    spinner: string,
    holder: string,
  },
  sheet: Object,
}

/**
 * My own impression of what a cool spinner looks like, because I'm just another JS hipster I guess
 */
const Spinner = ({
  sheet, // eslint-disable-line no-unused-vars
  classes: {spinner, holder}, ...props
}: Props) => (
  <div {...props} className={holder}>
    <div className={spinner} />
  </div>
)

export default injectSheet(styles)(Spinner)

