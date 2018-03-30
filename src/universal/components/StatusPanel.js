// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles} from 'material-ui/styles'
import type {Theme} from '../theme'
import ViewPanel from './ViewPanel'

const StatusPanel = ViewPanel
export default StatusPanel

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}

const statusPanelTitleStyles = ({statusPanel}: Theme) => ({
  root: {
    ...statusPanel.title,
  },
})

type StatusPanelTitleClasses = $Call<ExtractClasses, typeof statusPanelTitleStyles>

export type StatusPanelTitleProps = {
  classes: StatusPanelTitleClasses,
  className?: string,
  children?: React.Node,
}

const StyledStatusPanelTitle = ({classes, className, ...props}: StatusPanelTitleProps) => (
  <div className={classNames(classes.root, className)} {...props} data-component="StatusPanelTitle" />
)

export const StatusPanelTitle = withStyles(statusPanelTitleStyles, {withTheme: true})(StyledStatusPanelTitle)

