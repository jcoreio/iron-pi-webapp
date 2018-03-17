// @flow

import * as React from 'react'
import {reduxForm} from 'redux-form'

export type Props = {
  component: React.ComponentType<any>,
}

export class FormWrapper extends React.Component<Props> {
  render(): ?React.Node {
    const {component: Component, ...props} = this.props
    return <Component {...props} />
  }
}

export default reduxForm({form: 'wrapper'})(FormWrapper)

