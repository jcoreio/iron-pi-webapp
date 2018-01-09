// @flow

import * as React from 'react'
import {map} from 'lodash'
import {Field} from 'redux-form'
import {Select, TextField} from 'redux-form-material-ui'
import type {FieldArrayProps} from 'redux-form'
import {withStyles} from 'material-ui/styles'
import {MenuItem} from 'material-ui/Menu'
import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import Tooltip from 'material-ui/Tooltip'
import AddIcon from 'material-ui-icons/AddCircle'
import InfoIcon from 'material-ui-icons/Info'
import DeleteIcon from 'material-ui-icons/Delete'
import {FormControl, FormHelperText, FormLabel} from 'material-ui/Form'
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from 'material-ui/Table'

import type {Theme} from '../../theme'
import type {Comparison, ControlCondition, LogicOperation} from '../../types/Channel'
import {Comparisons, LogicOperations} from '../../types/Channel'

const styles = ({spacing, palette}: Theme) => ({
  table: {
    marginTop: spacing.unit * 2,
    borderCollapse: 'separate',
    border: {
      width: 2,
      style: 'solid',
      color: palette.grey[500],
    },
    borderLeftWidth: 0,
    borderRightWidth: 0,
    '& td, & th': {
      padding: spacing.unit / 2,
    },
    '& td:first-child, & th:first-child': {
      paddingLeft: 0,
    },
    '& td:last-child, & th:last-child': {
      paddingRight: 0,
      textAlign: 'right',
    },
  },
  topRightCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  addIcon: {
    marginLeft: spacing.unit,
  },
  infoIcon: {
    marginLeft: spacing.unit,
  },
  deleteButton: {
    marginRight: -spacing.unit * 1.5,
  },
  thresholdField: {
    width: '100%',
    '& input': {
      textAlign: 'center',
    }
  },
  hidden: {
    visibility: 'hidden',
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

type ExtractFields = <T>(props: {fields: T}) => T
type Fields = $Call<ExtractFields, FieldArrayProps>

type Channel = {
  id: number,
  name: string,
}

export type Props = {
  classes: Classes,
  fields: Fields,
  channels?: Array<Channel>,
  formControlClass?: string,
  meta?: {
    warning?: string,
    error?: string,
    submitFailed?: boolean,
  },
}

class ControlLogicTable extends React.Component<Props> {
  handleAddConditionClick = () => {
    const {fields} = this.props
    fields.push(({
      operation: 'AND',
      comparison: 'GT',
    }: $Shape<ControlCondition>))
  }
  render(): React.Node {
    const {fields, classes, channels, meta, formControlClass} = this.props
    const {warning, error, submitFailed} = meta || {}
    return (
      <FormControl error={submitFailed && (error != null || warning != null)} className={formControlClass}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell colSpan={3}>
                <FormLabel>
                  Control Logic
                </FormLabel>
              </TableCell>
              <TableCell colSpan={2}>
                <div className={classes.topRightCell}>
                  <Button onClick={this.handleAddConditionClick}>
                    Add Condition
                    <AddIcon className={classes.addIcon} />
                  </Button>
                  <Tooltip title="???" placement="left">
                    <InfoIcon className={classes.infoIcon} />
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((condition: string, index: number) => (
              <TableRow key={index}>
                <TableCell>
                  <Field
                    name={`${condition}.operation`}
                    component={Select}
                    className={index === 0 ? classes.hidden : undefined}
                  >
                    {map(LogicOperations, ({displayText}: {displayText: string}, value: LogicOperation) => (
                      <MenuItem key={value} value={value}>{displayText}</MenuItem>
                    ))}
                  </Field>
                </TableCell>
                <TableCell>
                  <Field
                    name={`${condition}.channelId`}
                    component={Select}
                    displayEmpty
                  >
                    <MenuItem value="">Select Channel</MenuItem>
                    {map(channels, ({id, name}: Channel) => (
                      <MenuItem key={id} value={id}>{name}</MenuItem>
                    ))}
                  </Field>
                </TableCell>
                <TableCell>
                  <Field
                    name={`${condition}.comparison`}
                    component={Select}
                  >
                    {map(Comparisons, ({displayText}: {displayText: string}, value: Comparison) => (
                      <MenuItem key={value} value={value}>{displayText}</MenuItem>
                    ))}
                  </Field>
                </TableCell>
                <TableCell>
                  <Field
                    name={`${condition}.threshold`}
                    type="text"
                    placeholder="Threshold"
                    component={TextField}
                    className={classes.thresholdField}
                  />
                </TableCell>
                <TableCell>
                  <IconButton className={classes.deleteButton} onClick={() => fields.remove(index)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {submitFailed && (error || warning) &&
          <FormHelperText>
            {error || warning}
          </FormHelperText>
        }
      </FormControl>
    )
  }
}

export default withStyles(styles, {withTheme: true})(ControlLogicTable)
