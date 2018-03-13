// @flow

import * as React from 'react'
import {reduxForm} from 'redux-form'

export type Props = {
  children: React.ComponentType<any>,
}

export class FormWrapper extends React.Component<Props> {
  render(): ?React.Node {
    const {children: Children, ...props} = this.props
    return <Children {...props} />
  }
}

export default reduxForm({form: 'wrapper'})(FormWrapper)

