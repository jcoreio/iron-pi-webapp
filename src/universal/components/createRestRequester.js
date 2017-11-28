// @flow

import * as React from 'react'
import _ from 'lodash'
import {connect} from 'react-redux'
import type {State, Action, Dispatch} from '../redux/types'
import {createStructuredSelector} from 'reselect'
import warnIfNotMemoized from 'warn-if-not-memoized'
import {TransitionListener} from 'react-transition-context'
import superagent from 'superagent'
import type {Superagent, Request, Response} from 'superagent'

type Options<InputProps: Object> = {
  /**
   * The arguments to call Symmetry.subscribe with (first is always the publication name).
   * Can either be a static array, or a function of state and props.
   * CAUTION: right now at least, if you use a function, it should always be something like
   * `createSelector` from the `reselect` package, because two arrays that are !== will trigger
   * a resubscribe even if they are deep equal.  I need to make this more foolproof.
   */
  request: (superagent: Superagent) => (state: State, props: InputProps) => ?Request,
  /**
   * By default, this will resubscribe whenever the user's roles or policies change.  If `ignorePermissionsChanges`
   * is `true`, it will not resubscribe when that happens.
   */
  ignorePermissionsChanges?: boolean,
  /**
   * Unless this is false, the returned Caller will call the method when it mounts.
   */
  callOnMount?: boolean,
  /**
   * Action creators for reporting the status, result, and errors of the call.
   * For instance, when the call successfully returns `result`, the component will dispatch `actions.resolve(result)`.
   * These are designed to have the same names as the action creators from `promiseStatus.js`.
   * TODO: make createCaller warn about unhandled events in dev mode
   */
  actions: {
    +setPending: () => Action,
    +resolve: (result: Response) => Action | Array<Action>,
    +reject: (error: Error) => Action,
  },
  displayName?: string,
  throttle?: number,
  debounce?: number,
}

/**
 * Creates a React component that calls a REST method whenever it mounts, and whenever the request to call with
 * (determined by the `request` option, which may be a function of redux state and component props) changes.
 */
export default function createRestRequester<InputProps: Object>(options: Options<InputProps>): React.ComponentType<InputProps> {
  const {request, actions: {setPending, resolve, reject}, throttle, debounce} = options

  type PropsFromState = {
    request: Array<any>,
  }
  type PropsFromDispatch = {
    dispatch: Dispatch,
  }
  type Props = InputProps & PropsFromState & PropsFromDispatch

  class RestRequester extends React.Component<Props, void> {
    isIn: boolean = false
    callCount: number = 0

    _call = ({request}: Props = this.props) => {
      if (!request) return
      const {dispatch} = this.props
      const initCallCount = ++this.callCount
      dispatch(setPending())
      request.then(
        (response: Response) => {
          if (this.callCount === initCallCount) {
            const actionOrActions = resolve(response)
            if (Array.isArray(actionOrActions)) actionOrActions.forEach(dispatch)
            else dispatch(actionOrActions)
          }
        },
        (error: Error) => {
          if (this.callCount === initCallCount) dispatch(reject(error))
          throw error
        }
      )
    }

    _throttledCall: (props?: Props) => void = throttle
      ? _.throttle(this._call, throttle)
      : debounce
        ? _.debounce(this._call, debounce)
        : this._call

    handleEnter = () => {
      this.isIn = true
      this._throttledCall()
    }

    handleLeave = () => {
      this.isIn = false
      this.callCount++
      if (typeof this._throttledCall.cancel === 'function') {
        this._throttledCall.cancel()
      }
    }

    componentWillReceiveProps(nextProps: Props) {
      if (this.isIn && nextProps.request !== this.props.request) this._throttledCall(nextProps)
    }
    render(): React.Node {
      return <TransitionListener didComeIn={this.handleEnter} willLeave={this.handleLeave} />
    }
  }

  const mapStateToProps = createStructuredSelector({
    request: warnIfNotMemoized(request(superagent), {functionName: 'request function'}),
  })

  return connect(mapStateToProps)(RestRequester)
}

