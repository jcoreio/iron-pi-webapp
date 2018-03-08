// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'
import {createSelector} from 'reselect'
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from 'material-ui/Table'
import Typography from 'material-ui/Typography'
import type {Theme} from '../theme'
import {MAPPING_PROBLEM_NO_SOURCE, MAPPING_PROBLEM_MULTIPLE_SOURCES} from '../data-router/PluginConfigTypes'
import SuccessAlert from './SuccessAlert'

const styles = (theme: Theme) => ({
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

type ProblemKind = 'noSource' | 'multipleSources'

export type MappingProblem = {
  tag: string,
  problem: ProblemKind,
  mappingLocation: {
    pluginName: string,
    channelName: string,
  },
}

export type Props = {
  classes: Classes,
  MappingProblems?: Array<MappingProblem>,
}

class MappingProblemsTable extends React.Component<Props> {
  _organizeMappingProblems: (props: Props) => {
    noSourceProblems: Array<MappingProblem>,
    multipleSourcesProblems: Array<MappingProblem>,
  } = createSelector(
    props => props.MappingProblems,
    (MappingProblems: Array<MappingProblem> = []) => ({
      noSourceProblems: MappingProblems.filter(({problem}) => problem === MAPPING_PROBLEM_NO_SOURCE),
      multipleSourcesProblems: MappingProblems.filter(({problem}) => problem === MAPPING_PROBLEM_MULTIPLE_SOURCES),
    })
  )
  render(): ?React.Node {
    const {classes} = this.props
    const {noSourceProblems, multipleSourcesProblems} = this._organizeMappingProblems(this.props)
    return (
      <Table>
        {!noSourceProblems.length && !multipleSourcesProblems.length && (
          <TableHead>
            <TableRow>
              <TableCell colSpan={3}>
                <SuccessAlert>
                  There are currently no mapping problems!
                </SuccessAlert>
              </TableCell>
            </TableRow>
          </TableHead>
        )}
        {noSourceProblems.length ? (
          <MappingProblemsSection
            classes={classes}
            MappingProblems={noSourceProblems}
            title="Output Tags with no source"
          />
        ) : null}
        {multipleSourcesProblems.length ? (
          <MappingProblemsSection
            classes={classes}
            MappingProblems={multipleSourcesProblems}
            title="Input Tags with multiple sources"
          />
        ) : null}
      </Table>
    )
  }
}

export default withStyles(styles, {withTheme: true})(MappingProblemsTable)

const MappingProblemsSection = ({title, MappingProblems = []}: Props & {title: React.Node}): React.Node => (
  <React.Fragment>
    <TableHead>
      <TableRow>
        <TableCell colSpan={3}>
          <Typography type="subheading">
            {title}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Tag</TableCell>
        <TableCell>Plugin</TableCell>
        <TableCell>Channel</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {MappingProblems.map((problem, key) => (
        <TableRow key={key}>
          <TableCell>
            {problem.tag}
          </TableCell>
          <TableCell>
            {problem.mappingLocation.pluginName}
          </TableCell>
          <TableCell>
            {problem.mappingLocation.channelName}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </React.Fragment>
)

