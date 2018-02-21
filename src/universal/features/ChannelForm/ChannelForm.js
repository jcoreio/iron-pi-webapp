// @flow

import * as React from 'react'
import Paper from 'material-ui/Paper'
import {FormSection} from 'redux-form'
import {Field} from 'redux-form-normalize-on-blur'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import {required} from '@jcoreio/redux-form-validators'

import type {Theme} from '../../theme'
import ControlWithInfo from '../../components/ControlWithInfo'
import MetadataItemFieldsContainer from '../../components/MetadataItemFieldsContainer'
import Spinner from '../../components/Spinner'
import Fader from '../../components/Fader'
import ButtonGroupField from '../../components/ButtonGroupField'

import {ChannelModesArray, getChannelModeDisplayText} from '../../localio/LocalIOChannel'
import type {ChannelMode, LocalIOChannelConfig, LocalIOChannelState} from '../../localio/LocalIOChannel'
import type {MetadataItem} from '../../types/MetadataItem'
import AnalogInputConfigSection from './AnalogInputConfigSection'
import DigitalInputConfigSection from './DigitalInputConfigSection'
import DigitalOutputConfigSection from './DigitalOutputConfigSection'
import ChannelStateWidget from './ChannelStateWidget'
import handleError from '../../redux-form/createSubmissionError'
import parseChannelFormValues from './parseChannelFormValues'
import SubmitStatus from '../../components/SubmitStatus'

