// @flow

import * as React from 'react'
import Typography from 'material-ui/Typography'

export type Props = {
  children: React.Node,
}

const Title = ({children, ...props}: Props) => (
  <Typography type="title" color="inherit" {...props}>
    {children}
  </Typography>
)

export default Title

