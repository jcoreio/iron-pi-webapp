// @flow

import * as React from 'react'
import _ from 'lodash'
import {connect} from 'react-redux'
import type {State, Action, Dispatch} from '../redux/types'
import {call} from '../redux/symmetry'
import {createStructuredSelector} from 'reselect'
import warnIfNotMemoized from 'warn-if-not-memoized'
import {TransitionListener} from 'react-transition-context'

type Options<InputProps: Object> = {
  /**
   * The arguments to call Symmetry.call with (first is always the method name).
   * Can either be a static array, or a function of state and props.
   * CAUTION: right now at least, if you use a function, it should always be something like
   * `createSelector` from the `reselect` package, because two arrays that are !== will trigger
   * a new call even if they are deep equal.  I need to make this more foolproof.
   */
  args: Array<any> | (state: State, props: InputProps) => Array<any>,
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
    +resolve: (result: any) => Action | Array<Action>,
    +reject: (error: Error) => Action,
  },
  throttle?: number,
  debounce?: number,
}

/**
 * Creates a React component that calls a Symmetry method whenever it mounts, and whenever the args to call with
 * (determined by the `args` option, which may be a function of redux state and component props) change.
 */
export default function createCaller<InputProps: Object>(options: Options<InputProps>): React.ComponentType<InputProps> {
  const {args, actions: {setPending, resolve, reject}, throttle, debounce} = options

  type PropsFromState = {
    args: Array<any>,
  }
  type PropsFromDispatch = {
    dispatch: Dispatch,
  }
  type Props = InputProps & PropsFromState & PropsFromDispatch

  class Caller extends React.Component<Props, void> {
    isIn: boolean = false
    callCount: number = 0

    _call = ({args}: Props = this.props) => {
      const {dispatch} = this.props
      const initCallCount = ++this.callCount
      dispatch(setPending())
      dispatch(call(...args))
        .then((result: any) => {
          if (this.callCount === initCallCount) {
            const actionOrActions = resolve(result)
            if (Array.isArray(actionOrActions)) actionOrActions.forEach(dispatch)
            else dispatch(actionOrActions)
          }
        })
        .catch((error: Error) => {
          if (this.callCount === initCallCount) dispatch(reject(error))
          throw error
        })
    }

    _throttledCall = throttle
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
      if (this.isIn && nextProps.args !== this.props.args) this._throttledCall(nextProps)
    }
    render(): React.Node {
      return <TransitionListener didComeIn={this.handleEnter} willLeave={this.handleLeave} />
    }
  }

  const argsObject = {args}
  const mapStateToProps = Array.isArray(args)
    ? () => argsObject
    : createStructuredSelector({args: warnIfNotMemoized(args, {functionName: 'args function'})})

  return connect(mapStateToProps)(Caller)
}