const styles = ({spacing}: Theme) => ({
  form: {
    margin: '0 auto',
    minWidth: 570 + spacing.unit * 4,
    maxWidth: 570 + spacing.unit * 4,
  },
  formControl: {
    width: '100%',
  },
  firstFaderChild: {
    marginTop: 0,
  },
  lastFaderChild: {
    marginBottom: 0,
  },
  errorCollapse: {
    marginTop: spacing.unit * 2,
  },
  buttons: {
    textAlign: 'right',
    marginTop: spacing.unit * 2,
    '& > button': {
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
    padding: `${spacing.unit * 2}px ${spacing.unit * 4}px`,
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

type ControlLogicMetadataItem = {
  tag: string,
  name: string,
}

export type ConfigSectionProps = {
  config: {
    mode: ChannelMode,
  },
  formControlClass: string,
  firstControlClass: string,
  lastControlClass: string,
  tallButtonClass: string,
  metadata?: Array<ControlLogicMetadataItem>,
}

const ConfigSection = (
  ({config, ...props}: ConfigSectionProps): React.Node => {
    const mode = config && config.mode || 'DISABLED'
    return (
      <Fader animateHeight>
        <div key={mode}>
          {mode ? React.createElement(ConfigComponents[mode], {key: mode, ...props}) : ''}
        </div>
      </Fader>
    )
  }
)

const channelStateInfo: {[name: ChannelMode]: React.Node} = {
  ANALOG_INPUT: (
    <span>
      <p><strong>Raw Input</strong>: Voltage at the physical input</p>
      <p><strong>System Value</strong>: Value after calibration</p>
    </span>
  ),
  DIGITAL_INPUT: (
    <span>
      <p><strong>Raw Input</strong>: Logic level at physical input</p>
      <p><strong>Polarity</strong>: Optionally inverts the input logic level</p>
      <p><strong>System Value</strong>: Value after optional polarity invert step</p>
    </span>
  ),
  DIGITAL_OUTPUT: (
    <span>
      <p><strong>Control Value</strong>: Value being sent to the output, if available</p>
      <p><strong>Safe State</strong>: Value that will be sent to the output if the control value becomes unavailable for any reason</p>
      <p><strong>Polarity</strong>: Optionally inverts the output logic level</p>
      <p><strong>Raw Output</strong>: Value being sent to the physical output</p>
    </span>
  ),
  DISABLED: (
    <span>
      To use this channel, select <strong>Analog Input</strong>, <strong>Digital Input</strong>, or <strong>Digital Output</strong> mode
    </span>
  )
}

type FullChannel = {
  id: number,
  config: LocalIOChannelConfig,
  state?: LocalIOChannelState,
  metadataItem?: MetadataItem,
}

export type Props = {
  classes: Classes,
  initialize: (values: FullChannel) => any,
  initialized?: boolean,
  submitting?: boolean,
  submitSucceeded?: boolean,
  submitFailed?: boolean,
  pristine?: boolean,
  error?: string,
  change?: (field: string, newValue: any) => any,
  config?: {
    mode: ChannelMode,
  },
  data: {
    Channel?: FullChannel,
    Metadata?: Array<ControlLogicMetadataItem>,
    loading?: boolean,
  },
  subscribeToChannelState?: (id: number) => Function,
  handleSubmit: (onSubmit: (values: FullChannel) => any) => (event: Event) => any,
  mutate: (options: {variables: {id?: number, where?: Object, channel: FullChannel}}) => Promise<void>,
}

class ChannelForm extends React.Component<Props> {
  unsubscribeFromChannelState: ?Function
  initializeTimeout: ?number

  pickFormFields = ({id, metadataItem, config}: FullChannel) => ({id, metadataItem, config})

  componentDidMount() {
    const {data: {Channel}, initialize, subscribeToChannelState} = this.props
    if (Channel) {
      this.initializeTimeout = setTimeout(() => initialize(this.pickFormFields(Channel)), 0)
      if (subscribeToChannelState) {
        this.unsubscribeFromChannelState = subscribeToChannelState(Channel.id)
      }
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const prevChannel = this.props.data.Channel
    const nextChannel = nextProps.data.Channel

    function getId(channel: ?{ id: number }): ?number {
      return channel ? channel.id : null
    }

    if (nextChannel !== prevChannel) {
      if (nextChannel && nextProps.pristine) {
        this.initializeTimeout = setTimeout(() => nextProps.initialize(this.pickFormFields(nextChannel)), 0)
      }
      if (getId(nextChannel) !== getId(prevChannel)) {
        if (this.unsubscribeFromChannelState) this.unsubscribeFromChannelState()
        if (nextChannel) {
          const {subscribeToChannelState} = nextProps
          if (subscribeToChannelState) {
            this.unsubscribeFromChannelState = subscribeToChannelState(nextChannel.id)
          }
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.initializeTimeout != null) clearTimeout(this.initializeTimeout)
    if (this.unsubscribeFromChannelState) this.unsubscribeFromChannelState()
  }

  handleCancel = () => {
    const {data: {Channel}, initialize} = this.props
    if (Channel) initialize(this.pickFormFields(Channel))
  }

  handleSubmit = (channel: FullChannel): Promise<void> => {
    const {mutate} = this.props
    const {id, config, metadataItem} = parseChannelFormValues(channel)
    return mutate({
      variables: {
        where: {id},
        channel: {id, config, metadataItem}
      }
    }).catch(handleError)
  }

  render(): React.Node {
    const {
      classes, data: {Metadata, Channel, loading}, initialized, pristine,
      submitting, submitSucceeded, submitFailed, error,
      handleSubmit, change,
    } = this.props
    const config = this.props.config || {mode: 'DISABLED', systemValue: null}
    if (loading || !initialized) {
      return (
        <div className={classes.form}>
          <Paper className={classes.paper}>
            <Typography type="subheading">
              <Spinner /> Loading channel configuration...
            </Typography>
          </Paper>
        </div>
      )
    }
    const channelMode: ChannelMode = (Channel && Channel.state ? Channel.state.mode : null) || 'DISABLED'
    return (
      <form id="channelForm" className={classes.form} onSubmit={handleSubmit(this.handleSubmit)}>
        {Channel &&
          <Paper className={classes.paper}>
            <Fader animateHeight>
              <ControlWithInfo
                info={channelStateInfo[channelMode]}
                key={channelMode}
              >
                <ChannelStateWidget channel={Channel} className={classes.formControl} />
              </ControlWithInfo>
            </Fader>
          </Paper>
        }
        <Paper className={classes.paper}>
          <ControlWithInfo info="The mode of this channel">
            <Field
              name="config.mode"
              component={ButtonGroupField}
              buttonClassName={classes.tallButton}
              availableValues={ChannelModesArray}
              activeButtonProps={{accent: true}}
              getDisplayText={getChannelModeDisplayText}
              className={classes.formControl}
              validate={required()}
            />
          </ControlWithInfo>
          <FormSection name="metadataItem">
            <MetadataItemFieldsContainer
              formControlClass={classes.formControl}
              mode={{
                dataType: 'number',
                isDigital: config ? config.mode !== 'ANALOG_INPUT' : true,
              }}
            />
          </FormSection>
          <ConfigSection
            config={config}
            formControlClass={classes.formControl}
            firstControlClass={classes.firstFaderChild}
            lastControlClass={classes.lastFaderChild}
            tallButtonClass={classes.tallButton}
            metadata={Metadata}
            change={change}
          />
          <SubmitStatus
            submitting={submitting}
            submitSucceeded={submitSucceeded}
            submitFailed={submitFailed}
            error={error}
          />
          <div className={classes.buttons}>
            <Button
              raised
              className={classes.tallButton}
              onClick={this.handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              raised
              color="primary"
              className={classes.tallButton}
              disabled={pristine || submitting}
            >
              Save
            </Button>
          </div>
        </Paper>
      </form>
    )
  }
}

export default withStyles(styles, {withTheme: true})(ChannelForm)

