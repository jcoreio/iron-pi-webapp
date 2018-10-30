// @flow

import * as React from 'react'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import {withStyles} from '@material-ui/core/styles'
import type {Theme} from '../../theme'

import MetadataValueBlock from '../../components/MetadataValueBlock'

import type {ChannelRowProps} from './MQTTChannelConfigsTable'
import {DeleteButtonCell, FlowArrow} from './MQTTChannelConfigsTable'

const smallValueBlockStyles = ({typography}: Theme) => ({
  block: {
    display: 'flex',
  },
  value: {
    fontSize: typography.pxToRem(18),
  },
  units: {
    fontSize: typography.pxToRem(12),
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type SmallValueBlockClasses = $Call<ExtractClasses, typeof smallValueBlockStyles>

export type SmallValueBlockProps = {
  classes: SmallValueBlockClasses,
}

const SmallValueBlock = withStyles(smallValueBlockStyles, {withTheme: true})(MetadataValueBlock)

type Props = ChannelRowProps & {
  data: {
    systemState?: {v: any},
    mqttState?: {v: any},
    metadataItem?: {
      units?: string,
      dataType?: string,
      isDigital?: boolean,
      displayPrecision: number,
    },
  },
}

const DELETE_ICON_RATIO = 0.07
const ARROW_RATIO = 0.07
const CHANNEL_RATIO = (1 - DELETE_ICON_RATIO - ARROW_RATIO) * 0.3
const VALUE_RATIO = (1 - DELETE_ICON_RATIO - ARROW_RATIO) * 0.2

const DELETE_ICON_WIDTH = `${DELETE_ICON_RATIO * 100}%`
const ARROW_WIDTH = `${ARROW_RATIO * 100}%`
const CHANNEL_WIDTH = `${CHANNEL_RATIO * 100}%`
const VALUE_WIDTH = `${VALUE_RATIO * 100}%`

export default class RealtimeMQTTChannelRow extends React.Component<Props> {
  render(): React.Node {
    const {
      channel: {mqttTag, internalTag, mqttTagState, internalTagState, metadataItem},
      arrowDirection,
      classes,
      onClick,
      onConfirmDelete,
      showDeleteButton,
    } = this.props
    return (
      <TableRow className={classes.channelRow} onClick={onClick}>
        <TableCell width={CHANNEL_WIDTH}>
          {internalTag}
        </TableCell>
        <TableCell width={VALUE_WIDTH}>
          <SmallValueBlock
            value={internalTagState ? internalTagState.v : null}
            metadataItem={metadataItem}
            showUnits={false}
          />
        </TableCell>
        <TableCell className={classes.arrowCell} width={ARROW_WIDTH}>
          <FlowArrow direction={arrowDirection} />
        </TableCell>
        <TableCell width={CHANNEL_WIDTH}>
          {mqttTag}
        </TableCell>
        <TableCell width={VALUE_WIDTH}>
          <SmallValueBlock
            value={mqttTagState ? mqttTagState.v : null}
            metadataItem={metadataItem}
            showUnits={false}
          />
        </TableCell>
        {showDeleteButton !== false && (
          <DeleteButtonCell
            classes={classes}
            onConfirmDelete={onConfirmDelete}
            width={DELETE_ICON_WIDTH}
          />
        )}
      </TableRow>
    )
  }
}

