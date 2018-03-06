// @flow

import * as React from 'react'
import {NavLink} from 'react-router-dom'
import {withStyles} from 'material-ui/styles/index'

import SidebarItem from '../../components/Sidebar/SidebarItem'
import SidebarItemText from '../../components/Sidebar/SidebarItemText'

import type {Theme} from '../../theme'
import {mqttConfigForm} from './routePaths'

export type Config = {
  id: number,
  name: string,
}

const mqttConfigStyles = (theme: Theme) => ({
  name: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  secondaryAction: {
    marginTop: -theme.spacing.unit,
    marginRight: theme.spacing.unit * 3,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof mqttConfigStyles>

export type MQTTConfigItemProps = {
  config: Config,
  classes: Classes,
}

const MQTTConfigItem = ({config, classes}: MQTTConfigItemProps): React.Node => (
  <SidebarItem component={NavLink} to={mqttConfigForm(config.id)} data-component="MQTTConfigItem">
    <SidebarItemText data-test-name="name" disableTypography primary={config.name} className={classes.name} />
  </SidebarItem>
)

export default withStyles(mqttConfigStyles, {withTheme: true})(MQTTConfigItem)

