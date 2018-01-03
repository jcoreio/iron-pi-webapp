// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'
import type {Theme} from '../theme'
import Tooltip from 'material-ui/Tooltip'
import InfoIcon from 'material-ui-icons/Info'

const styles = ({spacing, palette}: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    marginTop: spacing.unit,
    marginBottom: spacing.unit,
  },
  control: {
    flex: '1 1 auto',
    display: 'flex',
  },
  infoIcon: {
    marginLeft: spacing.unit,
    flex: '0 0 auto',
    color: palette.text.secondary,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  children: React.Node,
  info: React.Node,
}

const ControlWithInfo = withStyles(styles, {withTheme: true})(
  ({classes, children, info}: Props) => (
    <div className={classes.root}>
      <div className={classes.control}>
        {children}
      </div>
      <Tooltip title={info} placement="left">
        <InfoIcon className={classes.infoIcon} />
      </Tooltip>
    </div>
  )
)

export default ControlWithInfo

