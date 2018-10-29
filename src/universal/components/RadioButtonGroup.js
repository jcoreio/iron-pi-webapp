// @flow

import * as React from 'react'
import classNames from 'classnames'
import _Button from '@material-ui/core/Button'
import {withStyles} from '@material-ui/core/styles'

import ButtonGroup from './ButtonGroup'
import type {Theme} from '../theme'

const styles = ({spacing, palette}: Theme) => ({
  button: {},
  buttonUnselected: {
    border: {
      width: 1,
      style: 'solid',
      color: palette.grey[500],
    },
    '&:not(:last-child)': {
      borderRightWidth: 0,
    }
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props<V> = {
  classes: Classes,
  className?: string,
  availableValues: Array<V>,
  getDisplayText: (value: V) => string,
  selectedButtonProps: $Shape<React.ElementProps<typeof _Button>>,
  value?: ?V,
  onChange?: (newValue: ?V, event: Event) => any,
  disabled?: boolean,
  name: string,
  Button?: React.ComponentType<$ReadOnly<React.ElementProps<typeof _Button>>>,
}

const RadioButtonGroup = <V>(props: Props<V>): React.Node => {
  const {
    classes,
    className,
    selectedButtonProps,
    availableValues,
    getDisplayText,
    value: selectedValue,
    onChange,
    disabled,
    name,
  } = props
  const Button = props.Button || _Button
  return (
    <ButtonGroup name={name} data-value={selectedValue} className={className}>
      {availableValues.map((value: V, key: any) => {
        const selected = value === selectedValue
        return (
          <Button
            key={key}
            value={value}
            className={classNames(classes.button, {
              [classes.buttonUnselected]: !selected,
            })}
            disabled={disabled}
            onClick={e => onChange && onChange(value, e)}
            {...(selected ? selectedButtonProps : {})}
          >
            {getDisplayText(value)}
          </Button>
        )
      })}
    </ButtonGroup>
  )
}
RadioButtonGroup.defaultProps = {
  getDisplayText: value => String(value),
  selectedButtonProps: {
    color: 'secondary',
    variant: 'raised',
  },
}

export default withStyles(styles, {withTheme: true})(RadioButtonGroup)

