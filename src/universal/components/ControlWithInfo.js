// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles} from 'material-ui/styles'
import type {Theme} from '../theme'
import Tooltip from 'material-ui/Tooltip'
import InfoIcon from 'material-ui-icons/Info'

const styles = ({spacing, palette}: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    marginTop: spacing.unit * 1.5,
    marginBottom: spacing.unit * 1.5,
  },
  control: {
    flex: '1 1 auto',
    display: 'flex',
    '& > :not(:first-child)': {
      marginLeft: spacing.unit,
    },
  },
  infoIcon: {
    marginLeft: spacing.unit,
    flex: '0 0 auto',
    color: palette.infoIcon,
  },
  tooltip: {
    maxWidth: 320,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  className: string,
  controlClassName?: string,
  children: React.Node,
  info: React.Node,
}

const ControlWithInfo = withStyles(styles, {withTheme: true})(
  ({classes, className, children, info, controlClassName}: Props) => (
    <div className={classNames(classes.root, className)}>
      <div className={classNames(classes.control, controlClassName)}>
        {children}
      </div>
      <Tooltip title={info} placement="left" classes={{tooltip: classes.tooltip}}>
        <InfoIcon className={classes.infoIcon} />
      </Tooltip>
    </div>
  )
)

export default ControlWithInfo

