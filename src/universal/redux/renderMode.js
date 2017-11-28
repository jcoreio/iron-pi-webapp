// @flow

import type {RenderMode, Reducer, Action} from './types'
import {createReducer} from 'mindfront-redux-utils'

const SET_RENDER_MODE = 'SET_RENDER_MODE'

/**
 * Sets the render mode.  During server-side rendering, the renderMode should be
 * 'prerender' (the default) and components can respond by avoiding any client-only
 * APIs.  Once the app has mounted on the client, it will set the render mode to
 * 'client' to inform components to render themselves in full.
 */
export function setRenderMode(renderMode: RenderMode): Action {
  return {
    type: 'SET_RENDER_MODE',
    payload: renderMode,
  }
}

export const renderModeReducer: Reducer = createReducer('prerender', {
  [SET_RENDER_MODE]: (state: RenderMode, {payload}: {payload: RenderMode}): RenderMode => payload,
})

