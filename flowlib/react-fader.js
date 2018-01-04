// @flow

import * as React from 'react'
import Prefixer from 'inline-style-prefixer'

declare module 'react-fader' {
  declare export type TransitionState = 'in' | 'out' | 'entering' | 'leaving'

  declare export type DefaultProps = {
    animateHeight: boolean,
    fadeInTransitionDuration: number,
    fadeInTransitionTimingFunction: string,
    fadeOutTransitionDuration: number,
    fadeOutTransitionTimingFunction: string,
    heightTransitionDuration: number,
    heightTransitionTimingFunction: string,
    prefixer: Prefixer,
    style: Object,
    measureHeight: (node: HTMLElement) => number,
    shouldTransition: (oldChildren: any, newChildren: any) => boolean,
  }

  declare export type Props = {
    innerRef?: (c: ?React.ElementRef<'div'>) => any,
    shouldTransition: (oldChildren: any, newChildren: any) => boolean,
    children?: React.Node,
    animateHeight: boolean,
    fadeInTransitionDuration: number,
    fadeInTransitionTimingFunction: string,
    fadeOutTransitionDuration: number,
    fadeOutTransitionTimingFunction: string,
    heightTransitionDuration: number,
    heightTransitionTimingFunction: string,
    prefixer: Prefixer,
    style: Object,
    fillParent?: boolean,
    className?: string,
    measureHeight: (node: HTMLElement) => number,
  }

  declare export type State = {
    children: any,
    height: ?number,
    wrappedChildren: React.Element<any>,
    transitionState: TransitionState,
    transitioningHeight: boolean,
  }

  declare export type Options = {
    wrapChildren?: (children: any, transitionState: TransitionState) => React.Element<any>,
  }

  declare export function defaultWrapChildren(children: any, transitionState: TransitionState): React.Element<'div'>

  declare export function createFader(options?: Options): Class<React.Component<$Shape<Props>, State>>

  declare export default class Fader extends React.Component<Props, State> {
    static defaultProps: DefaultProps
  }
}
declare module 'react-fader/lib/withTransitionContext' {
  import type {Props, State, DefaultProps} from 'react-fader'

  declare export default class FaderWithTransitionContext extends React.Component<Props, State> {
    static defaultProps: DefaultProps
  }
}
declare module 'react-fader/lib/withTransitionContext.js' {
  declare module.exports: $Exports<'react-fader/lib/withTransitionContext'>
}
