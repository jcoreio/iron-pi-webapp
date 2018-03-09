// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles} from 'material-ui/styles'
import type {Theme} from '../theme'
import Paper from 'material-ui/Paper'

const styles = ({spacing}: Theme) => ({
  root: {
    maxWidth: 600,
    margin: `${spacing.unit * 2}px auto`,
    padding: `${spacing.unit * 2}px ${spacing.unit * 4}px`,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  className?: string,
  children?: React.Node,
}

const StatusPanel = ({classes, className, ...props}: Props): React.Node => (
  <Paper className={classNames(classes.root, className)} {...props} />
)

export default withStyles(styles, {withTheme: true})(StatusPanel)

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

