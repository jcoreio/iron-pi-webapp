// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles} from 'material-ui/styles'
import {NumericField} from 'redux-form-numeric-field'
import TextField from '../TextField'
import {required} from 'redux-form-validators'
import type {FieldArrayProps} from 'redux-form'
import IconButton from 'material-ui/IconButton'
import DeleteIcon from 'material-ui-icons/Delete'
import {FormControl, FormHelperText} from 'material-ui/Form'
import Arrow from 'react-arrow'
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from 'material-ui/Table'
import {withTheme} from 'material-ui/styles/index'

import type {Theme} from '../../theme/index'
import AddIcon from '../icons/AddRectangle'

const FlowArrow = withTheme()(({theme: {channelState: {arrow}}, ...props}: Object) => (
  <Arrow
    direction="right"
    shaftWidth={arrow.shaftWidth}
    shaftLength={arrow.shaftLength}
    headWidth={arrow.headWidth}
    headLength={arrow.headLength}
    fill={arrow.fill}
    {...props}
  />
))

const styles = ({spacing, palette}: Theme) => ({
  root: {
    display: 'block',
    paddingTop: 0,
  },
  table: {
    borderCollapse: 'separate',
    border: {
      width: 2,
      style: 'solid',
      color: palette.grey[500],
    },
    borderTopWidth: 0,
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
    '& td': {
      borderBottom: 'none',
      verticalAlign: 'top',
    },
    '& td$arrowCell': {
      verticalAlign: 'middle',
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
    marginRight: -spacing.unit * 1.5,
  },
  deleteButton: {
    marginRight: -spacing.unit * 1.5,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

type ExtractFields = <T>(props: {fields: T}) => T
type Fields = $Call<ExtractFields, FieldArrayProps>

export type Props = {
  classes: Classes,
  bodyClass?: string,
  fields: Fields,
  editable?: boolean,
  units?: ?string,
  rawInputUnits: string,
  meta?: {
    warning?: string,
    error?: string,
    submitFailed?: boolean,
  },
}

class CalibrationTable extends React.Component<Props> {
  render(): ?React.Node {
    const {classes, fields, meta, bodyClass, units, rawInputUnits} = this.props
    const editable = this.props.editable !== false
    const {warning, error, submitFailed} = meta || {}
    const hasError = submitFailed && (error != null || warning != null)
    return (
      <FormControl error={hasError} className={classNames(bodyClass, classes.root)} data-component="CalibrationTable">
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>
                Raw Value ({rawInputUnits})
              </TableCell>
              <TableCell />
              <TableCell>
                Actual Value {units ? `(${units})` : undefined}
              </TableCell>
              {editable &&
                <TableCell>
                  <IconButton className={classes.addButton} onClick={() => fields.push({})}>
                    <AddIcon />
                  </IconButton>
                </TableCell>
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((point: string, index: number) => (
              <TableRow key={index}>
                <TableCell>
                  <NumericField
                    name={`${point}.x`}
                    component={TextField}
                    validate={required()}
                    className={classes.textField}
                  />
                </TableCell>
                <TableCell className={classes.arrowCell}>
                  <FlowArrow />
                </TableCell>
                <TableCell>
                  <NumericField
                    name={`${point}.y`}
                    component={TextField}
                    validate={required()}
                    className={classes.textField}
                  />
                </TableCell>
                {editable &&
                  <TableCell>
                    <IconButton className={classes.deleteButton} onClick={() => fields.remove(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                }
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

export default withStyles(styles, {withTheme: true})(CalibrationTable)

