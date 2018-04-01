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

const ViewPanel = ({classes, className, ...props}: Props): React.Node => (
  <Paper className={classNames(classes.root, className)} {...props} />
)

export default withStyles(styles, {withTheme: true})(ViewPanel)

const viewPanelTitleStyles = ({palette, spacing, typography}: Theme) => ({
  root: {
    fontSize: typography.pxToRem(20),
    color: palette.text.primary,
    paddingBottom: spacing.unit / 2,
    borderBottom: {
      width: 2,
      style: 'solid',
      color: palette.text.primary,
    },
  }
})

type ViewPanelTitleClasses = $Call<ExtractClasses, typeof viewPanelTitleStyles>

export type ViewPanelTitleProps = {
  children?: React.Node,
  classes: ViewPanelTitleClasses,
}

const StyledViewPanelTitle = ({children, classes}: ViewPanelTitleProps) => (
  <h2 className={classes.root}>
    {children}
  </h2>
)

export const ViewPanelTitle = withStyles(viewPanelTitleStyles, {withTheme: true})(
  StyledViewPanelTitle
)

