// @flow

import * as React from 'react';
import {Alert, Icon} from '@jcoreio/rubix'
import Autocollapse from './Autocollapse'
import Spinner from './Spinner'
import type {PromiseState} from 'redux-track-promise'

export type Props<Value, Reason> = $Shape<PromiseState<Value, Reason> & {
  alertProps: Object,
  showFulfilled?: boolean,
  showPending?: boolean,
  pendingMessage: string,
  fulfilledMessage: string | (value: Value) => string,
  rejectedMessage: string | (reason: Reason) => string,
}>

/**
 * Displays the status of any async operation in a bootstrap alert.
 * This is designed to be passed props from a PromiseState straight out of redux state
 * (see universal/redux/promiseStatus.js).
 */
const PromiseStateAlert = <Value, Reason>(props: Props<Value, Reason>): React.Element<any> => {
  const {pending, showPending, fulfilled, showFulfilled, rejected, value, reason} = props

  let message
  if (pending) {
    if (showPending === false) return <Autocollapse />
    message = props.pendingMessage || ''
  } else if (fulfilled) {
    if (showFulfilled === false) return <Autocollapse />
    const fulfilledMessage = props.fulfilledMessage || ''
    message = typeof fulfilledMessage === 'string' ? fulfilledMessage : fulfilledMessage((value: any))
  } else if (rejected) {
    const rejectedMessage = props.rejectedMessage || ''
    message = typeof rejectedMessage === 'string'
      ? `${rejectedMessage} ${reason ? String((reason: any).message || reason) : ''}`
      : rejectedMessage((reason: any))
  } else {
    return <Autocollapse />
  }

  const alertProps = props.alertProps || {}
  const bsStyle = fulfilled ? 'success' : rejected ? 'danger' : 'info'
  const icon = pending ? <Spinner />
    : fulfilled ? <Icon bundle="glyphicon" glyph="ok" />
      : rejected ? <Icon bundle="glyphicon" glyph="exclamation-sign" />
        : undefined

  return (
    <Autocollapse>
      <div>
        <Alert bsStyle={bsStyle} {...alertProps}>
          {icon} {message}
        </Alert>
      </div>
    </Autocollapse>
  )
}

export default PromiseStateAlert

