// @flow

import * as React from 'react'
import _Button from 'material-ui/Button'
import {FormControl, FormLabel, FormHelperText} from 'material-ui/Form'
import {withStyles} from 'material-ui/styles'

import RadioButtonGroup from './RadioButtonGroup'
import type {Theme} from '../theme'

const styles = ({spacing, palette}: Theme) => ({
  label: {
    marginTop: spacing.unit * 2,
    marginBottom: spacing.unit,
  },
  button: {},
  buttonUnselected: {},
  helperText: {},
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props<V> = {
  label?: React.Node,
  classes: Classes,
  className?: string,
  availableValues: Array<V>,
  getDisplayText: (value: V) => string,
  selectedButtonProps: $Shape<React.ElementProps<typeof _Button>>,
  input: {
    value?: ?V,
    onChange?: (newValue: ?V) => any,
    disabled?: boolean,
    name: string,
  },
  meta: {
    warning?: string,
    error?: string,
    touched?: boolean,
  },
  Button?: React.ComponentType<$ReadOnly<React.ElementProps<typeof _Button>>>,
}

const ButtonGroupField = <V>(props: Props<V>): React.Node => {
  const {
    label,
    classes,
    className,
    selectedButtonProps,
    availableValues,
    getDisplayText,
    input,
    meta: {warning, error, touched},
    Button,
  } = props
  return (
    <FormControl className={className} error={touched && (error != null || warning != null)}>
      {label &&
        <FormLabel className={classes.label}>
          {label}
        </FormLabel>
      }
      <RadioButtonGroup
        availableValues={availableValues}
        getDisplayText={getDisplayText}
        selectedButtonProps={selectedButtonProps}
        Button={Button}
        classes={{
          button: classes.button,
          buttonUnselected: classes.buttonUnselected,
        }}
        {...input}
      />
      {touched && (error || warning) &&
      <FormHelperText className={classes.helperText}>
        {error || warning}
      </FormHelperText>
      }
    </FormControl>
  )
}
ButtonGroupField.defaultProps = {
  getDisplayText: value => String(value),
  selectedButtonProps: {
    color: 'secondary',
    variant: 'raised',
  },
}

export default withStyles(styles, {withTheme: true})(ButtonGroupField)

