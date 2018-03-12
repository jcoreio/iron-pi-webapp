// @flow

import * as React from 'react'
import {ListItemSecondaryAction} from 'material-ui/List'
import {withStyles} from 'material-ui/styles'
import IconButton from 'material-ui/IconButton'
import Icon from 'material-ui/Icon'
import {Link} from 'react-router-dom'
import {mqttConfigForm} from './routePaths'

import type {Theme} from '../../theme'
import SidebarSection from '../../components/Sidebar/SidebarSection'
import MQTTConfigItem from './MQTTConfigItem'
import type {Config} from './MQTTConfigItem'
import Spinner from '../../components/Spinner'
import AddIcon from '../../components/icons/AddRectangle'

const styles = (theme: Theme) => ({
  secondaryAction: {
    marginTop: -theme.spacing.unit * 2,
    marginRight: theme.spacing.unit,
  },
  addConfigButton: {
    marginTop: -theme.spacing.unit,
    marginBottom: 0,
  },
  addConfigIcon: {
    color: theme.sidebar.foregroundColor,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  expanded?: boolean,
  configs?: Array<Config>,
  loading?: boolean,
  onExpandedChange: (expanded: boolean) => any,
  classes: Classes,
}

const MQTTSidebarSection = ({expanded, configs, onExpandedChange, loading, classes}: Props): React.Node => (
  <SidebarSection
    title="MQTT"
    headerProps={{
      children: (
        <ListItemSecondaryAction className={classes.secondaryAction}>
          <Spinner in={loading} />
          <IconButton
            data-test-name="addMQTTConfigButton"
            component={Link}
            className={classes.addConfigButton}
            to={mqttConfigForm(('create': any))}
          >
            <Icon><AddIcon className={classes.addConfigIcon} /></Icon>
          </IconButton>
        </ListItemSecondaryAction>
      )
    }}
    expanded={expanded}
    onHeaderClick={() => onExpandedChange(!expanded)}
  >
    {configs && configs.map((config: Config) =>
      <MQTTConfigItem config={config} key={config.id} />
    )}
  </SidebarSection>
)

export default withStyles(styles, {withTheme: true})(MQTTSidebarSection)

