// @flow

import * as React from 'react'
import {reduxForm} from 'redux-form'

export type Props = {
  initialValues?: any,
  initialize: (initialValues: any) => any,
  component: React.ComponentType<any>,
}

export class FormWrapper extends React.Component<Props> {
  componentDidMount() {
    const {initialValues, initialize} = this.props
    if (initialValues) initialize(initialValues)
  }
  render(): ?React.Node {
    const {component: Component, ...props} = this.props
    return <Component {...props} />
  }
}

export default reduxForm({form: 'wrapper'})(FormWrapper)

