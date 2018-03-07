// @flow

import * as React from 'react'
import type {RouterHistory, Match} from 'react-router-dom'
import Paper from 'material-ui/Paper'
import {Field} from 'redux-form-normalize-on-blur'
import {NumericField} from 'redux-form-numeric-field'
import {InputAdornment} from 'material-ui/Input'
import {FormHelperText} from 'material-ui/Form'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import {required, format} from 'redux-form-validators'
import {mqttConfigForm} from './routePaths'
import {mqttUrlPattern} from '../../types/MQTTUrl'

import type {Theme} from '../../theme'
import ControlWithInfo from '../../components/ControlWithInfo'
import TextField from '../../components/TextField'
import Spinner from '../../components/Spinner'
import Fader from '../../components/Fader'

import handleError from '../../redux-form/createSubmissionError'
import SubmitStatus from '../../components/SubmitStatus'
import ConfirmDeletePopover from '../../components/ConfirmDeletePopover'

import type {Channel} from './MQTTChannelConfigsTable'
import MQTTChannelConfigsTable from './MQTTChannelConfigsTable'
import {ProtocolsArray, getProtocolDisplayText} from '../../mqtt/MQTTConfig'
import ButtonGroupField from '../../components/ButtonGroupField'

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
  serverURLControl: {
    flexDirection: 'column',
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

const trim = (value: ?string): ?string => typeof value === 'string' ? value.trim() : value

type Protocol = 'SPARKPLUG' | 'TEXT_JSON'

type MQTTConfig = {
  id: number,
  name?: ?string,

  serverURL: string, // e.g. tcp://myhost.mydomain.com:1883
  username?: ?string,
  password?: ?string,
  groupId: string,
  nodeId: string,
  protocol: Protocol,

  minPublishInterval?: ?number, // minimum interval, in milliseconds, for publishing data

  /**
   * If true, plugin will automatically publish all public tags and metadata in addition
   * to any channels defined in channelsToMQTT.
   */
  publishAllPublicTags?: ?boolean,
  channelsFromMQTT?: Array<Channel>,
  channelsToMQTT?: Array<Channel>,
}

export type Props = {
  id: number,
  loadedId: number,
  protocol?: Protocol,
  classes: Classes,
  initialize: (values: $Shape<MQTTConfig>, keepDirty?: boolean, otherMeta?: {keepSubmitSucceeded?: boolean}) => any,
  initialized?: boolean,
  submitting?: boolean,
  submitSucceeded?: boolean,
  submitFailed?: boolean,
  pristine?: boolean,
  error?: string,
  change?: (field: string, newValue: any) => any,
  match: Match,
  history: RouterHistory,
  data?: {
    Config?: MQTTConfig,
    loading?: boolean,
  },
  handleSubmit: (onSubmit: (values: MQTTConfig) => any) => (event: Event) => any,
  createMQTTConfig: (options: {variables: {values: MQTTConfig}}) => Promise<{
    data: {Config: MQTTConfig},
  }>,
  updateMQTTConfig: (options: {variables: {values: MQTTConfig}}) => Promise<{
    data: {Config: MQTTConfig},
  }>,
  destroyMQTTConfig: (options: {variables: {id: number}}) => Promise<any>,
  destroyMQTTChannelConfig: (options: {variables: {id: number}}) => Promise<any>,
}

function _shouldInitialize({data, id, loadedId, pristine}: Props): boolean {
  if (!data) return false
  const {Config} = data
  return Config != null && Config.id === id && (pristine || loadedId !== Config.id)
}

const pickFormFields = ({
  id, name, serverURL, username, password, groupId, nodeId, protocol,
  minPublishInterval, publishAllPublicTags,
}: MQTTConfig) => {
  username = username || null
  password = password || null
  if (!Number.isFinite(minPublishInterval)) minPublishInterval = null
  return {
    id, name, serverURL, username, password, groupId, nodeId, protocol,
    minPublishInterval, publishAllPublicTags,
  }
}

const validateServerURL = [required(), format({
  with: mqttUrlPattern,
  message: 'must be a valid MQTT URL',
})]

class MQTTConfigForm extends React.Component<Props> {
  initializeTimeout: ?number

  componentDidMount() {
    const {id, data, initialize} = this.props
    if (!id) initialize({})
    if (!data) return
    const {Config} = data
    if (Config) {
      if (_shouldInitialize(this.props)) {
        this.initializeTimeout = setTimeout(() => initialize(pickFormFields(Config)), 0)
      }
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const prevConfig = (this.props.data || {}).Config
    const nextConfig = (nextProps.data || {}).Config

    if (nextConfig !== prevConfig) {
      if (nextConfig && _shouldInitialize(nextProps)) {
        this.initializeTimeout = setTimeout(() => nextProps.initialize(pickFormFields(nextConfig)), 0)
      }
    }
  }

  componentWillUnmount() {
    if (this.initializeTimeout != null) clearTimeout(this.initializeTimeout)
  }

  handleCancel = () => {
    const {data, initialize} = this.props
    if (!data) return
    const {Config} = data
    if (Config) initialize(pickFormFields(Config))
  }

  handleSubmit = (values: MQTTConfig): Promise<void> => {
    const {initialize, history} = this.props
    values = pickFormFields(values)
    const mutate = values.id != null ? this.props.updateMQTTConfig : this.props.createMQTTConfig
    return mutate({variables: {values}}).then(({data: {Config}}: {data: {Config: MQTTConfig}}) => {
      if (values.id == null) {
        history.replace(mqttConfigForm(Config.id))
      } else {
        initialize(pickFormFields(Config), false, {keepSubmitSucceeded: true})
      }
    }).catch(handleError)
  }

  handleDelete = () => {
    const {loadedId, history, destroyMQTTConfig} = this.props
    if (loadedId == null) return
    destroyMQTTConfig({variables: {id: loadedId}})
      .then(() => history.goBack())
      .catch(handleError)
  }

  handleDeleteChannel = (channelId: number) => {
    const {destroyMQTTChannelConfig} = this.props
    destroyMQTTChannelConfig({variables: {id: channelId}})
      .catch(handleError)
  }

  render(): React.Node {
    const {
      classes, data, initialized, pristine,
      submitting, submitSucceeded, submitFailed, error,
      handleSubmit, loadedId, id, match, history, protocol,
    } = this.props
    const loading = data ? data.loading : false
    if (data != null && (loading || !initialized || loadedId !== id)) {
      return (
        <div className={classes.form}>
          <Paper className={classes.paper}>
            <Typography type="subheading">
              <Spinner /> Loading MQTT configuration...
            </Typography>
          </Paper>
        </div>
      )
    }
    const Config = data ? data.Config : null
    const ProtocolFields = protocol ? fieldsForProtocol[protocol] : null
    return (
      <form id="MQTTConfigForm" className={classes.form} onSubmit={handleSubmit(this.handleSubmit)}>
        <Paper className={classes.paper}>
          <ControlWithInfo info="The name of the MQTT connection">
            <Field
              name="name"
              label="Name"
              type="text"
              component={TextField}
              className={classes.formControl}
              normalizeOnBlur={trim}
              validate={required()}
            />
          </ControlWithInfo>
          <ControlWithInfo info="The URL of the MQTT server" controlClassName={classes.serverURLControl}>
            <Field
              name="serverURL"
              label="Server URL"
              type="text"
              component={TextField}
              className={classes.formControl}
              normalizeOnBlur={trim}
              validate={validateServerURL}
            />
            <FormHelperText>
              Examples: mqtts://server.domain.com
            </FormHelperText>
            <FormHelperText>
              <span style={{visibility: 'hidden'}}>Examples:</span> mqtt://server.domain.com:1883
            </FormHelperText>
          </ControlWithInfo>
          <ControlWithInfo info="The connection protocol">
            <Field
              name="protocol"
              component={ButtonGroupField}
              buttonClassName={classes.tallButton}
              availableValues={ProtocolsArray}
              activeButtonProps={{accent: true}}
              getDisplayText={getProtocolDisplayText}
              className={classes.formControl}
              validate={required()}
            />
          </ControlWithInfo>
          <Fader>
            {ProtocolFields && (
              <ProtocolFields key={protocol} formControlClass={classes.formControl} />
            )}
          </Fader>
          <ControlWithInfo info="TODO">
            <NumericField
              name="minPublishInterval"
              label="Minimum Transmit Interval"
              type="text"
              component={TextField}
              className={classes.formControl}
              InputProps={{
                endAdornment: <InputAdornment position="end">milliseconds</InputAdornment>,
              }}
            />
          </ControlWithInfo>
          <ControlWithInfo info="The username to connect with">
            <Field
              name="username"
              label="Username"
              type="text"
              component={TextField}
              className={classes.formControl}
            />
          </ControlWithInfo>
          <ControlWithInfo info="The password to connect with">
            <Field
              name="password"
              label="Password"
              type="password"
              component={TextField}
              className={classes.formControl}
            />
          </ControlWithInfo>

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
            <ConfirmDeletePopover
              onConfirmDelete={this.handleDelete}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              {({bind}) => (
                <Button raised className={classes.tallButton} {...bind}>
                  Delete
                </Button>
              )}
            </ConfirmDeletePopover>
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
        {id != null &&
          <React.Fragment>
            <Paper className={classes.paper}>
              <MQTTChannelConfigsTable
                direction="TO_MQTT"
                channels={Config && Config.channelsToMQTT || []}
                match={match}
                history={history}
                onDeleteChannel={this.handleDeleteChannel}
              />
            </Paper>
            <Paper className={classes.paper}>
              <MQTTChannelConfigsTable
                direction="FROM_MQTT"
                channels={Config && Config.channelsFromMQTT || []}
                match={match}
                history={history}
                onDeleteChannel={this.handleDeleteChannel}
              />
            </Paper>
          </React.Fragment>
        }
      </form>
    )
  }
}

type ProtocolFieldsProps = {
  formControlClass: string,
}

const SparkPlugFields = ({formControlClass}: ProtocolFieldsProps): React.Node => (
  <div>
    <ControlWithInfo info="The ID of the MQTT group">
      <Field
        name="groupId"
        label="Group ID"
        type="text"
        component={TextField}
        className={formControlClass}
        normalizeOnBlur={trim}
        validate={required()}
      />
    </ControlWithInfo>
    <ControlWithInfo info="The ID of the MQTT node">
      <Field
        name="nodeId"
        label="Node ID"
        type="text"
        component={TextField}
        className={formControlClass}
        normalizeOnBlur={trim}
        validate={required()}
      />
    </ControlWithInfo>
  </div>
)

const TextJsonFields = ({formControlClass}: ProtocolFieldsProps): React.Node => (
  <div>
    <ControlWithInfo info="The MQTT data topic">
      <Field
        name="dataTopic"
        label="Data Topic"
        type="text"
        component={TextField}
        className={formControlClass}
        normalizeOnBlur={trim}
        validate={required()}
      />
    </ControlWithInfo>
    <ControlWithInfo info="The MQTT metadata topic">
      <Field
        name="metadataTopic"
        label="Metadata Topic"
        type="text"
        component={TextField}
        className={formControlClass}
        normalizeOnBlur={trim}
        validate={required()}
      />
    </ControlWithInfo>
  </div>
)

const fieldsForProtocol: {[protocol: Protocol]: React.ComponentType<ProtocolFieldsProps>} = {
  SPARKPLUG: SparkPlugFields,
  TEXT_JSON: TextJsonFields,
}

export default withStyles(styles, {withTheme: true})(MQTTConfigForm)

