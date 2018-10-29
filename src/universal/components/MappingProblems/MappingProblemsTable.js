// @flow

import * as React from 'react'
import {withStyles} from '@material-ui/core/styles'
import {createSelector} from 'reselect'
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core/Table'
import type {Theme} from '../../theme/index'
import {MAPPING_PROBLEM_NO_SOURCE, MAPPING_PROBLEM_MULTIPLE_SOURCES} from '../../data-router/PluginConfigTypes'
import SuccessAlert from '../SuccessAlert'
import WorkaroundLink from '../WorkaroundLink'

const styles = ({palette, defaultTable}: Theme) => ({
  linkRow: {
    cursor: 'pointer',
    '&:hover > td': {
      backgroundColor: palette.divider,
    },
  },
  table: defaultTable,
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

type ProblemKind = 'noSource' | 'multipleSources'

export type MappingProblem = {
  tag: string,
  problem: ProblemKind,
  mappingLocation: {
    pluginType: string,
    pluginId: string | number,
    pluginName: string,
    channelId: string | number,
    channelName: string,
  },
}

export type Props = {
  classes: Classes,
  MappingProblems?: Array<MappingProblem>,
  getMappingProblemURL?: (mappingProblem: MappingProblem) => ?string,
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
    const {classes, getMappingProblemURL} = this.props
    const {noSourceProblems, multipleSourcesProblems} = this._organizeMappingProblems(this.props)
    return (
      <Table className={classes.table}>
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
            getMappingProblemURL={getMappingProblemURL}
            title="Output Tags with no source"
          />
        ) : null}
        {multipleSourcesProblems.length ? (
          <MappingProblemsSection
            classes={classes}
            MappingProblems={multipleSourcesProblems}
            getMappingProblemURL={getMappingProblemURL}
            title="Input Tags with multiple sources"
          />
        ) : null}
      </Table>
    )
  }
}

export default withStyles(styles, {withTheme: true})(MappingProblemsTable)

const MappingProblemsSection = ({classes, title, MappingProblems = [], getMappingProblemURL}: Props & {title: React.Node}): React.Node => (
  <React.Fragment>
    <TableHead>
      <TableRow>
        <TableCell colSpan={3}>
          {title}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Tag</TableCell>
        <TableCell>Plugin</TableCell>
        <TableCell>Channel</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {MappingProblems.map((problem: MappingProblem, key: any): React.Node => {
        const content = (
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
        )

        const to = getMappingProblemURL ? getMappingProblemURL(problem) : null
        if (to) return (
          <WorkaroundLink to={to}>
            {({bind}) => React.cloneElement(content, {...bind, className: classes.linkRow})}
          </WorkaroundLink>
        )
        return content
      })}
    </TableBody>
  </React.Fragment>
)

