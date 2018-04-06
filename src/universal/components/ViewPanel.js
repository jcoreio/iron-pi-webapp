// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles} from 'material-ui/styles'
import type {Theme} from '../theme'
import Paper from 'material-ui/Paper'

const styles = ({viewPanel}: Theme) => ({
  root: viewPanel.root,
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  className?: string,
  children?: React.Node,
}

const ViewPanel = ({
  classes, className,
  theme, // eslint-disable-line no-unused-vars
  ...props
}: Props): React.Node => (
  <Paper className={classNames(classes.root, className)} {...props} />
)

export default withStyles(styles, {withTheme: true})(ViewPanel)

const viewPanelBodyStyles = (theme: Theme) => ({
  root: theme.viewPanel.body,
  noVerticalPadding: theme.viewPanel.noVerticalPadding,
})

type ViewPanelBodyClasses = $Call<ExtractClasses, typeof viewPanelBodyStyles>

export type ViewPanelBodyProps = {
  classes: ViewPanelBodyClasses,
  className?: string,
  children?: React.Node,
  noVerticalPadding?: boolean,
}

const StyledViewPanelBody = ({
  classes, className, noVerticalPadding,
  theme, // eslint-disable-line no-unused-vars
  ...props
}: ViewPanelBodyProps): React.Node => (
  <div
    className={classNames(classes.root, {[classes.noVerticalPadding]: noVerticalPadding}, className)}
    {...props}
  />
)

export const ViewPanelBody = withStyles(viewPanelBodyStyles, {withTheme: true})(
  StyledViewPanelBody
)

const viewPanelTitleStyles = ({palette, spacing, typography, viewPanel}: Theme) => ({
  root: {
    ...viewPanel.title,
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

