// @flow

import * as React from 'react'
import classNames from 'classnames'
import Button from 'material-ui/Button'
import {FormControl, FormLabel, FormHelperText} from 'material-ui/Form'
import {withStyles} from 'material-ui/styles'

import ButtonGroup from './ButtonGroup'
import type {Theme} from '../theme'

const styles = ({spacing, palette}: Theme) => ({
  label: {
    marginTop: spacing.unit * 2,
    marginBottom: spacing.unit,
  },
  buttonUnselected: {
    border: {
      width: 1,
      style: 'solid',
      color: palette.grey[300],
    },
    '&:not(:last-child)': {
      borderRightWidth: 0,
    }
  }
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props<V> = {
  label?: React.Node,
  classes: Classes,
  className?: string,
  labelClassName?: string,
  buttonClassName?: string,
  helperTextClassName?: string,
  availableValues: Array<V>,
  getDisplayText: (value: V) => string,
  selectedButtonProps: $Shape<React.ElementProps<typeof Button>>,
  input: {
    value?: ?V,
    onChange?: (newValue: ?V) => any,
    disabled?: boolean,
  },
  meta: {
    warning?: string,
    error?: string,
    touched?: boolean,
  },
}

const ButtonGroupField = withStyles(styles, {withTheme: true})(<V>({
  label,
  classes,
  className,
  labelClassName,
  buttonClassName,
  selectedButtonProps,
  helperTextClassName,
  availableValues,
  getDisplayText,
  input: {value: selectedValue, onChange, disabled},
  meta: {warning, error, touched},
}: Props<V>): React.Node => (
  <FormControl className={className} error={touched && (error != null || warning != null)}>
    {label &&
      <FormLabel className={classNames(classes.label, labelClassName)}>
        {label}
      </FormLabel>
    }
    <ButtonGroup>
      {availableValues.map((value: V, key: any) => {
        const selected = value === selectedValue
        return (
          <Button
            key={key}
            className={classNames(buttonClassName, {
              [classes.buttonUnselected]: !selected,
            })}
            disabled={disabled}
            onClick={() => onChange && onChange(value)}
            {...(selected ? selectedButtonProps : {})}
          >
            {getDisplayText(value)}
          </Button>
        )
      })}
    </ButtonGroup>
    {touched && (error || warning) &&
      <FormHelperText className={helperTextClassName}>
        {error || warning}
      </FormHelperText>
    }
  </FormControl>
))
ButtonGroupField.defaultProps = {
  getDisplayText: value => String(value),
  selectedButtonProps: {
    color: 'accent',
    raised: true,
  },
}

export default ButtonGroupField

