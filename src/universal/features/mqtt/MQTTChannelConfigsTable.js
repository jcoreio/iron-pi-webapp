// @flow

import * as React from 'react'
import {Link} from 'react-router-dom'
import type {Match, RouterHistory} from 'react-router-dom'
import {withStyles} from 'material-ui/styles'
import IconButton from 'material-ui/IconButton'
import Icon from 'material-ui/Icon'
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
import type {TagState} from '../../types/TagState'
import type {MetadataItem} from '../../types/MetadataItem'

type Direction = 'TO_MQTT' | 'FROM_MQTT'

export const FlowArrow = withTheme()(({theme: {channelState: {arrow}}, direction, ...props}: Object) => (
  <Arrow
    direction={direction}
    shaftWidth={arrow.shaftWidth}
    shaftLength={arrow.shaftLength / 2}
    headWidth={arrow.headWidth}
    headLength={arrow.headLength}
    fill={arrow.fill}
    {...props}
  />
))

const styles = ({spacing, palette, typography, stripedList}: Theme) => ({
  root: {
    display: 'block',
    paddingTop: 0,
  },
  alignRight: {
    textAlign: 'right',
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
      paddingRight: spacing.unit / 2,
    },
    '& td': {
      fontSize: typography.pxToRem(18),
      border: 'none',
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
      ...stripedList,
    },
  },
  title: {
    fontSize: typography.pxToRem(20),
    color: palette.text.primary,
  },
  columnHeaders: {
    height: spacing.unit * 3,
    '& th': {
      color: palette.text.secondary,
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
      backgroundColor: palette.divider,
    },
  },
  valueBlock: {
    width: '100%',
  },
  infoIcon: {
    color: palette.infoIcon,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Channel = {
  id: number,
  mqttTag: string,
  internalTag: string,
  metadataItem?: ?MetadataItem,
  mqttTagState?: ?TagState,
  internalTagState?: ?TagState,
}

export type ChannelRowProps = {
  +channel: Channel,
  +classes: Classes,
  +onClick?: (e: MouseEvent) => any,
  +onConfirmDelete?: () => any,
  +arrowDirection: 'left' | 'right',
  +showDeleteButton?: boolean,
}

const BasicChannelRow = ({
  channel: {id, mqttTag, internalTag},
  arrowDirection,
  classes,
  onClick,
  onConfirmDelete,
  showDeleteButton,
}: ChannelRowProps): React.Node => (
  <TableRow className={classes.channelRow} onClick={onClick}>
    <TableCell colSpan={2}>
      {internalTag}
    </TableCell>
    <TableCell className={classes.arrowCell}>
      <FlowArrow direction={arrowDirection} />
    </TableCell>
    <TableCell colSpan={2}>
      {mqttTag}
    </TableCell>
    {showDeleteButton !== false && (
      <DeleteButtonCell
        classes={classes}
        onConfirmDelete={onConfirmDelete}
      />
    )}
  </TableRow>
)


export type Props = {
  classes: Classes,
  channels: Array<Channel>,
  match: Match,
  history: RouterHistory,
  direction: Direction,
  onDeleteChannel: (id: number) => any,
  ChannelRow: React.ComponentType<$ReadOnly<ChannelRowProps>>,
  showEditButtons: boolean,
}

export type DefaultProps = {
  showEditButtons: boolean,
  onDeleteChannel: (id: number) => any,
  ChannelRow: React.ComponentType<$ReadOnly<ChannelRowProps>>,
}

class MQTTChannelConfigsTable extends React.Component<Props> {
  static defaultProps: DefaultProps = {
    showEditButtons: true,
    onDeleteChannel() {},
    ChannelRow: BasicChannelRow,
  }
  handleChannelClick = (id: number) => {
    const {match, history} = this.props
    history.push(mqttChannelConfigForm(match.url, id))
  }
  render(): ?React.Node {
    const {classes, channels, direction, onDeleteChannel, match, ChannelRow, showEditButtons} = this.props
    const arrowDirection = direction === 'TO_MQTT' ? 'right' : 'left'
    return (
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2} className={classes.title}>
              Channels {direction === 'TO_MQTT' ? 'To' : 'From'} MQTT
            </TableCell>
            <TableCell>
              <Tooltip title="TODO" placement="bottom">
                <InfoIcon className={classes.infoIcon} />
              </Tooltip>
            </TableCell>
            <TableCell colSpan={2} />
            {showEditButtons && (
              <TableCell className={classes.alignRight}>
                <IconButton
                  className={classes.addButton}
                  component={Link}
                  to={mqttChannelConfigForm(match.url, (`create/${direction === 'TO_MQTT' ? 'to' : 'from'}`: any))}
                >
                  <Icon><AddIcon /></Icon>
                </IconButton>
              </TableCell>
            )}
          </TableRow>
          <TableRow className={classes.columnHeaders}>
            <TableCell colSpan={3}>
              System Tag
            </TableCell>
            <TableCell colSpan={showEditButtons ? 3 : 2}>
              MQTT Tag
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {channels.map((channel: Channel, index: number) => (
            <ChannelRow
              key={index}
              channel={channel}
              classes={classes}
              onClick={() => this.handleChannelClick(channel.id)}
              onConfirmDelete={() => onDeleteChannel(channel.id)}
              arrowDirection={arrowDirection}
              showDeleteButton={showEditButtons}
            />
          ))}
        </TableBody>
      </Table>
    )
  }
}

export type DeleteButtonCellProps = {
  classes: Classes,
  width?: number | string,
  onConfirmDelete?: () => any,
}

export const DeleteButtonCell = ({classes, width, onConfirmDelete}: DeleteButtonCellProps): React.Node => (
  <TableCell className={classes.alignRight} onClick={e => e.stopPropagation()} width={width}>
    <ConfirmDeletePopover
      onConfirmDelete={onConfirmDelete}
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
          <Icon><DeleteIcon /></Icon>
        </IconButton>
      )}
    </ConfirmDeletePopover>
  </TableCell>
)

export default withStyles(styles, {withTheme: true})(MQTTChannelConfigsTable)

