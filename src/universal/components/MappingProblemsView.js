// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'
import Paper from 'material-ui/Paper'
import Typography from 'material-ui/Typography'
import type {Theme} from '../theme'
import Fader from '../components/Fader'
import MappingProblemsTable from './MappingProblemsTable'
import type {MappingProblem} from './MappingProblemsTable'
import Spinner from './Spinner'

const styles = ({spacing}: Theme) => ({
  paper: {
    margin: `${spacing.unit * 2}px auto`,
    maxWidth: 600,
  },
  loading: {
    padding: spacing.unit * 3,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  data: {
    loading: boolean,
    MappingProblems?: Array<MappingProblem>,
  },
  getMappingProblemURL?: (mappingProblem: MappingProblem) => ?string,
}

const MappingProblemsView = ({classes, data: {loading, MappingProblems}, getMappingProblemURL}: Props) => {
  const content = loading
    ? <Typography type="subheading" key="loading" className={classes.loading}><Spinner /> Loading Mapping Problems...</Typography>
    : (
      <MappingProblemsTable
        key="loaded"
        MappingProblems={MappingProblems}
        getMappingProblemURL={getMappingProblemURL}
      />
    )
  return (
    <Paper className={classes.paper}>
      <Fader animateHeight>
        {content}
      </Fader>
    </Paper>
  )
}

export default withStyles(styles, {withTheme: true})(MappingProblemsView)

