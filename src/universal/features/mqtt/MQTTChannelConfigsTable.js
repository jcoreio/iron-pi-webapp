// @flow

import * as React from 'react'
import {Link} from 'react-router-dom'
import type {Match, RouterHistory} from 'react-router-dom'
import {withStyles} from 'material-ui/styles'
import IconButton from 'material-ui/IconButton'
import DeleteIcon from 'material-ui-icons/Delete'
import Arrow from 'react-arrow'
import Tooltip from 'material-ui/Tooltip'
import InfoIcon from 'material-ui-icons/Info'
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from 'material-ui/Table'
import {withTheme} from 'material-ui/styles/index'

import type {Theme} from '../../theme/index'
import AddIcon from '../../components/icons/AddRectangle'
import ConfirmDeletePopover from '../../components/ConfirmDeletePopover'
import {mqttChannelConfigForm} from './routePaths'

type Direction = 'TO_MQTT' | 'FROM_MQTT'

const FlowArrow = withTheme()(({theme: {channelState: {arrow}}, direction, ...props}: Object) => (
  <Arrow
    direction={direction}
    shaftWidth={arrow.shaftWidth}
    shaftLength={arrow.shaftLength}
    headWidth={arrow.headWidth}
    headLength={arrow.headLength}
    fill={arrow.fill}
    {...props}
  />
))

const styles = ({spacing, palette, typography}: Theme) => ({
  root: {
    display: 'block',
    paddingTop: 0,
  },
  table: {
    borderCollapse: 'separate',
    '& td, & th': {
      padding: spacing.unit / 2,
      verticalAlign: 'middle',
    },
    '& td:first-child, & th:first-child': {
      paddingLeft: 0,
      width: 225,
    },
    '& td:last-child, & th:last-child': {
      paddingRight: 0,
      textAlign: 'right',
    },
    '& td': {
      fontSize: typography.pxToRem(18),
    },
    '& > thead > tr:first-child': {
      height: spacing.unit * 4,
      '& > th': {
        borderBottom: {
          width: 2,
          style: 'solid',
          color: palette.grey[500],
        },
      },
    },
    '& > tbody > tr': {
      height: spacing.unit * 4,
    },
  },
  title: {
    fontSize: typography.pxToRem(20),
    color: palette.text.primary,
  },
  columnHeaders: {
    height: spacing.unit * 3,
    '& th': {
      fontSize: typography.pxToRem(15),
    },
  },
  arrowCell: {
  },
  textField: {
    '& input': {
      textAlign: 'center',
    }
  },
  addButton: {
    height: spacing.unit * 3,
    width: spacing.unit * 3,
  },
  deleteButton: {
    height: spacing.unit * 3,
    width: spacing.unit * 3,
  },
  channelRow: {
    cursor: 'pointer',
    '&:hover > td': {
      backgroundColor: palette.text.divider,
    },
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Channel = {
  id: number,
  mqttTag: string,
  internalTag: string,
}

export type Props = {
  classes: Classes,
  channels: Array<Channel>,
  match: Match,
  history: RouterHistory,
  direction: Direction,
  onDeleteChannel: (id: number) => any,
}

export type DefaultProps = {
  onDeleteChannel: (id: number) => any,
}

class CalibrationTable extends React.Component<Props> {
  static defaultProps: DefaultProps = {
    onDeleteChannel() {},
  }
  handleChannelClick = (id: number) => {
    const {match, history} = this.props
    history.push(mqttChannelConfigForm(match.url, id))
  }
  render(): ?React.Node {
    const {classes, channels, direction, onDeleteChannel, match} = this.props
    const arrowDirection = direction === 'TO_MQTT' ? 'right' : 'left'
    return (
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.title}>
              Channels {direction === 'TO_MQTT' ? 'To' : 'From'} MQTT
            </TableCell>
            <TableCell>
              <Tooltip title="TODO" placement="bottom">
                <InfoIcon />
              </Tooltip>
            </TableCell>
            <TableCell />
            <TableCell>
              <IconButton
                className={classes.addButton}
                component={Link}
                to={mqttChannelConfigForm(match.url, (`create/${direction === 'TO_MQTT' ? 'to' : 'from'}`: any))}
              >
                <AddIcon />
              </IconButton>
            </TableCell>
          </TableRow>
          <TableRow className={classes.columnHeaders}>
            <TableCell>
              System Tag
            </TableCell>
            <TableCell />
            <TableCell>
              MQTT Tag
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {channels.map(({id, mqttTag, internalTag}: Channel, index: number) => (
            <TableRow key={index} className={classes.channelRow} onClick={() => this.handleChannelClick(id)}>
              <TableCell>
                {internalTag}
              </TableCell>
              <TableCell className={classes.arrowCell}>
                <FlowArrow direction={arrowDirection} />
              </TableCell>
              <TableCell>
                {mqttTag}
              </TableCell>
              <TableCell onClick={e => e.stopPropagation()}>
                <ConfirmDeletePopover
                  onConfirmDelete={() => onDeleteChannel(id)}
                  anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'center',
                    horizontal: 'right',
                  }}
                >
                  {({bind}) => (
                    <IconButton className={classes.deleteButton} {...bind}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </ConfirmDeletePopover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
}

export default withStyles(styles, {withTheme: true})(CalibrationTable)

