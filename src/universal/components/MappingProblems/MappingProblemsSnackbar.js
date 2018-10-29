// @flow

import * as React from 'react'
import {Link} from 'react-router-dom'
import Snackbar from '@material-ui/core/Snackbar'
import {MAPPING_PROBLEMS} from '../../react-router/paths'
import SuccessAlert from '../SuccessAlert'
import WarningIcon from '@material-ui/icons/Warning'
import {withStyles} from '@material-ui/core/styles'
import type {Theme} from '../../theme/index'

const styles = ({palette}: Theme) => ({
  link: {
    textDecoration: 'none',
    color: palette.error[500],
    '&:hover, &:visited, &:active, &:focus': {
      textDecoration: 'underline',
      color: palette.error[500],
    },
  },
  icon: {
    verticalAlign: 'middle',
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  data: {
    numMappingProblems?: number,
  },
}

const MappingProblemsSnackbar = ({classes, data: {numMappingProblems}}: Props): React.Node => {
  const are = numMappingProblems === 1 ? 'is' : 'are'
  const problems = numMappingProblems === 1 ? 'problem' : 'problems'
  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={numMappingProblems != null && numMappingProblems > 0}
      message={
        numMappingProblems != null && numMappingProblems > 0
          ? <span><WarningIcon className={classes.icon} /> There {are} currently <Link className={classes.link} to={MAPPING_PROBLEMS}>{numMappingProblems} mapping {problems}</Link></span>
          : <SuccessAlert>There are currently no mapping problems!</SuccessAlert>
      }
    />
  )
}

export default withStyles(styles, {withTheme: true})(MappingProblemsSnackbar)

