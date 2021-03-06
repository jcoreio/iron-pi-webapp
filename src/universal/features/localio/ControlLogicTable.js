// @flow

import * as React from 'react'
import classNames from 'classnames'
import map from 'lodash.map'
import {Field, formValues} from 'redux-form'
import {NumericField} from 'redux-form-numeric-field'
import {required} from 'redux-form-validators'
import TextField from '../../components/TextField'
import type {FieldArrayProps} from 'redux-form'
import {withStyles} from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import Tooltip from '@material-ui/core/Tooltip'
import AddIcon from '../../components/icons/AddRectangle'
import InfoIcon from '@material-ui/icons/Info'
import DeleteIcon from '@material-ui/icons/Delete'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormLabel from '@material-ui/core/FormLabel'

import {createSelector} from 'reselect'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import type {Theme} from '../../theme'
import type {Comparison, ControlCondition, LogicOperator} from '../../types/ControlLogic'
import {Comparisons, LogicOperators} from '../../types/ControlLogic'

export type SetpointFieldProps = {
  condition: string,
  comparison: ?Comparison,
  classes: Classes,
}

const SetpointField = ({condition, classes, comparison}: SetpointFieldProps): React.Node => {
  if (comparison === 'UNAVAILABLE') return <span />
  return (
    <NumericField
      name={`${condition}.setpoint`}
      type="text"
      placeholder="Setpoint"
      component={TextField}
      className={classes.setpointField}
      validate={required()}
      inputProps={{size: 10}}
    />
  )
}

const ConnectedSetpointField = formValues(createSelector(
  ({condition}) => condition,
  (condition: string) => ({comparison: `${condition}.comparison`})
))(
  SetpointField
)

const styles = ({spacing, palette, typography: {pxToRem}}: Theme) => ({
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
    '& td': {
      borderBottom: 'none',
      verticalAlign: 'top',
    },
  },
  fullWidth: {
    width: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    flexGrow: 1,
    textAlign: 'left',
    fontSize: pxToRem(18),
  },
  labelValid: {
    color: palette.text.primary,
  },
  addConditionButton: {
    fontSize: pxToRem(16),
    color: palette.text.secondary,
  },
  addIcon: {
    marginLeft: spacing.unit,
  },
  infoIcon: {
    marginLeft: spacing.unit,
    color: palette.infoIcon,
  },
  deleteButton: {
    marginRight: -spacing.unit * 1.5,
  },
  setpointField: {
    width: '100%',
    '& input': {
      textAlign: 'center',
    }
  },
  hidden: {
    visibility: 'hidden',
  },
  selectTagItem: {
    color: palette.text.hint,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

type ExtractFields = <T>(props: {fields: T}) => T
type Fields = $Call<ExtractFields, FieldArrayProps>

type MetadataItem = {
  tag: string,
  name: string,
}

export type Props = {
  classes: Classes,
  fields: Fields,
  metadata?: Array<MetadataItem>,
  formControlClass?: string,
  meta?: {
    warning?: string,
    error?: string,
    submitFailed?: boolean,
  },
  change: (field: string, newValue: any) => any,
}

class ControlLogicTable extends React.Component<Props> {
  handleAddConditionClick = () => {
    const {fields} = this.props
    fields.push(({
      operator: 'AND',
      comparison: 'GT',
    }: $Shape<ControlCondition>))
  }
  handleComparisonChange = (condition: string) => (event: any, newValue: Comparison) => {
    if (newValue === 'UNAVAILABLE') {
      const {change} = this.props
      change(`${condition}.setpoint`, null)
    }
  }
  render(): React.Node {
    const {fields, classes, metadata, meta, formControlClass} = this.props
    const {warning, error, submitFailed} = meta || {}
    const hasError = submitFailed && (error != null || warning != null)
    return (
      <FormControl error={hasError} className={formControlClass} data-component="ControlLogicTable">
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell colSpan={5}>
                <div className={classes.header}>
                  <FormLabel className={classNames(classes.label, {[classes.labelValid]: !hasError})}>
                    Control Logic
                  </FormLabel>
                  <Button
                    onClick={this.handleAddConditionClick}
                    className={classes.addConditionButton}
                    data-test-name="addConditionButton"
                  >
                    Add Condition
                    <AddIcon className={classes.addIcon} />
                  </Button>
                  <Tooltip title="Controls the output based on one or more comparison conditions." placement="left">
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
                    name={`${condition}.operator`}
                    component={TextField}
                    select
                    props={{onBlur: null}}
                    className={index === 0 ? classes.hidden : undefined}
                    validate={index === 0 ? undefined : required()}
                  >
                    {map(LogicOperators, ({displayText}: {displayText: string}, value: LogicOperator) => (
                      <MenuItem key={value} value={value}>{displayText}</MenuItem>
                    ))}
                  </Field>
                </TableCell>
                <TableCell>
                  <Field
                    name={`${condition}.tag`}
                    component={TextField}
                    select
                    SelectProps={{displayEmpty: true}}
                    props={{onBlur: null}}
                    validate={required()}
                    className={classes.fullWidth}
                  >
                    <MenuItem value="">
                      <span className={classes.selectTagItem}>Select Tag</span>
                    </MenuItem>
                    {map(metadata, ({tag, name}: MetadataItem) => (
                      <MenuItem key={tag} value={tag}>{name}</MenuItem>
                    ))}
                  </Field>
                </TableCell>
                <TableCell>
                  <Field
                    name={`${condition}.comparison`}
                    component={TextField}
                    select
                    props={{onBlur: null}}
                    className={classes.fullWidth}
                    validate={required()}
                    onChange={this.handleComparisonChange(condition)}
                  >
                    {map(Comparisons, ({displayText}: {displayText: string}, value: Comparison) => (
                      <MenuItem key={value} value={value}>{displayText}</MenuItem>
                    ))}
                  </Field>
                </TableCell>
                <TableCell>
                  <ConnectedSetpointField condition={condition} classes={classes} />
                </TableCell>
                <TableCell>
                  <IconButton
                    className={classes.deleteButton}
                    onClick={() => fields.remove(index)}
                    data-test-name="deleteConditionButton"
                  >
                    <Icon><DeleteIcon /></Icon>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {submitFailed && (error || warning) &&
          <FormHelperText data-component="FormHelperText">
            {error || warning}
          </FormHelperText>
        }
      </FormControl>
    )
  }
}

export default withStyles(styles, {withTheme: true})(ControlLogicTable)
