// @flow

import * as React from 'react'
import {connect} from 'react-redux'
import type {State, Action, Dispatch} from '../redux/types'
import type SubContext from '../symmetry/SubContext'
import {subscribe} from '../redux/symmetry'
import {createStructuredSelector} from 'reselect'
import warnIfNotMemoized from 'warn-if-not-memoized'
import {TransitionListener} from 'react-transition-context'

type Options<InputProps: Object> = {
  /**
   * The arguments to call Symmetry.subscribe with (first is always the publication name).
   * Can either be a static array, or a function of state and props.
   * CAUTION: right now at least, if you use a function, it should always be something like
   * `createSelector` from the `reselect` package, because two arrays that are !== will trigger
   * a resubscribe even if they are deep equal.  I need to make this more foolproof.
   */
  args: Array<any> | (state: State, props: InputProps) => Array<any>,
  /**
   * By default, this will resubscribe whenever the user's roles or policies change.  If `ignorePermissionsChanges`
   * is `true`, it will not resubscribe when that happens.
   */
  ignorePermissionsChanges?: boolean,
  /**
   * Action creators for events emitted by the publication.  For instance, if the publication
   * did `emit('platitude', 'foo', 'bar')`, the subscriber will dispatch `actions.platitude('foo', 'bar')`
   * if it exists.
   * TODO: make createSubscriber warn about unhandled events in dev mode
   */
  actions?: {[eventName: string]: (...args: Array<any>) => Action},
  onSubscribe?: (sub: SubContext, dispatch: Dispatch) => any,
  onUnsubscribe?: (sub: SubContext, dispatch: Dispatch) => any,
  displayName?: string,
}

/**
 * Creates a React component that maintains a Symmetry subscription while it's mounted.  What to subscribe to is
 * determined by the `args` option (which may be a function of redux state and the component props), and whenever
 * those args change, the component will resubscribe.  When the component unmounts, it will unsubscribe, so by rendering
 * it in the relevant view (doesn't matter where, it's invisible), you don't need to worry about unsubscribing --
 * when the user navigates away from that view, it will automatically unsubscribe.
 */
export default function createSubscriber<InputProps: Object>(options: Options<InputProps>): React.ComponentType<InputProps> {
  const {args, actions, onSubscribe, onUnsubscribe, displayName, ignorePermissionsChanges} = options

  type PropsFromState = {
    args: Array<any>,
    userRoles: any,
    userPolicies: any,
  }
  type PropsFromDispatch = {
    dispatch: Dispatch,
  }
  type Props = InputProps & PropsFromState & PropsFromDispatch

  class Subscriber extends React.Component<Props, void> {
    _isIn: boolean = false
    _subscription: ?SubContext

    _unsubscribe = () => {
      const {_subscription} = this
      if (_subscription) {
        if (onUnsubscribe) onUnsubscribe(_subscription, this.props.dispatch)
        _subscription.removeAllListeners()
        _subscription.stop()
      }
      this._subscription = null
    }
    _subscribe = ({args}: Props = this.props) => {
      if (!args) return
      const {dispatch} = this.props
      const subscription = this._subscription = dispatch(subscribe(...args))
      if (subscription) {
        if (onSubscribe) onSubscribe(subscription, dispatch)
        if (actions) {
          for (let eventName in actions) {
            subscription.on(eventName, (...args) => dispatch(actions[eventName](...args)))
          }
        }
      }
    }

    handleEnter = () => {
      this._isIn = true
      this._subscribe()
    }

    handleLeave = () => {
      this._isIn = false
      this._unsubscribe()
    }

    componentWillReceiveProps(nextProps: Props) {
      if (!this._isIn) return
      if (nextProps.args !== this.props.args ||
        (!ignorePermissionsChanges && (
          nextProps.userRoles !== this.props.userRoles ||
          nextProps.userPolicies !== this.props.userPolicies
        ))) {
        this._unsubscribe()
        this._subscribe(nextProps)
      }
    }
    render(): React.Node {
      const {children} = this.props
      const listener = <TransitionListener didComeIn={this.handleEnter} willLeave={this.handleLeave} />
      return children != null ? <div>{listener}{children}</div> : listener
    }
  }
  if (displayName) Subscriber.displayName = displayName

  const mapStateToProps = createStructuredSelector({
    userPolicies: ({user}) => user && user.policies,
    userRoles: ({user}) => user && user.roles,
    args: Array.isArray(args) ? () => args : warnIfNotMemoized(args, {functionName: 'args function'}),
  })

  return connect(mapStateToProps)(Subscriber)
}

