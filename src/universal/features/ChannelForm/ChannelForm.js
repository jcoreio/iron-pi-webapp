// @flow

import * as React from 'react'
import Paper from 'material-ui/Paper'
import {Field, formValues} from 'redux-form'
import {TextField} from 'redux-form-material-ui'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import ControlWithInfo from '../../components/ControlWithInfo'
import Spinner from '../../components/Spinner'

import type {Theme} from '../../theme'
import ButtonGroupField from '../../components/ButtonGroupField'
import {ChannelModesArray, getChannelModeDisplayText} from '../../types/Channel'
import type {ChannelMode, Channel as FullChannel} from '../../types/Channel'
import AnalogInputConfigSection from './AnalogInputConfigSection'
import DigitalInputConfigSection from './DigitalInputConfigSection'
import DigitalOutputConfigSection from './DigitalOutputConfigSection'

const styles = ({spacing}: Theme) => ({
  form: {
    margin: '0 auto',
    maxWidth: 570 + spacing.unit * 4,
  },
  formControl: {
    width: '100%',
  },
  buttons: {
    textAlign: 'right',
    '& > *': {
      minWidth: 120,
    },
    '& > :not(:last-child)': {
      marginRight: spacing.unit * 3,
    }
  },
  tallButton: {
    height: spacing.unit * 7,
  },
  paper: {
    padding: `${spacing.unit * 3}px ${spacing.unit * 4}px`,
    margin: spacing.unit * 2,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

const Empty = () => <div />

const ConfigComponents: {[mode: ChannelMode]: React.ComponentType<any> | string} = {
  ANALOG_INPUT: AnalogInputConfigSection,
  DIGITAL_INPUT: DigitalInputConfigSection,
  DIGITAL_OUTPUT: DigitalOutputConfigSection,
  DISABLED: Empty,
}

type Channel = {
  id: number,
  name: string,
}

export type ConfigSectionProps = {
  mode: ChannelMode,
  formControlClass: string,
  tallButtonClass: string,
  channels?: Array<Channel>,
}

const ConfigSection = formValues('mode')(
  ({mode, ...props}: ConfigSectionProps): React.Node => (
    mode ? React.createElement(ConfigComponents[mode], {key: mode, ...props}) : ''
  )
)

export type Props = {
  classes: Classes,
  initialize: (values: FullChannel) => any,
  submitting?: boolean,
  valid?: boolean,
  data: {
    Channel?: FullChannel,
    Channels?: Array<Channel>,
    loading?: boolean,
  },
}

class ChannelForm extends React.Component<Props> {
  componentDidMount() {
    const {data: {Channel}, initialize} = this.props
    if (Channel) initialize(Channel)
  }

  componentWillReceiveProps(nextProps: Props) {
    const prevChannel = this.props.data.Channel
    const nextChannel = nextProps.data.Channel

    if (nextChannel && nextChannel !== prevChannel) {
      nextProps.initialize(nextChannel)
    }
  }

  render(): React.Node {
    const {classes, data: {Channels, loading}, valid, submitting} = this.props
    if (loading) {
      return (
        <div className={classes.form}>
          <Paper className={classes.paper}>
            <Typography type="title">
              <Spinner /> Loading channel configuration...
            </Typography>
          </Paper>
        </div>
      )
    }
    return (
      <form id="channelForm" className={classes.form}>
        <Paper className={classes.paper}>
          <ControlWithInfo info="The mode of the channel">
            <Field
              name="mode"
              component={ButtonGroupField}
              buttonClassName={classes.tallButton}
              availableValues={ChannelModesArray}
              activeButtonProps={{accent: true}}
              getDisplayText={getChannelModeDisplayText}
              className={classes.formControl}
            />
          </ControlWithInfo>
          <ControlWithInfo info="The name of the channel">
            <Field
              name="name"
              label="Channel Name"
              type="text"
              component={TextField}
              className={classes.formControl}
            />
          </ControlWithInfo>
          <ControlWithInfo info="The internal id of the channel">
            <Field
              name="channelId"
              label="Channel ID"
              type="text"
              component={TextField}
              className={classes.formControl}
            />
          </ControlWithInfo>
          <ConfigSection
            formControlClass={classes.formControl}
            tallButtonClass={classes.tallButton}
            channels={Channels}
          />
          <div className={classes.buttons}>
            <Button raised className={classes.tallButton}>
              Cancel
            </Button>
            <Button
              type="submit"
              raised
              color="primary"
              className={classes.tallButton}
              disabled={!valid || submitting}
            >
              OK
            </Button>
          </div>
        </Paper>
      </form>
    )
  }
}

export default withStyles(styles, {withTheme: true})(ChannelForm)

