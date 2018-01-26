// @flow

import * as React from 'react'
import {TextField} from 'redux-form-material-ui'

export type Props = React.ElementProps<typeof TextField>

const TestTextField = ({input, InputLabelProps, FormHelperTextProps, ...props}: Props): React.Node => (
  <TextField
    input={input}
    data-name={input.name}
    data-component="TextField"
    InputLabelProps={{
      ...InputLabelProps || {},
      'data-component': 'InputLabel',
    }}
    FormHelperTextProps={{
      ...FormHelperTextProps || {},
      'data-component': 'FormHelperText',
    }}
    {...props}
  />
)


export default process.env.BABEL_ENV === 'test' ? TestTextField : TextField

