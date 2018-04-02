// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles} from 'material-ui/styles'
import type {Theme} from '../../theme'

import type {MQTTPluginState} from '../../types/MQTTPluginState'
import {
  MQTT_PLUGIN_STATUS_CONNECTED,
  MQTT_PLUGIN_STATUS_CONNECTING,
  MQTT_PLUGIN_STATUS_ERROR
} from '../../types/MQTTPluginState'
import Timer from '../../components/Timer'
import Spinner from '../../components/Spinner'
import formatUptime from '../../util/formatUptime'

const styles = ({alert, spacing, typography}: Theme) => ({
  root: {
    padding: `${spacing.unit}px ${spacing.unit * 2}px`,
    fontSize: typography.pxToRem(18),
  },
  connected: {
    ...alert.success,
  },
  connecting: {
    ...alert.warning,
  },
  error: {
    ...alert.error,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  state: MQTTPluginState,
}

class MQTTConfigState extends React.Component<Props> {
  render(): ?React.Node {
    const {classes, state: {status, connectedSince, error}} = this.props
    switch (status) {
    case MQTT_PLUGIN_STATUS_CONNECTED: return (
      <Timer delay={1000}>
        {({time}) => (
          <div className={classNames(classes.root, classes.connected)}>
            Connected{connectedSince != null ? ` for ${formatUptime(time - connectedSince)}` : null}
          </div>
        )}
      </Timer>
    )
    case MQTT_PLUGIN_STATUS_CONNECTING: return (
      <div className={classNames(classes.root, classes.connecting)}>
        <Spinner /> Connecting...
      </div>
    )
    case MQTT_PLUGIN_STATUS_ERROR: return (
      <div className={classNames(classes.root, classes.error)}>
        Connection failed: {error}
      </div>
    )
    }
  }
}

export default withStyles(styles, {withTheme: true})(MQTTConfigState)

