// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'
import Typography from 'material-ui/Typography'
import type {Theme} from '../../theme/index'
import Fader from '../Fader'
import ViewPanel from '../ViewPanel'
import MappingProblemsTable from './MappingProblemsTable'
import type {MappingProblem} from './MappingProblemsTable'
import Spinner from '../Spinner'

const styles = ({spacing}: Theme) => ({
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
    ? <Typography variant="subheading" key="loading" className={classes.loading}><Spinner /> Loading Mapping Problems...</Typography>
    : (
      <MappingProblemsTable
        key="loaded"
        MappingProblems={MappingProblems}
        getMappingProblemURL={getMappingProblemURL}
      />
    )
  return (
    <ViewPanel>
      <Fader animateHeight>
        {content}
      </Fader>
    </ViewPanel>
  )
}

export default withStyles(styles, {withTheme: true})(MappingProblemsView)

